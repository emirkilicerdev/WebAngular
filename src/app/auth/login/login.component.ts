// src/app/auth/login/login.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Material Modül Importları
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserLoginDto } from '../../dtos/auth.dtos';
// RoleSelectorComponent'e bu component'te doğrudan ihtiyaç yoksa kaldırılabilir.
// import { RoleSelectorComponent } from '../../components/role-selector/role-selector';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    // MaterialModule kullanılıyorsa aşağıdaki tek tek importlara gerek kalmaz.
    // Eğer MaterialModule kullanmıyorsanız, bu modüller gereklidir:
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
export class LoginComponent implements OnInit {
  // FormGroup tipinde login formumuzu tanımlıyoruz
  loginForm: FormGroup;
  // Şifre gösterme/gizleme butonu için durum değişkeni
  hidePassword = true;

  constructor(
    private fb: FormBuilder, // FormBuilder'ı enjekte ediyoruz
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Component yüklendiğinde formu FormBuilder ile başlatıyoruz
    this.loginForm = this.fb.group({
      username: ['', Validators.required], // Kullanıcı adı alanı zorunlu
      password: ['', Validators.required]  // Şifre alanı zorunlu
    });
  }

  /**
   * Giriş butonuna tıklandığında çalışacak metod.
   * Formun geçerliliğini kontrol eder ve AuthService üzerinden giriş işlemini başlatır.
   */
  onLogin(): void {
    // Form geçerli mi kontrol et
    if (this.loginForm.valid) {
      // Form verilerini UserLoginDto tipine dönüştürerek AuthService'e gönder
      const credentials = this.loginForm.value as UserLoginDto;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Giriş Başarılı:', response);
          // Başarılı giriş mesajını kullanıcıya göster
          this.snackBar.open(response.message || 'Giriş başarıyla tamamlandı!', 'Kapat', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'left',   // sağa hizala
            verticalPosition: 'top'      // yukarı hizala
          });
          this.loginForm.reset(); // Formu temizle
          // Yönlendirme mantığı AuthService içinde yönetildiği için buradan kaldırıldı.
          // AuthService, kullanıcının rollerine göre uygun sayfaya yönlendirecektir.
        },
        error: (err) => {
          console.error('Giriş Hatası:', err);
          // Hata mesajını kullanıcıya göster
          const errorMessage = err.message;
          this.snackBar.open(errorMessage, 'Kapat', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'left',   
            verticalPosition: 'top'      // yukarı hizala
          });
        }
      });
    } else {
      // Form geçerli değilse, tüm form alanlarını dokunulmuş olarak işaretle
      // Bu, hata mesajlarının görünmesini sağlar
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Lütfen kullanıcı adı ve şifrenizi girin.', 'Kapat', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Şifre görünürlüğünü değiştiren metod.
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
