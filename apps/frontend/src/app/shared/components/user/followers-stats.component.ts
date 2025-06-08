import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-followers-stats',
  template: `
    <div
      class="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200"
    >
      <div class="text-3xl font-bold text-blue-600 mb-1">
        {{ followersCount }}
      </div>
      <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">
        Followers
      </div>
    </div>
  `,
  standalone: true,
  imports: [],
})
export class FollowersStatsComponent {
  @Input() followersCount = 0;
}
