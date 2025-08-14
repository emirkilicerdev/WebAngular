import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveRequestResponseDto } from '../../dtos/leave-request.dtos';
import { LeaveDetailComponent } from '../leave-detail/leave-detail';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.html',
  styleUrls: ['./leave-list.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LeaveDetailComponent,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
})
export class LeaveListComponent implements OnInit, OnDestroy {
  leaves: LeaveRequestResponseDto[] = [];
  selectedLeaveId: number | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private leaveService: LeaveRequestService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Leave status değişimlerini dinle
    this.subscriptions.add(
      this.leaveService.leaveStatusChanged$.subscribe(() => {
        this.loadLeaves();
      })
    );

    // Aktif rolü dinle ve izinleri yükle
    this.subscriptions.add(
      this.authService.activeSelectedRole$.subscribe(role => {
        this.loadLeaves();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadLeaves() {
  this.authService.activeSelectedRole$.subscribe(role => {
    if(role === 'Admin' || role === 'Leader') {
      this.leaveService.getAll().subscribe(data => {
        console.log('Admin/Leader - Tüm izinler:', data);
        this.leaves = data;
      });
    } else {
      this.leaveService.getMyLeaveRequests().subscribe(data => {
        console.log('Normal kullanıcı - Kendi izinleri:', data);
        this.leaves = data;
      });
    }
  });
}


  selectLeave(id: number) {
    this.selectedLeaveId = id;
  }
}
