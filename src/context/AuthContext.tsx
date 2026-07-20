"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import SessionExpiredModal from "@/components/SessionExpiredModal";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Guard: prevent multiple simultaneous logout calls
  const isLoggingOutRef = useRef(false);

  // On mount, call /api/auth/me to restore session from httpOnly cookie
  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setUser(data.user);
          }
        }
      } catch {
        // Network error — remain unauthenticated
      } finally {
        setIsHydrated(true);
      }
    };
    hydrate();
  }, []);

  const login = useCallback((authUser: AuthUser) => {
    setIsAuthenticated(true);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    // Prevent double-logout
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // MUST await — cookie is only cleared after this resolves
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });

      if (!res.ok) {
        console.warn("[AuthContext] Logout API returned non-OK:", res.status);
      }
    } catch {
      // Network error — still clear local state so UI reflects logged-out
      console.warn("[AuthContext] Logout API call failed — clearing local state anyway");
    }

    // Clear all local auth state
    setIsAuthenticated(false);
    setUser(null);
    isLoggingOutRef.current = false;
  }, []);

  // Monitor session validity in the background (single-device enforcement)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (isLoggingOutRef.current) return; // Skip check if already logging out
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 200) {
          const data = await res.json();
          if (!data.authenticated) {
            setIsSessionExpired(true);
            await logout();
          }
        }
      } catch {
        // Ignore network errors to prevent false logouts during connectivity drop
      }
    }, 10000); // Check session validity every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isHydrated, user, login, logout }}>
      {children}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onRedirect={() => setIsSessionExpired(false)}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
