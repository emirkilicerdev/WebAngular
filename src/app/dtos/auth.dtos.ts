
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
  message: string; // Opsiyonel mesaj alanı

}

export interface ApiResponse {
  message: string;
  success: boolean;
  data?: AuthResponseData; // Artık JWT token ve kullanıcı verilerini içerebilir
}
