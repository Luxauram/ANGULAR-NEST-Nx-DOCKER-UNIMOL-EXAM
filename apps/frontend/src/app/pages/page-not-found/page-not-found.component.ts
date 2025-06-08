import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [CommonModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
})
export class PageNotFoundComponent implements OnInit {
  constructor(
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
