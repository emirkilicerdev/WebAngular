
export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface ApiResponse {
  message: string;
}
