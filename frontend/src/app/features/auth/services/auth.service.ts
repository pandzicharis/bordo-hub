import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface User {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  constructor(private apiService: ApiService) {}

  register(request: RegisterRequest): Observable<User> {
    return this.apiService.post<User>('auth/register', request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', request);
  }

  validate(): Observable<User> {
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    return this.apiService.get<User>('auth/validate', { headers });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Logout - Error clearing localStorage:', error);
      }
    }
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setUserData(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('setUserData - Error saving to localStorage:', error);
      }
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
} 