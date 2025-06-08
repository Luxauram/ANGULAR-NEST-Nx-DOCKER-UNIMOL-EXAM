/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../models/user.model';
import { Post } from '../../../../models/post.model';
import { AuthService } from '../../../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { ImageService } from '../../../../services/user/image.service';
import { PostService } from '../../../../services/post/post.service';
import { SocialService } from '../../../../services/user/social.service';
import { UserService } from '../../../../services/user/user.service';
import { CoverPhotoComponent } from '../../../../shared/components/user/cover-photo.component';
import { AvatarComponent } from '../../../../shared/components/user/avatar.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent, CoverPhotoComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = [];
  followersCount = 0;
  followingCount = 0;
  isFollowing = false;
  isOwnProfile = false;
  isLoading = true;
  isPostsLoading = true;
  isFollowLoading = false;
  error: string | null = null;
  private userId: string | null = null;
  private userIdentifier: string | null = null;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;
  private isLoadingByUsername = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private socialService: SocialService,
    private postService: PostService,
    private authService: AuthService,
    private imageService: ImageService
  ) {}

  private isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    this.currentUsername = currentUser?.username || null;

    console.log('🔍 Current user:', {
      id: this.currentUserId,
      username: this.currentUsername,
    });

    // Debug: stampa tutti i parametri disponibili
    console.log('🔍 Route snapshot params:', this.route.snapshot.params);
    console.log('🔍 Route snapshot url:', this.route.snapshot.url);

    this.route.params.subscribe((params) => {
      console.log('🔍 Route params subscription:', params);

      // La route è definita come 'user/:username', quindi leggi il parametro 'username'
      this.userIdentifier = params['username'];

      console.log('🔍 Extracted username parameter:', this.userIdentifier);

      if (this.userIdentifier) {
        // Determina se è un ID (UUID format) o username
        this.isLoadingByUsername = !this.isUUID(this.userIdentifier);
        console.log('🔍 Loading by username:', this.isLoadingByUsername);
        console.log('🔍 Is UUID format:', this.isUUID(this.userIdentifier));

        this.loadUserProfile();
      } else {
        this.error = 'Identificatore utente non fornito';
        this.isLoading = false;
        console.error('❌ No username parameter found in route');
      }
    });
  }

  async loadUserProfile() {
    try {
      this.isLoading = true;
      this.error = null;

      console.log(
        '🔄 Loading user profile for identifier:',
        this.userIdentifier
      );
      console.log('🔄 Loading by username:', this.isLoadingByUsername);

      // Carica profilo utente usando il metodo appropriato
      if (this.isLoadingByUsername) {
        console.log('🔄 Calling getUserByUsername...');
        // Carica per username
        this.user = await firstValueFrom(
          this.userService.getUserByUsername(this.userIdentifier!)
        );
        // Dopo aver caricato l'utente per username, ottieni l'ID
        this.userId = this.user?.id || null;
      } else {
        console.log('🔄 Calling getUserPublicProfile with UUID...');
        // Carica per ID (UUID)
        this.userId = this.userIdentifier;
        this.user = await firstValueFrom(
          this.userService.getUserPublicProfile(this.userId!)
        );
      }

      console.log('✅ User profile loaded:', this.user);

      if (!this.user || !this.userId) {
        this.error = 'Utente non trovato';
        return;
      }

      // Controlla se è il proprio profilo (confronta sia ID che username)
      this.isOwnProfile =
        this.userId === this.currentUserId ||
        this.user.username === this.currentUsername;

      console.log('🔍 Is own profile:', this.isOwnProfile);

      // Carica post dell'utente
      await this.loadUserPosts();

      // Se non è il proprio profilo, carica info social
      if (!this.isOwnProfile) {
        await this.loadSocialInfo();
      }
    } catch (error: any) {
      console.error('❌ Error loading user profile:', error);

      // Handle different types of errors
      if (error.status === 404) {
        this.error = 'Utente non trovato';
      } else if (error.status === 401) {
        this.error = 'Non autorizzato';
      } else if (error.status === 403) {
        this.error = 'Accesso negato';
      } else {
        this.error = error.message || 'Errore nel caricamento del profilo';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async loadUserPosts() {
    try {
      this.isPostsLoading = true;
      console.log('🔄 Loading posts for user:', this.userId);

      // Check if getUserPosts method exists
      if (this.postService.getUserPosts) {
        this.userPosts =
          (await firstValueFrom(this.postService.getUserPosts(this.userId!))) ||
          [];
      } else {
        console.warn('⚠️ getUserPosts method not available in PostService');
        this.userPosts = [];
      }

      console.log('✅ Posts loaded:', this.userPosts.length);
    } catch (error) {
      console.error('❌ Error loading user posts:', error);
      this.userPosts = [];
    } finally {
      this.isPostsLoading = false;
    }
  }

  async loadSocialInfo() {
    try {
      console.log('🔄 Loading social info for user:', this.userId);

      // Check if social service methods exist
      if (
        !this.socialService.getFollowers ||
        !this.socialService.getFollowing ||
        !this.socialService.getRelationship
      ) {
        console.warn('⚠️ Social service methods not available');
        return;
      }

      // Carica info sui follower/following
      const [followers, following, relationship] = await Promise.all([
        firstValueFrom(this.socialService.getFollowers(this.userId!)),
        firstValueFrom(this.socialService.getFollowing(this.userId!)),
        firstValueFrom(this.socialService.getRelationship(this.userId!)),
      ]);

      this.followersCount = followers?.length || 0;
      this.followingCount = following?.length || 0;
      this.isFollowing = relationship?.isFollowing || false;

      console.log('✅ Social info loaded:', {
        followers: this.followersCount,
        following: this.followingCount,
        isFollowing: this.isFollowing,
      });
    } catch (error) {
      console.error('❌ Error loading social info:', error);
    }
  }

  async toggleFollow() {
    if (!this.userId || this.isFollowLoading) return;

    try {
      this.isFollowLoading = true;
      console.log('🔄 Toggling follow for user:', this.userId);

      if (this.isFollowing) {
        await firstValueFrom(this.socialService.unfollowUser(this.userId));
        this.isFollowing = false;
        this.followersCount--;
        console.log('✅ Unfollowed user');
      } else {
        await firstValueFrom(
          this.socialService.followUser({ targetUserId: this.userId })
        );
        this.isFollowing = true;
        this.followersCount++;
        console.log('✅ Followed user');
      }
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
    } finally {
      this.isFollowLoading = false;
    }
  }

  getUserAvatar(): string {
    return this.imageService.getAvatarUrl(this.user?.avatar);
  }

  getUserCover(): string {
    return this.imageService.getCoverUrl(this.user?.coverPhoto);
  }

  onAvatarError(event: any): void {
    this.imageService.onAvatarError(event);
  }

  onCoverError(event: any): void {
    this.imageService.onCoverError(event);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/search']);
  }

  debugState() {
    console.log('🔍 Debug State:', {
      userIdentifier: this.userIdentifier,
      userId: this.userId,
      currentUserId: this.currentUserId,
      currentUsername: this.currentUsername,
      isLoadingByUsername: this.isLoadingByUsername,
      isOwnProfile: this.isOwnProfile,
      user: this.user,
      error: this.error,
      isLoading: this.isLoading,
      routeParams: this.route.snapshot.params,
      routeUrl: this.route.snapshot.url,
    });
  }
}
