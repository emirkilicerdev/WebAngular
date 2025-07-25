// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthResponseData } from '../dtos/auth.dtos'; // API yanıt modeliniz
import { UserDetail, UserCreate, UserUpdate } from '../dtos/user.dtos'; // Kullanıcı DTO'larınızı import edin

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:5209/api/User'; // Kullanıcı API'sinin base URL'si

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.baseUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }

  // Yeni: Belirli bir kullanıcıyı ID ile getir
  getUserById(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Yeni: Yeni kullanıcı oluştur
  createUser(user: UserCreate): Observable<UserDetail> {
    return this.http.post<UserDetail>(this.baseUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  // Yeni: Kullanıcı güncelle
  updateUser(id: number, user: UserUpdate): Observable<void> { // PUT genelde NoContent (204) döner
    return this.http.put<void>(`${this.baseUrl}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  // Yeni: Kullanıcı sil
  deleteUser(id: number): Observable<void> { // DELETE genelde NoContent (204) döner
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Hata yönetimi (önceki düzeltmelerinizle birlikte)
  private handleError(error: HttpErrorResponse): Observable<never> {
    let displayMessage: string;
    console.error('API Hatası:', error); // Konsola tüm hata objesini yazdır

    if (error.error instanceof ErrorEvent) {
      displayMessage = `Bir hata oluştu: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        displayMessage = 'Yetkisiz işlem. Oturumunuzun süresi dolmuş olabilir veya yetkiniz yok.';
        // Eğer router'ı burada enjekte ettiyseniz, login sayfasına yönlendirebilirsiniz.
        // this.router.navigate(['/login']);
      } else if (error.status === 404) {
        displayMessage = 'İstenen kaynak bulunamadı.';
      } else if (error.status === 400 && error.error?.message) {
        displayMessage = error.error.message; // Backend'den gelen spesifik hata mesajı
      } else if (error.status === 403) {
        displayMessage = 'Bu işlemi yapmaya yetkiniz yok.';
      }
      else if (error.error && typeof error.error === 'object' && (error.error as AuthResponseData).message) {
        displayMessage = (error.error as AuthResponseData).message; // Genel API yanıtı modelinden mesaj
      } else {
        displayMessage = `Sunucu hatası: ${error.status} - ${error.message}`;
      }
    }
    return throwError(() => new Error(displayMessage));
  }
}