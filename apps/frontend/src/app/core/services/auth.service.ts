/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginDto, LoginResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (this.isAuthenticated()) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/api/auth/login`, credentials)
      .pipe(
        tap((response: { user: User; access_token: string }) => {
          this.setCurrentUser(response.user, response.access_token);
        })
      );
  }

  register(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/api/auth/register`, userData)
      .pipe(
        tap((response) => {
          this.setCurrentUser(response.user, response.access_token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }

  logoutWithRedirect(redirectTo: string = '/login'): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate([redirectTo]);
  }

  setCurrentUser(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp <= currentTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return new Observable((observer) => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http
      .post<boolean>(`${this.API_URL}/api/auth/validate-token`, {
        token,
      })
      .pipe(
        tap((isValid) => {
          if (!isValid) {
            this.logout();
          }
        })
      );
  }

  isAuthenticatedSync(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
}
