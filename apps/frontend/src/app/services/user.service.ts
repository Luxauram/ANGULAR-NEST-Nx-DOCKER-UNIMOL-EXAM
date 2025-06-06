import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL =
    environment.apiGatewayUrl || environment.apiGatewayDocker;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, userData);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/profile`, {
      headers: this.getHeaders(),
    });
  }
}
