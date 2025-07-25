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
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service'; // Auth Servisiniz

// Backend'deki RegisterModel'in TypeScript karşılığı
export interface RegisterModel {
  username: string;
  email: string;
  password: string;
  role?: string; // <<< Role alanını ekleyin, backend'e göre opsiyonel olabilir
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <<< ReactiveFormsModule'ü imports'a ekleyin
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon 
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  roles: string[] = ['User', 'Admin']; // Kullanıcıların seçebileceği roller
hidePassword: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['User', Validators.required] // <<< 'role' form kontrolünü ekledik ve varsayılan 'User'
    });
  }

  ngOnInit(): void {
    // Component yüklendiğinde yapılacaklar (şimdilik boş)
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registerData: RegisterModel = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.snackBar.open('Kayıt başarılı! Giriş yapabilirsiniz.', 'Kapat', { duration: 3000 });
          this.router.navigate(['/login']); // Kayıt sonrası giriş sayfasına yönlendir
        },
        error: (err) => {
          console.error('Kayıt hatası:', err);
          this.snackBar.open('Kayıt başarısız oldu: ' + (err.error?.message || 'Bilinmeyen Hata'), 'Kapat', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000 });
    }
  }
}