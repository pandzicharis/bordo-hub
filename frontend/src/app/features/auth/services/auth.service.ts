import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export interface User {
  email: string;
  // add other user fields as needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();
  private tokenKey = 'auth_token';

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ access_token: string }>(`http://localhost:8000/auth/login`, credentials).pipe(
      tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem(this.tokenKey, res.access_token);
        }
        this.getCurrentUser().subscribe();
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    const token = this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
    if (!token) {
      this.userSubject.next(null);
      return of(null);
    }
    this.loadingSubject.next(true);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<User>(`http://localhost:8000/auth/validate`, { headers }).pipe(
      tap(user => this.userSubject.next(user)),
      catchError((_err) => {
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isBrowser() && !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }
} 