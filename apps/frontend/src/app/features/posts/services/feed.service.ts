/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

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
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getFeed(page: number = 1, limit: number = 10): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.API_URL}/feed?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  refreshFeed(): Observable<any> {
    return this.http.post(
      `${this.API_URL}/feed/refresh`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }
}
