import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-following-stats',
  template: `
    <div
      class="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-200"
    >
      <div class="text-3xl font-bold text-purple-600 mb-1">
        {{ followingCount }}
      </div>
      <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">
        Following
      </div>
    </div>
  `,
  standalone: true,
  imports: [],
})
export class FollowingStatsComponent {
  @Input() followingCount = 0;
}
