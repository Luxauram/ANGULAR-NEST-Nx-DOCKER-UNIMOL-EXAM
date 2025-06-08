/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { Post } from '../../../core/models/post.model';

// Interfacce per le risposte del feed service
export interface FeedItem {
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserFeed {
  userId: string;
  items: FeedItem[];
  lastUpdated: Date;
  totalItems: number;
}

export interface FeedResponse {
  success?: boolean;
  data?: UserFeed;
  message?: string;
}

export interface TrendingResponse {
  items: FeedItem[];
  timeframe: string;
  totalItems: number;
}

export interface RecentResponse {
  items: FeedItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly BASE_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;
  private readonly API_URL = `${this.BASE_URL}/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private handleError(error: any) {
    console.error('FeedService Error:', error);
    return throwError(() => error);
  }

  /**
   * Recupera il feed personalizzato dell'utente
   */
  getFeed(page: number = 1, limit: number = 10): Observable<UserFeed> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<FeedResponse>(`${this.API_URL}/feed`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          // Gestisce diverse strutture di risposta dall'API Gateway
          const feedData = response.data || (response as any);

          // Converte le date string in oggetti Date
          if (feedData.items) {
            feedData.items = feedData.items.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));
          }

          return {
            userId: feedData.userId,
            items: feedData.items || [],
            lastUpdated: new Date(feedData.lastUpdated),
            totalItems: feedData.totalItems || 0,
          } as UserFeed;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Forza il refresh del feed utente
   */
  refreshFeed(): Observable<any> {
    return this.http
      .post(
        `${this.API_URL}/feed/refresh`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Pulisce la cache del feed utente
   */
  clearFeedCache(): Observable<any> {
    return this.http
      .delete(`${this.API_URL}/feed/cache`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Recupera la timeline cronologica dell'utente
   */
  getTimeline(page: number = 1, limit: number = 20): Observable<UserFeed> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<FeedResponse>(`${this.API_URL}/feed/timeline`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          const feedData = response.data || (response as any);

          if (feedData.items) {
            feedData.items = feedData.items.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));
          }

          return {
            userId: feedData.userId,
            items: feedData.items || [],
            lastUpdated: new Date(feedData.lastUpdated),
            totalItems: feedData.totalItems || 0,
          } as UserFeed;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Recupera i post in tendenza (pubblico - non richiede autenticazione)
   */
  getTrendingPosts(
    limit: number = 10,
    timeframe: string = '24h'
  ): Observable<TrendingResponse> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('timeframe', timeframe);

    return this.http
      .get<TrendingResponse>(`${this.API_URL}/feed/trending`, {
        params,
      })
      .pipe(
        map((response) => {
          // Converte le date string in oggetti Date
          if (response.items) {
            response.items = response.items.map((item) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));
          }

          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Recupera i post più recenti (pubblico - non richiede autenticazione)
   */
  getRecentPosts(
    page: number = 1,
    limit: number = 20
  ): Observable<RecentResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<RecentResponse>(`${this.API_URL}/feed/recent`, {
        params,
      })
      .pipe(
        map((response) => {
          // Converte le date string in oggetti Date
          if (response.items) {
            response.items = response.items.map((item) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));
          }

          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Metodi di utilità per la gestione del feed
   */

  /**
   * Converte FeedItem in Post (per compatibilità con il resto dell'app)
   */
  convertFeedItemToPost(feedItem: FeedItem): Post {
    return {
      id: feedItem.postId,
      content: feedItem.content,
      userId: feedItem.userId,
      username: feedItem.username,
      isPublic: true,
      createdAt: feedItem.createdAt,
      updatedAt: feedItem.updatedAt || feedItem.createdAt,
      title: undefined,
      tags: [],
      liked: false,
      likesCount: 0,
      commentsCount: 0,
    };
  }

  /**
   * Converte UserFeed in array di Post
   */
  convertUserFeedToPosts(userFeed: UserFeed): Post[] {
    return userFeed.items.map((item) => this.convertFeedItemToPost(item));
  }

  /**
   * Metodo wrapper che ritorna Post[] per compatibilità con il codice esistente
   */
  getFeedAsPosts(page: number = 1, limit: number = 10): Observable<Post[]> {
    return this.getFeed(page, limit).pipe(
      map((userFeed) => this.convertUserFeedToPosts(userFeed))
    );
  }

  /**
   * Metodo wrapper per timeline che ritorna Post[]
   */
  getTimelineAsPosts(page: number = 1, limit: number = 20): Observable<Post[]> {
    return this.getTimeline(page, limit).pipe(
      map((userFeed) => this.convertUserFeedToPosts(userFeed))
    );
  }

  /**
   * Metodo wrapper per trending che ritorna Post[]
   */
  getTrendingAsPosts(
    limit: number = 10,
    timeframe: string = '24h'
  ): Observable<Post[]> {
    return this.getTrendingPosts(limit, timeframe).pipe(
      map((trending) =>
        trending.items.map((item) => this.convertFeedItemToPost(item))
      )
    );
  }

  /**
   * Metodo wrapper per recent che ritorna Post[]
   */
  getRecentAsPosts(page: number = 1, limit: number = 20): Observable<Post[]> {
    return this.getRecentPosts(page, limit).pipe(
      map((recent) =>
        recent.items.map((item) => this.convertFeedItemToPost(item))
      )
    );
  }
}
