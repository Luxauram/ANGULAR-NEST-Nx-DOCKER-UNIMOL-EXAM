/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePostRequest,
  GetPostsQuery,
  Post,
  PostsResponse,
  UpdatePostRequest,
} from '../../../core/models/post.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly BASE_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;
  private readonly API_URL = `${this.BASE_URL}/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /**
   * POST /posts - Crea nuovo post (protetto)
   */
  createPost(postData: CreatePostRequest): Observable<Post> {
    const url = `${this.API_URL}/posts`;
    const headers = this.getHeaders();

    console.log('🔍 POST URL:', url);
    console.log('🔍 Headers:', headers);
    console.log('🔍 Post Data:', postData);
    console.log('🔍 Token:', this.authService.getToken());

    return this.http.post<Post>(url, postData, {
      headers: headers,
    });
  }

  /**
   * GET /posts - Ottieni lista post con filtri e paginazione
   */
  getPosts(query?: GetPostsQuery): Observable<PostsResponse> {
    let params = new HttpParams();

    if (query) {
      if (query.userId) params = params.set('userId', query.userId);
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.tag) params = params.set('tag', query.tag);
    }

    return this.http.get<PostsResponse>(`${this.API_URL}/posts`, {
      headers: this.getHeaders(),
      params,
    });
  }

  /**
   * GET /posts/my - Ottieni i propri post (protetto)
   */
  getMyPosts(page?: number, limit?: number): Observable<PostsResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<PostsResponse>(`${this.API_URL}/posts/my`, {
      headers: this.getHeaders(),
      params,
    });
  }

  /**
   * GET /posts/:id - Ottieni singolo post
   */
  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * PUT /posts/:id - Aggiorna post (protetto)
   */
  updatePost(id: string, postData: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.API_URL}/posts/${id}`, postData, {
      headers: this.getHeaders(),
    });
  }

  /**
   * DELETE /posts/:id - Elimina post (protetto)
   */
  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/posts/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * POST /posts/:id/like - Like/Unlike post (protetto)
   */
  toggleLike(postId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/posts/${postId}/like`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * POST /posts/:id/unlike - Unlike post (protetto)
   */
  unlikePost(postId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/posts/${postId}/unlike`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * POST /posts/:id/increment-comments - Incrementa contatore commenti
   */
  incrementComments(postId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/posts/${postId}/increment-comments`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * GET /posts/user/:userId - Ottieni post di un utente specifico
   */
  getPostsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Observable<PostsResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<PostsResponse>(
      `${this.API_URL}/posts/user/${userId}`,
      {
        headers: this.getHeaders(),
        params,
      }
    );
  }

  /**
   * GET /posts/health/check - Health check
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.API_URL}/posts/health/check`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Ottiene tutti i post di un utente specifico
   */
  getUserPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts/user/${userId}`, {
      headers: this.getHeaders(),
    });
  }
}
