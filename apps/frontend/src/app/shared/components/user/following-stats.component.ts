import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-following-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="text-center cursor-pointer group"
      (click)="onFollowingClick()"
      (keydown.enter)="onFollowingClick()"
      (keydown.space)="onFollowingClick()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Visualizza ' + followingCount + ' follower'"
    >
      <div
        class="bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 rounded-xl p-4 transition-all duration-200 transform group-hover:scale-105"
      >
        <div class="flex items-center justify-center space-x-2 mb-2">
          <svg
            class="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            ></path>
          </svg>
          <span
            class="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors"
          >
            {{ followingCount }}
          </span>
        </div>
        <p
          class="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors"
        >
          Following
        </p>
        <p
          class="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Clicca per vedere
        </p>
      </div>
    </div>
  `,
})
export class FollowingStatsComponent {
  @Input() followingCount = 0;
  @Output() followingClicked = new EventEmitter<void>();

  onFollowingClick() {
    this.followingClicked.emit();
  }
}
