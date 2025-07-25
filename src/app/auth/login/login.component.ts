// src/app/auth/login/login.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'; // OnInit ekliyoruz
import { CommonModule } from '@angular/common';
// Reactive Forms için gerekli import'lar
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
// UserLoginDto'ya artık doğrudan ihtiyacımız yok, formun kendisi DTO gibi davranacak
// import { UserLoginDto } from '../../dtos/auth.dtos';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Material Modül Importları (Eğer MaterialModule oluşturduysanız)
import { MaterialModule } from '../../shared/material.module';
// Veya tek tek importlar:
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // MatIcon için

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // FormsModule yerine ReactiveFormsModule kullanıyoruz
    RouterLink,
    MaterialModule, // Eğer MaterialModule kullanıyorsanız
    // Eğer MaterialModule kullanmıyorsanız, aşağıdaki modülleri ekleyin:
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit { // OnInit arayüzünü uyguluyoruz
  loginForm!: FormGroup; // FormGroup tipinde formumuzu tanımlıyoruz
  hidePassword = true; // Şifre gösterme/gizleme butonu için

  constructor(
    private fb: FormBuilder, // FormBuilder'ı enjekte ediyoruz
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Formu FormBuilder ile başlatıyoruz
    this.loginForm = this.fb.group({
      username: ['', Validators.required], // Kullanıcı adı zorunlu
      password: ['', Validators.required]  // Şifre zorunlu
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      // Form geçerliyse API'ye gönder
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Giriş Başarılı:', response);
          this.snackBar.open(response.message || 'Giriş başarıyla tamamlandı!', 'Kapat', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loginForm.reset(); // Formu temizle (isteğe bağlı)
          this.router.navigate(['/']); // Başarılı girişten sonra ana sayfaya yönlendir
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
    } else {
      // Form geçerli değilse, hataları göstermek için tüm alanları işaretle
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Lütfen kullanıcı adı ve şifrenizi girin.', 'Kapat', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}