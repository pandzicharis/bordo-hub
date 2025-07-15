import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';
import {  signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FksLoaderComponent } from './shared/fks-loader.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, FksLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  loading = signal(true);

  protected title = 'app';

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(() => {
      this.loading.set(false);
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const preloader = document.getElementById('global-preloader');
        if (preloader) {
          preloader.remove();
        }
      }
    });
  }
}
