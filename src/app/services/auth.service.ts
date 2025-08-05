// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, Subject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
// DTO'ları user.dtos'tan import edin.
// AuthResponseData, SelectRoleRequestDto ve SelectRoleResponseDto'nun doğru tanımlandığından emin olun.
import { UserRegistrationDto, UserLoginDto, ApiResponse, AuthResponseData, SelectRoleRequestDto, SelectRoleResponseDto } from '../dtos/user.dtos';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Backend API'nizin temel URL'si
  private baseUrl = 'http://localhost:5209/api/Auth';

  // Kullanıcının giriş yapıp yapmadığını gösteren Observable
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  // Kullanıcının JWT token'ından çözümlenen tüm rollerini tutan BehaviorSubject
  // Bu roller, kullanıcının sisteme ilk giriş yaptığında sahip olduğu tüm rollerdir.
  private _currentUserRoles = new BehaviorSubject<string[]>([]);
  // DİKKAT: AuthGuard'ın getValue() kullanabilmesi için BehaviorSubject olarak dışarıya açıldı.
  currentUserRoles$ = this._currentUserRoles;

  // Kullanıcının giriş sonrası seçtiği aktif rolü tutan Observable
  // Bu, kullanıcının o an hangi yetki seviyesiyle işlem yaptığını belirler.
  private _activeSelectedRole = new BehaviorSubject<string | null>(null);
  activeSelectedRole$ = this._activeSelectedRole.asObservable();

  // Kullanıcının giriş sonrası rol seçimi ekranında gösterilecek rolleri tutan Observable
  // Bu, login yanıtından gelen 'availableRoles' ile doldurulur.
  private _availableRolesForSelection = new BehaviorSubject<string[]>([]);
  availableRolesForSelection$ = this._availableRolesForSelection.asObservable();

  private rolesChangedSource = new Subject<void>();
  rolesChanged$ = this.rolesChangedSource.asObservable();
  isAdmin$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  notifyRolesChanged() {
    this.rolesChangedSource.next();
  }

  getRolesFromDatabase(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/roles`).pipe(
      catchError(this.handleError)
    );
  }

  refreshRoles(): void {
    this.getCurrentUserId().subscribe(userId => {
      if (userId) {
        this.getRolesFromDatabase().subscribe(rolesArray => {
          this._currentUserRoles.next(rolesArray);
          this._availableRolesForSelection.next(rolesArray);
          console.log("Veritabanından gelen roller güncellendi:", rolesArray);
        });
      }
    });
  }

  // Uygulama genelinde kullanılabilecek tekil rol (örneğin Admin Guard için)
  // Eğer aktif bir rol seçilmişse onu döndürür, yoksa token'daki rollere bakarak Admin rolünü veya ilk rolü döndürür.
  currentUserRole$: Observable<string | null> = this._activeSelectedRole.asObservable().pipe(
    map(selectedRole => {
      if (selectedRole) {
        return selectedRole; // Eğer aktif bir rol seçilmişse onu döndür
      }
      // Eğer aktif rol seçilmemişse, token'daki rollere bak
      const rolesFromToken = this._currentUserRoles.getValue();
      if (rolesFromToken && rolesFromToken.includes('Admin')) {
        this.isAdmin$.next(false); // Bu kısım muhtemelen 'true' olmalıydı, kontrol edin.
      }
      // Başka bir rol varsa ilkini döndür
      return rolesFromToken && rolesFromToken.length > 0 ? rolesFromToken[0] : null;
    })
  );

  // Mevcut kullanıcının kullanıcı adını tutan Observable
  private _currentUsername = new BehaviorSubject<string | null>(null);
  currentUsername$ = this._currentUsername.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Servis başlatıldığında giriş durumunu kontrol et
    this.checkLoginStatus();
  }

  /**
   * Uygulama yüklendiğinde veya sayfa yenilendiğinde giriş durumunu ve rolleri kontrol eder.
   * localStorage'daki token ve aktif rolü okur.
   */
  private checkLoginStatus(): void {
    const token = localStorage.getItem('jwt_token');
    const activeRole = localStorage.getItem('active_role'); // localStorage'dan aktif seçilen rolü oku

    this._isLoggedIn.next(!!token); // Token varsa giriş yapılmış say
    this._activeSelectedRole.next(activeRole); // Aktif rolü BehaviorSubject'e set et

    if (token) {
      const decodedToken = this.decodeToken(token); // Token'ı çözümle
      if (decodedToken) {
        // JWT token'ından rol claim'lerini alırken farklı anahtarları kontrol et
        const rolesFromToken = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        let rolesArray: string[] = [];

        if (rolesFromToken) {
          if (Array.isArray(rolesFromToken)) {
            rolesArray = rolesFromToken; // Eğer roller zaten dizi ise doğrudan kullan
          } else if (typeof rolesFromToken === 'string') {
            rolesArray = [rolesFromToken]; // Tek bir rol string ise diziye çevir
          }
        }
        this._currentUserRoles.next(rolesArray); // Kullanıcının tüm rollerini kaydet

        // Sayfa yenilendiğinde de seçilebilir rolleri güncelle
        this._availableRolesForSelection.next(rolesArray);

        // Kullanıcı adını alırken farklı claim anahtarlarını kontrol et
        const username = decodedToken.username || decodedToken.name || decodedToken.sub || decodedToken.unique_name;
        if (username) {
          this._currentUsername.next(username); // Kullanıcı adını kaydet
        }
      }
    }
  }

  /**
   * Yeni kullanıcı kaydı yapar.
   * @param user Kaydedilecek kullanıcı bilgileri (UserRegistrationDto).
   * @returns API yanıtı (ApiResponse).
   */
  register(user: UserRegistrationDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register`, user).pipe(
      catchError(this.handleError) // Hata yönetimi
    );
  }

  /**
   * Kullanıcı girişi yapar.
   * @param credentials Kullanıcı adı ve şifre (UserLoginDto).
   * @returns API yanıtı (ApiResponse).
   */
  login(credentials: UserLoginDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        // Giriş başarılıysa ve token varsa
        if (response.success && response.data?.token) {
          this.processSuccessfulLogin(response.data.token);
        }
      }),
      catchError(this.handleError) // Hata yönetimi
    );
  }

  private processSuccessfulLogin(token: string): void {
    this.setLoginData(token);
    this._isLoggedIn.next(true);

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return;
    }

    const roles = this.getRolesFromToken(decodedToken);
    this.setRoles(roles);

    const username = this.getUsernameFromToken(decodedToken);
    if (username) {
      this._currentUsername.next(username);
    }

    this.setAvailableRoles(roles);
    this.setActiveRoleIfSingle(roles);
  }

  private setLoginData(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  private getRolesFromToken(decodedToken: any): string[] {
    const rolesFromToken = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!rolesFromToken) {
      return [];
    }
    return Array.isArray(rolesFromToken) ? rolesFromToken : [rolesFromToken];
  }

  private setRoles(roles: string[]): void {
    this._currentUserRoles.next(roles);
  }

  // Login component'in kullanabilmesi için bu metot eklendi.
  getAvailableRolesForSelection(): string[] {
    return this._availableRolesForSelection.getValue();
  }

  private getUsernameFromToken(decodedToken: any): string | undefined {
    return decodedToken.username || decodedToken.name || decodedToken.sub || decodedToken.unique_name;
  }

  private setAvailableRoles(roles: string[]): void {
    this._availableRolesForSelection.next(roles);
  }

  private setActiveRoleIfSingle(roles: string[]): void {
    if (roles.length === 1) {
      localStorage.setItem('active_role', roles[0]);
      this._activeSelectedRole.next(roles[0]);
      // Tek bir rol varsa, doğrudan ana sayfaya yönlendir
      this.router.navigate(['/home/users']);
    } else if (roles.length > 1) {
      // Eğer birden fazla rol varsa, aktif rolü sıfırlayıp rol seçim ekranına yönlendir
      localStorage.removeItem('active_role'); // Aktif rolü temizle
      this._activeSelectedRole.next(null); // BehaviorSubject'i sıfırla
      this.router.navigate(['/home/select-role']); // Rol seçim ekranı rotası
    } else {
      // Hiç rol bulunamazsa (normalde olmamalı), varsayılan bir sayfaya yönlendir
      console.warn('AuthService: Kullanıcının hiç rolü bulunamadı, varsayılan ana sayfaya yönlendiriliyor.');
      this.router.navigate(['/home']); // Veya '/unauthorized' gibi bir sayfaya yönlendirebilirsiniz.
    }
  }

  /**
   * Kullanıcının sahip olduğu rollerden birini seçmesini sağlar.
   * Backend'e seçilen rolü gönderir ve yeni bir token alır (eğer backend döndürüyorsa).
   * @param selectedRole Kullanıcının seçtiği rolün adı.
   * @returns API yanıtı (SelectRoleResponseDto).
   */
  selectRole(selectedRole: string): Observable<SelectRoleResponseDto> {
    const token = this.getToken(); // Mevcut token'ı al
    if (!token) {
      // Token yoksa hata fırlat
      return throwError(() => new Error('Giriş yapılmamış. Rol seçimi yapılamaz.'));
    }

    const requestBody: SelectRoleRequestDto = { selectedRole };

    return this.http.post<SelectRoleResponseDto>(`${this.baseUrl}/select-role`, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}` // Mevcut token'ı Authorization başlığında gönder
      }
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('active_role', selectedRole); // Seçilen rolü localStorage'a kaydet
          this._activeSelectedRole.next(selectedRole); // BehaviorSubject'i güncelle

          if(selectedRole === 'Admin') {
            this.isAdmin$.next(true); // Eğer Admin rolü seçildiyse, isAdmin'i true yap
          }else {
            this.isAdmin$.next(false); // Diğer roller için false yap
          }

          if (response.newToken) {
            // Backend yeni bir token döndürdüyse, eski token'ı onunla değiştir
            localStorage.setItem('jwt_token', response.newToken);
            // Yeni token'ı çözerek currentUserRoles ve currentUsername'i güncelle
            const decodedNewToken = this.decodeToken(response.newToken);
            if (decodedNewToken) {
              const rolesFromNewToken = decodedNewToken.role || decodedNewToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
              let newRolesArray: string[] = [];
              if (rolesFromNewToken) {
                if (Array.isArray(rolesFromNewToken)) {
                  newRolesArray = rolesFromNewToken;
                } else if (typeof rolesFromNewToken === 'string') {
                  newRolesArray = [rolesFromNewToken];
                }
              }
              this._currentUserRoles.next(newRolesArray); // Yeni token'daki rolleri kaydet
              this._availableRolesForSelection.next(newRolesArray); // Yeni token'daki rolleri seçilebilir olarak da ayarla
              const newUsername = decodedNewToken.username || decodedNewToken.name || decodedNewToken.sub || decodedNewToken.unique_name;
              if (newUsername) {
                this._currentUsername.next(newUsername);
              }
            }
          }
        }
      }),
      catchError(this.handleError) // Hata yönetimi
    );
  }

  /**
   * Mevcut kullanıcının ID'sini döndürür. Token'dan veya backend'den çekebilir.
   * @returns Kullanıcı ID'si veya null.
   */
  getCurrentUserId(): Observable<number | null> {
    const token = this.getToken();
    if (!token) {
      return of(null); // Token yoksa null döndür
    }
    const decodedToken = this.decodeToken(token);
    if (decodedToken && decodedToken.nameid) { // 'nameid' claim'i genellikle User ID'yi tutar
      return of(parseInt(decodedToken.nameid, 10));
    }
    // Eğer token'da ID yoksa veya çözülemezse backend'den iste (bu nadir olmalı)
    // Not: Bu endpoint'in backend'de var olduğundan emin olun.
    return this.http.get<number>(`${this.baseUrl}/currentUserId`).pipe(
      catchError(this.handleError)
    );
  }


  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('active_role'); // Aktif seçilen rolü de temizle
    this._isLoggedIn.next(false); // Giriş yapıldı durumunu sıfırla
    this._currentUserRoles.next([]); // Tüm rolleri sıfırla
    this._activeSelectedRole.next(null); // Aktif rolü sıfırla
    this._availableRolesForSelection.next([]); // Seçilebilir rolleri sıfırla
    this._currentUsername.next(null); // Kullanıcı adını sıfırla
    this.router.navigate(['/login']); // Giriş sayfasına yönlendir
  }

  /**
   * localStorage'dan JWT token'ını döndürür.
   * @returns JWT token string'i veya null.
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * JWT token'ını çözümleyen yardımcı metot.
   * @param token Çözümlenecek JWT token.
   * @returns Çözümlenmiş token payload'ı veya null.
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Token çözümleme hatası:', e);
      return null;
    }
  }

  /**
   * API hatalarını yöneten özel metot.
   * @param error HTTP hata yanıtı.
   * @returns Hata mesajını içeren bir Observable.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Bir hata oluştu: ${error.error.message}`;
    } else {
      // Backend'den gelen özel hata mesajını kontrol et
      if (error.error && typeof error.error === 'object' && (error.error as ApiResponse).message) {
        errorMessage = (error.error as ApiResponse).message;
      } else {
        errorMessage = `Sunucu hatası: ${error.status} - ${error.message || JSON.stringify(error.error)}`;
      }
    }
    console.error('API Hatası:', errorMessage, error);
    return throwError(() => new Error(errorMessage)); // Hatayı yeniden fırlat
  }
}
