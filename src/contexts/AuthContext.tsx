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
import { logout as firebaseLogout } from "@/services/auth.service";
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

// ─── Criação do contexto ──────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helper: converte User do Firebase para AppUser ───────────────────────────

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

  /**
   * Força o reload do token/estado do usuário no Firebase.
   * Útil para atualizar emailVerified após o usuário verificar o e-mail.
   */
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

// ─── Hook de acesso ao contexto ───────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
