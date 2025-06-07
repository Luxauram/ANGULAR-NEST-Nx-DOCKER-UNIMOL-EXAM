import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder) {
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
    // Qui caricheresti i dati attuali del profilo dal servizio
    // Esempio di dati mockati:
    const currentProfile = {
      username: 'johndoe',
      about: 'Sviluppatore full-stack appassionato di tecnologie innovative.',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      country: 'IT',
      streetAddress: 'Via Roma 123',
      city: 'Milano',
      region: 'Lombardia',
      postalCode: '20100',
      emailNotifications: {
        comments: true,
        candidates: false,
        offers: false,
      },
      pushNotifications: 'everything',
    };

    this.profileForm.patchValue(currentProfile);
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
      console.log('Dati del profilo da aggiornare:', formData);

      // Qui chiameresti il servizio per aggiornare il profilo
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
    // Implementa la chiamata al servizio per aggiornare il profilo
    // this.profileService.updateProfile(profileData).subscribe({
    //   next: (response) => {
    //     console.log('Profilo aggiornato con successo', response);
    //     // Mostra messaggio di successo
    //   },
    //   error: (error) => {
    //     console.error('Errore nell\'aggiornamento del profilo', error);
    //     // Mostra messaggio di errore
    //   }
    // });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter per facilitare l'accesso ai controlli del form nel template
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
