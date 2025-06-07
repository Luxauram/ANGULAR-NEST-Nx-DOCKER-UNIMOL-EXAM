import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../features/posts/services/post.service';
import { SocialService } from '../../features/users/services/social.service';
import { User } from '../../core/models/user.model';
import { Post } from '../../core/models/post.model';
import { PostListComponent } from '../../features/posts/components/post-list/post-list.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostListComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  userPosts: Post[] = [];
  followers: any[] = [];
  following: any[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private socialService: SocialService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Carica i post dell'utente
    this.postService.getUserPosts(this.currentUser.id).subscribe({
      next: (posts) => {
        this.userPosts = posts;
      },
      error: (error) => console.error('Error loading user posts:', error),
    });

    // Carica followers
    this.socialService.getFollowers(this.currentUser.id).subscribe({
      next: (followers) => {
        this.followers = followers;
      },
      error: (error) => console.error('Error loading followers:', error),
    });

    // Carica following
    this.socialService.getFollowing(this.currentUser.id).subscribe({
      next: (following) => {
        this.following = following;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading following:', error);
        this.isLoading = false;
      },
    });
  }
}
