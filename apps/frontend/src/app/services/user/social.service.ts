import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowDto, SocialStats } from '../../models/social.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

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

  followUser(followData: FollowDto): Observable<any> {
    return this.http.post(`${this.API_URL}/social/follow`, followData, {
      headers: this.getHeaders(),
    });
  }

  unfollowUser(targetUserId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/social/follow/${targetUserId}`, {
      headers: this.getHeaders(),
    });
  }

  // ========================================================================
  // GET FOLLOWERS/FOLLOWING - WITH PAGINATION
  // ========================================================================

  getFollowers(
    userId: string,
    limit?: number,
    offset?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get(`${this.API_URL}/social/followers/${userId}`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getFollowing(
    userId: string,
    limit?: number,
    offset?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get(`${this.API_URL}/social/following/${userId}`, {
      headers: this.getHeaders(),
      params,
    });
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
}
