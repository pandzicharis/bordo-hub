import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { Observable } from 'rxjs';
import { FksLoaderComponent } from '../../../../shared/fks-loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FksLoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user$: Observable<any>;
  constructor(public authService: AuthService) {
    this.user$ = this.authService.user$;
  }
} 