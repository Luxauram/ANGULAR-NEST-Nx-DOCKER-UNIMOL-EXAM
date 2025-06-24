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
    <div class="border-b border-gray-900/10 pb-6">
      <div
        class="flex justify-between items-center cursor-pointer"
        (click)="toggle()"
        (keydown.enter)="toggle()"
        (keydown.space)="toggle()"
        tabindex="0"
        role="button"
        [attr.aria-expanded]="isOpen ? 'true' : 'false'"
      >
        <h3 class="text-base/7 font-semibold text-gray-900">{{ title }}</h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">{{ subtitle }}</p>
        <svg
          [class.rotate-180]="isOpen"
          class="w-5 h-5 transition-transform duration-200 text-gray-500"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <div *ngIf="isOpen" class="mt-6 space-y-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div
            *ngFor="let item of items"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
          >
            <dt class="text-sm/6 font-medium text-gray-900">
              {{ item.label }}
            </dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
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

  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
