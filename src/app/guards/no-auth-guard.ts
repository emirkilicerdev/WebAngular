import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (token) {
      // Token varsa giriş yapılmış demektir, home'a yönlendir
      this.router.navigate(['/home']);
      return false;
    }

    // Token yoksa login/register sayfalarına erişebilir
    return true;
  }
}
