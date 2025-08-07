import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetailDto } from '../../dtos/user.dtos';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog'; // MatDialog import edildi
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetailComponent implements OnInit {
  user: UserDetailDto | null = null;
  isLoading = true;
  userId: number | null = null;
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog, // MatDialog enjekte edildi
    private router: Router // Router enjekte edildi
  ) { }

  ngOnInit(): void {
    this.authService.currentUserRole$.pipe(
      map(role => role === 'Admin')
    ).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
        this.getUserDetails(this.userId);
      } else {
        this.snackBar.open('Kullanıcı ID\'si bulunamadı.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  getUserDetails(id: number): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: UserDetailDto) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Kullanıcı detayları çekilirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı detayları yüklenirken hata oluştu.', 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
        this.isLoading = false;
        this.user = null;
      }
    });
  }

  confirmDeleteUser(user: UserDetailDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Kullanıcıyı Sil',
        message: `${user.username} adlı kullanıcıyı silmek istediğinize emin misiniz?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('Kullanıcı başarıyla silindi.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
        this.router.navigate(['/home/users']); // Kullanıcı silindikten sonra kullanıcı listesine yönlendir
      },
      error: (err) => {
        console.error('Kullanıcı silinirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı silinirken hata oluştu.', 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
      }
    });
  }
}
