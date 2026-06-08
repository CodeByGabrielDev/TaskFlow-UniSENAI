"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckSquare,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";

// ─── Conteúdo da página de perfil ────────────────────────────────────────────

function ProfileContent() {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">TaskFlow</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as informações da sua conta.
          </p>
        </div>

        {/* Avatar e nome */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center
              text-white text-2xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.displayName ?? "Usuário"}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-1">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    E-mail verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3" />
                    E-mail não verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes da conta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Detalhes</h3>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 py-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Nome completo</p>
                <p className="text-sm text-gray-700 font-medium">
                  {user?.displayName ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">E-mail</p>
                <p className="text-sm text-gray-700 font-medium">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Membro desde</p>
                <p className="text-sm text-gray-700 font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h3 className="font-semibold text-red-700 mb-1">Zona de perigo</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ações irreversíveis. Prossiga com cuidado.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700
              text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Todos os dados serão excluídos permanentemente.
          </p>
        </div>
      </main>

      {/* Modal de exclusão */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
