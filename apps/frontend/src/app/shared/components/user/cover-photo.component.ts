import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../services/user/image.service';

@Component({
  selector: 'app-cover-photo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContainerClass()">
      <img
        [src]="getCoverUrl()"
        [alt]="alt"
        [class]="getImageClass()"
        (error)="onCoverError($event)"
      />
    </div>
  `,
  styleUrls: [],
})
export class CoverPhotoComponent {
  @Input() coverPhoto: string | null | undefined = null;
  @Input() alt = 'Cover photo';
  @Input() height = 'h-48';
  @Input() containerClass = '';
  @Input() imageClass = '';
  @Input() rounded = true;
  @Input() overflow = true;

  constructor(private imageService: ImageService) {}

  getContainerClass(): string {
    let baseClass = this.height;

    if (this.overflow) {
      baseClass += ' overflow-hidden';
    }

    if (this.rounded) {
      baseClass += ' rounded-t-xl';
    }

    if (this.containerClass) {
      baseClass += ` ${this.containerClass}`;
    }

    return baseClass;
  }

  getImageClass(): string {
    let baseClass = 'w-full h-full object-cover';

    if (this.imageClass) {
      baseClass += ` ${this.imageClass}`;
    }

    return baseClass;
  }

  getCoverUrl(): string {
    return this.imageService.getCoverUrl(this.coverPhoto);
  }

  onCoverError(event: any): void {
    this.imageService.onCoverError(event);
  }
}
