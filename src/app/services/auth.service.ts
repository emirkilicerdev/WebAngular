// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserRegistrationDto, UserLoginDto, ApiResponse, AuthResponseData } from '../dtos/auth.dtos';
import { Router } from '@angular/router'; // Router for navigation

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5209/api/Auth';

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private _currentUserRole = new BehaviorSubject<string | null>(null);
  currentUserRole$ = this._currentUserRole.asObservable();

  private _currentUsername = new BehaviorSubject<string | null>(null);
  currentUsername$ = this._currentUsername.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    const token = localStorage.getItem('jwt_token');
    this._isLoggedIn.next(!!token);

    console.log('checkLoginStatus - Token var mı:', !!token); // Debug log

    if (token) {
      const decodedToken = this.decodeToken(token);
      console.log('checkLoginStatus - Çözülmüş Token:', decodedToken); // Debug log
      if (decodedToken) {
        if (decodedToken.role) {
          this._currentUserRole.next(decodedToken.role);
        }
        // Kullanıcı adını alırken daha esnek ol (EKLENDİ/DÜZENLENDİ)
        // 'unique_name' claim'ini de kontrol et
        const username = decodedToken.username || decodedToken.name || decodedToken.sub || decodedToken.unique_name;
        console.log('checkLoginStatus - Çözülmüş Kullanıcı Adı:', username); // Debug log
        if (username) {
          this._currentUsername.next(username);
        }
      }
    }
  }

  register(user: UserRegistrationDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: UserLoginDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data && response.data.token) {
          localStorage.setItem('jwt_token', response.data.token);
          this._isLoggedIn.next(true);

          const decodedToken = this.decodeToken(response.data.token);
          console.log('login - Çözülmüş Token:', decodedToken); // Debug log
          if (decodedToken) {
            if (decodedToken.role) {
              this._currentUserRole.next(decodedToken.role);
            }
            // Kullanıcı adını alırken daha esnek ol (EKLENDİ/DÜZENLENDİ)
            // 'unique_name' claim'ini de kontrol et
            const username = decodedToken.username || decodedToken.name || decodedToken.sub || decodedToken.unique_name;
            console.log('login - Çözülmüş Kullanıcı Adı:', username); // Debug log
            if (username) {
              this._currentUsername.next(username);
            }
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this._isLoggedIn.next(false);
    this._currentUserRole.next(null);
    this._currentUsername.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload); // Debug log için ayrı bir değişkene atandı
      console.log('decodeToken - Ham Çözülmüş Payload:', decoded); // Debug log
      return decoded;
    } catch (e) {
      console.error('Token decoding error:', e);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object' && (error.error as ApiResponse).message) {
        errorMessage = (error.error as ApiResponse).message;
      } else {
        errorMessage = `Server error: ${error.status} - ${error.message || JSON.stringify(error.error)}`;
      }
    }
    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
