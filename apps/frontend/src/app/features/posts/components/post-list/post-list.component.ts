import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../models/post.model';
import { User } from '../../../../models/user.model';
import { AvatarComponent } from '../../../../shared/components/user/avatar.component';
import { LikeButtonComponent } from '../../../../shared/ui/buttons/like-button.component';
import { CommentButtonComponent } from '../../../../shared/ui/buttons/comment-button.component';
import { ShareButtonComponent } from '../../../../shared/ui/buttons/share-button.component';
import { DeleteButtonComponent } from '../../../../shared/ui/buttons/delete-button.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    LikeButtonComponent,
    CommentButtonComponent,
    ShareButtonComponent,
    DeleteButtonComponent,
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

  ngOnInit(): void {
    // DEBUG: Controlla la struttura dei post
    console.log('🔍 Posts structure:', this.posts);
    this.posts.forEach((post) => {
      console.log('🔍 Post:', {
        id: post.id,
        _id: post.id,
        title: post.title || post.content?.substring(0, 50),
      });
    });

    // Ordina i post per data (più recenti prima)
    this.posts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  trackByPostId(index: number, post: Post): string {
    // FIX: Usa _id se id non esiste
    const postId = post.id || post.id;
    console.log('🔍 trackByPostId:', { postId, post });
    return postId;
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
  onLikeToggled(event: {
    postId: string;
    liked: boolean;
    likesCount: number;
  }): void {
    console.log('📍 Post list received like toggle event:', event);

    // Aggiorna il post nella lista locale
    const post = this.posts.find((p) => p.id === event.postId);
    if (post) {
      const wasLiked = post.liked;
      const oldCount = post.likesCount;

      // Aggiorna con i nuovi valori
      post.liked = event.liked;
      post.likesCount = event.likesCount;

      console.log(
        `📍 Post ${event.postId} updated: ${wasLiked} -> ${event.liked}, count: ${oldCount} -> ${event.likesCount}`
      );
    } else {
      console.warn('📍 Post not found in local list:', event.postId);
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

  // Gestisce l'evento di eliminazione dal componente delete button
  onPostDeleted(event: {
    postId: string;
    success: boolean;
    error?: string;
  }): void {
    console.log('🗑️ Post list received delete event:', event);

    if (event.success) {
      // Rimuovi il post dalla lista locale
      this.posts = this.posts.filter((p) => p.id !== event.postId);
      console.log('✅ Post removed from local list:', event.postId);

      // Propaga l'evento al componente padre
      this.postDeleted.emit(event.postId);
    } else {
      console.error('❌ Delete failed:', event.error);
      // L'errore è già gestito nel DeleteButtonComponent
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

  getPostId(post: Post): string {
    const postId = post.id || post._id || '';
    if (!postId) {
      console.error('❌ Post without ID:', post);
    }
    return postId;
  }
}
