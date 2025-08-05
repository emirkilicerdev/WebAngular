// src/app/components/user-form/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserCreateDto, UserUpdateDto, UserDetailDto } from '../../dtos/user.dtos';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service'; // RoleService import edildi
import { RoleDto } from '../../dtos/role.dtos'; // RoleDto import edildi
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    RouterLink,
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  pageTitle = 'Yeni Kullanıcı Oluştur';
  
  roles: RoleDto[] = []; // Rolleri API'den çekeceğimiz için başlangıçta boş bir dizi
  
  isAdmin = false;
  private user: UserDetailDto | null = null; // Kullanıcı detaylarını saklamak için

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private roleService: RoleService // RoleService enjekte edildi
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // Yeni kullanıcı için gerekli, düzenlemede opsiyonel
      roleIds: [[], Validators.required] // roleId yerine roleIds, başlangıçta boş dizi
    });

    this.authService.currentUserRoles$.pipe( // currentUserRoles$ kullanıldı
      map(roles => roles.includes('Admin'))
    ).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      if (this.isAdmin) { // Sadece admin ise rolleri çek
        this.loadRoles();
      } else {
        // Admin değilse ve düzenleme modundaysa rol seçimini devre dışı bırak
        if (this.isEditMode) {
          this.userForm.get('roleIds')?.disable();
        }
        // Eğer admin değilse ve yeni kullanıcı oluşturuyorsa, varsayılan rolü "User" olarak ayarla
        if (!this.isEditMode) {
          // 'User' rolünün ID'sini dinamik olarak bulmak için loadRoles'u beklemeliyiz
          // Şimdilik varsayılan ID'yi (2) kullanıyoruz, ancak daha sağlam bir çözüm için loadRoles'tan sonra set etmeliyiz.
          this.userForm.get('roleIds')?.setValue([2]); // Varsayılan olarak 'User' rolünün ID'si (2) atanır
          this.userForm.get('roleIds')?.disable(); // Kullanıcının değiştirmesini engelle
        }
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = +id;
        this.pageTitle = 'Kullanıcıyı Düzenle';
        this.loadUser(this.userId);
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      } else {
        this.userForm.get('password')?.setValidators(Validators.required);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  // Rolleri API'den çeken yeni metot
  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles: RoleDto[]) => {
        this.roles = roles;
        // Eğer düzenleme modundaysak ve roller yüklendiyse, kullanıcının rolünü ayarla
        if (this.isEditMode && this.user) {
          this.userForm.get('roleIds')?.setValue(this.user.roleIds);
        } else if (!this.isEditMode && this.roles.length > 0 && !this.isAdmin) {
          // Yeni kullanıcı oluştururken ve admin değilken varsayılan rolü (User) ayarla
          const defaultUserRole = this.roles.find(r => r.name === 'User');
          if (defaultUserRole) {
            this.userForm.get('roleIds')?.setValue([defaultUserRole.id]);
            this.userForm.get('roleIds')?.disable(); // Kullanıcının değiştirmesini engelle
          }
        }
      },
      error: (err) => {
        console.error('Roller yüklenirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Roller yüklenirken hata oluştu.', 'Kapat', { duration: 5000 });
      }
    });
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user: UserDetailDto) => {
        this.user = user; // Kullanıcı nesnesini sakla
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          roleIds: user.roleIds // Backend'den gelen roleIds'yi kullan
        });
        if (!this.isAdmin && this.isEditMode) {
          this.userForm.get('roleIds')?.disable();
        }
        // Roller zaten yüklüyse veya yüklenecekse, formdaki rolü ayarla
        if (this.roles.length > 0) {
          this.userForm.get('roleIds')?.setValue(user.roleIds);
        }
      },
      error: (err) => {
        console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', err);
        this.snackBar.open(err.message || 'Kullanıcı bilgileri yüklenirken hata oluştu.', 'Kapat', { duration: 5000 });
        this.router.navigate(['/home/users']);
      }
    });
  }

  onSubmit(): void {
    const roleIdsControl = this.userForm.get('roleIds');
    const wasRoleIdsDisabled = roleIdsControl?.disabled;
    if (wasRoleIdsDisabled) {
      roleIdsControl?.enable(); // Devre dışıysa geçici olarak etkinleştir
    }

    if (this.userForm.invalid) {
      this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000 });
      if (wasRoleIdsDisabled) {
        roleIdsControl?.disable(); // İşlem bittikten sonra tekrar devre dışı bırak
      }
      return;
    }

    if (this.isEditMode && this.userId !== null) {
      const userUpdate: UserUpdateDto = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        ...(this.isAdmin ? { roleIds: this.userForm.value.roleIds } : {}) // Sadece admin ise roleIds gönder
      };

      if (this.userForm.value.password) {
        userUpdate.password = this.userForm.value.password;
      }

      this.userService.updateUser(this.userId, userUpdate).subscribe({
        next: () => {
          this.snackBar.open('Kullanıcı başarıyla güncellendi.', 'Kapat', { duration: 3000 });
          this.authService.notifyRolesChanged();
          this.router.navigate(['/home/users']);
        },
        error: (err) => {
          console.error('Kullanıcı güncellenirken hata oluştu:', err);
          this.snackBar.open(err.message || 'Kullanıcı güncellenirken hata oluştu.', 'Kapat', { duration: 5000 });
        }
      });
    } else {
      const userCreate: UserCreateDto = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        roleIds: this.userForm.value.roleIds // roleIds gönder
      };
      this.userService.createUser(userCreate).subscribe({
        next: () => {
          this.snackBar.open('Kullanıcı başarıyla oluşturuldu.', 'Kapat', { duration: 3000 });
          this.router.navigate(['/home/users']);
        },
        error: (err) => {
          console.error('Kullanıcı oluşturulurken hata oluştu:', err);
          this.snackBar.open(err.message || 'Kullanıcı oluşturulurken hata oluştu.', 'Kapat', { duration: 5000 });
        }
      });
    }
    if (wasRoleIdsDisabled) {
      roleIdsControl?.disable(); // İşlem bittikten sonra tekrar devre dışı bırak
    }
  }
}
