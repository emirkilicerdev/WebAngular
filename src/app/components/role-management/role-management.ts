// src/app/components/role-management/role-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog'; // MatDialog import edildi
import { AuthService } from '../../services/auth.service';

import { RoleService } from '../../services/role.service'; // RoleService import edildi
import { RoleDto, RoleCreateDto, RoleUpdateDto } from '../../dtos/role.dtos'; // Rol DTO'ları import edildi
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog'; // Onay dialogu import edildi

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './role-management.html',
  styleUrls: ['./role-management.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: RoleDto[] = []; // Mevcut rolleri tutar
  roleForm!: FormGroup; // Rol oluşturma/düzenleme formu
  isEditMode = false; // Düzenleme modunda olup olmadığını belirtir
  editingRoleId: number | null = null; // Düzenlenen rolün ID'si
  isLoading = true; // Veri yüklenirken spinner göstermek için
  errorMessage: string | null = null; // Hata mesajlarını tutar
  private authService: AuthService

  constructor(
    private fb: FormBuilder, // Form oluşturmak için FormBuilder
    private roleService: RoleService, // Rol API'si ile iletişim için RoleService
    private snackBar: MatSnackBar, // Kullanıcıya bildirim göstermek için MatSnackBar
    private dialog: MatDialog // Onay dialogu için MatDialog
  ) { }

  ngOnInit(): void {
    this.initRoleForm(); // Formu başlat
    this.loadRoles(); // Rolleri yükle
  }

  /**
   * Rol oluşturma/düzenleme formunu başlatır.
   */
  initRoleForm(): void {
    this.roleForm = this.fb.group({
      name: ['', Validators.required] // Rol adı alanı, zorunlu
    });
  }

  /**
   * Backend'den tüm rolleri çeker ve `roles` dizisine atar.
   */
  loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.roleService.getAllRoles().subscribe({
      next: (data: RoleDto[]) => {
        this.roles = data; // Başarılı yanıtı rollere ata
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Roller yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Roller yükleme hatası:', err);
      }
    });
  }

  /**
   * Form gönderildiğinde (yeni rol oluşturma veya mevcut rolü güncelleme).
   */
  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.snackBar.open('Lütfen rol adını girin.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
      return;
    }

    const roleName = this.roleForm.value.name;

    if (this.isEditMode && this.editingRoleId !== null) {
      // Düzenleme modunda ise rolü güncelle
      const roleUpdate: RoleUpdateDto = {
        id: this.editingRoleId,
        name: roleName
      };
      this.roleService.updateRole(this.editingRoleId, roleUpdate).subscribe({
        next: () => {
          this.snackBar.open('Rol başarıyla güncellendi.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
          this.resetForm(); // Formu sıfırla
          this.loadRoles(); // Rolleri yeniden yükle
          this.authService.notifyRolesChanged();;
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Rol güncellenirken hata oluştu.', 'Kapat', { duration: 5000,verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
          console.error('Rol güncelleme hatası:', err);
        }
      });
    } else {
      // Yeni rol oluştur
      const roleCreate: RoleCreateDto = {
        name: roleName
      };
      this.roleService.createRole(roleCreate).subscribe({
        next: () => {
          this.snackBar.open('Rol başarıyla oluşturuldu.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
          this.resetForm(); // Formu sıfırla
          this.loadRoles(); // Rolleri yeniden yükle
          this.authService.notifyRolesChanged();
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Rol oluşturulurken hata oluştu.', 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
          console.error('Rol oluşturma hatası:', err);
        }
      });
    }
  }

  /**
   * Bir rolü düzenleme moduna alır.
   * @param role Düzenlenecek rol objesi
   */
  editRole(role: RoleDto): void {
    this.isEditMode = true;
    this.editingRoleId = role.id;
    this.roleForm.patchValue({ name: role.name }); // Formu rolün adıyla doldur
  }

  /**
   * Rol silme işlemi için onay dialogu açar.
   * @param role Silinecek rol objesi
   */
  confirmDeleteRole(role: RoleDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Rolü Sil',
        message: `${role.name} adlı rolü silmek istediğinize emin misiniz? Bu işlem, bu rolü kullanan tüm kullanıcıları etkileyebilir.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRole(role.id); // Onaylanırsa silme işlemini çağır
      }
    });
  }

  /**
   * Belirli bir rolü siler.
   * @param id Silinecek rolün ID'si
   */
  deleteRole(id: number): void {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.snackBar.open('Rol başarıyla silindi.', 'Kapat', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['success-snackbar'] });
        this.loadRoles();
        this.authService.notifyRolesChanged();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Rol silinirken hata oluştu.', 'Kapat', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'end', panelClass: ['error-snackbar'] });
        console.error('Rol silme hatası:', err);
      }
    });
  }

  /**
   * Formu sıfırlar ve düzenleme modundan çıkar.
   */
  resetForm(): void {
    this.isEditMode = false;
    this.editingRoleId = null;
    this.roleForm.reset(); // Formu boşalt
  }
}
