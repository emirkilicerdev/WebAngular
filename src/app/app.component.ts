// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;
  currentUsername$: Observable<string | null>;
  currentUserRole$: Observable<string | null>;
  currentUserRoles$: Observable<string[]>;

  // Admin rolü kontrolü için dinamik observable
  isAdmin$ = new BehaviorSubject<boolean>(false);

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    // AuthService'den gelen verileri component'e aktar
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUsername$ = this.authService.currentUsername$;
    this.currentUserRole$ = this.authService.currentUserRole$;
    this.currentUserRoles$ = this.authService.currentUserRoles$;

    // Uygulama başlarken admin bilgisi hesaplansın
    this.updateIsAdmin();
  }

  ngOnInit(): void {
    // Kullanıcı adı değiştiğinde logla
    this.currentUsername$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        console.log('Kullanıcı adı:', username);
      });

    // Admin bilgisi değiştiğinde logla
    this.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        console.log('Admin mi?', isAdmin);
      });

    // Roller değiştiğinde yeniden hesapla ve view'u yenile
    this.authService.rolesChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Roller değişti — isAdmin yeniden hesaplanıyor...');
        this.authService.refreshRoles(); // DB'den alır artık
        this.updateIsAdmin(); // yeni gelen rollere göre hesapla
        this.cdRef.detectChanges(); // görünümü yenile
      });
  }

  /**
   * Kullanıcının admin olup olmadığını hesaplar
   */
  private updateIsAdmin(): void {
    const roles = this.authService.currentUserRoles$.getValue(); // mevcut roller
    const isAdmin = roles.includes('Admin');
    this.isAdmin$.next(isAdmin);
  }

  // Çıkış işlemi
  onLogout(): void {
    this.authService.logout();
    this.isAdmin$.next(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
