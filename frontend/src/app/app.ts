import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';
import {  signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  loading = signal(true);

  protected title = 'app';

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const preloader = document.getElementById('global-preloader');
      if (preloader) {
        preloader.remove();
      }
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
            this.authService.setUserData(localStorage.getItem('access_token') || '', user);
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
  }

  private fadeOutLoader() {
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
      loadingContainer.classList.add('fade-out');
      setTimeout(() => {
        this.loading.set(false);
      }, 300);
    } else {
      this.loading.set(false);
    }
  }
}
