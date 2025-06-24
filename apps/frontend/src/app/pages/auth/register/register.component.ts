import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: [''], // Campo opzionale come nel tuo AuthService
    });
  }

  // Funzione per capitalizzare la prima lettera
  private capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Funzione per trasformare il testo prima dell'invio
  private transformFormData(formData: any): any {
    return {
      ...formData,
      username: formData.username.toLowerCase(),
      email: formData.email.toLowerCase(),
      firstName: this.capitalizeFirstLetter(formData.firstName),
      lastName: this.capitalizeFirstLetter(formData.lastName),
      // bio rimane invariata
      bio: formData.bio,
    };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Trasforma i dati prima di inviarli
      const transformedData = this.transformFormData(this.registerForm.value);

      this.authService.register(transformedData).subscribe({
        next: (response) => {
          this.successMessage = 'Account created successfully!';

          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);

          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed';
          this.isLoading = false;
        },
      });
    }
  }
}
