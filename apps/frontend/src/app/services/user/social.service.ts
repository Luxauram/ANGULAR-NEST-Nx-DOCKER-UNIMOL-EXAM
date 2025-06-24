import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FollowDto, SocialStats } from '../../models/social.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface FollowingUser {
  id: string;
  userId?: string;
  targetUserId?: string;
  username?: string;
  email?: string;
}

export interface FollowingResponse {
  data: FollowingUser[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class SocialService {
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

  // ========================================================================
  // FOLLOW/UNFOLLOW OPERATIONS
  // ========================================================================

  followUser(params: { targetUserId: string }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/social/follow`,
      { targetUserId: params.targetUserId },
      { headers: this.getHeaders() }
    );
  }

  unfollowUser(targetUserId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/social/follow/${targetUserId}`, {
      headers: this.getHeaders(),
    });
  }

  // ========================================================================
  // GET FOLLOWERS/FOLLOWING - WITH PAGINATION
  // ========================================================================

  // Nel SocialService, aggiungi logging anche per getFollowers:

  getFollowers(
    userId: string,
    limit?: number,
    offset?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    const url = `${this.API_URL}/social/followers/${userId}`;
    console.log('🌐 Making API call for followers:', {
      url,
      params: params.toString(),
      headers: this.getHeaders(),
    });

    return this.http
      .get(url, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response: any) => {
          console.log(
            '🌐 SocialService received followers response:',
            response
          );
          console.log('🌐 Followers response type:', typeof response);
          console.log(
            '🌐 Followers response is array:',
            Array.isArray(response)
          );

          if (response) {
            console.log('🌐 Followers response keys:', Object.keys(response));
            for (const key in response) {
              console.log(`🌐 followers response.${key}:`, response[key]);
            }
          }

          return response;
        })
      );
  }

  getFollowing(
    userId: string,
    limit?: number,
    offset?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    const url = `${this.API_URL}/social/following/${userId}`;
    console.log('🌐 Making API call:', {
      url,
      params: params.toString(),
      headers: this.getHeaders(),
    });

    return this.http
      .get(url, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response: any) => {
          console.log('🌐 SocialService received response:', response);
          console.log('🌐 Response type:', typeof response);
          console.log('🌐 Response is array:', Array.isArray(response));

          if (response) {
            console.log('🌐 Response keys:', Object.keys(response));
            for (const key in response) {
              console.log(`🌐 response.${key}:`, response[key]);
            }
          }

          return response;
        })
      );
  }

  // ========================================================================
  // MY FOLLOWERS/FOLLOWING - AUTHENTICATED USER
  // ========================================================================

  getMyFollowers(limit?: number, offset?: number): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get(`${this.API_URL}/social/followers/me`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getMyFollowing(limit?: number, offset?: number): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get(`${this.API_URL}/social/following/me`, {
      headers: this.getHeaders(),
      params,
    });
  }

  // ========================================================================
  // RELATIONSHIP & STATS
  // ========================================================================

  getRelationship(targetUserId: string): Observable<any> {
    return this.http.get(
      `${this.API_URL}/social/relationship/${targetUserId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getSocialStats(userId: string): Observable<SocialStats> {
    return this.http.get<SocialStats>(
      `${this.API_URL}/social/stats/${userId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // ========================================================================
  // FOLLOW SUGGESTIONS
  // ========================================================================

  getFollowSuggestions(limit?: number): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get(`${this.API_URL}/social/suggestions`, {
      headers: this.getHeaders(),
      params,
    });
  }

  // ========================================================================
  // SYNC USER (INTERNAL - might not be needed in frontend)
  // ========================================================================

  syncUser(userData: {
    userId: string;
    username: string;
    email: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/social/sync-user`, userData, {
      headers: this.getHeaders(),
    });
  }

  getMyFollowingIds(): Observable<string[]> {
    return this.getMyFollowing(1000, 0).pipe(
      map((response) => {
        const ids = response.data
          .map((user: { id: string }) => user.id)
          .filter((id: string) => id && typeof id === 'string');

        console.log('🎯 Following IDs for feed:', ids);
        return ids;
      })
    );
  }
}
