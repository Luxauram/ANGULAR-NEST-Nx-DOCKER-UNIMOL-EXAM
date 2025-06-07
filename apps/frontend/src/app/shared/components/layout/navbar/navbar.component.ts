import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../features/users/services/user.service';
import { Subscription } from 'rxjs';
import { ImageService } from '../../../../features/users/services/image.service';
import { User } from '../../../../core/models/user.model';

// da inserire altrove
interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type?: 'message' | 'like' | 'comment' | 'follow';
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  currentUser: any = null;
  mobileMenuOpen = false;
  profileMenuOpen = false;
  notificationDrawerOpen = false;
  unreadNotifications = 0;
  notifications: any[] = [];
  drawerVisible = false;
  drawerAnimating = false;

  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  getUserAvatar(): string {
    return this.imageService.getAvatarUrl(this.user?.avatar);
  }

  getUserCover(): string {
    return this.imageService.getCoverUrl(this.user?.coverPhoto);
  }

  onAvatarError(event: any): void {
    this.imageService.onAvatarError(event);
  }

  onCoverError(event: any): void {
    this.imageService.onCoverError(event);
  }

  onBackdropClick(event: Event) {
    // Chiude il drawer quando si clicca sul backdrop (parte grigia)
    this.closeNotificationDrawer();
  }

  toggleNotificationDrawer() {
    if (!this.notificationDrawerOpen) {
      this.openNotificationDrawer();
    } else {
      this.closeNotificationDrawer();
    }
  }

  private openNotificationDrawer() {
    this.notificationDrawerOpen = true;
    this.drawerVisible = true;
    this.drawerAnimating = true;

    // Forza il reflow per assicurarsi che le classi iniziali siano applicate
    setTimeout(() => {
      this.drawerAnimating = false;
    }, 10);

    this.toggleBodyScroll();
  }

  closeNotificationDrawer() {
    this.drawerAnimating = true;

    // Aspetta la fine dell'animazione prima di nascondere il drawer
    setTimeout(() => {
      this.notificationDrawerOpen = false;
      this.drawerVisible = false;
      this.drawerAnimating = false;
    }, 300);

    this.toggleBodyScroll();
  }

  private toggleBodyScroll() {
    if (this.notificationDrawerOpen) {
      document.body.classList.add('drawer-open');
      // Previene lo scroll della pagina sottostante
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('drawer-open');
      // Ripristina lo scroll della pagina
      document.body.style.overflow = '';
    }
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.unreadNotifications = 0;
    // @TODO: chiamate API
  }

  // @TODO: chiamate API
  loadNotifications() {
    // @TODELETE
    this.notifications = [
      {
        id: 1,
        title: 'Nuovo messaggio',
        message: 'Hai ricevuto un nuovo messaggio da Mario',
        createdAt: new Date(),
        read: false,
      },
      {
        id: 2,
        title: 'Like al tuo post',
        message: 'A qualcuno piace il tuo ultimo post',
        createdAt: new Date(Date.now() - 3600000),
        read: true,
      },
    ];

    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }
}
