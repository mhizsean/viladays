import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "../config";
import { deleteStoredToken, getStoredToken } from "../lib/tokenStorage";

let onSessionExpired: (() => void) | null = null;

/** Register handler for 401 responses (e.g. clear auth state). */
export function setSessionExpiredHandler(fn: (() => void) | null) {
  onSessionExpired = fn;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await deleteStoredToken();
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);
