import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../models/post.model';
import { PostService } from '../../../../services/post/post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  @Input() posts: Post[] = [];
  @Input() isLoading = false;
  @Input() hasMorePosts = false;
  @Input() currentUserId?: string;
  @Output() loadMorePosts = new EventEmitter<number>();
  @Output() postLiked = new EventEmitter<string>();
  @Output() postDeleted = new EventEmitter<string>();

  currentPage = 1;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    // Ordina i post per data (più recenti prima)
    this.posts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Implementazione corretta del like usando l'API
  likePost(postId: string): void {
    this.postService.toggleLike(postId).subscribe({
      next: (response) => {
        console.log('Post liked/unliked:', response);
        this.postLiked.emit(postId);
        // Aggiorna il post nella lista locale se necessario
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          // Assumendo che la risposta contenga il nuovo stato del like
          if (response.liked !== undefined) {
            post.liked = response.liked;
            post.likesCount = response.likesCount ?? post.likesCount ?? 0;
          }
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      },
    });
  }

  // Metodo per unlike esplicito (se necessario)
  unlikePost(postId: string): void {
    this.postService.unlikePost(postId).subscribe({
      next: (response) => {
        console.log('Post unliked:', response);
        this.postLiked.emit(postId);
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.liked = false;
          // Gestisce il caso in cui likesCount sia undefined
          const currentLikes = post.likesCount ?? 0;
          if (currentLikes > 0) {
            post.likesCount = currentLikes - 1;
          } else {
            post.likesCount = 0;
          }
        }
      },
      error: (error) => {
        console.error('Error unliking post:', error);
      },
    });
  }

  // Metodo per eliminare post
  deletePost(postId: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          console.log('Post deleted:', postId);
          this.postDeleted.emit(postId);
          // Rimuovi il post dalla lista locale
          this.posts = this.posts.filter((p) => p.id !== postId);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
        },
      });
    }
  }

  // Incrementa contatore commenti
  incrementComments(postId: string): void {
    this.postService.incrementComments(postId).subscribe({
      next: (response) => {
        console.log('Comments incremented:', response);
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.commentsCount = (post.commentsCount ?? 0) + 1;
        }
      },
      error: (error) => {
        console.error('Error incrementing comments:', error);
      },
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.loadMorePosts.emit(this.currentPage);
  }

  // Metodo helper per controllare se l'utente può modificare/eliminare il post
  canModifyPost(post: Post, currentUserId?: string): boolean {
    return post.userId === currentUserId;
  }

  // Metodo per formattare i tag
  formatTags(tags?: string[]): string {
    if (!tags || tags.length === 0) return '';
    return tags.join(', ');
  }

  // Metodi helper per gestire valori undefined nei template
  getLikesCount(post: Post): number {
    return post.likesCount ?? 0;
  }

  getCommentsCount(post: Post): number {
    return post.commentsCount ?? 0;
  }

  isPostLiked(post: Post): boolean {
    return post.liked ?? false;
  }
}
