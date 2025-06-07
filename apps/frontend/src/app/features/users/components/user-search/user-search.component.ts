import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../../../core/models/user.model';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
})
export class UserSearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  users: User[] = [];
  isLoading = false;
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private router: Router,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) {
            return of([]);
          }
          this.isLoading = true;
          return this.userService.searchUsers(query);
        })
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.users = [];
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchInput(event: any) {
    const query = event.target.value.trim();
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  viewUserProfile(userId: string) {
    this.router.navigate(['/user', userId]);
  }

  getUserAvatar(user: User): string {
    return this.imageService.getAvatarUrl(user.avatar);
  }

  onAvatarError(event: any): void {
    this.imageService.onAvatarError(event);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
    });
  }
}
