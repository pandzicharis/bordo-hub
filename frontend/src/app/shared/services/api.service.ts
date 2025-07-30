import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: any): Observable<any> {
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, options);
  }

  post<T>(endpoint: string, data?: any, options?: any): Observable<any> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, data, options);
  }

  put<T>(endpoint: string, data?: any, options?: any): Observable<any> {
    const url = this.buildUrl(endpoint);
    return this.http.put<T>(url, data, options);
  }

  patch<T>(endpoint: string, data?: any, options?: any): Observable<any> {
    const url = this.buildUrl(endpoint);
    return this.http.patch<T>(url, data, options);
  }

  delete<T>(endpoint: string, options?: any): Observable<any> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<T>(url, options);
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
  }

  createAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  createAuthOptions(options?: ApiRequestOptions): ApiRequestOptions {
    return {
      ...options,
      headers: options?.headers || this.createAuthHeaders()
    };
  }
} 