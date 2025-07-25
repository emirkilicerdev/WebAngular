// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserRegistrationDto, UserLoginDto, ApiResponse, AuthResponseData } from '../dtos/auth.dtos';
import { Router } from '@angular/router'; // Router'ı yönlendirme için ekledik

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5209/api/Auth';
  // Kullanıcının giriş yapıp yapmadığını Observable olarak takip etmek için
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable(); // Diğer component'ler bu Observable'a abone olabilir

  constructor(private http: HttpClient, private router: Router) {
    // Uygulama yüklendiğinde (veya servis başlatıldığında) token olup olmadığını kontrol et
    this.checkLoginStatus();
  }

  // localStorage'da token olup olmadığını kontrol eden başlangıç metodu
  private checkLoginStatus(): void {
    const token = localStorage.getItem('jwt_token');
    this._isLoggedIn.next(!!token); // Token varsa true, yoksa false ayarlar
  }

  // Yeni kullanıcı kaydı
  register(user: UserRegistrationDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register`, user).pipe(
      catchError(this.handleError) // Hata yönetimi için
    );
  }

  // Kullanıcı girişi ve token kaydı
  login(credentials: UserLoginDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        // Backend'den başarılı yanıt geldiyse ve data içinde token varsa
        if (response.success && response.data && response.data.token) {
          localStorage.setItem('jwt_token', response.data.token); // Token'ı localStorage'a kaydet
          this._isLoggedIn.next(true); // Giriş durumunu true yap
        }
      }),
      catchError(this.handleError) // Hata yönetimi için
    );
  }

  // Kullanıcının çıkış yapması
  logout(): void {
    localStorage.removeItem('jwt_token'); // Token'ı localStorage'dan sil
    this._isLoggedIn.next(false); // Giriş durumunu false yap
    this.router.navigate(['/login']); // Çıkış yaptıktan sonra login sayfasına yönlendir
  }

  // JWT token'ını almak için yardımcı metod
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  // Hata yönetimi (API yanıtları için)
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';
    if (error.error instanceof ErrorEvent) {
      // İstemci tarafı veya ağ hatası oluştu
      errorMessage = `Bir hata oluştu: ${error.error.message}`;
    } else {
      // Backend bir hata kodu ile yanıt verdi
      // Eğer backend'den gelen hata yanıtı da ApiResponse yapısında ise
      if (error.error && typeof error.error === 'object' && (error.error as ApiResponse).message) {
        errorMessage = (error.error as ApiResponse).message;
      } else {
        // Diğer hata durumları için (örn: validation hataları, 500 internal server error)
        errorMessage = `Sunucu hatası: ${error.status} - ${error.message || JSON.stringify(error.error)}`;
      }
    }
    console.error('API Hatası:', errorMessage, error);
    // Hata mesajını yakalayan component'e ilet
    return throwError(() => new Error(errorMessage));
  }
}