"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, RefreshCw, ListTodo } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout";
import { TaskCard } from "@/components/molecules/TaskCard";
import { TaskFormModal, TaskFormValues } from "@/components/molecules/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { createTask } from "@/services/task.service";
import { useAuth } from "@/hooks/useAuth";
import { TaskType, TASK_TYPE_LABELS } from "@/types/task";

const TYPE_FILTERS: { value: TaskType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "tarefa", label: TASK_TYPE_LABELS.tarefa },
  { value: "feature", label: TASK_TYPE_LABELS.feature },
  { value: "user_story", label: TASK_TYPE_LABELS.user_story },
  { value: "bug", label: TASK_TYPE_LABELS.bug },
  { value: "melhoria", label: TASK_TYPE_LABELS.melhoria },
];

function TasksContent() {
  const { user } = useAuth();
  const { tasks, loading, error, reload } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchType = typeFilter === "all" || t.taskType === typeFilter;
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [tasks, typeFilter, search]);

  async function handleCreate(data: TaskFormValues) {
    if (!user?.uid) return;
    setCreating(true);
    try {
      await createTask(user.uid, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        taskType: data.taskType,
        bugScope: data.bugScope,
      });
      toast.success("Tarefa criada com sucesso!");
      setModalOpen(false);
    } catch {
      toast.error("Erro ao criar tarefa. Tente novamente.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-text">Tarefas</h1>
          <p className="text-sm text-app-muted mt-0.5">
            {loading ? "Carregando..." : `${tasks.length} tarefa(s) encontrada(s)`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium transition-colors"
          aria-label="Nova tarefa"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarefa..."
            className="w-full pl-9 pr-3 py-2 bg-app-card border border-app-border rounded-lg text-sm text-app-text placeholder:text-app-muted focus:outline-none focus:border-app-accent transition-colors"
            aria-label="Buscar tarefas"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? "bg-app-accent text-white"
                  : "bg-app-card border border-app-border text-app-muted hover:text-app-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={reload}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-app-card border border-app-border rounded-xl p-4 h-36 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <ListTodo className="w-12 h-12 text-app-border" />
          <div>
            <p className="font-semibold text-app-text">Nenhuma tarefa encontrada</p>
            <p className="text-sm text-app-muted mt-1">
              {tasks.length === 0
                ? "Crie sua primeira tarefa para começar."
                : "Tente ajustar os filtros de busca."}
            </p>
          </div>
          {tasks.length === 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar primeira tarefa
            </button>
          )}
        </div>
      )}

      {/* Task grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
        loading={creating}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppLayout>
      <TasksContent />
    </AppLayout>
  );
}
