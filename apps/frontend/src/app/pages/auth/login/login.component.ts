import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        ...this.loginForm.value,
        email: this.loginForm.value.email.toLowerCase(),
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.router.navigate(['/home']);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed';
          this.isLoading = false;
        },
      });
    }
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();

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
}
