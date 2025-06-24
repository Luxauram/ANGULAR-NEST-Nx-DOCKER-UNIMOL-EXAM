/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Post, PostsResponse } from '../../models/post.model';
import { AuthService } from '../auth/auth.service';
import { SocialService } from '../user/social.service';
import { environment } from '../../../environments/environment';

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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socialService: SocialService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
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
   * Ottiene il feed personalizzato basato sugli utenti che segui
   * Questo metodo dovrebbe essere usato nella home component
   */
  getFeedAsPosts(page: number = 1, limit: number = 20): Observable<Post[]> {
    // Prima ottieni la lista degli utenti che segui
    return this.socialService.getMyFollowing(1000, 0).pipe(
      switchMap((followingResponse) => {
        console.log('Following response:', followingResponse);

        // Estrai gli ID degli utenti seguiti
        let followedUserIds: string[] = [];

        // Il SocialService potrebbe restituire { data: [...] } o direttamente [...]
        if (
          followingResponse &&
          followingResponse.data &&
          Array.isArray(followingResponse.data)
        ) {
          followedUserIds = followingResponse.data.map(
            (user: any) => user.id || user.userId
          );
        } else if (followingResponse && Array.isArray(followingResponse)) {
          followedUserIds = followingResponse.map(
            (user: any) => user.id || user.userId
          );
        }

        console.log('Followed user IDs:', followedUserIds);

        // Se non segui nessuno, ritorna array vuoto
        if (followedUserIds.length === 0) {
          console.log('No users followed, returning empty feed');
          return of([]);
        }

        // Ottieni i post di tutti gli utenti seguiti
        const postRequests = followedUserIds.map(
          (userId) => this.getPostsByUser(userId, 1, 50) // Ottieni più post per utente
        );

        return forkJoin(postRequests).pipe(
          map((responses: PostsResponse[]) => {
            // Combina tutti i post in un singolo array
            const allPosts: Post[] = [];
            responses.forEach((response) => {
              // PostsResponse può avere { data: [...] } o essere direttamente [...]
              if (response && response.posts && Array.isArray(response.posts)) {
                allPosts.push(...response.posts);
              } else if (response && Array.isArray(response)) {
                allPosts.push(...response);
              }
            });

            // Ordina i post per data (più recenti prima)
            allPosts.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            });

            // Applica paginazione manuale
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = allPosts.slice(startIndex, endIndex);

            console.log(
              `Feed loaded: ${paginatedPosts.length} posts from ${followedUserIds.length} followed users`
            );
            return paginatedPosts;
          })
        );
      }),
      catchError((error) => {
        console.error('Error loading personalized feed:', error);
        return of([]); // Ritorna array vuoto in caso di errore
      })
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
      .get<any>(`${this.API_URL}/feed/recent`, {
        params,
      })
      .pipe(
        map((response) => {
          // *** AGGIUNGI QUESTO DEBUG ***
          console.log('🔍 Raw response from backend:', response);
          console.log('🔍 Response type:', typeof response);
          console.log('🔍 Response keys:', Object.keys(response || {}));

          // Prova a gestire diverse strutture di risposta
          let items: any[] = [];

          if (Array.isArray(response)) {
            // Se la risposta è direttamente un array di post
            console.log('📝 Response is direct array');
            items = response;
          } else if (response && response.items) {
            // Se la risposta ha una proprietà items
            console.log('📝 Response has items property');
            items = response.items;
          } else if (response && response.data) {
            // Se la risposta ha una proprietà data
            console.log('📝 Response has data property');
            items = Array.isArray(response.data)
              ? response.data
              : response.data.items || [];
          } else if (response && response.posts) {
            // Se la risposta ha una proprietà posts
            console.log('📝 Response has posts property');
            items = response.posts;
          } else {
            console.warn('⚠️ Unknown response structure');
            items = [];
          }

          console.log('🎯 Final items array:', items);
          console.log('🎯 Items count:', items.length);

          // Converte le date string in oggetti Date
          if (items && Array.isArray(items)) {
            items = items.map((item) => {
              console.log('🔄 Processing item:', item);
              return {
                ...item,
                // Mappa i campi se necessario
                postId: item.id || item.postId,
                userId: item.userId,
                username: item.username,
                content: item.content,
                createdAt: new Date(item.createdAt),
                updatedAt: item.updatedAt
                  ? new Date(item.updatedAt)
                  : undefined,
              };
            });
          }

          const result = {
            items: items,
            total: response.total || items.length || 0,
          };

          console.log('✅ Final result:', result);
          return result;
        }),
        catchError((error) => {
          console.error('❌ Error in getRecentPosts:', error);
          return this.handleError(error);
        })
      );
  }

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
   * Ottiene timeline posts (alias per getFeedAsPosts)
   */
  getTimelineAsPosts(page: number = 1, limit: number = 20): Observable<Post[]> {
    return this.getFeedAsPosts(page, limit);
  }

  /**
   * Ottiene post trending (se implementato nel backend)
   */
  getTrendingAsPosts(limit: number = 10): Observable<Post[]> {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());

    return this.http
      .get<PostsResponse>(`${this.API_URL}/posts/trending`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          // PostsResponse potrebbe essere { data: [...] } o direttamente [...]
          if (response && response.posts && Array.isArray(response.posts)) {
            return response.posts;
          } else if (Array.isArray(response)) {
            return response as Post[];
          }
          return [];
        }),
        catchError((error) => {
          console.error('Error loading trending posts:', error);
          return of([]);
        })
      );
  }

  /**
   * Ottiene tutti i post recenti (per explore)
   */
  getRecentAsPosts(page: number = 1, limit: number = 20): Observable<Post[]> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    return this.http
      .get<PostsResponse>(`${this.API_URL}/posts`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          // PostsResponse potrebbe essere { data: [...] } o direttamente [...]
          if (response && response.posts && Array.isArray(response.posts)) {
            return response.posts;
          } else if (Array.isArray(response)) {
            return response as Post[];
          }
          return [];
        }),
        catchError((error) => {
          console.error('Error loading recent posts:', error);
          return of([]);
        })
      );
  }

  /**
   * Ottiene i post di un utente specifico
   */
  private getPostsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Observable<PostsResponse> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    return this.http
      .get<PostsResponse>(`${this.API_URL}/posts/user/${userId}`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        catchError((error) => {
          console.error(`Error loading posts for user ${userId}:`, error);
          // Ritorna un array vuoto per questo utente invece di lanciare l'errore
          return of([] as any);
        })
      );
  }
}
