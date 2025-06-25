import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comment-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onCommentClick($event)"
      class="flex items-center space-x-1 hover:text-blue-500 transition-colors"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        ></path>
      </svg>
      <span>{{ commentsCount }}</span>
    </button>
  `,
})
export class CommentButtonComponent {
  @Input() postId!: string;
  @Input() commentsCount = 0;
  @Output() commentClicked = new EventEmitter<string>();

  constructor(private toastr: ToastrService) {}

  onCommentClick(event: Event): void {
    event.preventDefault();

    this.toastr.info(
      'Questa funzionalità non è ancora stata implementata',
      'Feature non implementata',
      {
        timeOut: 4000,
        progressBar: true,
        closeButton: true,
      }
    );

    // Emetti l'evento per il componente padre (se necessario per tracking o altre logiche)
    this.commentClicked.emit(this.postId);
  }
}
