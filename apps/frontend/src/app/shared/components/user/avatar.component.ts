import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../services/user/image.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="getAvatarUrl()"
      [alt]="alt"
      [class]="avatarClass"
      (error)="onAvatarError($event)"
    />
  `,
  styleUrls: [],
})
export class AvatarComponent {
  @Input() avatar: string | null | undefined = null;
  @Input() alt = 'Avatar';
  @Input() size: 'small' | 'medium' | 'large' | 'extralarge' | 'custom' =
    'medium';
  @Input() customClass = '';
  @Input() borderColor = 'border-white';
  @Input() borderWidth = 'border-4';
  @Input() shadow = true;

  constructor(private imageService: ImageService) {}

  get avatarClass(): string {
    let baseClass = 'rounded-full object-cover';

    switch (this.size) {
      case 'small':
        baseClass += ' w-8 h-8';
        break;
      case 'medium':
        baseClass += ' w-12 h-12';
        break;
      case 'large':
        baseClass += ' w-24 h-24';
        break;
      case 'extralarge':
        baseClass += ' w-36 h-36';
        break;
      case 'custom':
        break;
    }

    if (this.borderWidth && this.borderColor) {
      baseClass += ` ${this.borderWidth} ${this.borderColor}`;
    }

    if (this.shadow) {
      baseClass += ' shadow-lg';
    }

    if (this.customClass) {
      baseClass += ` ${this.customClass}`;
    }

    return baseClass;
  }

  getAvatarUrl(): string {
    return this.imageService.getAvatarUrl(this.avatar);
  }

  onAvatarError(event: any): void {
    this.imageService.onAvatarError(event);
  }
}
