/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropdownComponent } from './dropdown.component';
import { DropdownItem, DropdownSection } from './dropdown.types';

// Dropdown Menu Azioni Base
@Component({
  selector: 'dropdown-actions',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <app-dropdown
      [config]="{ buttonText: buttonText, showChevron: true }"
      [sections]="actionSections"
      (itemSelected)="onItemSelected($event)"
    ></app-dropdown>
  `,
})
export class DropdownActionsComponent {
  @Input() buttonText = 'Azioni';
  @Input() items: DropdownItem[] = [];
  @Output() itemSelected = new EventEmitter<DropdownItem>();

  get actionSections(): DropdownSection[] {
    return this.items.length > 0 ? [{ items: this.items }] : [];
  }

  onItemSelected(item: DropdownItem): void {
    this.itemSelected.emit(item);
  }
}

// Dropdown Menu Utente
@Component({
  selector: 'dropdown-user',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <app-dropdown
      [config]="{
        buttonText: userName,
        buttonClass:
          'inline-flex items-center gap-x-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-150'
      }"
      [sections]="userSections"
      (itemSelected)="onItemSelected($event)"
    >
      <ng-template #buttonTemplate>
        <div class="flex items-center gap-x-2">
          <div
            class="size-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          >
            {{ userInitials }}
          </div>
          {{ userName }}
        </div>
      </ng-template>
    </app-dropdown>
  `,
})
export class DropdownUserComponent {
  @Input() userName = 'Utente';
  @Input() profileItems: DropdownItem[] = [
    { id: 'profile', label: 'Il tuo profilo' },
    { id: 'settings', label: 'Impostazioni' },
  ];
  @Input() actionItems: DropdownItem[] = [{ id: 'logout', label: 'Esci' }];
  @Output() itemSelected = new EventEmitter<DropdownItem>();

  get userInitials(): string {
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  get userSections(): DropdownSection[] {
    const sections: DropdownSection[] = [];

    if (this.profileItems.length > 0) {
      sections.push({ items: this.profileItems });
    }

    if (this.actionItems.length > 0) {
      sections.push({ items: this.actionItems });
    }

    return sections;
  }

  onItemSelected(item: DropdownItem): void {
    this.itemSelected.emit(item);
  }
}

// Dropdown Menu Contestuale (3 punti)
@Component({
  selector: 'dropdown-menu-dots',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <app-dropdown
      [config]="{
        buttonClass:
          'inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150',
        showChevron: false,
        width: 'w-48'
      }"
      [sections]="menuSections"
      (itemSelected)="onItemSelected($event)"
    >
      <ng-template #buttonTemplate>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
          ></path>
        </svg>
      </ng-template>
    </app-dropdown>
  `,
})
export class DropdownMenuDotsComponent {
  @Input() editItems: DropdownItem[] = [
    { id: 'edit', label: 'Modifica' },
    { id: 'duplicate', label: 'Duplica' },
  ];
  @Input() organizeItems: DropdownItem[] = [
    { id: 'archive', label: 'Archivia' },
    { id: 'move', label: 'Sposta' },
  ];
  @Input() shareItems: DropdownItem[] = [
    { id: 'share', label: 'Condividi' },
    { id: 'favorites', label: 'Aggiungi ai preferiti' },
  ];
  @Input() dangerItems: DropdownItem[] = [{ id: 'delete', label: 'Elimina' }];
  @Output() itemSelected = new EventEmitter<DropdownItem>();

  get menuSections(): DropdownSection[] {
    const sections: DropdownSection[] = [];

    if (this.editItems.length > 0) {
      sections.push({ items: this.editItems });
    }

    if (this.organizeItems.length > 0) {
      sections.push({ items: this.organizeItems });
    }

    if (this.shareItems.length > 0) {
      sections.push({ items: this.shareItems });
    }

    if (this.dangerItems.length > 0) {
      sections.push({ items: this.dangerItems });
    }

    return sections;
  }

  onItemSelected(item: DropdownItem): void {
    this.itemSelected.emit(item);
  }
}
