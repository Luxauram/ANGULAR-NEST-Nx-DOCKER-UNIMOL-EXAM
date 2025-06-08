import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post/post.service';
import { CreatePostRequest } from '../../models/post.model';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostPageComponent implements OnInit {
  postForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  uploadedImages: UploadedImage[] = [];
  maxImages = 4;
  maxFileSize = 5 * 1024 * 1024;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.maxLength(100)]],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(2000),
        ],
      ],
      tags: [[]],
      isPublic: [true],
      category: ['general'],
      scheduledAt: [''],
    });
  }

  ngOnInit(): void {
    this.loadDraft();
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const postData: CreatePostRequest = {
        content: this.postForm.value.content.trim(),
      };

      // Aggiungi campi opzionali solo se presenti
      if (this.postForm.value.title?.trim()) {
        postData.title = this.postForm.value.title.trim();
      }

      if (this.postForm.value.tags?.length > 0) {
        postData.tags = this.postForm.value.tags.filter((tag: string) =>
          tag.trim()
        );
      }

      if (this.postForm.value.isPublic !== undefined) {
        postData.isPublic = this.postForm.value.isPublic;
      }

      // if (this.postForm.value.category) {
      //   postData.category = this.postForm.value.category;
      // }

      // if (this.postForm.value.scheduledAt) {
      //   postData.scheduledAt = new Date(this.postForm.value.scheduledAt);
      // }

      // TODO: Implementare upload delle immagini
      if (this.uploadedImages.length > 0) {
        // postData.images = this.uploadedImages.map(img => img.file);
        console.log('Images to upload:', this.uploadedImages);
      }

      this.postService.createPost(postData).subscribe({
        next: (post) => {
          this.successMessage = 'Post created successfully!';
          this.isLoading = false;

          // Redirect dopo 2 secondi
          setTimeout(() => {
            this.router.navigate(['/posts', post.id]);
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.errorMessage = error.error?.message || 'Failed to create post';
          this.isLoading = false;
        },
      });

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Metodi per gestione tag
  addTag(tagValue: string): void {
    if (tagValue && tagValue.trim()) {
      const cleanTag = tagValue.trim().replace(/^#/, '');
      const currentTags = this.postForm.get('tags')?.value || [];

      if (!currentTags.includes(cleanTag) && cleanTag.length <= 30) {
        this.postForm.patchValue({
          tags: [...currentTags, cleanTag],
        });
      }
    }
  }

  removeTag(tagToRemove: string): void {
    const currentTags = this.postForm.value.tags || [];
    this.postForm.patchValue({
      tags: currentTags.filter((tag: string) => tag !== tagToRemove),
    });
  }

  // Metodi per gestione immagini
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        if (this.validateFile(file)) {
          this.addImage(file);
        }
      });
      // Reset input per permettere la selezione dello stesso file
      input.value = '';
    }
  }

  validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPEG, PNG, GIF and WebP images are allowed.';
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'File size must be less than 5MB.';
      return false;
    }

    if (this.uploadedImages.length >= this.maxImages) {
      this.errorMessage = `Maximum ${this.maxImages} images allowed.`;
      return false;
    }

    return true;
  }

  addImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image: UploadedImage = {
        file: file,
        preview: e.target?.result as string,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      this.uploadedImages.push(image);
    };
    reader.readAsDataURL(file);
  }

  removeImage(imageId: string): void {
    this.uploadedImages = this.uploadedImages.filter(
      (img) => img.id !== imageId
    );
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (this.validateFile(file)) {
          this.addImage(file);
        }
      });
    }
  }

  // Utility methods
  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach((key) => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }

  saveDraft(): void {
    const draftData = {
      ...this.postForm.value,
      images: this.uploadedImages,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('postDraft', JSON.stringify(draftData));
    this.successMessage = 'Draft saved successfully!';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  loadDraft(): void {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      this.postForm.patchValue(draftData);
      this.successMessage = 'Draft loaded successfully!';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  clearDraft(): void {
    localStorage.removeItem('postDraft');
    this.postForm.reset({
      title: '',
      content: '',
      tags: [],
      isPublic: true,
      category: 'general',
      scheduledAt: '',
    });
    this.uploadedImages = [];
    this.successMessage = 'Form cleared successfully!';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Getters per il template
  get contentLength(): number {
    return this.postForm.get('content')?.value?.length || 0;
  }

  get isContentValid(): boolean {
    const content = this.postForm.get('content');
    return content ? content.valid : false;
  }

  get canAddMoreImages(): boolean {
    return this.uploadedImages.length < this.maxImages;
  }
}
