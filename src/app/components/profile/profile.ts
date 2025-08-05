// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserDetailDto } from '../../dtos/user.dtos'; // Kullanıcı modeliniz doğru şekilde import edilmiş
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router'; // Router eklendi

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: UserDetailDto | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getCurrentUserProfile().subscribe({
      next: (data: UserDetailDto) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Profil bilgileri çekilirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Profil çekme hatası:', err);
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/home/profile/edit']);
  }
}
