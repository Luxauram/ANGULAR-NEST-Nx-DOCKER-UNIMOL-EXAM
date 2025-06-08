import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-posts-stats',
  template: `
    <div
      class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-200"
    >
      <div class="text-3xl font-bold text-green-600 mb-1">
        {{ postsCount }}
      </div>
      <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">
        Posts
      </div>
    </div>
  `,
  standalone: true,
  imports: [],
})
export class PostsStatsComponent {
  @Input() postsCount = 0;
}
