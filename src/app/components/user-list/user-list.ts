// src/app/components/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService} from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router'; // routerLink direktifi için
import { MatButtonModule } from '@angular/material/button'; // Butonlar için
import { UserDetail } from '../../dtos/user.dtos'; // Kullanıcı detay DTO'su
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators'; // <<< Bu satır eklendi veya güncellendi!

// Dialog modülü ve servisi
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog'; // Oluşturacağımız onay dialogu

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // routerLink kullanmak için import edin
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule // Butonlar için import edin
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: UserDetail[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  isAdmin = false; // Kullanıcının admin olup olmadığını kontrol etmek için
  

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    this.getAllUsers();
    this.authService.currentUserRole$.pipe(
      map(role => role === 'Admin')
    ).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  getAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        console.log('Kullanıcılar yüklendi:', this.users);
      },
      error: (err) => {
        console.error('Kullanıcıları çekerken hata oluştu:', err);
        this.isLoading = false;
        const displayMessage = err.message || 'Kullanıcılar yüklenirken bir hata oluştu.';
        this.errorMessage = displayMessage;
      }
    });
  }

  // Yeni: Kullanıcı silme metodu
  confirmDeleteUser(user: UserDetail): void {
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
        this.snackBar.open('Kullanıcı başarıyla silindi.', 'Kapat', { duration: 3000 });
        this.getAllUsers(); // Listeyi yeniden yükle
      },
      error: (err) => {
        console.error('Kullanıcı silinirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı silinirken hata oluştu.', 'Kapat', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}