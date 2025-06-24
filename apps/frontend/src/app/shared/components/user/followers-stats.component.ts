import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-followers-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="text-center cursor-pointer group"
      (click)="onFollowersClick()"
      (keydown.enter)="onFollowersClick()"
      (keydown.space)="onFollowersClick()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Visualizza ' + followersCount + ' follower'"
    >
      <div
        class="bg-gradient-to-br from-purple-50 to-indigo-50 group-hover:from-purple-100 group-hover:to-indigo-100 rounded-xl p-4 transition-all duration-200 transform group-hover:scale-105"
      >
        <div class="flex items-center justify-center space-x-2 mb-2">
          <svg
            class="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <span
            class="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors"
          >
            {{ followersCount }}
          </span>
        </div>
        <p
          class="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors"
        >
          Followers
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
export class FollowersStatsComponent {
  @Input() followersCount = 0;
  @Output() followersClicked = new EventEmitter<void>();

  onFollowersClick() {
    this.followersClicked.emit();
  }
}
