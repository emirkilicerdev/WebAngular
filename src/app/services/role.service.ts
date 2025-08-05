// src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RoleDto, RoleCreateDto, RoleUpdateDto } from '../dtos/role.dtos';
import { ApiResponse } from '../dtos/user.dtos'; // Genel ApiResponse yapısını kullanıyoruz

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:5209/api/Role';

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.baseUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }

  createRole(role: RoleCreateDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.baseUrl, role).pipe(
      catchError(this.handleError)
    );
  }

  updateRole(id: number, role: RoleUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, role).pipe(
      catchError(this.handleError)
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  

  private handleError(error: HttpErrorResponse): Observable<never> {
    let displayMessage: string;
    console.error('API Hatası (RoleService):', error);

    if (error.error instanceof ErrorEvent) {
      displayMessage = `Bir hata oluştu: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        displayMessage = 'Yetkisiz işlem. Oturumunuzun süresi dolmuş olabilir veya yetkiniz yok.';
      } else if (error.status === 404) {
        displayMessage = 'İstenen kaynak bulunamadı.';
      } else if (error.status === 400 && error.error?.message) {
        displayMessage = error.error.message;
      } else if (error.status === 403) {
        displayMessage = 'Bu işlemi yapmaya yetkiniz yok.';
      } else if (error.error && typeof error.error === 'object' && (error.error as ApiResponse).message) {
        displayMessage = (error.error as ApiResponse).message;
      } else {
        displayMessage = `Sunucu hatası: ${error.status} - ${error.message || JSON.stringify(error.error)}`;
      }
    }
    return throwError(() => new Error(displayMessage));
  }
}
