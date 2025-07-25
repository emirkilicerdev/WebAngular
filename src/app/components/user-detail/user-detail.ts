// src/app/components/user-detail/user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // RouterLink için
import { UserService } from '../../services/user.service'; // UserService ve UserDetail interface'i
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetail } from '../../dtos/user.dtos'; // UserDetail interface'i
import { map } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // routerLink direktifini kullanmak için
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetailComponent implements OnInit {
  user: UserDetail | null = null;
  isLoading = true;
  userId: number | null = null;
  authService: any;
  isAdmin: boolean = false; // 

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id; // String'den number'a çevir
        this.getUserDetails(this.userId);
      } else {
        this.snackBar.open('Kullanıcı ID\'si bulunamadı.', 'Kapat', { duration: 3000 });
        this.isLoading = false;

        this.authService.currentUserRole$.pipe(
              map(role => role === 'Admin')
            ).subscribe(isAdmin => {
              this.isAdmin = isAdmin;
            });
      }
    });
  }

  getUserDetails(id: number): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Kullanıcı detayları çekilirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı detayları yüklenirken hata oluştu.', 'Kapat', { duration: 5000 });
        this.isLoading = false;
        this.user = null; // Hata durumunda kullanıcıyı sıfırla
      }
    });
  }
}