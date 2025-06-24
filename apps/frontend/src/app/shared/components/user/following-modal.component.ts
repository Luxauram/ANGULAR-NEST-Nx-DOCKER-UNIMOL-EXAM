import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService } from '../../../services/user/social.service';
import { AvatarComponent } from './avatar.component';

export interface FollowingUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'app-following-modal',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      *ngIf="isOpen"
      (click)="closeModal()"
      (keydown.enter)="closeModal()"
      (keydown.space)="closeModal()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Chiudi modal'"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden"
        (click)="$event.stopPropagation()"
        tabindex="0"
        role="button"
        [attr.aria-label]="'Chiudi modal'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            Following ({{ totalCount }})
          </h3>
          <button
            (click)="closeModal()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            (keydown.enter)="closeModal()"
            (keydown.space)="closeModal()"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Chiudi modal'"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto max-h-80">
          <div *ngIf="isLoading" class="p-4 text-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
            ></div>
            <p class="mt-2 text-gray-600">Caricamento following...</p>
          </div>

          <div
            *ngIf="!isLoading && following.length === 0"
            class="p-4 text-center text-gray-500"
          >
            Non stai seguendo nessuno
          </div>

          <div
            *ngIf="!isLoading && following.length > 0"
            class="divide-y divide-gray-100"
          >
            <div
              *ngFor="let user of following"
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              (click)="onUserClick(user)"
              (keydown.enter)="onUserClick(user)"
              (keydown.space)="onUserClick(user)"
              tabindex="0"
              role="button"
              [attr.aria-label]="
                'Segui ' +
                getDisplayName(user) +
                ' (&#64;' +
                user.username +
                ')'
              "
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <app-avatar
                    [avatar]="user.avatar"
                    [alt]="user.username"
                    size="medium"
                    [shadow]="true"
                  >
                  </app-avatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ getDisplayName(user) }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      "&#64;"{{ user.username }}
                    </p>
                  </div>
                </div>
                <button
                  (click)="unfollowUser(user, $event)"
                  class="px-3 py-1 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  (keydown.enter)="unfollowUser(user, $event)"
                  (keydown.space)="unfollowUser(user, $event)"
                  tabindex="0"
                  role="button"
                  [attr.aria-label]="'Segui ' + getDisplayName(user)"
                >
                  Unfollow
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer con Load More se necessario -->
        <div *ngIf="hasMore && !isLoading" class="p-4 border-t">
          <button
            (click)="loadMore()"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            (keydown.enter)="loadMore()"
            (keydown.space)="loadMore()"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Carica altri followers'"
          >
            Carica altri
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FollowingModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() userId!: string;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() userSelected = new EventEmitter<FollowingUser>();
  @Output() userUnfollowed = new EventEmitter<string>();

  following: FollowingUser[] = [];
  isLoading = false;
  totalCount = 0;
  hasMore = false;
  currentOffset = 0;
  readonly limit = 20;

  constructor(private socialService: SocialService) {}

  ngOnInit() {
    if (this.isOpen) {
      this.loadFollowing();
    }
  }

  ngOnChanges() {
    if (this.isOpen && this.following.length === 0) {
      this.loadFollowing();
    }
  }

  // Nel FollowingModalComponent, modifica il metodo loadFollowing():

  loadFollowing() {
    if (this.isLoading) return;

    console.log('🔄 Starting loadFollowing with:', {
      userId: this.userId,
      limit: this.limit,
      offset: this.currentOffset,
    });

    this.isLoading = true;
    this.socialService
      .getFollowing(this.userId, this.limit, this.currentOffset)
      .subscribe({
        next: (response) => {
          console.log('📥 RAW Following response:', response);
          console.log('📥 Response type:', typeof response);
          console.log('📥 Response keys:', Object.keys(response || {}));
          console.log('📥 Response.data:', response?.data);
          console.log('📥 Response.data type:', typeof response?.data);
          console.log(
            '📥 Response.data is array:',
            Array.isArray(response?.data)
          );
          console.log('📥 Response.total:', response?.total);

          if (response && response.data) {
            console.log('✅ Using response.data:', response.data);
            console.log('✅ Data length:', response.data.length);

            this.following = [...this.following, ...response.data];
            this.totalCount = response.total || response.data.length;
            this.hasMore = response.data.length === this.limit;
            this.currentOffset += this.limit;

            console.log('✅ Final state:', {
              following: this.following,
              totalCount: this.totalCount,
              hasMore: this.hasMore,
              currentOffset: this.currentOffset,
            });
          } else if (Array.isArray(response)) {
            console.log('✅ Using direct array response:', response);
            this.following = [...this.following, ...response];
            this.totalCount = response.length;
            this.hasMore = false;
          } else {
            console.log('❌ Unknown response structure:', response);
            // Log ogni proprietà della risposta
            for (const key in response) {
              console.log(`❌ response.${key}:`, response[key]);
            }
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading following:', error);
          console.error('❌ Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          });
          this.isLoading = false;
        },
      });
  }

  loadMore() {
    this.loadFollowing();
  }

  unfollowUser(user: FollowingUser, event: Event) {
    event.stopPropagation();

    if (confirm(`Sei sicuro di voler smettere di seguire @${user.username}?`)) {
      this.socialService.unfollowUser(user.id).subscribe({
        next: () => {
          // Rimuovi l'utente dalla lista
          this.following = this.following.filter((u) => u.id !== user.id);
          this.totalCount--;

          // Emetti l'evento per aggiornare il parent component
          this.userUnfollowed.emit(user.id);
        },
        error: (error) => {
          console.error('❌ Error unfollowing user:', error);
          alert("Errore durante l'unfollow. Riprova.");
        },
      });
    }
  }

  closeModal() {
    this.isOpen = false;
    this.following = [];
    this.currentOffset = 0;
    this.hasMore = false;
    this.closeModalEvent.emit();
  }

  onUserClick(user: FollowingUser) {
    this.userSelected.emit(user);
  }

  getDisplayName(user: FollowingUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }
}
