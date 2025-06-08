import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Social Network';
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
