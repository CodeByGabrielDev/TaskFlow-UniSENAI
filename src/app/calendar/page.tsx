"use client";

export const dynamic = "force-dynamic";

import lazyLoad from "next/dynamic";
import { Loader2, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout";
import { useTasks } from "@/hooks/useTasks";

const CalendarView = lazyLoad(
  () => import("@/components/organisms/CalendarView").then((m) => m.CalendarView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-app-accent animate-spin" />
      </div>
    ),
  }
);

function CalendarContent() {
  const { tasks, loading, error, reload } = useTasks();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-app-text">Calendário</h1>
        <p className="text-sm text-app-muted mt-0.5">Visualize suas tarefas por data de vencimento</p>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-400">Falha ao carregar dados</p>
          <button
            onClick={reload}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="bg-app-card border border-app-border rounded-2xl p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-app-accent animate-spin" />
          </div>
        ) : (
          <CalendarView tasks={tasks} />
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AppLayout>
      <CalendarContent />
    </AppLayout>
  );
}
