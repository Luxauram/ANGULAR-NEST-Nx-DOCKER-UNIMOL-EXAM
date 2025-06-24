import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ImageService } from '../../services/user/image.service';
import { AvatarComponent } from '../../shared/components/user/avatar.component';
import { CoverPhotoComponent } from '../../shared/components/user/cover-photo.component';

export interface ProfileFormData {
  username: string;
  about: string;
  photo?: File;
  coverPhoto?: File;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  streetAddress: string;
  city: string;
  region: string;
  postalCode: string;
  emailNotifications: {
    comments: boolean;
    candidates: boolean;
    offers: boolean;
  };
  pushNotifications: 'everything' | 'same-as-email' | 'none';
}

@Component({
  selector: 'app-profile-update',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    CoverPhotoComponent,
  ],
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css'],
})
export class ProfileUpdateComponent implements OnInit {
  profileForm: FormGroup;
  photoPreview: string | null = null;
  coverPhotoPreview: string | null = null;

  countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'IT', label: 'Italy' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'GB', label: 'United Kingdom' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private imageService: ImageService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCurrentProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      about: ['', [Validators.maxLength(500)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      country: ['', [Validators.required]],
      streetAddress: [''],
      city: [''],
      region: [''],
      postalCode: [''],
      emailNotifications: this.fb.group({
        comments: [true],
        candidates: [false],
        offers: [false],
      }),
      pushNotifications: ['everything'],
    });
  }

  private loadCurrentProfile(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm.patchValue({
      username: currentUser.username || 'Username non disponibile',
      about: currentUser.bio || 'Biografia non disponibile',
      firstName: currentUser.firstName || 'Nome non disponibile',
      lastName: currentUser.lastName || 'Cognome non disponibile',
      email: currentUser.email || 'eamil non disponibile',
      country: 'Paese non disponibile',
      streetAddress: 'Indirizzo non disponibile',
      city: 'Città non disponibile',
      region: 'Provincia non disponibile',
      postalCode: 'CAP non disponibile',
      emailNotifications: {
        comments: true,
        candidates: false,
        offers: false,
      },
      pushNotifications: 'everything',
    });

    this.photoPreview = this.imageService.getAvatarUrl(currentUser.avatar);
    this.coverPhotoPreview = this.imageService.getCoverUrl(
      currentUser.coverPhoto
    );
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFilePreview(file, 'photo');
    }
  }

  onCoverPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFilePreview(file, 'cover');
    }
  }

  onCoverPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFilePreview(files[0], 'cover');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  private handleFilePreview(file: File, type: 'photo' | 'cover'): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'photo') {
          this.photoPreview = e.target?.result as string;
        } else {
          this.coverPhotoPreview = e.target?.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value as ProfileFormData;
      console.log('Dati da inviare:', formData);

      this.updateProfile(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.profileForm.reset();
    this.loadCurrentProfile();
    this.photoPreview = null;
    this.coverPhotoPreview = null;
  }
  private updateProfile(profileData: ProfileFormData): void {
    // this.profileService.updateProfile(profileData).subscribe({
    //   next: (response) => {
    //     console.log('Profilo aggiornato con successo', response);
    //     this.router.navigate(['/profile']);
    //   },
    //   error: (error) => {
    //     console.error('Errore nell\'aggiornamento del profilo', error);
    //     // Gestisci l'errore
    //   }
    // });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.profileForm.get('username');
  }
  get about() {
    return this.profileForm.get('about');
  }
  get firstName() {
    return this.profileForm.get('firstName');
  }
  get lastName() {
    return this.profileForm.get('lastName');
  }
  get email() {
    return this.profileForm.get('email');
  }
  get country() {
    return this.profileForm.get('country');
  }
  get emailNotifications() {
    return this.profileForm.get('emailNotifications');
  }
}
