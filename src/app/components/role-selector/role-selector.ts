import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
selector: 'app-role-selector',
standalone: true,
imports: [
CommonModule,
MatCardModule,
MatButtonModule,
MatListModule,
MatIconModule,
MatProgressSpinnerModule
],
templateUrl: './role-selector.html',
styleUrls: ['./role-selector.scss']
})
export class RoleSelectorComponent implements OnInit {
roles: string[] = [];
isLoading = true;

constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
this.authService.availableRolesForSelection$.subscribe(roles => {
this.roles = roles;
this.isLoading = false;
});
}

selectRole(role: string): void {
this.authService.selectRole(role).subscribe({
next: () => {
this.router.navigate(['/home']);
},
error: err => {
alert('Rol seçilirken hata oluştu: ' + err.message);
}
});
}
}