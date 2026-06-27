export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  CheckSquare,
  Zap,
  Shield,
  LayoutDashboard,
  CalendarDays,
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";

// ─── Feature data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: <CheckSquare className="w-6 h-6 text-blue-600" />,
    title: "Gestão de Tarefas",
    description: "Crie, edite e organize suas tarefas com campos de prioridade, prazo e subtarefas.",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
    title: "Dashboard com Gráficos",
    description: "Visualize métricas chave e gráficos de progresso com Tremor Charts.",
  },
  {
    icon: <Kanban className="w-6 h-6 text-blue-600" />,
    title: "Quadro Kanban",
    description: "Arraste e solte tarefas entre colunas A Fazer, Fazendo e Concluído.",
  },
  {
    icon: <CalendarDays className="w-6 h-6 text-blue-600" />,
    title: "Calendário Integrado",
    description: "Visualize prazos em um calendário FullCalendar e clique para ver detalhes.",
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    title: "Tempo Real",
    description: "Sincronização automática via Firebase Firestore em todos os dispositivos.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-600" />,
    title: "Login Seguro",
    description: "Autenticação via e-mail, Google e GitHub com Firebase Authentication.",
  },
];

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16">
      {/* Glow behind the mockup */}
      <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
        {/* Browser bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4 bg-white rounded border border-gray-200 px-3 py-0.5 text-xs text-gray-400">
            taskflow-app.vercel.app/dashboard
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-64 sm:h-80">
          {/* Sidebar */}
          <div className="w-14 sm:w-44 bg-gray-50 border-r border-gray-100 flex flex-col py-4 px-2 sm:px-3 shrink-0">
            <div className="flex items-center gap-2 mb-5 px-1">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden sm:block text-xs font-bold text-gray-800">TaskFlow</span>
            </div>
            {[
              { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: "Dashboard", active: true },
              { icon: <CheckSquare className="w-3.5 h-3.5" />, label: "Tarefas" },
              { icon: <Kanban className="w-3.5 h-3.5" />, label: "Kanban" },
              { icon: <CalendarDays className="w-3.5 h-3.5" />, label: "Calendário" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 ${
                  item.active
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="hidden sm:block text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden">
            <p className="text-sm font-bold text-gray-800 mb-3">Dashboard</p>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white border border-blue-100 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <p className="text-[9px] text-gray-500">Em aberto</p>
                </div>
                <p className="text-lg font-bold text-gray-800">12</p>
              </div>
              <div className="bg-white border border-green-100 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <p className="text-[9px] text-gray-500">Concluídas</p>
                </div>
                <p className="text-lg font-bold text-gray-800">8</p>
              </div>
              <div className="bg-white border border-red-100 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <p className="text-[9px] text-gray-500">Atrasadas</p>
                </div>
                <p className="text-lg font-bold text-gray-800">3</p>
              </div>
            </div>

            {/* Charts area */}
            <div className="grid grid-cols-2 gap-2">
              {/* Bar chart mockup */}
              <div className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                <p className="text-[9px] text-gray-500 mb-2">Por semana</p>
                <div className="flex items-end gap-1 h-12">
                  {[2, 4, 3, 6, 5, 8, 4, 7].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500 rounded-t opacity-80"
                      style={{ height: `${(h / 8) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              {/* Donut chart mockup */}
              <div className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm flex items-center justify-center">
                <div className="relative w-14 h-14">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="12" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="30 70" />
                    <circle cx="18" cy="18" r="12" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="-30" />
                    <circle cx="18" cy="18" r="12" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="-70" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-700">23</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            aria-label="Fazer login"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ── Hero (Aceternity Spotlight) ─────────────────────────────────────── */}
      <section id="main-content" role="main" className="relative flex flex-col items-center justify-center py-20 px-6 overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white">
        {/* Aceternity Spotlight */}
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3b82f6" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Projeto Acadêmico · TaskFlow UniSENAI
          </span>

          {/* Aceternity TextGenerateEffect */}
          <TextGenerateEffect
            words="Organize suas tarefas com clareza e foco"
            className="mb-4"
          />

          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto mt-6">
            Gerencie projetos com Kanban interativo, calendário visual e dashboard
            com métricas em tempo real. Autenticação segura via Firebase.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="/login"
              className="border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-all duration-200 text-sm"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Dashboard Mockup */}
          <DashboardMockup />
        </div>
      </section>

      {/* ── Features (Aceternity HoverEffect) ──────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Tudo o que você precisa
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Uma plataforma completa construída com Next.js, Firebase e as melhores
            bibliotecas do ecossistema React.
          </p>
        </div>

        {/* Aceternity HoverEffect grid */}
        <HoverEffect items={features} />
      </section>

      {/* ── Stack tecnológico ───────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Stack Tecnológico</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 15", "TypeScript", "Firebase", "Tailwind CSS",
              "Tremor", "Aceternity UI", "Framer Motion", "FullCalendar",
              "DnD Kit", "React Hook Form", "Zod", "Sonner",
            ].map((tech) => (
              <span
                key={tech}
                className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Crie sua conta gratuitamente e comece a organizar suas tarefas agora.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-blue-500/25"
        >
          Criar conta grátis →
        </Link>
      </section>

      {/* ── Footer institucional ────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">TaskFlow</span>
            </div>
            <p className="text-sm text-gray-500">
              Sistema de gerenciamento de tarefas desenvolvido como projeto
              acadêmico na UniSENAI.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-3">Funcionalidades</p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>Dashboard & Métricas</li>
              <li>Gestão de Tarefas (CRUD)</li>
              <li>Quadro Kanban</li>
              <li>Calendário de Prazos</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-3">Tecnologias</p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>Next.js 15 + TypeScript</li>
              <li>Firebase Firestore & Auth</li>
              <li>Tailwind CSS + Tremor</li>
              <li>Aceternity UI + Framer Motion</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} TaskFlow · Projeto Acadêmico UniSENAI
        </div>
      </footer>
    </main>
  );
}
