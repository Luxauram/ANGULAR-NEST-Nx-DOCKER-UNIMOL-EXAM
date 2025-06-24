import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentYear = new Date().getFullYear();

  private userSubscription: Subscription = new Subscription();

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
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

  // Navigation methods per i link rapidi
  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToCreatePost() {
    this.router.navigate(['/create/post']);
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToExplore() {
    this.router.navigate(['/feed/explore']);
  }

  // Email methods
  openSupportEmail() {
    window.location.href = 'mailto:support@nexus.unimol.it';
  }

  openInfoEmail() {
    window.location.href = 'mailto:info@nexus.unimol.it';
  }

  // External link methods
  openUnimolWebsite() {
    window.open('https://www.unimol.it', '_blank', 'noopener,noreferrer');
  }
}
