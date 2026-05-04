export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  country: string | null;
  phone_number: string | null;
  role: "user" | "admin";
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
