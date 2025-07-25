// src/app/components/user-form/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Router'ı import et
import { UserCreate, UserUpdate, UserDetail } from '../../dtos/user.dtos';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; // Rol seçimi için
import { UserService } from '../../services/user.service'; // UserService'i import et


@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Reactive Forms için gerekli
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    RouterLink 
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  pageTitle = 'Yeni Kullanıcı Oluştur';
  roles: string[] = ['User', 'Admin']; // Mümkün roller

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router, // Yönlendirme için
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // Yeni kullanıcı için gerekli, düzenlemede opsiyonel
      role: ['User', Validators.required] // Varsayılan rol 'User'
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = +id;
        this.pageTitle = 'Kullanıcıyı Düzenle';
        this.loadUser(this.userId);
        // Düzenleme modunda şifre alanını opsiyonel yap
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      } else {
        // Yeni kullanıcı modunda şifre alanını zorunlu yap
        this.userForm.get('password')?.setValidators(Validators.required);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Formu mevcut kullanıcı bilgileriyle doldur
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role
          // Şifre hash'i frontend'e gelmediği için doldurmuyoruz
        });
      },
      error: (err) => {
        console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı bilgileri yüklenirken hata oluştu.', 'Kapat', { duration: 5000 });
        this.router.navigate(['/home/users']); // Hata olursa listeye geri dön
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000 });
      return;
    }

    if (this.isEditMode && this.userId !== null) {
      // Kullanıcı Güncelleme
      const userUpdate: UserUpdate = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        role: this.userForm.value.role
        // Şifre alanı boşsa gönderme, sadece güncellenecekse gönder
        // password: this.userForm.value.password // Eğer şifre güncellemesi burada yapılacaksa
      };
      this.userService.updateUser(this.userId, userUpdate).subscribe({
        next: () => {
          this.snackBar.open('Kullanıcı başarıyla güncellendi.', 'Kapat', { duration: 3000 });
          this.router.navigate(['/home/users']); // Listeye geri dön
        },
        error: (err) => {
          console.error('Kullanıcı güncellenirken hata oluştu:', err);
          this.snackBar.open(err.message || 'Kullanıcı güncellenirken hata oluştu.', 'Kapat', { duration: 5000 });
        }
      });
    } else {
      // Yeni Kullanıcı Oluşturma
      const userCreate: UserCreate = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        password: this.userForm.value.password, // Yeni kullanıcı için şifre gerekli
        role: this.userForm.value.role
      };
      this.userService.createUser(userCreate).subscribe({
        next: () => {
          this.snackBar.open('Kullanıcı başarıyla oluşturuldu.', 'Kapat', { duration: 3000 });
          this.router.navigate(['/home/users']); // Listeye geri dön
        },
        error: (err) => {
          console.error('Kullanıcı oluşturulurken hata oluştu:', err);
          this.snackBar.open(err.message || 'Kullanıcı oluşturulurken hata oluştu.', 'Kapat', { duration: 5000 });
        }
      });
    }
  }
}