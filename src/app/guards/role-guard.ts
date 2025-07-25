// src/app/guards/role-guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service'; // AuthService'inizin yolu

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Rotadan beklenen rolü al
    const expectedRole = route.data['role'];

    // AuthService'den kullanıcının mevcut rolünü gözlemle
    return this.authService.currentUserRole$.pipe(
      map(userRole => {
        // Eğer kullanıcının rolü varsa ve beklenen rolle eşleşiyorsa, erişime izin ver
        if (userRole && userRole === expectedRole) {
          console.log(`RoleGuard: Erişim İzin Verildi. Gerekli Rol: ${expectedRole}, Kullanıcı Rolü: ${userRole}`);
          return true;
        } else {
          // Rol eşleşmiyorsa veya kullanıcı girişi yoksa, ana sayfaya yönlendir
          console.warn(`RoleGuard: Erişim Reddedildi. Gerekli Rol: ${expectedRole}, Kullanıcı Rolü: ${userRole || 'Yok'}. Ana Sayfaya Yönlendiriliyor.`);
          this.router.navigate(['/home']); // Veya '/unauthorized' gibi bir yetkisiz erişim sayfasına yönlendirebilirsiniz
          return false;
        }
      })
    );
  }
}
