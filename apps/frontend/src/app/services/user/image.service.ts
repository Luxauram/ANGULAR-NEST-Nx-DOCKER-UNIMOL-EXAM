import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly DEFAULT_AVATAR = '/default-avatar.png';
  private readonly DEFAULT_COVER = '/default-cover.jpg';

  /**
   * Restituisce l'URL dell'avatar o quello di default se non disponibile
   */
  getAvatarUrl(avatarUrl?: string | null): string {
    return avatarUrl || this.DEFAULT_AVATAR;
  }

  /**
   * Restituisce l'URL della cover o quello di default se non disponibile
   */
  getCoverUrl(coverUrl?: string | null): string {
    return coverUrl || this.DEFAULT_COVER;
  }

  /**
   * Gestisce l'errore di caricamento dell'immagine
   */
  onImageError(event: any, fallbackUrl: string): void {
    if (event?.target) {
      event.target.src = fallbackUrl;
    }
  }

  /**
   * Gestisce l'errore di caricamento dell'avatar
   */
  onAvatarError(event: any): void {
    this.onImageError(event, this.DEFAULT_AVATAR);
  }

  /**
   * Gestisce l'errore di caricamento della cover
   */
  onCoverError(event: any): void {
    this.onImageError(event, this.DEFAULT_COVER);
  }
}
