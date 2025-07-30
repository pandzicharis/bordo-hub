import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private platformId = inject(PLATFORM_ID);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = null;
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        token = localStorage.getItem('access_token');
      } catch (error) {
        console.error('Interceptor - Error reading localStorage:', error);
      }
    }
    
    if (token && token.length > 0) {
      const authHeader = `Bearer ${token}`;
      
      request = request.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
    }
    
    return next.handle(request);
  }
} 