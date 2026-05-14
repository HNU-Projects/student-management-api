export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: "admin" | "student";
}

export interface UserRegister {
  email: string;
  password: string;
  full_name?: string;
  role: "admin" | "student";
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

/** @deprecated Use Token instead — login does not return user data */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface ApiError {
  detail: string;
}

export interface EmailUpdate {
  new_email: string;
}

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

export interface NameUpdate {
  full_name: string;
}

