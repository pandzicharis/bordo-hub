import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = this.loginForm.value;

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
       
          if (response && response.access_token) {
            const token = response.access_token;
            
            // Use AuthService to handle localStorage safely
            this.authService.setUserData(token, {} as User); // Temporary user object
            
            this.authService.validate().subscribe({
              next: (user: User) => {
                console.log('User data:', user);
                this.authService.setUserData(response.access_token, user);
                this.router.navigate(['/dashboard']);
              },
              error: (error) => {
                console.error('Error fetching user data:', error);
                this.errorMessage = 'Error fetching user data';
                this.isLoading = false;
                this.authService.logout();
              }
            });
          } else {
            console.error('No access_token in response:', response);
            this.errorMessage = 'Invalid response from server';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Login failed';
          this.isLoading = false;
        }
      });
    }
  }

  loginWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const apiGatewayUrl = 'http://localhost:8000';
    
    fetch(`${apiGatewayUrl}/auth/google`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          this.errorMessage = 'Failed to get Google OAuth URL';
          this.isLoading = false;
        }
      })
      .catch(error => {
        console.error('Google OAuth error:', error);
        this.errorMessage = 'Failed to initiate Google OAuth';
        this.isLoading = false;
      });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }
}
