import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { User, CreateUserDto } from '../../models/user.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
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

  private handleError(error: HttpErrorResponse) {
    console.error('UserService Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/users`, userData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUser(id: string): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/users/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUserProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/users/profile`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http
      .get<User[]>(
        `${this.API_URL}/users/search/${encodeURIComponent(query)}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUserPublicProfile(id: string): Observable<User> {
    console.log('🔍 Getting public profile for user ID:', id);
    console.log('🌐 API URL:', `${this.API_URL}/users/${id}`);

    return this.http
      .get<User>(`${this.API_URL}/users/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error getting public profile:', error);
          return this.handleError(error);
        })
      );
  }

  getUserByUsername(username: string): Observable<User> {
    console.log('🔍 Getting user by username:', username);

    return this.http
      .get<User>(`${this.API_URL}/users/username/${username}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error getting user by username:', error);
          return this.handleError(error);
        })
      );
  }
}
