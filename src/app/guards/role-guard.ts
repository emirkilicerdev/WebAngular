// src/app/guards/role-guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // 'take' operatörünü eklediğinizden emin olun
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    // Rotanın beklediği tek bir rolü al (örneğin 'Admin', 'Editor' vb.)
    // Bu, app.routes.ts'deki 'data: { role: 'Admin' }' tanımından gelir.
    const requiredRole = route.data['role'] as string;

    // AuthService'ten aktif olarak seçilen rolü gözlemle
    // Yetkilendirme için kullanıcının o anki aktif rolünü kullanıyoruz.
    return this.authService.activeSelectedRole$.pipe(
      take(1), // Observable'dan sadece bir değer alıp aboneliği sonlandır
      map(activeRole => {
        // Eğer rota belirli bir rol gerektirmiyorsa, erişime izin ver.
        // Bu senaryo genellikle guard'ın kullanılmadığı rotalar içindir, ancak bir güvenlik katmanı olarak bırakılabilir.
        if (!requiredRole) {
          console.log('RoleGuard: Rota belirli bir rol gerektirmiyor, erişime izin verildi.');
          return true;
        }

        // Eğer aktif bir rol seçilmemişse VEYA seçilen aktif rol gerekli rol değilse
        if (!activeRole || activeRole !== requiredRole) {
          console.warn(`RoleGuard: Erişim Reddedildi. Gerekli rol: '${requiredRole}', Aktif rol: '${activeRole}'. Ana sayfaya yönlendiriliyor.`);
          // Yetkisiz erişim durumunda kullanıcıyı ana sayfaya yönlendir
          return this.router.createUrlTree(['/home']);
        }

        // Aktif olarak seçilen rol, gerekli rolle eşleşiyorsa erişime izin ver
        console.log(`RoleGuard: Erişim İzin Verildi. Gerekli rol: '${requiredRole}', Aktif rol: '${activeRole}'.`);
        return true;
      })
    );
  }
}
