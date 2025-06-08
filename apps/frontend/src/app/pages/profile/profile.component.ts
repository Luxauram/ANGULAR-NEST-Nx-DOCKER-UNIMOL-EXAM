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
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = [];
  followers: any[] = [];
  following: any[] = [];
  isLoading = false;
  applicantInfo: InfoItem[] = [];

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
      // Redirect to login if no user
      this.router.navigate(['/login']);
    }
  }

  // Update Info after reload
  private initializeApplicantInfo(): void {
    if (!this.user) return;

    // Separa fullName in firstName e lastName se necessario
    // const nameParts = this.user.fullName?.split(' ') || [];
    // const firstName = nameParts[0] || '';
    // const lastName = nameParts.slice(1).join(' ') || '';

    this.applicantInfo = [
      {
        label: 'Nome',
        value: this.user.firstName || 'Nome non disponibile',
      },
      {
        label: 'Cognome',
        value: this.user.lastName || 'Cognome non disponibile',
      },
      // {
      //   label: 'Nome Completo',
      //   value: this.user.fullName || 'Nome completo non disponibile',
      // },
      {
        label: 'Email',
        value: this.user.email || 'Email non disponibile',
      },
      {
        label: 'Username',
        value: this.user.username || 'Username non disponibile',
      },
      // {
      //   label: 'Data di nascita',
      //   value: this.user.dateOfBirth || '30/04/92', // Fallback se non disponibile
      // },
      // {
      //   label: 'Città di nascita',
      //   value: this.user.birthPlace || 'Termoli', // Fallback se non disponibile
      // },
      {
        label: 'Biografia',
        value: this.user.bio || 'Biografia non disponibile',
      },
    ];

    console.log('📋 ApplicantInfo initialized:', this.applicantInfo);
  }

  loadUserData(): void {
    if (!this.user) return;

    console.log('🔄 Loading user data for user:', this.user.id);
    this.isLoading = true;

    // Carica i post dell'utente
    this.postService.getUserPosts(this.user.id).subscribe({
      next: (posts) => {
        console.log('📝 Posts loaded:', posts);
        this.userPosts = posts;
      },
      error: (error) => {
        console.error('❌ Error loading user posts:', error);
      },
    });

    // Carica followers
    this.socialService.getFollowers(this.user.id).subscribe({
      next: (followers) => {
        console.log('👥 Followers loaded:', followers);
        this.followers = followers;
      },
      error: (error) => {
        console.error('❌ Error loading followers:', error);
      },
    });

    // Carica following
    this.socialService.getFollowing(this.user.id).subscribe({
      next: (following) => {
        console.log('👤 Following loaded:', following);
        this.following = following;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading following:', error);
        this.isLoading = false;
      },
    });
  }

  refreshUserProfile(): void {
    // Se hai un endpoint per recuperare i dati completi dell'utente
    // Puoi implementare questo metodo per fare una chiamata API
    console.log('🔄 Refreshing user profile...');

    // Esempio di implementazione (se hai un UserService):
    // this.userService.getProfile(this.user!.id).subscribe({
    //   next: (updatedUser) => {
    //     this.user = updatedUser;
    //     this.authService.setCurrentUser(updatedUser, this.authService.getToken()!);
    //     this.initializeApplicantInfo();
    //   },
    //   error: (error) => console.error('Error refreshing profile:', error)
    // });
  }

  // Modifica Profilo
  handleEditProfile(): void {
    this.router.navigate(['/profile/update']);
  }

  // Condividi Profilo
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
}
