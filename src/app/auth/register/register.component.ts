// src/app/components/auth/register/register.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // ReactiveFormsModule önemli
import { Router } from '@angular/router'; // Yönlendirme için
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'; // Mesaj göstermek için
import { MatSelectModule } from '@angular/material/select'; // <<< MatSelectModule'ü import edin
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service'; // Auth Servisiniz
import { UserRegistrationDto } from '../../dtos/auth.dtos';

// Backend'deki RegisterModel'in TypeScript karşılığı
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    // MatSelectModule kaldırıldı
    MatIconModule // MatIcon için MatIconModule kullanın
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  // roles: string[] = ['User', 'Admin']; // <<< Bu satır kaldırıldı, rol seçimi artık yok
  hidePassword = true; // Şifre gösterme/gizleme butonu için

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Formu FormBuilder ile başlatıyoruz
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // role: ['User', Validators.required] // <<< 'role' form kontrolü kaldırıldı
    });
  }

  ngOnInit(): void {
    // Component yüklendiğinde yapılacaklar (şimdilik boş)
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // registerData doğrudan UserRegistrationDto yapısına uyuyor
      const registerData: UserRegistrationDto = this.registerForm.value; // <<< Tipi UserRegistrationDto olarak belirtildi

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.snackBar.open('Kayıt başarılı! Giriş yapabilirsiniz.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
          this.router.navigate(['/login']); // Kayıt sonrası giriş sayfasına yönlendir
        },
        error: (err) => {
          console.error('Kayıt hatası:', err);
          // Hata mesajını daha doğru bir şekilde yakala
          const errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
          this.snackBar.open('Kayıt başarısız oldu: ' + errorMessage, 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
        }
      });
    } else {
      // Form geçerli değilse, hataları göstermek için tüm alanları işaretle
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
    }
  }
}