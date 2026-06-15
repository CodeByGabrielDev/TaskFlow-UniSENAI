"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { User, Mail, Calendar, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/templates/AppLayout";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";

function ProfileContent() {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-app-text">Meu Perfil</h1>
        <p className="text-sm text-app-muted mt-0.5">Informações da sua conta.</p>
      </div>

      {/* Avatar */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-app-accent rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-semibold text-app-text">{user?.displayName ?? "Usuário"}</h2>
            <p className="text-sm text-app-muted">{user?.email}</p>
            <div className="mt-1.5">
              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  E-mail verificado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" />
                  E-mail não verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 space-y-0 divide-y divide-app-border">
        <div className="flex items-center gap-3 py-3">
          <User className="w-4 h-4 text-app-muted shrink-0" />
          <div>
            <p className="text-xs text-app-muted">Nome</p>
            <p className="text-sm text-app-text font-medium">{user?.displayName ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 py-3">
          <Mail className="w-4 h-4 text-app-muted shrink-0" />
          <div>
            <p className="text-xs text-app-muted">E-mail</p>
            <p className="text-sm text-app-text font-medium">{user?.email ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 py-3">
          <Calendar className="w-4 h-4 text-app-muted shrink-0" />
          <div>
            <p className="text-xs text-app-muted">Membro desde</p>
            <p className="text-sm text-app-text font-medium">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-app-card border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Zona de perigo</h3>
        <p className="text-xs text-app-muted mb-4">Ações irreversíveis. Prossiga com cuidado.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir minha conta
        </button>
      </div>

      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  );
}
