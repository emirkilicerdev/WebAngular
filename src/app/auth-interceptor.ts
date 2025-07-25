// src/app/interceptors/auth.interceptor.ts
import {
  HttpRequest,
  HttpHandlerFn, // <<< HttpHandler yerine HttpHandlerFn kullanıyoruz
  HttpEvent,
  HttpInterceptorFn // <<< Yeni: HttpInterceptorFn tipi
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core'; // <<< inject fonksiyonunu import ediyoruz
import { AuthService } from '../app/services/auth.service'; // AuthService'i import et

// AuthInterceptor sınıfı yerine doğrudan bir fonksiyon olarak tanımlıyoruz
export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService); // <<< AuthService'i inject() ile alıyoruz
  const token = authService.getToken(); // AuthService'den token'ı al

  // Eğer token varsa ve istek kendi backend API'mize gidiyorsa
  // Güvenlik için sadece kendi API adreslerinize token ekleyin!
  if (token && req.url.startsWith('http://localhost:5209/api/')) { // <<< Kendi API adresinize göre düzenleyin
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Token'ı Authorization header'ına ekle
      }
    });
  }

  return next(req); // Değiştirilmiş isteği devam ettir
};