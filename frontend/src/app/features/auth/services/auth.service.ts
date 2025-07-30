import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';

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
  constructor(private apiService: ApiService) {}

  register(request: RegisterRequest): Observable<User> {
    return this.apiService.post<User>('auth/register', request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', request);
  }

  validate(): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    return this.apiService.get<User>('auth/validate', { headers });
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        console.log('Logout - localStorage cleared');
      } catch (error) {
        console.error('Logout - Error clearing localStorage:', error);
      }
    } else {
      console.log('Logout - localStorage not available');
    }
  }

  isAuthenticated(): boolean {
    let token = null;
    
    if (typeof localStorage !== 'undefined') {
      try {
        token = localStorage.getItem('access_token');
        console.log('isAuthenticated - localStorage available');
      } catch (error) {
        console.error('isAuthenticated - Error reading localStorage:', error);
      }
    } else {
      console.log('isAuthenticated - localStorage not available');
    }
    
    console.log('isAuthenticated - Token:', token);
    console.log('isAuthenticated - Token exists:', !!token);
    return !!token;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUserData(token: string, user: User): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('setUserData - Error saving to localStorage:', error);
      }
    } else {
      console.log('setUserData - localStorage not available');
    }
  }
} 