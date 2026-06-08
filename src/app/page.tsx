import Link from "next/link";
import { CheckSquare, Zap, Shield, Users } from "lucide-react";

// ─── Landing Page ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: <CheckSquare className="w-6 h-6 text-blue-600" />,
    title: "Gerencie tarefas",
    description: "Organize suas atividades de forma simples e visual.",
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    title: "Rápido e intuitivo",
    description: "Interface limpa para máxima produtividade.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-600" />,
    title: "Seguro",
    description: "Autenticação robusta com Firebase.",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Colaboração",
    description: "Trabalhe em equipe com facilidade.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white
              px-4 py-2 rounded-lg transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold
          px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
          Projeto Acadêmico · TaskFlow
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Organize suas tarefas<br />
          <span className="text-blue-600">com clareza e foco</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          TaskFlow é uma plataforma de gerenciamento de tarefas com autenticação
          segura, interface responsiva e tudo o que você precisa para ser produtivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
              px-8 py-3 rounded-xl transition-colors text-sm"
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold
              px-8 py-3 rounded-xl transition-colors text-sm"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        © {new Date().getFullYear()} TaskFlow · Projeto Acadêmico
      </footer>
    </main>
  );
}
