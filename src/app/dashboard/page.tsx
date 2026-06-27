"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import {
  BarChart,
  DonutChart,
  Card,
  Metric,
  Text,
  Title,
  Legend,
  BadgeDelta,
  Flex,
  Grid,
} from "@tremor/react";
import { AppLayout } from "@/components/templates/AppLayout";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskType, Priority } from "@/types/task";

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

const PRIORITY_TREMOR_COLORS: Record<Priority, string> = {
  alta:  "red",
  media: "amber",
  baixa: "green",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const TYPE_TREMOR_COLORS: Record<TaskType, string> = {
  feature:    "blue",
  user_story: "violet",
  bug:        "red",
  melhoria:   "amber",
  tarefa:     "slate",
};

const TYPE_LABELS: Record<TaskType, string> = {
  feature:    "Feature",
  user_story: "User Story",
  bug:        "Bug",
  melhoria:   "Melhoria",
  tarefa:     "Tarefa",
};

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const { tasks, loading, error, reload } = useTasks();

  const metrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const active = tasks.filter(
      (t) => t.status === "a_fazer" || t.status === "fazendo"
    ).length;

    const completedRecent = tasks.filter((t) => {
      if (t.status !== "concluido" || !t.completedAt) return false;
      return new Date(t.completedAt) >= sevenDaysAgo;
    }).length;

    const overdue = tasks.filter(
      (t) => t.status !== "concluido" && t.dueDate < todayStr
    ).length;

    return { active, completedRecent, overdue };
  }, [tasks]);

  // ── Weekly bar chart data ──────────────────────────────────────────────────
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

    return weeks.map((w) => ({ Semana: w, "Concluídas": counts[w] }));
  }, [tasks]);

  // ── Priority donut chart data ──────────────────────────────────────────────
  const priorityChart = useMemo(() => {
    const counts: Record<Priority, number> = { baixa: 0, media: 0, alta: 0 };
    tasks.forEach((t) => { counts[t.priority]++; });
    return (Object.entries(counts) as [Priority, number][])
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        prioridade: PRIORITY_LABELS[k],
        tarefas: v,
        color: PRIORITY_TREMOR_COLORS[k],
      }));
  }, [tasks]);

  // ── Task type donut chart data ─────────────────────────────────────────────
  const typeChart = useMemo(() => {
    const counts: Partial<Record<TaskType, number>> = {};
    tasks.forEach((t) => {
      counts[t.taskType] = (counts[t.taskType] ?? 0) + 1;
    });
    return (Object.entries(counts) as [TaskType, number][])
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        tipo: TYPE_LABELS[k],
        tarefas: v,
        color: TYPE_TREMOR_COLORS[k],
      }));
  }, [tasks]);

  const priorityColors = priorityChart.map((d) => d.color);
  const typeColors     = typeChart.map((d) => d.color);

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

      {/* ── Metric Cards (Tremor) ──────────────────────────────────────────── */}
      <Grid numItemsSm={3} className="gap-4">
        {/* Em aberto */}
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Em aberto</Text>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <Metric>{metrics.active}</Metric>
              )}
            </div>
            <BadgeDelta
              deltaType="unchanged"
              className="bg-blue-50 text-blue-600"
            >
              <Clock className="w-4 h-4" />
            </BadgeDelta>
          </Flex>
        </Card>

        {/* Concluídas na semana */}
        <Card decoration="top" decorationColor="green">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Concluídas (7 dias)</Text>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <Metric>{metrics.completedRecent}</Metric>
              )}
            </div>
            <BadgeDelta
              deltaType="increase"
              className="bg-green-50 text-green-600"
            >
              <CheckCircle2 className="w-4 h-4" />
            </BadgeDelta>
          </Flex>
        </Card>

        {/* Atrasadas */}
        <Card decoration="top" decorationColor="red">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Atrasadas</Text>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <Metric>{metrics.overdue}</Metric>
              )}
            </div>
            <BadgeDelta
              deltaType={metrics.overdue > 0 ? "increase" : "unchanged"}
              className="bg-red-50 text-red-600"
            >
              <AlertCircle className="w-4 h-4" />
            </BadgeDelta>
          </Flex>
        </Card>
      </Grid>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <Grid numItemsLg={2} className="gap-4">
        {/* Bar Chart — Concluídas por semana */}
        <Card>
          <Title>Concluídas por semana (últimas 8)</Title>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse mt-4" />
          ) : (
            <BarChart
              className="mt-4 h-48"
              data={weeklyChart}
              index="Semana"
              categories={["Concluídas"]}
              colors={["blue"]}
              yAxisWidth={28}
              showAnimation
              showLegend={false}
              aria-label="Gráfico de barras: tarefas concluídas por semana nas últimas 8 semanas"
            />
          )}
        </Card>

        {/* Donut Chart — Distribuição por prioridade */}
        <Card>
          <Title>Distribuição por prioridade</Title>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse mt-4" />
          ) : priorityChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Nenhuma tarefa encontrada
            </div>
          ) : (
            <>
              <DonutChart
                className="mt-4 h-36"
                data={priorityChart}
                category="tarefas"
                index="prioridade"
                colors={priorityColors}
                showAnimation
                valueFormatter={(v) => `${v} tarefa${v !== 1 ? "s" : ""}`}
                aria-label="Gráfico de rosca: distribuição de tarefas por prioridade (alta, média, baixa)"
              />
              <Legend
                className="mt-3"
                categories={priorityChart.map((d) => d.prioridade)}
                colors={priorityColors}
              />
            </>
          )}
        </Card>
      </Grid>

      {/* Donut Chart — Distribuição por tipo */}
      <Card>
        <Title>Distribuição por tipo de tarefa</Title>
        {loading ? (
          <div className="h-48 bg-gray-100 rounded animate-pulse mt-4" />
        ) : typeChart.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          <Grid numItemsSm={2} className="mt-4 gap-6">
            <DonutChart
              className="h-44"
              data={typeChart}
              category="tarefas"
              index="tipo"
              colors={typeColors}
              showAnimation
              valueFormatter={(v) => `${v} tarefa${v !== 1 ? "s" : ""}`}
              aria-label="Gráfico de rosca: distribuição de tarefas por tipo (tarefa, feature, bug, melhoria, user story)"
            />
            <Legend
              className="self-center"
              categories={typeChart.map((d) => d.tipo)}
              colors={typeColors}
            />
          </Grid>
        )}
      </Card>
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
