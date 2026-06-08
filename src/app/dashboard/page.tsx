"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckSquare,
  LogOut,
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Settings,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { resendVerificationEmail } from "@/services/auth.service";
import { useState } from "react";

// ─── Badge de verificação ─────────────────────────────────────────────────────

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700
        text-xs font-medium px-2.5 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        E-mail verificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700
      text-xs font-medium px-2.5 py-1 rounded-full">
      <ShieldAlert className="w-3.5 h-3.5" />
      E-mail não verificado
    </span>
  );
}

// ─── Página do Dashboard ──────────────────────────────────────────────────────

function DashboardContent() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    document.cookie = "taskflow_session=; path=/; max-age=0";
    await logout();
    toast.success("Você saiu da conta.");
    router.replace("/login");
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success("E-mail de verificação reenviado! Verifique sua caixa de entrada.");
    } catch {
      toast.error("Não foi possível reenviar o e-mail. Tente novamente.");
    } finally {
      setResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      toast.success("Status atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setRefreshing(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">TaskFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-sm text-gray-600
                hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600
                hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Boas-vindas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center
              text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Olá, {user?.displayName ?? "usuário"}!
              </h1>
              <p className="text-sm text-gray-500">
                Bem-vindo ao seu dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Informações do usuário */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informações da conta</h2>

          <div className="divide-y divide-gray-100">
            {/* Nome */}
            <div className="flex items-center gap-3 py-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nome</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.displayName ?? "—"}
                </p>
              </div>
            </div>

            {/* E-mail */}
            <div className="flex items-center gap-3 py-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">E-mail</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.email ?? "—"}
                </p>
              </div>
            </div>

            {/* Status do e-mail */}
            <div className="flex items-center justify-between py-3 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status do e-mail</p>
                  <VerificationBadge verified={user?.emailVerified ?? false} />
                </div>
              </div>

              {/* Ações de verificação */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRefreshStatus}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs text-gray-500
                    hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  Atualizar status
                </button>
                {!user?.emailVerified && (
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="text-xs text-blue-600 hover:text-blue-700
                      transition-colors disabled:opacity-50"
                  >
                    {resending ? "Enviando..." : "Reenviar verificação"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Aviso e-mail não verificado */}
        {!user?.emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex
            items-start gap-3 text-sm text-yellow-800">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">E-mail não verificado</p>
              <p className="text-yellow-700 mt-0.5">
                Verifique sua caixa de entrada e clique no link que enviamos para
                ativar todas as funcionalidades da sua conta.
              </p>
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Ações rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200
                text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Gerenciar perfil
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100
                text-red-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
