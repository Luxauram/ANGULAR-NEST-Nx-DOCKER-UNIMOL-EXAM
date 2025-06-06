import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowDto, SocialStats } from '../models/social.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  private readonly API_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  followUser(followData: FollowDto): Observable<any> {
    return this.http.post(`${this.API_URL}/social/follow`, followData, {
      headers: this.getHeaders(),
    });
  }

  unfollowUser(unfollowData: FollowDto): Observable<any> {
    return this.http.post(`${this.API_URL}/social/unfollow`, unfollowData, {
      headers: this.getHeaders(),
    });
  }

  getFollowers(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/social/${userId}/followers`, {
      headers: this.getHeaders(),
    });
  }

  getFollowing(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/social/${userId}/following`, {
      headers: this.getHeaders(),
    });
  }
}
