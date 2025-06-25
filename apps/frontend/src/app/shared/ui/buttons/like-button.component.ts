import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../services/post/post.service';

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onLikeClick()"
      class="flex items-center space-x-1 hover:text-red-500 transition-colors"
      [class.text-red-500]="isLiked"
      [disabled]="isLoading"
    >
      <svg
        class="w-4 h-4"
        [class.fill-current]="isLiked"
        [class.animate-pulse]="isLoading"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
      <span>{{ likesCount }}</span>
    </button>
  `,
})
export class LikeButtonComponent {
  @Input() postId!: string;
  @Input() likesCount = 0;
  @Input() isLiked = false;
  @Output() likeToggled = new EventEmitter<{
    postId: string;
    liked: boolean;
    likesCount: number;
  }>();

  isLoading = false;

  constructor(private postService: PostService) {}

  onLikeClick(): void {
    // FIX: Validazione postId
    if (!this.postId || this.postId === 'undefined') {
      console.error('❌ LikeButton: Invalid postId:', this.postId);
      alert('Errore: ID post non valido');
      return;
    }

    if (this.isLoading) return;

    console.log('❤️ Liking post with ID:', this.postId);
    this.isLoading = true;

    // Usa il nuovo metodo toggleLike che passa lo stato attuale
    this.postService.toggleLike(this.postId, this.isLiked).subscribe({
      next: (response) => {
        console.log('Post liked/unliked:', response);

        // Aggiorna lo stato locale basandosi sulla risposta del server
        // Se il server non restituisce questi campi, usa la logica locale
        const newLiked =
          response.liked !== undefined ? response.liked : !this.isLiked;
        const newLikesCount =
          response.likesCount !== undefined
            ? response.likesCount
            : newLiked
            ? this.likesCount + 1
            : Math.max(0, this.likesCount - 1);

        this.isLiked = newLiked;
        this.likesCount = newLikesCount;

        // Emetti l'evento per il componente padre
        this.likeToggled.emit({
          postId: this.postId,
          liked: this.isLiked,
          likesCount: this.likesCount,
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.isLoading = false;
      },
    });
  }
}
