// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 
import { UserRegistrationDto, UserLoginDto, ApiResponse } from '../dtos/auth.dtos'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  // Kullanıcı kaydı için metot

  register(user: UserRegistrationDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/register`, user);
  }

  // Kullanıcı girişi için metot
  login(credentials: UserLoginDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/login`, credentials);
  }

}