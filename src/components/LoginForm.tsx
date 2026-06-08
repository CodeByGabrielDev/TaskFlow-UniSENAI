"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { loginSchema, LoginSchema } from "@/lib/validations";
import {
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub,
  getLoginRedirectResult,
  getFirebaseErrorMessage,
} from "@/services/auth.service";

// ─── Ícones inline ────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Cookie helper ────────────────────────────────────────────────────────────

function setSessionCookie() {
  document.cookie = "taskflow_session=1; path=/; SameSite=Lax";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // ── Captura resultado do signInWithRedirect ao voltar do provedor ──────────
  useEffect(() => {
    getLoginRedirectResult()
      .then((user) => {
        if (user) {
          setSessionCookie();
          toast.success("Login realizado com sucesso!");
          router.replace(redirectTo);
        }
      })
      .catch((error: unknown) => {
        const err = error as { code?: string };
        toast.error(getFirebaseErrorMessage(err.code ?? ""));
      })
      .finally(() => {
        setCheckingRedirect(false);
      });
  }, [redirectTo, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      await loginWithEmail(data.email, data.password);
      setSessionCookie();
      toast.success("Login realizado com sucesso!");
      router.replace(redirectTo);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const msg =
        err.message?.startsWith("E-mail não verificado")
          ? err.message
          : getFirebaseErrorMessage(err.code ?? "");
      toast.error(msg);
    }
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      await loginWithGoogle(); // redireciona para accounts.google.com
    } catch (error: unknown) {
      const err = error as { code?: string };
      toast.error(getFirebaseErrorMessage(err.code ?? ""));
      setLoadingGoogle(false);
    }
  };

  const handleGithub = async () => {
    setLoadingGithub(true);
    try {
      await loginWithGithub(); // redireciona para github.com
    } catch (error: unknown) {
      const err = error as { code?: string };
      toast.error(getFirebaseErrorMessage(err.code ?? ""));
      setLoadingGithub(false);
    }
  };

  // Enquanto verifica o redirect result, mostra loading sutil
  if (checkingRedirect) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isBusy = isSubmitting || loadingGoogle || loadingGithub;

  return (
    <div className="space-y-4">
      {/* Login social */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg
            py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Google
        </button>

        <button
          type="button"
          onClick={handleGithub}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg
            py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon />}
          GitHub
        </button>
      </div>

      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400">
          <span className="bg-white px-2">ou entre com e-mail</span>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha"
              className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
            disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
            rounded-lg transition-colors text-sm"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
