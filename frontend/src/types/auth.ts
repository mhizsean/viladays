export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  country: string | null
  phone_number: string | null
  role: 'user' | 'admin'
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  country?: string
  phone_number?: string
}

/** Controlled fields for the register form (subset of {@link RegisterRequest}). */
export type RegisterFormFields = Pick<
  RegisterRequest,
  "email" | "password" | "first_name" | "last_name"
>

export interface LoginRequest {
  email: string
  password: string
}