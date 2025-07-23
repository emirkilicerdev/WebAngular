// src/app/auth/login/login.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // [(ngModel)] için
import { AuthService } from '../../services/auth.service';
import { UserLoginDto } from '../../dtos/auth.dtos';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Material Snack Bar

// Eğer MaterialModule oluşturduysanız:
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule // MaterialModule'ü buraya import ediyoruz
    // Eğer MaterialModule oluşturmadıysanız, tek tek buraya eklemelisiniz:
    // MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  credentials: UserLoginDto = { username: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar // MatSnackBar'ı enjekte ediyoruz
  ) { }

  onLogin(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Giriş Başarılı:', response);
        this.snackBar.open(response.message || 'Giriş başarıyla tamamlandı!', 'Kapat', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Başarılı girişten sonra ana sayfaya yönlendir
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Giriş Hatası:', err);
        const errorMessage = err.error?.message || err.error || 'Giriş sırasında bir hata oluştu.';
        this.snackBar.open(errorMessage, 'Kapat', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}