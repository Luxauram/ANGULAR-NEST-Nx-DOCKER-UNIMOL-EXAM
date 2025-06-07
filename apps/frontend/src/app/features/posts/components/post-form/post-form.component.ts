import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreatePostRequest, Post } from '../../../../core/models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent {
  @Output() postCreated = new EventEmitter<Post>();
  postForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private postService: PostService) {
    this.postForm = this.fb.group({
      title: [''],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(280),
        ],
      ],
      tags: [['#post']],
      isPublic: [true],
    });
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const postData: CreatePostRequest = {
        content: this.postForm.value.content,
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

      this.postService.createPost(postData).subscribe({
        next: (post) => {
          this.postCreated.emit(post);
          this.postForm.reset({
            title: '',
            content: '',
            tags: ['#post'],
            isPublic: true,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.errorMessage = error.error?.message || 'Failed to create post';
          this.isLoading = false;
        },
      });
    }
  }

  // Metodo per aggiungere tag
  addTag(tagValue: string) {
    if (tagValue && tagValue.trim()) {
      const cleanTag = tagValue.trim().replace(/^#/, '');
      const currentTags = this.postForm.get('tags')?.value || [];
      if (!currentTags.includes(cleanTag)) {
        this.postForm.patchValue({
          tags: [...currentTags, cleanTag],
        });
      }
    }
  }

  // Metodo per rimuovere tag
  removeTag(tagToRemove: string): void {
    const currentTags = this.postForm.value.tags || [];
    this.postForm.patchValue({
      tags: currentTags.filter((tag: string) => tag !== tagToRemove),
    });
  }
}
