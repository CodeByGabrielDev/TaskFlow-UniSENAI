"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { registerSchema, RegisterSchema } from "@/lib/validations";
import {
  registerWithEmail,
  getFirebaseErrorMessage,
} from "@/services/auth.service";

// ─── Indicador visual de força de senha ──────────────────────────────────────

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Número", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "Caractere especial",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

function PasswordStrength({ password }: { password: string }) {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {passwordRules.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < passed ? colors[passed - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {passwordRules.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              )}
              <span className={ok ? "text-gray-600" : "text-gray-400"}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await registerWithEmail(data.name, data.email, data.password);
      setEmailSent(true);
      toast.success("Conta criada! Verifique seu e-mail para ativar o acesso.");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const msg = getFirebaseErrorMessage(firebaseError.code ?? "");
      toast.error(msg);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Verifique seu e-mail
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enviamos um link de confirmação para o seu e-mail. Clique no link para
          ativar sua conta e depois faça login.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Ir para o login →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* E-mail */}
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

      {/* Senha */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
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
        {passwordValue && <PasswordStrength password={passwordValue} />}
      </div>

      {/* Confirmar senha */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-colors
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
          disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
          rounded-lg transition-colors text-sm mt-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Fazer login
        </Link>
      </p>
    </form>
  );
}
