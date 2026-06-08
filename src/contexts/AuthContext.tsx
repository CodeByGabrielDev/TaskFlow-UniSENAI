"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  logout as firebaseLogout,
  getLoginRedirectResult,
} from "@/services/auth.service";
import { AppUser } from "@/types/user";

// ─── Tipos do contexto ────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helper ───────────────────────────────────────────────────────────────────

function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    createdAt: user.metadata.creationTime,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Captura resultado de signInWithRedirect (Google/GitHub) ao voltar da página do provedor
    getLoginRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        // Grava o cookie de sessão após login social via redirect
        document.cookie = "taskflow_session=1; path=/; SameSite=Lax";
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser(toAppUser(fbUser));
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    if (refreshed) {
      setFirebaseUser(refreshed);
      setUser(toAppUser(refreshed));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, initialized, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
