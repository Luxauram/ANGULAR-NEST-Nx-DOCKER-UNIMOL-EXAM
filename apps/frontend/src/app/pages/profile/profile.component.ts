import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { PostListComponent } from '../../features/posts/components/post-list/post-list.component';
import { PostService } from '../../services/post/post.service';
import { SocialService } from '../../services/user/social.service';
import { AvatarComponent } from '../../shared/components/user/avatar.component';
import { CoverPhotoComponent } from '../../shared/components/user/cover-photo.component';
import {
  InfoItem,
  InfoListComponent,
} from '../../shared/components/user/info-list.component';
import { FollowersStatsComponent } from '../../shared/components/user/followers-stats.component';
import { FollowingStatsComponent } from '../../shared/components/user/following-stats.component';
import { PostsStatsComponent } from '../../shared/components/user/posts-stats.component';
import { BadgeComponent } from '../../shared/components/user/badge.component';
import { ShareProfileButtonComponent } from '../../shared/components/user/share-profile-button.component';
import { EditProfileButtonComponent } from '../../shared/components/user/edit-profile-button.component';
import {
  FollowersModalComponent,
  FollowerUser,
} from '../../shared/components/user/followers-modal.component';
import {
  FollowingModalComponent,
  FollowingUser,
} from '../../shared/components/user/following-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    CoverPhotoComponent,
    BadgeComponent,
    PostsStatsComponent,
    FollowersStatsComponent,
    FollowingStatsComponent,
    InfoListComponent,
    EditProfileButtonComponent,
    ShareProfileButtonComponent,
    PostListComponent,
    FollowersModalComponent,
    FollowingModalComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = [];
  followers: any[] = [];
  following: any[] = [];
  isLoading = false;
  applicantInfo: InfoItem[] = [];

  showFollowersModal = false;
  showFollowingModal = false;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private socialService: SocialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 ProfileComponent ngOnInit started');
    console.log('🔍 getCurrentUser result:', this.authService.getCurrentUser());

    this.user = this.authService.getCurrentUser();
    console.log('👤 this.user after assignment:', this.user);

    if (this.user) {
      console.log('✅ User exists, setting up data');
      this.initializeApplicantInfo();
      console.log('📝 applicantInfo after init:', this.applicantInfo);
      this.loadUserData();
    } else {
      console.log('❌ User è null/undefined');
      this.router.navigate(['/login']);
    }
  }

  private initializeApplicantInfo(): void {
    if (!this.user) return;

    this.applicantInfo = [
      {
        label: 'Nome',
        value: this.user.firstName || 'Nome non disponibile',
      },
      {
        label: 'Cognome',
        value: this.user.lastName || 'Cognome non disponibile',
      },
      {
        label: 'Biografia',
        value: this.user.bio || 'Biografia non disponibile',
      },
      {
        label: 'Email',
        value: this.user.email || 'Email non disponibile',
      },
      {
        label: 'Data di Nascita',
        value: 'Data di Nascita non disponibile',
      },
      {
        label: 'Paese',
        value: 'Paese non disponibile',
      },
      {
        label: 'Indirizzo',
        value: 'Indirizzo non disponibile',
      },
      {
        label: 'Città',
        value: 'Città non disponibile',
      },
      {
        label: 'Provincia',
        value: 'Provincia non disponibile',
      },
      {
        label: 'CAP',
        value: 'CAP non disponibile',
      },
    ];

    console.log('📋 ApplicantInfo initialized:', this.applicantInfo);
  }

  loadUserData(): void {
    if (!this.user) return;

    console.log('🔄 Loading user data for user:', this.user.id);
    this.isLoading = true;

    // Post utente
    this.postService.getUserPosts(this.user.id).subscribe({
      next: (posts) => {
        console.log('📝 Posts loaded:', posts);
        this.userPosts = posts;
      },
      error: (error) => {
        console.error('❌ Error loading user posts:', error);
      },
    });

    // Followers - aggiungi parametri di paginazione
    this.socialService.getFollowers(this.user.id, 100, 0).subscribe({
      next: (response) => {
        console.log('👥 Followers loaded:', response);
        // Gestisci sia response.data che response diretto
        if (response && response.data) {
          this.followers = response.data;
        } else if (Array.isArray(response)) {
          this.followers = response;
        } else {
          console.warn('⚠️ Unexpected followers response structure:', response);
          this.followers = [];
        }
      },
      error: (error) => {
        console.error('❌ Error loading followers:', error);
      },
    });

    // Following - aggiungi parametri di paginazione
    this.socialService.getFollowing(this.user.id, 100, 0).subscribe({
      next: (response) => {
        console.log('👤 Following loaded:', response);
        // Gestisci sia response.data che response diretto
        if (response && response.data) {
          this.following = response.data;
        } else if (Array.isArray(response)) {
          this.following = response;
        } else {
          console.warn('⚠️ Unexpected following response structure:', response);
          this.following = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading following:', error);
        this.isLoading = false;
      },
    });
  }

  refreshUserProfile(): void {
    console.log('🔄 Refreshing user profile...');
  }

  handleEditProfile(): void {
    this.router.navigate(['/profile/update']);
  }

  handleShareProfile(): void {
    const shareData = {
      title: 'Il mio profilo',
      text: 'Guarda il mio profilo!',
      url: window.location.origin + '/profile/' + this.user?.id,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log('Condivisione completata'))
        .catch((error) => console.log('Errore nella condivisione:', error));
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => {
          alert('Link copiato negli appunti!');
        })
        .catch(() => {
          this.openShareDialog(shareData);
        });
    }
  }

  private openShareDialog(shareData: any): void {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareData.url
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareData.text
      )}&url=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareData.url
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        shareData.text + ' ' + shareData.url
      )}`,
    };

    window.open(shareUrls.whatsapp, '_blank', 'width=600,height=400');
  }

  openFollowersModal(): void {
    this.showFollowersModal = true;
  }

  closeFollowersModal(): void {
    this.showFollowersModal = false;
  }

  openFollowingModal(): void {
    this.showFollowingModal = true;
  }

  closeFollowingModal(): void {
    this.showFollowingModal = false;
  }

  onFollowerSelected(follower: FollowerUser): void {
    console.log('📱 Follower selected:', follower);
    this.closeFollowersModal();
    this.router.navigate(['/user', follower.username]);
  }

  onFollowingSelected(following: FollowingUser): void {
    console.log('📱 Following selected:', following);
    this.closeFollowingModal();
    this.router.navigate(['/user', following.username]);
  }

  onUserUnfollowed(userId: string): void {
    this.following = this.following.filter((user) => user.id !== userId);
    console.log('👥 User unfollowed, updated following list');
  }
}
