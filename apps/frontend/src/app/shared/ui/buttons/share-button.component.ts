import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onShareClick()"
      class="flex items-center space-x-1 hover:text-green-500 transition-colors"
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        ></path>
      </svg>
      <span>Condividi</span>
    </button>
  `,
})
export class ShareButtonComponent {
  @Input() postId!: string;
  @Input() postTitle?: string;
  @Input() postContent?: string;
  @Input() authorUsername?: string;
  @Output() postShared = new EventEmitter<string>();

  onShareClick(): void {
    this.handleSharePost();
  }

  private handleSharePost(): void {
    const shareData = {
      title: this.postTitle || 'Post interessante',
      text: this.postContent
        ? `${this.postContent.substring(0, 100)}${
            this.postContent.length > 100 ? '...' : ''
          }`
        : 'Guarda questo post interessante!',
      url: `${window.location.origin}/post/${this.postId}`,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {
          console.log('Condivisione completata');
          this.postShared.emit(this.postId);
        })
        .catch((error) => console.log('Errore nella condivisione:', error));
    } else {
      // Fallback: copia il link negli appunti
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => {
          alert('Link del post copiato negli appunti!');
          this.postShared.emit(this.postId);
        })
        .catch(() => {
          // Fallback finale: apri dialog di condivisione
          this.openShareDialog(shareData);
        });
    }
  }

  private openShareDialog(shareData: {
    title: string;
    text: string;
    url: string;
  }): void {
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

    // Apri WhatsApp come default, oppure puoi creare un dialog per scegliere
    window.open(shareUrls.whatsapp, '_blank', 'width=600,height=400');

    // Emetti l'evento di condivisione
    this.postShared.emit(this.postId);
  }
}
