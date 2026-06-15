"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Edit3, Trash2, Plus, Check, X, Loader2,
  MessageSquare, CalendarDays, AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout";
import { TaskTypeBadge, PriorityBadge, StatusBadge } from "@/components/atoms/Badge";
import { ProgressBar, calcProgress } from "@/components/atoms/ProgressBar";
import { TaskFormModal, TaskFormValues } from "@/components/molecules/TaskForm";
import {
  subscribeTask, updateTask, deleteTask,
  addSubtask, toggleSubtask, deleteSubtask, addWorkLog,
} from "@/services/task.service";
import { useAuth } from "@/hooks/useAuth";
import { Task, BUG_SCOPE_LABELS, STATUS_LABELS, TaskStatus } from "@/types/task";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isOverdue(task: Task): boolean {
  if (task.status === "concluido") return false;
  return task.dueDate < new Date().toISOString().split("T")[0];
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-app-surface border border-app-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-app-text">{title}</h3>
            </div>
            <p className="text-sm text-app-muted mb-5">{description}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-app-border text-app-muted hover:text-app-text hover:bg-app-card transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Page content ─────────────────────────────────────────────────────────────

function TaskDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskError, setSubtaskError] = useState("");
  const [deleteSubtaskId, setDeleteSubtaskId] = useState<string | null>(null);
  const [deletingSubtask, setDeletingSubtask] = useState(false);

  const [comment, setComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeTask(
      id,
      (t) => {
        if (!t) {
          setNotFound(true);
        } else {
          setTask(t);
          setNotFound(false);
        }
        setLoadingTask(false);
      },
      () => {
        setNotFound(true);
        setLoadingTask(false);
      }
    );
    return () => unsub();
  }, [id]);

  async function handleEdit(data: TaskFormValues) {
    if (!task) return;
    setUpdating(true);
    try {
      await updateTask(task.id, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        taskType: data.taskType,
        bugScope: data.bugScope ?? null,
      });
      toast.success("Tarefa atualizada!");
      setEditOpen(false);
    } catch {
      toast.error("Erro ao atualizar tarefa.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Tarefa excluída.");
      router.push("/tasks");
    } catch {
      toast.error("Erro ao excluir tarefa.");
      setDeleting(false);
    }
  }

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    const prev = task.status;
    setStatusSaving(true);
    try {
      await updateTask(task.id, { status });
      toast.success(`Status: ${STATUS_LABELS[status]}`);
    } catch {
      toast.error("Erro ao atualizar status.");
      await updateTask(task.id, { status: prev }).catch(() => null);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddSubtask() {
    if (!newSubtask.trim()) {
      setSubtaskError("O título da sub-tarefa é obrigatório");
      return;
    }
    if (!task) return;
    setSubtaskError("");
    setAddingSubtask(true);
    try {
      await addSubtask(task.id, newSubtask.trim());
      setNewSubtask("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar sub-tarefa.");
    } finally {
      setAddingSubtask(false);
    }
  }

  async function handleToggleSubtask(subtaskId: string, completed: boolean) {
    if (!task) return;
    try {
      await toggleSubtask(task.id, subtaskId, completed);
    } catch {
      toast.error("Erro ao atualizar sub-tarefa.");
    }
  }

  async function handleDeleteSubtask(subtaskId: string) {
    if (!task) return;
    setDeletingSubtask(true);
    try {
      await deleteSubtask(task.id, subtaskId);
      setDeleteSubtaskId(null);
    } catch {
      toast.error("Erro ao remover sub-tarefa.");
    } finally {
      setDeletingSubtask(false);
    }
  }

  async function handleAddComment() {
    if (!comment.trim()) {
      setCommentError("O comentário não pode estar vazio");
      return;
    }
    if (!task || !user) return;
    setCommentError("");
    setSavingComment(true);
    try {
      await addWorkLog(task.id, comment.trim(), user.uid, user.displayName);
      toast.success("Comentário adicionado!");
      setComment("");
    } catch {
      toast.error("Erro ao salvar comentário.");
    } finally {
      setSavingComment(false);
    }
  }

  if (loadingTask) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-app-accent animate-spin" />
      </div>
    );
  }

  if (notFound || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-app-border" />
        <p className="font-semibold text-app-text">Tarefa não encontrada</p>
        <a href="/tasks" className="text-sm text-app-accent hover:underline">
          Voltar para tarefas
        </a>
      </div>
    );
  }

  const total = task.subtasks?.length ?? 0;
  const completed = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progress = calcProgress(total, completed);
  const overdue = isOverdue(task);
  const sortedLogs = [...(task.workLogs ?? [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const inputClass = "bg-app-surface border border-app-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:outline-none focus:border-app-accent transition-colors";

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center gap-2 text-app-muted hover:text-app-text text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app-border text-app-muted hover:text-app-text hover:bg-app-card text-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </button>
        </div>
      </div>

      {/* Task header card */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h1 className={`text-xl font-bold text-app-text leading-snug ${task.status === "concluido" ? "line-through opacity-60" : ""}`}>
            {task.title}
          </h1>
          {overdue && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              Atrasada
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <TaskTypeBadge type={task.taskType} size="md" />
          <PriorityBadge priority={task.priority} size="md" />
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-app-muted leading-relaxed">{task.description}</p>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-app-muted uppercase tracking-wide">Vencimento</span>
            <p className={`mt-0.5 font-medium ${overdue ? "text-red-400" : "text-app-text"}`}>
              <CalendarDays className="inline w-3.5 h-3.5 mr-1" />
              {formatDate(task.dueDate)}
            </p>
          </div>
          {task.taskType === "bug" && task.bugScope && (
            <div>
              <span className="text-xs text-app-muted uppercase tracking-wide">Escopo</span>
              <p className="mt-0.5 font-medium text-app-text">{BUG_SCOPE_LABELS[task.bugScope]}</p>
            </div>
          )}
        </div>

        {/* Status changer */}
        <div>
          <p className="text-xs text-app-muted uppercase tracking-wide mb-2">Alterar status</p>
          <div className="flex flex-wrap gap-2">
            {(["a_fazer", "fazendo", "concluido"] as TaskStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={task.status === s || statusSaving}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  task.status === s
                    ? "bg-app-accent text-white"
                    : "bg-app-surface border border-app-border text-app-muted hover:text-app-text"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-app-muted uppercase tracking-wide">Progresso de sub-tarefas</p>
            <span className="text-xs text-app-muted">{completed}/{total}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* Subtasks */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-app-text">Sub-tarefas</h2>

        {/* Add subtask */}
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => { setNewSubtask(e.target.value); setSubtaskError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              placeholder="Nova sub-tarefa..."
              maxLength={200}
              className={`flex-1 ${inputClass}`}
              aria-label="Título da nova sub-tarefa"
            />
            <button
              onClick={handleAddSubtask}
              disabled={addingSubtask}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-sm transition-colors disabled:opacity-60"
              aria-label="Adicionar sub-tarefa"
            >
              {addingSubtask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          {subtaskError && <p className="text-xs text-red-400">{subtaskError}</p>}
        </div>

        {/* Subtask list */}
        {task.subtasks?.length === 0 && (
          <p className="text-sm text-app-muted">Nenhuma sub-tarefa adicionada.</p>
        )}
        <ul className="space-y-2" aria-label="Lista de sub-tarefas">
          {task.subtasks?.map((s) => (
            <li key={s.id} className="flex items-center gap-3 group">
              <button
                onClick={() => handleToggleSubtask(s.id, !s.completed)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  s.completed
                    ? "bg-green-500 border-green-500"
                    : "border-app-border hover:border-app-accent"
                }`}
                aria-label={s.completed ? "Marcar como pendente" : "Marcar como concluída"}
              >
                {s.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={`flex-1 text-sm ${s.completed ? "line-through text-app-muted" : "text-app-text"}`}>
                {s.title}
              </span>
              <button
                onClick={() => setDeleteSubtaskId(s.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-app-muted hover:text-red-400 transition-all"
                aria-label="Remover sub-tarefa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Work log */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-app-text flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-app-muted" />
          Comentários
        </h2>

        {/* Add comment */}
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setCommentError(""); }}
            placeholder="Adicione um comentário..."
            maxLength={500}
            rows={3}
            className={`w-full ${inputClass} resize-none`}
            aria-label="Novo comentário"
          />
          {commentError && <p className="text-xs text-red-400">{commentError}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-app-muted">{comment.length}/500</span>
            <button
              onClick={handleAddComment}
              disabled={savingComment}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-xs font-medium transition-colors disabled:opacity-60"
            >
              {savingComment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Comentar
            </button>
          </div>
        </div>

        {/* Comments list */}
        {sortedLogs.length === 0 && (
          <p className="text-sm text-app-muted">Nenhum comentário ainda.</p>
        )}
        <div
          className="space-y-3"
          aria-live="polite"
          aria-label="Comentários"
        >
          {sortedLogs.map((log) => (
            <div key={log.id} className="bg-app-surface border border-app-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-app-accent">
                  {log.authorName ?? "Usuário"}
                </span>
                <span className="text-xs text-app-muted">{formatDateTime(log.timestamp)}</span>
              </div>
              <p className="text-sm text-app-text leading-relaxed">{log.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        defaultValues={task}
        mode="edit"
        loading={updating}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Excluir tarefa"
        description="Esta ação é irreversível. A tarefa e todas as suas sub-tarefas serão removidas permanentemente."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />

      {/* Delete subtask dialog */}
      <ConfirmDialog
        open={!!deleteSubtaskId}
        title="Remover sub-tarefa"
        description="Deseja remover esta sub-tarefa?"
        onConfirm={() => deleteSubtaskId && handleDeleteSubtask(deleteSubtaskId)}
        onCancel={() => setDeleteSubtaskId(null)}
        loading={deletingSubtask}
      />
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <AppLayout>
      <TaskDetailContent />
    </AppLayout>
  );
}
