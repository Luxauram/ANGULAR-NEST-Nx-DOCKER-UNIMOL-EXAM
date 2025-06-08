import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-share-profile-button',
  template: `
    <button
      (click)="onShareProfile()"
      class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-black bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <svg
        class="w-4 h-4 mr-2"
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
      Condividi Profilo
    </button>
  `,
  standalone: true,
})
export class ShareProfileButtonComponent {
  @Output() shareProfile = new EventEmitter<void>();

  onShareProfile(): void {
    this.shareProfile.emit();
  }
}
