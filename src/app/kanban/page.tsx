"use client";

export const dynamic = 'force-dynamic';

import { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout";
import { KanbanCard } from "@/components/molecules/TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { updateTask } from "@/services/task.service";
import { Task, TaskStatus, STATUS_LABELS } from "@/types/task";

// ─── Droppable Column ─────────────────────────────────────────────────────────

function DroppableColumn({
  status,
  tasks,
  label,
  activeId,
}: {
  status: TaskStatus;
  tasks: Task[];
  label: string;
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const headerColor: Record<TaskStatus, string> = {
    a_fazer: "#8B949E",
    fazendo: "#0078D4",
    concluido: "#22c55e",
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: headerColor[status] }} />
          <h2 className="text-sm font-semibold text-app-text">{label}</h2>
        </div>
        <span className="text-xs text-app-muted bg-app-card border border-app-border px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 transition-colors min-h-[200px] space-y-2 ${
          isOver ? "bg-app-accent/10 border-2 border-dashed border-app-accent" : "bg-app-surface border border-app-border"
        }`}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} isDimmed={activeId === task.id} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-app-muted">
            Solte aqui
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draggable Card ───────────────────────────────────────────────────────────

function DraggableCard({ task, isDimmed }: { task: Task; isDimmed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-opacity ${isDimmed ? "opacity-40" : ""} ${isDragging ? "z-50" : ""}`}
    >
      <Link href={`/tasks/${task.id}`} onClick={(e) => isDragging && e.preventDefault()}>
        <KanbanCard task={task} isDragging={isDragging} />
      </Link>
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "a_fazer", label: STATUS_LABELS.a_fazer },
  { id: "fazendo", label: STATUS_LABELS.fazendo },
  { id: "concluido", label: STATUS_LABELS.concluido },
];

function KanbanContent() {
  const { tasks, loading, error, reload } = useTasks();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const activeTask = tasks.find((t) => t.id === activeId);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t.id === active.id);
    const newStatus = over.id as TaskStatus;

    if (!task || task.status === newStatus) return;
    const prevStatus = task.status;

    try {
      await updateTask(task.id, { status: newStatus });
    } catch {
      toast.error("Erro ao mover tarefa. Revertendo.");
      await updateTask(task.id, { status: prevStatus }).catch(() => null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-app-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <WifiOff className="w-10 h-10 text-app-border" />
        <p className="text-app-muted text-sm">{error}</p>
        <button
          onClick={reload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-text">Kanban</h1>
          <p className="text-sm text-app-muted mt-0.5">Arraste as tarefas entre as colunas</p>
        </div>
        <Wifi className="w-4 h-4 text-green-400" aria-label="Sincronizado" />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              status={col.id}
              label={col.label}
              tasks={getTasksByStatus(col.id)}
              activeId={activeId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 shadow-2xl">
              <KanbanCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <AppLayout>
      <KanbanContent />
    </AppLayout>
  );
}
