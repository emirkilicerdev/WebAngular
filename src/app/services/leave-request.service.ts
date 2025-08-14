// src/app/services/leave-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { LeaveRequestResponseDto, LeaveRequestCreateDto } from '../dtos/leave-request.dtos';


@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private apiUrl = 'http://localhost:5209/api/LeaveRequest';

  constructor(private http: HttpClient) {}

  /**
   * Tüm izin taleplerini getirir.
   * @returns İzin taleplerinin listesini döndüren Observable.
   */
  getAll(): Observable<LeaveRequestResponseDto[]> {
    return this.http.get<LeaveRequestResponseDto[]>(this.apiUrl);
  }

  /**
   * Belirli bir kullanıcının tüm izin taleplerini getirir.
   * Bu endpoint'in backend'de '.../api/LeaveRequest/user/{userId}' şeklinde tanımlanmış olması gerekir.
   * @param userId İzinleri getirilecek kullanıcının ID'si.
   * @returns Belirli kullanıcının izin taleplerini döndüren Observable.
   */
  getMyLeaveRequests(): Observable<LeaveRequestResponseDto[]> {
    return this.http.get<LeaveRequestResponseDto[]>(`${this.apiUrl}/user`);
  }

  /**
   * ID'ye göre tek bir izin talebinin detayını getirir.
   * @param id Getirilecek izin talebinin ID'si.
   * @returns İzin talebi detayını döndüren Observable.
   */
  getById(id: number): Observable<LeaveRequestResponseDto> {
    return this.http.get<LeaveRequestResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Yeni bir izin talebi oluşturur.
   * @param dto Oluşturulacak izin talebinin verisi.
   * @returns Oluşturulan izin talebini döndüren Observable.
   */
  create(dto: LeaveRequestCreateDto): Observable<LeaveRequestResponseDto> {
    return this.http.post<LeaveRequestResponseDto>(this.apiUrl, dto);
  }

  /**
   * Mevcut bir izin talebini günceller.
   * @param id Güncellenecek izin talebinin ID'si.
   * @param dto Güncelleme için kullanılacak yeni veriler.
   * @returns İşlemin tamamlandığını belirten Observable.
   */
  update(id: number, dto: LeaveRequestCreateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Mevcut bir izin talebini siler.
   * @param id Silinecek izin talebinin ID'si.
   * @returns İşlemin tamamlandığını belirten Observable.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

   private leaveStatusChangedSource = new Subject<void>();
  leaveStatusChanged$ = this.leaveStatusChangedSource.asObservable();

  notifyLeaveStatusChanged() {
    this.leaveStatusChangedSource.next();
  }
}
