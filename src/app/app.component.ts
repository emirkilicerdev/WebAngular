// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // RouterLinkActive eklendi
import { MatToolbarModule } from '@angular/material/toolbar'; // MatToolbarModule eklendi
import { MatButtonModule } from '@angular/material/button'; // MatButtonModule eklendi
import { AuthService } from './services/auth.service'; // AuthService'inizin yolu
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive, // routerLinkActive için
    MatToolbarModule, // mat-toolbar için
    MatButtonModule   // mat-button için
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn$: Observable<boolean>;
  currentUsername$: Observable<string | null>; // Kullanıcı adını tutacak Observable

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUsername$ = this.authService.currentUsername$; // AuthService'den kullanıcı adını al
  }

  onLogout(): void {
    this.authService.logout();
  }
}
