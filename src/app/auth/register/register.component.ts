// src/app/auth/register/register.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // [(ngModel)] için
import { AuthService } from '../../services/auth.service';
import { UserRegistrationDto } from '../../dtos/auth.dtos';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Material Snack Bar

// Eğer MaterialModule oluşturduysanız:
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule // MaterialModule'ü buraya import ediyoruz
    // Eğer MaterialModule oluşturmadıysanız, tek tek buraya eklemelisiniz:
    // MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss', // SCSS dosyası hala olabilir, ama içeriği minimalist olacak
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  user: UserRegistrationDto = { username: '', email: '', password: '' };
  // errorMessage ve successMessage artık MatSnackBar ile gösterilebilir
  // Bu yüzden doğrudan onları component'te tutmaya gerek kalmayabilir.

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar // MatSnackBar'ı enjekte ediyoruz
  ) { }

  onRegister(): void {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Kayıt Başarılı:', response);
        this.snackBar.open(response.message || 'Kayıt başarıyla tamamlandı!', 'Kapat', {
          duration: 3000,
          panelClass: ['success-snackbar'] // Özel CSS sınıfı
        });
        this.user = { username: '', email: '', password: '' }; // Formu temizle
      },
      error: (err) => {
        console.error('Kayıt Hatası:', err);
        const errorMessage = err.error?.message || err.error || 'Kayıt sırasında bir hata oluştu.';
        this.snackBar.open(errorMessage, 'Kapat', {
          duration: 5000,
          panelClass: ['error-snackbar'] // Özel CSS sınıfı
        });
      }
    });
  }
}