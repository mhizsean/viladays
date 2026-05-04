import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/auth";
import { getMe, login as loginRequest } from "../api/auth";
import { setSessionExpiredHandler } from "../api/client";
import {
  deleteStoredToken,
  getStoredToken,
  setStoredToken,
} from "../lib/tokenStorage";

type AuthContextType = {
  user: User | null;
  token: string | null;
  ready: boolean;
  userLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const clearSession = useCallback(async () => {
    await deleteStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void clearSession();
    });
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  useEffect(() => {
    void (async () => {
      const stored = await getStoredToken();
      setToken(stored);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    if (user) {
      setUserLoading(false);
      return;
    }

    let cancelled = false;
    setUserLoading(true);
    void (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) await clearSession();
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, token, user, clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await loginRequest({ email, password });
      await setStoredToken(access_token);
      try {
        const me = await getMe();
        setUser(me);
        setToken(access_token);
      } catch (err) {
        await clearSession();
        throw err;
      }
    },
    [clearSession],
  );

  const value: AuthContextType = {
    user,
    token,
    ready,
    userLoading,
    login,
    logout,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
