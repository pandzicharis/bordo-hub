import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <h2 *ngIf="isLoading">Processing authentication...</h2>
        <h2 *ngIf="error">Authentication failed</h2>
        <p *ngIf="error">{{ error }}</p>
        <div class="spinner" *ngIf="isLoading"></div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .callback-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
      min-width: 300px;
    }

    .callback-card h2 {
      color: #333;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .callback-card p {
      color: #e74c3c;
      font-size: 14px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  isLoading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        this.processGoogleCallback(code);
      } else {
        const token = this.extractTokenFromUrl();
        if (token) {
          this.processToken(token);
        } else {
          this.error = 'No authentication code received';
          this.isLoading = false;
        }
      }
    });
  }

  private extractTokenFromUrl(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const url = new URL(window.location.href);
      const fragment = url.hash.substring(1);
      const params = new URLSearchParams(fragment);
      return params.get('access_token');
    }
    return null;
  }

  private processToken(token: string): void {
    this.authService.setUserData(token, {} as User);

    this.authService.validate().subscribe({
      next: (user: User) => {
        this.authService.setUserData(token, user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.error = 'Failed to fetch user data';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  private processGoogleCallback(code: string): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}

