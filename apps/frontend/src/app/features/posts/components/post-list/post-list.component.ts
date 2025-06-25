import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../models/post.model';
import { User } from '../../../../models/user.model';
import { PostService } from '../../../../services/post/post.service';
import { AvatarComponent } from '../../../../shared/components/user/avatar.component';
import { LikeButtonComponent } from '../../../../shared/ui/buttons/like-button.component';
import { CommentButtonComponent } from '../../../../shared/ui/buttons/comment-button.component';
import { ShareButtonComponent } from '../../../../shared/ui/buttons/share-button.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule, 
    AvatarComponent, 
    LikeButtonComponent, 
    CommentButtonComponent, 
    ShareButtonComponent
  ],
  templateUrl: './post-list.component.html',
})
export class PostListComponent implements OnInit {
  @Input() posts: Post[] = [];
  @Input() user: User | null = null;
  @Input() isLoading = false;
  @Input() hasMorePosts = false;
  @Input() currentUserId?: string;
  @Output() loadMorePosts = new EventEmitter<number>();
  @Output() postLiked = new EventEmitter<string>();
  @Output() postDeleted = new EventEmitter<string>();
  @Output() postShared = new EventEmitter<string>();
  @Output() commentClicked = new EventEmitter<string>();

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
      return 'Ora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m fa`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h fa`;
    } else if (diffInDays < 7) {
      return `${diffInDays}g fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  }

  // Gestisce l'evento di like dal componente figlio
  onLikeToggled(event: { postId: string; liked: boolean; likesCount: number }): void {
    // Aggiorna il post nella lista locale
    const post = this.posts.find((p) => p.id === event.postId);
    if (post) {
      post.liked = event.liked;
      post.likesCount = event.likesCount;
    }

    // Propaga l'evento al componente padre
    this.postLiked.emit(event.postId);
  }

  // Gestisce l'evento di click sui commenti
  onCommentClicked(postId: string): void {
    this.commentClicked.emit(postId);
  }

  // Gestisce l'evento di condivisione
  onPostShared(postId: string): void {
    this.postShared.emit(postId);
  }

  // Metodo per eliminare post (rimane invariato)
  deletePost(postId: string): void {
    if (confirm('Sei sicuro di voler eliminare questo post?')) {
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

  loadMore(): void {
    this.currentPage++;
    this.loadMorePosts.emit(this.currentPage);
  }

  // Metodo helper per controllare se l'utente può modificare/eliminare il post
  canModifyPost(post: Post, currentUserId?: string): boolean {
    return post.userId === currentUserId;
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