// src/app/dtos/user.dtos.ts

// Backend'den Role adı string olarak geldiğinde kullanılabilir
// Eğer Backend RoleModel'in tamamını göndermezse bu arayüz doğrudan kullanılmayabilir.
export interface Role {
  id: number;
  name: string;
}

// Kullanıcı Detay DTO'su (Kullanıcı bilgilerini görüntülemek için)
export interface UserDetail {
  id: number;
  username: string;
  email: string;
  role: string; // <<< Rol adı string olarak tutulacak
  createdAt: Date;
}

// Kullanıcı Oluşturma DTO'su (Admin tarafından yeni kullanıcı eklemek için)
export interface UserCreate {
  username: string;
  email: string;
  password?: string; // Yeni kullanıcı oluştururken şifre gerekli olabilir
  role?: string; // <<< Rol adı string olarak gönderilecek (isteğe bağlı)
}

// Kullanıcı Güncelleme DTO'su (Kullanıcı bilgilerini güncellemek için)
export interface UserUpdate {
  username?: string; // İsteğe bağlı alanlar
  email?: string;
  role?: string; // <<< Rol adı string olarak gönderilecek (isteğe bağlı)
  // Şifre güncelleme için ayrı bir alan veya ayrı bir endpoint düşünebilirsiniz.
}

// YENİ EKLENEN/GÜNCELLENEN AUTH DTO'LARI
export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  username: string;
  userId: number;
  email: string;
  message?: string; // Opsiyonel mesaj alanı eklendi
  role?: string; // Rol bilgisi AuthResponseData'ya eklendi
}

export interface ApiResponse {
  message: string;
  success: boolean;
  data?: AuthResponseData; // Artık JWT token ve kullanıcı verilerini içerebilir
}
