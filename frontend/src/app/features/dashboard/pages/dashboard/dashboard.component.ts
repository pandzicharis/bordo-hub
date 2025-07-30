import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.isLoading = true;
      this.authService.validate().subscribe({
        next: (user: User) => {
          this.currentUser = user;
          // Get token from AuthService instead of directly accessing localStorage
          const token = this.authService.getToken();
          this.authService.setUserData(token || '', user);
          this.isLoading = false;
        },
        error: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 