import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';
import {  signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  loading = signal(true);

  protected title = 'app';

  ngOnInit() {
    // Only run this code in the browser
    if (isPlatformBrowser(this.platformId)) {
      const preloader = document.getElementById('global-preloader');
      if (preloader) {
        preloader.remove();
      }

      if (this.authService.isAuthenticated()) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          setTimeout(() => {
            this.fadeOutLoader();
          }, 300);
        } else {
          this.authService.validate().subscribe({
            next: (user) => {
              this.authService.setUserData(this.authService.getToken() || '', user);
              setTimeout(() => {
                this.fadeOutLoader();
              }, 300);
            },
            error: () => {
              this.authService.logout();
              setTimeout(() => {
                this.fadeOutLoader();
              }, 300);
            }
          });
        }
      } else {
        setTimeout(() => {
          this.fadeOutLoader();
        }, 800);
      }
    } else {
      // On server side, just set loading to false immediately
      this.loading.set(false);
    }
  }

  private fadeOutLoader() {
    // Only run this code in the browser
    if (isPlatformBrowser(this.platformId)) {
      const loadingContainer = document.querySelector('.loading-container');
      if (loadingContainer) {
        loadingContainer.classList.add('fade-out');
        setTimeout(() => {
          this.loading.set(false);
        }, 300);
      } else {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }
}
