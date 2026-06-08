import Link from "next/link";
import { CheckSquare, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50
      flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckSquare className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <p className="text-gray-500">Página não encontrada.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
