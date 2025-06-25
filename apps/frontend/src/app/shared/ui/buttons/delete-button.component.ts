import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../services/post/post.service';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onDeleteClick()"
      [disabled]="isDeleting"
      class="flex items-center space-x-1 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      [title]="'Elimina post'"
    >
      <svg
        class="w-4 h-4"
        [class.animate-spin]="isDeleting"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          *ngIf="!isDeleting"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        ></path>
        <path
          *ngIf="isDeleting"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        ></path>
      </svg>
      <span *ngIf="showText && !isDeleting">Elimina</span>
      <span *ngIf="showText && isDeleting">Eliminando...</span>
    </button>
  `,
})
export class DeleteButtonComponent implements OnInit {
  @Input() postId!: string;
  @Input() confirmMessage = 'Sei sicuro di voler eliminare questo post?';
  @Input() showText = false;
  @Output() postDeleted = new EventEmitter<{
    postId: string;
    success: boolean;
    error?: string;
  }>();

  isDeleting = false;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    if (!this.postId || this.postId === 'undefined') {
      console.error('❌ Delete Button: Invalid postId:', this.postId);
    }
  }

  onDeleteClick(): void {
    // Validazione postId
    if (!this.postId || this.postId === 'undefined') {
      console.error('❌ DeleteButton: Invalid postId:', this.postId);
      alert('Errore: ID post non valido');
      return;
    }

    if (this.isDeleting) {
      return;
    }

    // Mostra conferma
    if (!confirm(this.confirmMessage)) {
      return;
    }

    console.log('🗑️ Deleting post:', this.postId);
    this.isDeleting = true;

    this.postService.deletePost(this.postId).subscribe({
      next: (response) => {
        console.log('✅ Post deleted successfully:', response);
        this.isDeleting = false;

        // Emetti l'evento di successo IMMEDIATAMENTE
        this.postDeleted.emit({
          postId: this.postId,
          success: true,
        });

        // Forza un change detection per assicurarsi che l'UI si aggiorni
        setTimeout(() => {
          console.log('🔄 Post deletion UI update completed');
        }, 0);
      },
      error: (error) => {
        console.error('❌ Error deleting post:', error);
        this.isDeleting = false;

        // Emetti l'evento di errore
        this.postDeleted.emit({
          postId: this.postId,
          success: false,
          error: error.message || "Errore durante l'eliminazione del post",
        });

        // Mostra messaggio di errore all'utente
        alert("Errore durante l'eliminazione del post. Riprova più tardi.");
      },
    });
  }
}
