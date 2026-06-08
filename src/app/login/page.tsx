import type { Metadata } from "next";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50
      flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Bem-vindo de volta!</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Entrar na conta</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
