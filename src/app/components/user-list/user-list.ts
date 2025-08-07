// src/app/components/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService} from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { UserDetailDto } from '../../dtos/user.dtos'; // UserDetailDto'yu user.dtos'tan alıyoruz
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

// Dialog modülü ve servisi
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog'; // Doğru yol ve dosya adı
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: UserDetailDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  isAdmin = false;
  currentUserRole$: Observable<string | null>;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getAllUsers();
    // Kullanıcının admin olup olmadığını kontrol et
    this.authService.currentUserRoles$.pipe( // currentUserRoles$ kullanıldı
      map(roles => roles.includes('Admin')) // Roller dizisinde 'Admin' var mı kontrol et
    ).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  getAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getAllUsers().subscribe({
      next: (data: UserDetailDto[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const displayMessage = err.message || 'Kullanıcılar yüklenirken bir hata oluştu.';
        this.errorMessage = displayMessage;
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
        this.getAllUsers();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Kullanıcı silinirken hata oluştu.', 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
      }
    });
  }
}
