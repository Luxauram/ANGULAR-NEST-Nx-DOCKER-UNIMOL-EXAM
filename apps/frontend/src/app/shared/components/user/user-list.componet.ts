import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-list-modal',
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]"
      >
        <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
        <button
          (click)="closeEvent.emit()"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            *ngFor="let user of users"
            class="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
          >
            <img
              [src]="user.avatarUrl || '/default-avatar.png'"
              class="size-10 rounded-full object-cover"
              alt="Avatar di {{ user.username }}"
            />
            <div>
              <p class="font-medium">"&#64;"{{ user.username }}</p>
              <p class="text-sm text-gray-600">
                {{ user.firstName }} {{ user.lastName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep .modal-enter {
        opacity: 0;
        transform: translateY(-10px);
      }

      ::ng-deep .modal-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.3s ease-out;
      }
    `,
  ],
})
export class UserListModalComponent {
  @Input() users: any[] = [];
  @Input() title = '';
  @Input() isVisible = false;

  @Output() closeEvent = new EventEmitter<void>();

  onClose(): void {
    this.closeEvent.emit();
  }
}
