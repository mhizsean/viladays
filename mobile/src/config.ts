/**
 * Base URL for the FastAPI backend (no trailing slash).
 * Set in `mobile/.env` as EXPO_PUBLIC_API_URL (see `.env.example`).
 *
 * Physical device: use your computer's LAN IP, e.g. http://192.168.1.10:8000
 * Android emulator: often http://10.0.2.2:8000
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
