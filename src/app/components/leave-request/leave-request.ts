import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // MatSnackBarModule eklendi

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


// DTO'ları dtos/leave-request.dtos.ts dosyasından içe aktarıyoruz
import { 
  LeaveRequestCreateDto, 
  LEAVE_TYPES, 
  LEAVE_STATUSES 
} from '../../dtos/leave-request.dtos';

import { LeaveRequestService } from '../../services/leave-request.service';

// Kullanıcı kimliğini almak için bir servis olduğunu varsayıyoruz
import { AuthService } from '../../services/auth.service';
import { Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './leave-request.html',
  styleUrls: ['./leave-request.scss'],
})
export class LeaveRequestComponent implements OnInit {
  leaveForm: FormGroup;
  
  leaveTypes = LEAVE_TYPES;

  private readonly DEFAULT_STATUS_ID = LEAVE_STATUSES.find(status => status.name === 'Pending')?.id || 1;

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private AuthService: AuthService,
    private snackBar: MatSnackBar,
    private Router: Router
  ) {
    this.leaveForm = this.fb.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // leaveTypes artık DTO'dan geldiği için burada ekstra bir işlem yapmaya gerek yok.
  }

  submitRequest(): void {
  if (this.leaveForm.invalid) {
    this.leaveForm.markAllAsTouched();
    this.snackBar.open('Lütfen tüm alanları doğru doldurun.', 'Kapat', { duration: 3000 });
    return;
  }

  const formValue = this.leaveForm.value;

  const newRequest: LeaveRequestCreateDto = {
    typeId: formValue.leaveTypeId,
    statusId: this.DEFAULT_STATUS_ID,
    reason: formValue.reason,
    // Date tiplerini string'e çeviriyoruz
    startDate: formValue.startDate instanceof Date 
      ? formValue.startDate.toISOString() 
      : formValue.startDate,
    endDate: formValue.endDate instanceof Date 
      ? formValue.endDate.toISOString() 
      : formValue.endDate,
    userId: this.AuthService.getUserIdFromToken(),
    approvedById: null,
  };

  this.leaveRequestService.create(newRequest).subscribe({
    next: () => {
      this.snackBar.open('İzin talebi başarıyla gönderildi.', 'Kapat', { 
        duration: 3000, 
        verticalPosition: 'top', 
        horizontalPosition: 'end',
        panelClass: ['success-snackbar']
      });

      
      // Formu temizliyoruz ama varsayılan boş değerlerle yeniden başlatıyoruz
      this.leaveForm.reset({
        leaveTypeId: '',
        startDate: null,
        endDate: null,
        reason: ''
      });

      this.Router.navigate(['/home/leaves']); // İzin talepleri sayfasına yönlendir


    },
    error: (err) => {
      console.error('Leave request failed', err);
      this.snackBar.open(err.message || 'İzin talebi gönderilirken bir hata oluştu.', 'Kapat', { 
        duration: 5000, 
        verticalPosition: 'top', 
        horizontalPosition: 'end',
        panelClass: ['error-snackbar']
      });
    },
  });
}
}
