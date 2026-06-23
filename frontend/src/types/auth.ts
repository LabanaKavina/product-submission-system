export interface JWTPayload {
  userId: number;
  role: string;
}

export interface UserData {
  id: number;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}
