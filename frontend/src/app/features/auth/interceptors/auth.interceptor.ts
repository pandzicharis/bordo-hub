import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = null;
    
    if (typeof localStorage !== 'undefined') {
      try {
        token = localStorage.getItem('access_token');
      } catch (error) {
        console.error('Interceptor - Error reading localStorage:', error);
      }
    } else {
      console.log('Interceptor - localStorage not available');
    }
    
    if (token && token.length > 0) {
      const authHeader = `Bearer ${token}`;
      
      request = request.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
    } else {
      console.log('Interceptor - No token found or token is empty');
    }
    
    return next.handle(request);
  }
} 