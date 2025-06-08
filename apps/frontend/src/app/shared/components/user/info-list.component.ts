import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoItem {
  label: string;
  value: string;
  type?: 'text' | 'attachments';
}

export interface Attachment {
  name: string;
  size: string;
  downloadUrl?: string;
}

@Component({
  selector: 'app-info-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="px-4 sm:px-0">
        <h3 class="text-base/7 font-semibold text-gray-900">{{ title }}</h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">{{ subtitle }}</p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div
            *ngFor="let item of items"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
          >
            <dt class="text-sm/6 font-medium text-gray-900">
              {{ item.label }}
            </dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <!-- Contenuto normale -->
              <span *ngIf="item.type !== 'attachments'">{{ item.value }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  `,
  styles: [],
})
export class InfoListComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() items: InfoItem[] = [];
}
