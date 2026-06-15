export type TaskType = "feature" | "user_story" | "bug" | "melhoria" | "tarefa";
export type BugScope = "bug_mercado" | "bug_interno";
export type Priority = "baixa" | "media" | "alta";
export type TaskStatus = "a_fazer" | "fazendo" | "concluido";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkLog {
  id: string;
  content: string;
  timestamp: string;
  uid: string;
  authorName: string | null;
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  taskType: TaskType;
  bugScope?: BugScope;
  subtasks: Subtask[];
  workLogs: WorkLog[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  taskType: TaskType;
  bugScope?: BugScope;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  status?: TaskStatus;
  taskType?: TaskType;
  bugScope?: BugScope | null;
  completedAt?: string | null;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  feature: "Feature",
  user_story: "User Story",
  bug: "Bug",
  melhoria: "Melhoria",
  tarefa: "Tarefa",
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  feature: "#0078D4",
  user_story: "#6B2FD9",
  bug: "#D93025",
  melhoria: "#D97706",
  tarefa: "#4B5563",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  baixa: "#22c55e",
  media: "#f59e0b",
  alta: "#ef4444",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  a_fazer: "A Fazer",
  fazendo: "Fazendo",
  concluido: "Concluído",
};

export const BUG_SCOPE_LABELS: Record<BugScope, string> = {
  bug_mercado: "Bug de Mercado",
  bug_interno: "Bug Interno",
};
