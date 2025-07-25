export interface UserDetail {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  password?: string; // Yeni kullanıcı oluştururken şifre gerekli olabilir
  role?: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: string;
  // Şifre güncelleme için ayrı bir alan veya ayrı bir endpoint düşünebilirsiniz.
}