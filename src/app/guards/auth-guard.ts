// src/app/guards/auth-guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        const requiredRoles = route.data['roles'] as string[];

        // Senaryo 1: Kullanıcı giriş yapmamış
        if (!isLoggedIn) {
          // Eğer login veya register sayfasına gitmeye çalışmıyorsa, login sayfasına yönlendir.
          // Login ve register sayfaları giriş yapmamışken erişilebilir olmalıdır.
          if (state.url !== '/login' && state.url !== '/register') {
            console.warn('AuthGuard: Kullanıcı giriş yapmamış, /login sayfasına yönlendiriliyor.');
            return this.router.createUrlTree(['/login']);
          }
          // Login veya register sayfasına giriş yapmamışken erişime izin ver.
          return true;
        }

        // Senaryo 2: Kullanıcı giriş yapmış
        // Eğer kullanıcı giriş yapmışken /login veya /register sayfalarına erişmeye çalışıyorsa,
        // guard'ın bu durumda pasif kalması, AuthService'in router.navigate çağrısının başarılı olmasını sağlar.
        if (state.url === '/login' || state.url === '/register') {
          console.log('AuthGuard: Kullanıcı zaten giriş yapmış, AuthService yönlendirmesine izin veriliyor.');
          return true; // AuthService'in yönlendirmesine izin vermek için true döndürüyoruz.
        }

        // Senaryo 3: Rol tabanlı erişim kontrolü (kullanıcı giriş yapmış ve korumalı bir sayfada)
        if (requiredRoles && requiredRoles.length > 0) {
          const userRoles = this.authService.currentUserRoles$.getValue();
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

          if (!hasRequiredRole) {
            // Gerekli role sahip değilse, yetkisiz erişim için /home sayfasına yönlendir
            console.warn(`AuthGuard: Erişim Reddedildi. Gerekli rol(ler): ${requiredRoles.join(', ')}. /home sayfasına yönlendiriliyor.`);
            return this.router.createUrlTree(['/home']);
          }
        }

        // Tüm kontrollerden geçtiyse, rotaya erişime izin ver.
        console.log('AuthGuard: Erişim İzin Verildi.');
        return true;
      })
    );
  }
}
