// src/app/ui/dropdown/dropdown.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  DropdownItem,
  DropdownSection,
  DropdownConfig,
} from './dropdown.types';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Button Trigger -->
      <div>
        <button
          type="button"
          [class]="getButtonClasses()"
          [attr.aria-expanded]="isOpen"
          aria-haspopup="true"
          (click)="toggleDropdown()"
        >
          <!-- Custom button content -->
          <ng-container *ngIf="buttonTemplate; else defaultButton">
            <ng-container *ngTemplateOutlet="buttonTemplate"></ng-container>
          </ng-container>

          <ng-template #defaultButton>
            {{ config.buttonText || 'Options' }}
            <svg
              *ngIf="config.showChevron !== false"
              class="-mr-1 size-5 text-gray-400 transition-transform duration-200"
              [class.rotate-180]="isOpen"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </ng-template>
        </button>
      </div>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen"
        [class]="getMenuClasses()"
        [class.menu-enter]="isAnimated"
        [class.menu-exit]="!isAnimated"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <!-- Custom content -->
        <ng-container *ngIf="contentTemplate; else defaultContent">
          <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
        </ng-container>

        <!-- Default content with sections -->
        <ng-template #defaultContent>
          <div
            *ngFor="
              let section of sections;
              let sectionIndex = index;
              let isLast = last
            "
            class="py-1"
            [class.border-b]="!isLast && sections.length > 1"
            [class.border-gray-100]="!isLast && sections.length > 1"
            role="none"
          >
            <!-- Section title -->
            <div
              *ngIf="section.title"
              class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {{ section.title }}
            </div>

            <!-- Section items -->
            <ng-container
              *ngFor="let item of section.items; let itemIndex = index"
            >
              <!-- Router link -->
              <a
                *ngIf="item.routerLink && !item.disabled"
                [routerLink]="item.routerLink"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                role="menuitem"
                tabindex="-1"
                [attr.id]="'menu-item-' + sectionIndex + '-' + itemIndex"
                (click)="onItemClick($event, item)"
              >
                {{ item.label }}
              </a>

              <!-- External link -->
              <a
                *ngIf="item.href && !item.disabled && !item.routerLink"
                [href]="item.href"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                role="menuitem"
                tabindex="-1"
                [attr.id]="'menu-item-' + sectionIndex + '-' + itemIndex"
                (click)="onItemClick($event, item)"
              >
                {{ item.label }}
              </a>

              <!-- Button/Action item -->
              <button
                *ngIf="!item.href && !item.routerLink"
                type="button"
                class="w-full text-left block px-4 py-2 text-sm transition-colors duration-150"
                [class.text-gray-700]="!item.disabled"
                [class.hover:bg-gray-100]="!item.disabled"
                [class.hover:text-gray-900]="!item.disabled"
                [class.text-gray-400]="item.disabled"
                [class.cursor-not-allowed]="item.disabled"
                [disabled]="item.disabled"
                role="menuitem"
                tabindex="-1"
                [attr.id]="'menu-item-' + sectionIndex + '-' + itemIndex"
                (click)="onItemClick($event, item)"
              >
                {{ item.label }}
              </button>
            </ng-container>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent {
  @Input() config: DropdownConfig = {};
  @Input() sections: DropdownSection[] = [];
  @Output() itemSelected = new EventEmitter<DropdownItem>();
  @Output() dropdownToggled = new EventEmitter<boolean>();

  @ContentChild('buttonTemplate') buttonTemplate?: TemplateRef<any>;
  @ContentChild('contentTemplate') contentTemplate?: TemplateRef<any>;

  isOpen = false;
  isAnimated = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    this.isOpen = true;
    this.dropdownToggled.emit(true);
    setTimeout(() => {
      this.isAnimated = true;
    }, 10);
  }

  closeDropdown(): void {
    this.isAnimated = false;
    this.dropdownToggled.emit(false);
    setTimeout(() => {
      this.isOpen = false;
    }, 100);
  }

  onItemClick(event: Event, item: DropdownItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (!item.href && !item.routerLink) {
      event.preventDefault();
    }

    this.closeDropdown();

    if (item.action) {
      item.action();
    }

    this.itemSelected.emit(item);
  }

  getButtonClasses(): string {
    const baseClasses =
      'inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset transition-colors duration-150';
    const defaultClasses =
      'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50';

    return this.config.buttonClass || `${baseClasses} ${defaultClasses}`;
  }

  getMenuClasses(): string {
    const baseClasses =
      'absolute z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden dropdown-menu';
    const positionClass =
      this.config.position === 'left' ? 'left-0' : 'right-0';
    const widthClass = this.config.width || 'w-56';
    const customClasses = this.config.menuClass || '';

    return `${baseClasses} ${positionClass} ${widthClass} ${customClasses}`.trim();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.closeDropdown();
  }
}
