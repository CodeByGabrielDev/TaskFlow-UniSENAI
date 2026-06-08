"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import type { AppUser } from "@/types/user";
import type { User } from "firebase/auth";

/**
 * Hook principal de autenticação.
 * Expõe o estado do usuário e métodos úteis de auth.
 */
export function useAuth() {
  const { user, firebaseUser, loading, initialized, logout, refreshUser } =
    useAuthContext();

  return {
    /** Dados simplificados do usuário (AppUser) */
    user,
    /** Objeto User completo do Firebase (para operações avançadas) */
    firebaseUser,
    /** true enquanto o estado de auth está sendo resolvido */
    loading,
    /** true após o primeiro onAuthStateChanged ter disparado */
    initialized,
    /** Usuário está autenticado */
    isAuthenticated: !!user,
    /** E-mail confirmado */
    isEmailVerified: user?.emailVerified ?? false,
    /** Logout */
    logout,
    /** Força reload do estado do usuário no Firebase */
    refreshUser,
  };
}

// Re-exporta tipos para conveniência
export type { AppUser, User };
