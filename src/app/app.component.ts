// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; // Router'ı ekledik
import { AuthService } from './services/auth.service'; // AuthService'i import et
import { Observable } from 'rxjs'; // Observable için

// Material Modül Importları (Header/Navbar için)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // SnackBar için

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink, // routerLink directive'i için
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule // Eğer App Component'te snackbar kullanıyorsanız
  ],
  templateUrl: './app.component.html', // HTML'i ayrı dosyadan alacağız
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'AngularWebAPIAuth';
  isLoggedIn$: Observable<boolean>; // Giriş durumunu Observable olarak tutacak

  constructor(private authService: AuthService, private router: Router) {
    // AuthService'ten isLoggedIn$ Observable'ını al
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    // Başlangıçta yapılacak işlemler
  }

  // Çıkış yapma metodu
  onLogout(): void {
    this.authService.logout();
    // AuthService içinde logout zaten yönlendirme yaptığı için burada ayrıca yönlendirme yapmaya gerek yok
    // this.router.navigate(['/login']); // Eğer AuthService yönlendirme yapmıyorsa
  }
}