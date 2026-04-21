import client from "./clients";
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "../types/auth";


export const login = async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await client.post<TokenResponse>("/auth/login", data);
    return response.data;
}

export const register = async (data: RegisterRequest): Promise<User> => {
    const response = await client.post<User>("/auth/register", data);
    return response.data;
}

export const getCurrentUser = async (): Promise<User> => {
    const response = await client.get<User>("/auth/me");
    return response.data;
}