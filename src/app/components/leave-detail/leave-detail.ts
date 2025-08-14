import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveRequestResponseDto, LeaveRequestCreateDto } from '../../dtos/leave-request.dtos';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leave-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './leave-detail.html',
  styleUrls: ['./leave-detail.scss'],
})
export class LeaveDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() leaveId: number | null = null;
  

  leaveDetail: LeaveRequestResponseDto | null = null;
  loading = false;
  leaveForm: FormGroup;

  currentRole: string | null = null;
  currentUserId: number | null = null;
  private roleSub?: Subscription;

  constructor(
    private leaveService: LeaveRequestService, 
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.leaveForm = this.fb.group({
      reason: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.roleSub = this.authService.activeSelectedRole$.subscribe(role => {
      this.currentRole = role;
    });

    this.authService.getCurrentUserId().subscribe(userId => {
    this.currentUserId = userId;
  });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['leaveId'] && this.leaveId !== null) {
      this.loadLeaveDetail(this.leaveId);
    }
  }

  ngOnDestroy() {
    this.roleSub?.unsubscribe();
  }

  loadLeaveDetail(id: number) {
    this.loading = true;
    this.leaveService.getById(id).subscribe({
      next: data => {
        this.leaveDetail = data;
        this.loading = false;

        this.leaveForm.patchValue({
          reason: data.reason,
          startDate: data.startDate.substring(0, 10),
          endDate: data.endDate.substring(0, 10)
        });
      },
      error: () => {
        this.leaveDetail = null;
        this.loading = false;
      }
    });
  }

  approveLeave() {
    if (!this.leaveDetail) return;

    this.authService.getCurrentUserId().subscribe(userId => {
      if (userId === null) {
        alert('Kullanıcı bilgisi alınamadı.');
        return;
      }

      const updatedLeave: LeaveRequestCreateDto = {
        typeId: this.leaveDetail!.leaveTypeId,
        statusId: 2, // Onaylandı
        startDate: this.leaveDetail!.startDate,
        endDate: this.leaveDetail!.endDate,
        reason: this.leaveDetail!.reason,
        userId: this.leaveDetail!.userId,
        approvedById: userId
      };

      this.updateLeave(updatedLeave);
    });
  }

  rejectLeave() {
    if (!this.leaveDetail) return;

    this.authService.getCurrentUserId().subscribe(userId => {
      if (userId === null) {
        alert('Kullanıcı bilgisi alınamadı.');
        return;
      }

      const updatedLeave: LeaveRequestCreateDto = {
        typeId: this.leaveDetail!.leaveTypeId,
        statusId: 3, // Reddedildi
        startDate: this.leaveDetail!.startDate,
        endDate: this.leaveDetail!.endDate,
        reason: this.leaveDetail!.reason,
        userId: this.leaveDetail!.userId,
        approvedById: userId
      };

      this.updateLeave(updatedLeave);
    });
  }

  private updateLeave(dto: LeaveRequestCreateDto) {
  if (!this.leaveDetail) return;

  this.leaveService.update(this.leaveDetail.id, dto).subscribe({
    next: () => {
      this.snackBar.open('İzin durumu başarıyla güncellendi.', 'Kapat', {
        duration: 3000, // 3 saniye göster
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'] // opsiyonel, özel stil için
      });
      this.loadLeaveDetail(this.leaveDetail!.id);
      this.leaveService.notifyLeaveStatusChanged();
    },
    error: err => {
      console.error('İzin güncelleme hatası:', err);
      this.snackBar.open('İzin durumu güncellenirken hata oluştu.', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'] // opsiyonel
      });
    }
  });
}
}
