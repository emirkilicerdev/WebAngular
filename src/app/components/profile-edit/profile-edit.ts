// src/app/components/profile-edit/profile-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // RouterLink eklendi
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserDetailDto, UserUpdateDto } from '../../dtos/user.dtos'; // Doğru DTO'lar import edilmiş
import { catchError, switchMap, take } from 'rxjs/operators';
import { throwError } from 'rxjs'; // throwError eklendi

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink // RouterLink modülü import edildi
  ],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.scss']
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: UserDetailDto | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    // Form grubunu tanımla. Şifre alanı opsiyonel olduğu için başlangıçta boş ve validator'sız.
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Şifre alanı eklendi, opsiyonel
    });
  }

  ngOnInit(): void {
    // Bileşen yüklendiğinde kullanıcının mevcut profil bilgilerini yükle
    this.loadUserProfile();
  }

  /**
   * Mevcut kullanıcının profil bilgilerini backend'den çeker ve formu doldurur.
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getCurrentUserProfile().subscribe({
      next: (user: UserDetailDto) => {
        this.currentUser = user;
        // Çekilen verilerle formu doldur
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
        this.isLoading = false;
      },
      error: (err) => {
        // Hata durumunda mesajı göster ve yükleme durumunu kapat
        this.errorMessage = err.message || 'Profil bilgileri yüklenirken hata oluştu.';
        this.isLoading = false;
        console.error('Profil yükleme hatası:', err);
      }
    });
  }

  /**
   * Form gönderildiğinde çalışır. Kullanıcı bilgilerini günceller.
   */
  onSubmit(): void {
    // Form geçerli mi kontrol et
    if (this.profileForm.valid) {
      // Güncelleme için UserUpdateDto objesini oluştur
      const userUpdate: UserUpdateDto = {
        username: this.profileForm.value.username,
        email: this.profileForm.value.email
      };

      // Eğer şifre alanı doluysa (kullanıcı şifreyi değiştirmek istiyorsa), güncelleme objesine ekle
      if (this.profileForm.value.password) {
        userUpdate.password = this.profileForm.value.password;
      }

      // Mevcut kullanıcının ID'sini AuthService'den al
      this.authService.getCurrentUserId().pipe(
        take(1), // Sadece bir kez değer al ve aboneliği sonlandır
        switchMap(userId => {
          if (userId === null) {
            // Kullanıcı ID'si yoksa hata fırlat
            return throwError(() => new Error('Kullanıcı ID\'si bulunamadı. Lütfen tekrar giriş yapın.'));
          }
          // Kullanıcı ID'si varsa, UserService ile güncelleme isteği gönder
          return this.userService.updateUser(userId, userUpdate);
        }),
        catchError(err => {
          // API'den gelen hatayı yakala ve kullanıcıya göster
          this.snackBar.open(err.message || 'Profil güncellenirken hata oluştu.', 'Kapat', { duration: 5000,verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
          console.error('Profil güncellenirken hata oluştu:', err);
          return throwError(() => err); // Hatayı yeniden fırlat
        })
      ).subscribe({
        next: () => {
          // Başarılı olursa kullanıcıya bildirim göster ve profil sayfasına yönlendir
          this.snackBar.open('Profil başarıyla güncellendi.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
          this.router.navigate(['/home/profile']); // Profil sayfasına geri dön
        },
        error: () => {
          // Hata zaten catchError operatöründe işlendiği için burada ek bir işlem yapmaya gerek yok
        }
      });
    } else {
      // Form geçerli değilse tüm alanları dokunulmuş olarak işaretle ve hata mesajı göster
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
    }
  }
}
