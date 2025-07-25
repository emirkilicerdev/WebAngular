// src/app/auth/register/register.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'; // OnInit ekliyoruz
import { CommonModule } from '@angular/common';
// Reactive Forms için gerekli import'lar
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
// UserRegistrationDto'ya artık doğrudan ihtiyacımız yok, formun kendisi DTO gibi davranacak
// import { UserRegistrationDto } from '../../dtos/auth.dtos';
import { RouterLink, Router } from '@angular/router'; // Router'ı da ekleyelim, başarılı girişte yönlendirme için
import { MatSnackBar } from '@angular/material/snack-bar'; // Material Snack Bar

// Material Modül Importları (Eğer MaterialModule oluşturduysanız)
import { MaterialModule } from '../../shared/material.module';
// Veya tek tek importlar:
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // MatIcon için

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // BURADA FormsModule yerine ReactiveFormsModule kullanıyoruz
    RouterLink,
    MaterialModule, // Eğer MaterialModule kullanıyorsanız
    // Eğer MaterialModule kullanmıyorsanız, aşağıdaki modülleri ekleyin:
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit { // OnInit arayüzünü uyguluyoruz
  registerForm!: FormGroup; // FormGroup tipinde formumuzu tanımlıyoruz
  hidePassword = true; // Şifre gösterme/gizleme butonu için

  constructor(
    private fb: FormBuilder, // FormBuilder'ı enjekte ediyoruz
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router // Router'ı enjekte ediyoruz
  ) { }

  ngOnInit(): void {
    // Formu FormBuilder ile başlatıyoruz
    this.registerForm = this.fb.group({
      username: ['', Validators.required], // Kullanıcı adı zorunlu
      email: ['', [Validators.required, Validators.email]], // E-posta zorunlu ve geçerli formatta olmalı
      password: ['', [Validators.required, Validators.minLength(6)]] // Şifre zorunlu ve en az 6 karakter olmalı
    });
  }

  onSubmit(): void { // onRegister yerine onSubmit kullanıyoruz (HTML'e uygun)
    if (this.registerForm.valid) {
      // Form geçerliyse API'ye gönder
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Kayıt Başarılı:', response);
          this.snackBar.open(response.message || 'Kayıt başarıyla tamamlandı!', 'Kapat', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.registerForm.reset(); // Formu temizle
          this.router.navigate(['/login']); // Kayıt sonrası giriş sayfasına yönlendir
        },
        error: (err) => {
          console.error('Kayıt Hatası:', err);
          const errorMessage = err.error?.message || err.error || 'Kayıt sırasında bir hata oluştu.';
          this.snackBar.open(errorMessage, 'Kapat', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Form geçerli değilse, hataları göstermek için tüm alanları işaretle
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}