import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-profile-button',
  template: `
    <button
      (click)="onEditProfile()"
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        ></path>
      </svg>
      Modifica Profilo
    </button>
  `,
  standalone: true,
})
export class EditProfileButtonComponent {
  @Output() editProfile = new EventEmitter<void>();

  onEditProfile(): void {
    this.editProfile.emit();
  }
}
