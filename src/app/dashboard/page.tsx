"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AppLayout } from "@/components/templates/AppLayout";
import { useTasks } from "@/hooks/useTasks";
import { Task, TASK_TYPE_COLORS, TASK_TYPE_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, TaskType, Priority } from "@/types/task";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getLast8Weeks(): string[] {
  const weeks: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  for (let i = 7; i >= 0; i--) {
    const w = new Date(d);
    w.setDate(d.getDate() - i * 7);
    weeks.push(w.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }));
  }
  return weeks;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function MetricCard({ label, value, icon, color, loading }: MetricCardProps) {
  return (
    <div className="bg-app-card border border-app-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-app-muted uppercase tracking-wide">{label}</p>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}22` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-app-border rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-app-text">{value}</p>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-app-surface border border-app-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-app-muted mb-0.5">{label}</p>
      <p className="text-app-text font-semibold">{payload[0].value} tarefa(s)</p>
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const { tasks, loading, error, reload } = useTasks();

  const metrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const active = tasks.filter((t) => t.status === "a_fazer" || t.status === "fazendo").length;

    const completedRecent = tasks.filter((t) => {
      if (t.status !== "concluido" || !t.completedAt) return false;
      return new Date(t.completedAt) >= sevenDaysAgo;
    }).length;

    const overdue = tasks.filter(
      (t) => t.status !== "concluido" && t.dueDate < todayStr
    ).length;

    return { active, completedRecent, overdue };
  }, [tasks]);

  const weeklyChart = useMemo(() => {
    const weeks = getLast8Weeks();
    const counts: Record<string, number> = {};
    weeks.forEach((w) => (counts[w] = 0));

    tasks.forEach((t: Task) => {
      if (t.status === "concluido" && t.completedAt) {
        const key = getWeekKey(new Date(t.completedAt));
        if (key in counts) counts[key]++;
      }
    });

    return weeks.map((w) => ({ semana: w, concluídas: counts[w] }));
  }, [tasks]);

  const priorityChart = useMemo(() => {
    const counts: Record<string, number> = { baixa: 0, media: 0, alta: 0 };
    tasks.forEach((t) => { counts[t.priority]++; });
    return (Object.entries(counts) as [Priority, number][])
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: PRIORITY_LABELS[k], value: v, color: PRIORITY_COLORS[k] }));
  }, [tasks]);

  const typeChart = useMemo(() => {
    const counts: Partial<Record<TaskType, number>> = {};
    tasks.forEach((t) => {
      counts[t.taskType] = (counts[t.taskType] ?? 0) + 1;
    });
    return (Object.entries(counts) as [TaskType, number][])
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: TASK_TYPE_LABELS[k], value: v, color: TASK_TYPE_COLORS[k] }));
  }, [tasks]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-app-muted">{error}</p>
        <button
          onClick={reload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-app-text">Dashboard</h1>
        <p className="text-sm text-app-muted mt-0.5">Visão geral das suas tarefas</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Em aberto"
          value={metrics.active}
          icon={<Clock className="w-4 h-4" />}
          color="#0078D4"
          loading={loading}
        />
        <MetricCard
          label="Concluídas (7 dias)"
          value={metrics.completedRecent}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="#22c55e"
          loading={loading}
        />
        <MetricCard
          label="Atrasadas"
          value={metrics.overdue}
          icon={<AlertCircle className="w-4 h-4" />}
          color="#ef4444"
          loading={loading}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly bar chart */}
        <div className="bg-app-card border border-app-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-app-text mb-4">Concluídas por semana (últimas 8)</h2>
          {loading ? (
            <div className="h-48 bg-app-border rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="semana" tick={{ fontSize: 10, fill: "var(--app-muted)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--app-muted)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--app-border)" }} />
                <Bar dataKey="concluídas" fill="#0078D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority pie chart */}
        <div className="bg-app-card border border-app-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-app-text mb-4">Distribuição por prioridade</h2>
          {loading ? (
            <div className="h-48 bg-app-border rounded animate-pulse" />
          ) : priorityChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-app-muted text-sm">
              Nenhuma tarefa encontrada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityChart} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={false} labelLine={false} style={{ fontSize: 10 }}>
                  {priorityChart.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} tarefa(s)`, ""]} contentStyle={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Type chart */}
      <div className="bg-app-card border border-app-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-app-text mb-4">Distribuição por tipo</h2>
        {loading ? (
          <div className="h-48 bg-app-border rounded animate-pulse" />
        ) : typeChart.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-app-muted text-sm">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeChart} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                {typeChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "var(--app-text)" }}>{v}</span>} />
              <Tooltip formatter={(v) => [`${v} tarefa(s)`, ""]} contentStyle={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
