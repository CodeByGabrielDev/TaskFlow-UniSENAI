"use client";

import Link from "next/link";
import { CalendarDays, AlertCircle } from "lucide-react";
import { Task, PRIORITY_COLORS } from "@/types/task";
import { TaskTypeBadge, PriorityBadge } from "@/components/atoms/Badge";
import { ProgressBar, calcProgress } from "@/components/atoms/ProgressBar";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

function isOverdue(task: Task): boolean {
  if (task.status === "concluido") return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const overdue = isOverdue(task);
  const total = task.subtasks?.length ?? 0;
  const completed = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progress = calcProgress(total, completed);

  return (
    <Link href={`/tasks/${task.id}`}>
      <div
        className={`
          group bg-app-card border border-app-border rounded-xl p-4
          hover:border-app-accent transition-all duration-150 cursor-pointer
          ${overdue ? "border-l-4 border-l-red-500" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className={`text-sm font-semibold text-app-text leading-snug line-clamp-2 group-hover:text-app-accent transition-colors ${
              task.status === "concluido" ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h3>
          {overdue && (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-label="Tarefa atrasada" />
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <TaskTypeBadge type={task.taskType} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Progress */}
        {!compact && <ProgressBar value={progress} className="mb-3" />}

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs text-app-muted">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span className={overdue ? "text-red-400" : ""}>{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </Link>
  );
}

interface KanbanCardProps {
  task: Task;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function KanbanCard({ task, isDragging = false }: KanbanCardProps) {
  const overdue = isOverdue(task);
  const total = task.subtasks?.length ?? 0;
  const completed = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progress = calcProgress(total, completed);
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <div
      className={`
        bg-app-card border border-app-border rounded-xl p-3
        transition-all duration-150 select-none
        ${isDragging ? "shadow-2xl rotate-1 opacity-90 border-app-accent" : "hover:border-app-accent/60"}
        ${overdue ? "border-l-4 border-l-red-500" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <p
          className={`text-xs font-semibold text-app-text leading-snug line-clamp-2 ${
            task.status === "concluido" ? "line-through opacity-60" : ""
          }`}
        >
          {task.title}
        </p>
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-0.5"
          style={{ backgroundColor: priorityColor }}
          title={`Prioridade ${task.priority}`}
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <TaskTypeBadge type={task.taskType} />
      </div>

      <ProgressBar value={progress} />
    </div>
  );
}
