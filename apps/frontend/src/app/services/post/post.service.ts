/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreatePostRequest,
  GetPostsQuery,
  Post,
  PostsResponse,
  UpdatePostRequest,
} from '../../models/post.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

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
      'Content-Type': 'application/json',
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
   * PATCH /posts/:id - Aggiorna post (protetto)
   */
  updatePost(id: string, postData: UpdatePostRequest): Observable<Post> {
    return this.http.patch<Post>(`${this.API_URL}/posts/${id}`, postData, {
      headers: this.getHeaders(),
    });
  }

  /**
   * DELETE /posts/:id - Elimina post (protetto)
   * FIXED: Questa è la logica corretta per il delete
   */
  deletePost(id: string): Observable<any> {
    // FIX: Validazione ID
    if (!id || id === 'undefined') {
      console.error('❌ PostService.deletePost: Invalid ID:', id);
      throw new Error('Invalid post ID');
    }

    const url = `${this.API_URL}/posts/${id}`;
    const headers = this.getHeaders();

    console.log('🗑️ Deleting post with URL:', url);

    return this.http.delete(url, { headers }).pipe(
      tap({
        next: (response) => console.log('✅ Delete successful:', response),
        error: (error) => console.error('❌ Delete failed:', error),
      })
    );
  }

  /**
   * POST /posts/:id/like - Like post (protetto)
   * FIXED: Logica corretta basata sull'API Gateway
   */
  likePost(postId: string): Observable<any> {
    // FIX: Validazione postId
    if (!postId || postId === 'undefined') {
      console.error('❌ PostService.likePost: Invalid postId:', postId);
      throw new Error('Invalid post ID');
    }

    const url = `${this.API_URL}/posts/${postId}/like`;
    const headers = this.getHeaders();

    console.log('❤️ Liking post:', postId);
    console.log('❤️ URL:', url);

    return this.http.post(url, {}, { headers }).pipe(
      tap({
        next: (response) => console.log('✅ Like successful:', response),
        error: (error) => console.error('❌ Like failed:', error),
      })
    );
  }

  /**
   * POST /posts/:id/unlike - Unlike post (protetto)
   * FIXED: Logica corretta basata sull'API Gateway
   */
  unlikePost(postId: string): Observable<any> {
    const url = `${this.API_URL}/posts/${postId}/unlike`;
    const headers = this.getHeaders();

    console.log('💔 Unliking post:', postId);
    console.log('💔 URL:', url);
    console.log('💔 Headers:', headers);

    return this.http
      .post(
        url,
        {},
        {
          headers: headers,
        }
      )
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ Unlike successful:', response);
          },
          error: (error) => {
            console.error('❌ Unlike failed:', error);
          },
        })
      );
  }

  /**
   * Metodo helper per toggle like/unlike
   * FIXED: Logica migliorata con migliore gestione degli errori
   */
  toggleLike(postId: string, currentlyLiked: boolean): Observable<any> {
    console.log(
      `🔄 Toggling like for post ${postId}: ${
        currentlyLiked ? 'unlike' : 'like'
      }`
    );

    if (currentlyLiked) {
      return this.unlikePost(postId);
    } else {
      return this.likePost(postId);
    }
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
   * Ottiene tutti i post di un utente specifico
   */
  getUserPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts/user/${userId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * GET /posts/recent - Ottieni post recenti
   */
  getRecentPosts(query?: {
    limit?: number;
    offset?: number;
  }): Observable<PostsResponse> {
    let params = new HttpParams();
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.offset) params = params.set('offset', query.offset.toString());

    return this.http.get<PostsResponse>(`${this.API_URL}/posts/recent`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
