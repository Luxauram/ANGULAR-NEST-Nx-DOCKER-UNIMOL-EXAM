import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { ImageService } from '../../../services/user/image.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user/user.service';
import { ToastrService } from 'ngx-toastr';

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
    private imageService: ImageService,
    private toastr: ToastrService
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('drawer-open');
      document.body.style.overflow = '';
    }
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.unreadNotifications = 0;
  }

  showNotImplementedToast() {
    this.toastr.info(
      'Questa funzionalità non è ancora stata implementata',
      'Feature non implementata',
      {
        timeOut: 4000,
        progressBar: true,
        closeButton: true,
      }
    );
  }

  // @TODO: chiamate API
  loadNotifications() {
    // @TODELETE
    this.notifications = [
      {
        id: 1,
        title: 'Nuovo messaggio',
        message: 'Hai ricevuto un nuovo messaggio da Mario N.',
        createdAt: new Date(),
        read: false,
      },
      {
        id: 2,
        title: 'Like al tuo post',
        message: 'A qualcuno piace il tuo ultimo post',
        createdAt: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: 3,
        title: 'Nuova Attività',
        message: 'Francesco S. ti ha invitato al concerto dei Linkin Park',
        createdAt: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: 4,
        title: 'Segnalazione',
        message:
          'Simone S. ha segnalato il tuo post per il contenuto migliore rispetto allo studente modello',
        createdAt: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: 5,
        title: 'Nuovo messaggio',
        message: 'Hai ricevuto una nuova denuncia da Rocco O.',
        createdAt: new Date(),
        read: false,
      },
    ];

    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }
}
