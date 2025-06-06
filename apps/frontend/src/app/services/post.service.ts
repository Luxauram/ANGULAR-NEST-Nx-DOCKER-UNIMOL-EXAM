/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, CreatePostDto } from '../models/post.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly API_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  createPost(postData: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(`${this.API_URL}/posts`, postData, {
      headers: this.getHeaders(),
    });
  }

  getPosts(page: number = 1, limit: number = 10): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.API_URL}/posts?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getUserPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts/user/${userId}`, {
      headers: this.getHeaders(),
    });
  }
}
