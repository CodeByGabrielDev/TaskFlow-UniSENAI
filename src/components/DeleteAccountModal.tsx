"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertTriangle, Loader2, X } from "lucide-react";

import {
  deleteCurrentAccount,
  reauthAndDeleteWithPassword,
  reauthAndDeleteWithGoogle,
  reauthAndDeleteWithGithub,
  ReauthRequiredError,
  getFirebaseErrorMessage,
} from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "confirm" | "reauth";

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirm");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<{ password: string }>();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const afterDelete = async () => {
    document.cookie = "taskflow_session=; path=/; max-age=0";
    await logout();
    toast.success("Conta excluída com sucesso.");
    router.replace("/");
  };

  // ── Primeira tentativa de exclusão ────────────────────────────────────────

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteCurrentAccount();
      await afterDelete();
    } catch (error: unknown) {
      if (error instanceof ReauthRequiredError) {
        setStep("reauth");
      } else {
        const err = error as { code?: string };
        toast.error(getFirebaseErrorMessage(err.code ?? ""));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Reauth por senha ──────────────────────────────────────────────────────

  const onReauthPassword = async (data: { password: string }) => {
    setLoading(true);
    try {
      await reauthAndDeleteWithPassword(data.password);
      await afterDelete();
    } catch (error: unknown) {
      const err = error as { code?: string };
      toast.error(getFirebaseErrorMessage(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  // ── Reauth por provedor social ────────────────────────────────────────────

  const handleReauthProvider = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    try {
      if (provider === "google") await reauthAndDeleteWithGoogle();
      else await reauthAndDeleteWithGithub();
      await afterDelete();
    } catch (error: unknown) {
      const err = error as { code?: string };
      toast.error(getFirebaseErrorMessage(err.code ?? ""));
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
                {step === "confirm" ? "Excluir conta" : "Confirme sua identidade"}
              </h2>
              <p className="text-sm text-gray-500">
                {step === "confirm"
                  ? "Esta ação é permanente e não pode ser desfeita."
                  : "Por segurança, confirme quem você é para continuar."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* ── Passo 1: Confirmação inicial ─────────────────────────────── */}
          {step === "confirm" && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                Ao excluir sua conta, todos os seus dados serão removidos permanentemente.
                Você será desconectado automaticamente.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm
                    font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                    bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed
                    text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Excluindo..." : "Sim, excluir minha conta"}
                </button>
              </div>
            </>
          )}

          {/* ── Passo 2: Reautenticação ───────────────────────────────────── */}
          {step === "reauth" && (
            <div className="space-y-4">
              {/* Reauth por senha */}
              <form onSubmit={handleSubmit(onReauthPassword)} className="space-y-3">
                <div>
                  <label htmlFor="reauth-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Sua senha atual
                  </label>
                  <input
                    id="reauth-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none
                      focus:ring-2 focus:ring-red-500 focus:border-red-500
                      ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    {...register("password", { required: "Informe sua senha" })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                    bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed
                    text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmar e excluir
                </button>
              </form>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400">
                  <span className="bg-white px-2">ou confirme com</span>
                </div>
              </div>

              {/* Reauth social */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleReauthProvider("google")}
                  disabled={!!loadingProvider}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg
                    py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingProvider === "google" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold text-blue-500">G</span>
                  )}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleReauthProvider("github")}
                  disabled={!!loadingProvider}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg
                    py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingProvider === "github" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold">GH</span>
                  )}
                  GitHub
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
