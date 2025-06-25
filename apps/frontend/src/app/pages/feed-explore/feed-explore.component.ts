import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { FeedService } from '../../services/post/feed.service';
import { PostService } from '../../services/post/post.service';
import { ImageService } from '../../services/user/image.service';

@Component({
  selector: 'app-feed-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed-explore.component.html',
})
export class FeedExploreComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  isLoading = false;
  isLoadingMore = false;
  error: string | null = null;
  currentUserId: string | null = null;
  hasMorePosts = true;

  // Paginazione
  currentPage = 1;
  pageSize = 20;

  constructor(
    private feedService: FeedService,
    private postService: PostService,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    this.loadAllPosts();
  }

  /**
   * Carica tutti i post dal database
   */
  loadAllPosts(): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = 1;

    // Usa il servizio per ottenere tutti i post recenti
    this.feedService
      .getRecentAsPosts(this.currentPage, this.pageSize)
      .subscribe({
        next: (posts) => {
          console.log('🔍 All posts loaded:', posts);
          this.posts = posts;
          this.hasMorePosts = posts.length === this.pageSize;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading posts:', error);
          this.error = 'Impossibile caricare post';
          this.isLoading = false;
        },
      });
  }

  /**
   * Carica più post (paginazione)
   */
  loadMorePosts(): void {
    if (this.isLoadingMore || !this.hasMorePosts) return;

    this.isLoadingMore = true;
    this.currentPage++;

    this.feedService
      .getRecentAsPosts(this.currentPage, this.pageSize)
      .subscribe({
        next: (posts) => {
          console.log(
            `🔍 More posts loaded (page ${this.currentPage}):`,
            posts
          );
          this.posts = [...this.posts, ...posts];
          this.hasMorePosts = posts.length === this.pageSize;
          this.isLoadingMore = false;
        },
        error: (error) => {
          console.error('❌ Error loading more posts:', error);
          this.currentPage--; // Revert page increment on error
          this.isLoadingMore = false;
        },
      });
  }

  /**
   * Ricarica tutti i post
   */
  refreshPosts(): void {
    this.posts = [];
    this.loadAllPosts();
  }

  /**
   * Mette/toglie like a un post - LOGICA CORRETTA
   */
  toggleLike(post: Post): void {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    console.log(
      `🔄 Toggling like for post ${post.id}, currently liked: ${post.liked}`
    );

    // Usa il nuovo metodo toggleLike che gestisce automaticamente like/unlike
    this.postService.toggleLike(post.id, post.liked || false).subscribe({
      next: (response) => {
        console.log('✅ Like toggled successfully:', response);

        // Aggiorna lo stato locale basandosi sulla risposta del server
        // Se il server non restituisce questi campi, usa la logica locale
        const newLiked =
          response.liked !== undefined ? response.liked : !post.liked;
        const newLikesCount =
          response.likesCount !== undefined
            ? response.likesCount
            : newLiked
            ? (post.likesCount || 0) + 1
            : Math.max(0, (post.likesCount || 0) - 1);

        post.liked = newLiked;
        post.likesCount = newLikesCount;

        console.log(
          `✅ Post ${post.id} updated: liked=${newLiked}, count=${newLikesCount}`
        );
      },
      error: (error) => {
        console.error('❌ Error toggling like:', error);
        // Non aggiornare lo stato locale in caso di errore
      },
    });
  }

  /**
   * Naviga ai dettagli del post
   */
  viewPost(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }

  /**
   * Naviga al profilo dell'autore
   */
  viewProfile(userId: string | undefined): void {
    if (!userId) {
      console.error('User ID not available');
      return;
    }
    this.router.navigate(['/user/', userId]);
  }

  /**
   * Condivide un post
   */
  sharePost(post: Post): void {
    // Implementa la logica di condivisione
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.username || 'Utente Sconosciuto'}`,
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      });
    } else {
      // Fallback: copia il link negli appunti
      const url = `${window.location.origin}/posts/${post.id}`;
      navigator.clipboard.writeText(url).then(() => {
        console.log('Post URL copied to clipboard');
        // Potresti mostrare un toast notification qui
      });
    }
  }

  /**
   * Ottiene l'ID dell'utente corrente
   */
  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id || null;
  }

  /**
   * Formatta il numero di like/commenti/condivisioni
   */
  formatCount(count: number | undefined): string {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
  }

  /**
   * Genera un avatar placeholder se non presente
   */
  getUserAvatar(): string {
    return this.imageService.getAvatarUrl(this.user?.avatar);
  }

  /**
   * Formatta la data per la visualizzazione
   */
  getFormattedDate(date: Date | string): string {
    const postDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  }

  /**
   * TrackBy function per ottimizzare ngFor
   */
  trackByPostId(index: number, post: Post): string {
    return post.id;
  }
}
