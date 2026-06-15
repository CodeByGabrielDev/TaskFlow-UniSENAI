"use client";

import { TaskType, Priority, TaskStatus, TASK_TYPE_LABELS, TASK_TYPE_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS } from "@/types/task";

interface TaskTypeBadgeProps {
  type: TaskType;
  size?: "sm" | "md";
}

export function TaskTypeBadge({ type, size = "sm" }: TaskTypeBadgeProps) {
  const color = TASK_TYPE_COLORS[type];
  const label = TASK_TYPE_LABELS[type];
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-wide ${sizeClass}`}
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClass}`}
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {label}
    </span>
  );
}

interface StatusBadgeProps {
  status: TaskStatus;
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  a_fazer: "bg-gray-700 text-gray-300",
  fazendo: "bg-blue-900 text-blue-300",
  concluido: "bg-green-900 text-green-300",
};

const STATUS_STYLE_LIGHT: Record<TaskStatus, string> = {
  a_fazer: "bg-gray-100 text-gray-600",
  fazendo: "bg-blue-100 text-blue-700",
  concluido: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded text-xs px-2.5 py-1 font-medium dark:${STATUS_STYLE[status]} ${STATUS_STYLE_LIGHT[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
