// src/app/dtos/user.dtos.ts

// Backend'deki RoleModel'e karşılık gelen arayüz
export interface Role {
  id: number;
  name: string;
}

// Kullanıcı Kayıt DTO'su (Auth modülü için)
export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

// Kullanıcı Giriş DTO'su (Auth modülü için)
export interface UserLoginDto {
  username: string;
  password: string;
}

// Backend'den gelen genel API yanıt yapısı
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any; // Token, kullanıcı bilgileri vb. içerebilir
}

// Auth yanıt verisi (login sonrası)
export interface AuthResponseData {
  token: string;
  username: string;
  userId: number;
  email: string;
  // Backend'den gelen rol adları listesi
  roles: string[]; // Artık string dizisi olarak geliyor
}

// Kullanıcı Detay DTO'su (Kullanıcı bilgilerini görüntülemek için)
export interface UserDetailDto {
  id: number;
  username: string;
  email: string;
  // Backend'den gelen rol adları listesi
  roles: string[]; // Artık string dizisi olarak geliyor
  roleIds: number[]; // Rol ID'leri listesi eklendi
  createdAt: Date;
}

// Kullanıcı Oluşturma DTO'su (Admin tarafından yeni kullanıcı eklemek için)
export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  // Adminler rol atayabildiği için roleIds gönderilecek
  roleIds: number[]; // Atanacak rol ID'lerinin dizisi
}

// Kullanıcı Güncelleme DTO'su (Kullanıcı bilgilerini güncellemek için)
export interface UserUpdateDto {
  username?: string; // İsteğe bağlı alanlar
  email?: string;
  password?: string; // Şifre güncellemesi opsiyonel
  // Rol güncellemesi sadece Adminler için ve roleIds gönderilecek
  roleIds?: number[]; // İsteğe bağlı: Güncellenecek rol ID'lerinin dizisi (sadece Adminler için)
}

export interface SelectRoleRequestDto {
  selectedRole: string;
}

// Yeni DTO for select role response
export interface SelectRoleResponseDto {
  success: boolean;
  message?: string;
  newToken?: string; // Backend'den gelen yeni token (isteğe bağlı)
}