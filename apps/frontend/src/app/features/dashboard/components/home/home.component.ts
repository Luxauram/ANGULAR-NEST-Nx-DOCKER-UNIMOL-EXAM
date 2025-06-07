import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../../posts/services/feed.service';
import { Post } from '../../../../core/models/post.model';
import { PostFormComponent } from '../../../posts/components/post-form/post-form.component';
import { PostListComponent } from '../../../posts/components/post-list/post-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostFormComponent, PostListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  feedPosts: Post[] = [];
  isLoading = false;

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.feedService.getFeed().subscribe({
      next: (posts) => {
        this.feedPosts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading feed:', error);
        this.isLoading = false;
      },
    });
  }

  refreshFeed(): void {
    this.feedService.refreshFeed().subscribe({
      next: () => {
        this.loadFeed();
      },
      error: (error) => {
        console.error('Error refreshing feed:', error);
      },
    });
  }

  onPostCreated(post: Post): void {
    this.feedPosts.unshift(post);
  }
}
