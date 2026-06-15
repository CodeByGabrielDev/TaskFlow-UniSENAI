"use client";

import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Task, TASK_TYPE_COLORS } from "@/types/task";
import { TaskTypeBadge, PriorityBadge, StatusBadge } from "@/components/atoms/Badge";
import { ProgressBar, calcProgress } from "@/components/atoms/ProgressBar";

const OVERDUE_COLOR = "#EF4444";

function getEventColor(task: Task): string {
  const today = new Date().toISOString().split("T")[0];
  if (task.status !== "concluido" && task.dueDate < today) return OVERDUE_COLOR;
  return TASK_TYPE_COLORS[task.taskType];
}

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

function TaskModal({ task, onClose }: TaskModalProps) {
  if (!task) return null;
  const total = task.subtasks?.length ?? 0;
  const completed = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progress = calcProgress(total, completed);

  return (
    <AnimatePresence>
      {task && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative bg-app-surface border border-app-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="calendar-modal-title"
                className={`text-base font-semibold text-app-text ${task.status === "concluido" ? "line-through opacity-60" : ""}`}
              >
                {task.title}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-app-muted hover:text-app-text hover:bg-app-card transition-colors shrink-0"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <TaskTypeBadge type={task.taskType} size="md" />
              <PriorityBadge priority={task.priority} size="md" />
              <StatusBadge status={task.status} />
            </div>

            <p className="text-sm text-app-muted">
              {task.description || "Sem descrição"}
            </p>

            <div>
              <p className="text-xs text-app-muted mb-1">Progresso: {progress}%</p>
              <ProgressBar value={progress} />
            </div>

            <Link
              href={`/tasks/${task.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver detalhes
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const events = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks
      .filter((t) => !!t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: t.dueDate,
        allDay: true,
        backgroundColor: getEventColor(t),
        borderColor: getEventColor(t),
        textDecoration: t.status === "concluido" ? "line-through" : undefined,
        opacity: t.status === "concluido" ? 0.5 : 1,
        classNames: [
          t.status === "concluido" ? "fc-event-completed" : "",
          t.status !== "concluido" && t.dueDate < today ? "fc-event-overdue" : "",
        ],
      }));
  }, [tasks]);

  function handleEventClick({ event }: EventClickArg) {
    const task = tasks.find((t) => t.id === event.id);
    if (task) setSelectedTask(task);
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        buttonText={{ today: "Hoje", month: "Mês", week: "Semana" }}
        locale="pt-br"
        events={events}
        eventClick={handleEventClick}
        height="auto"
        eventDisplay="block"
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
        dayMaxEvents={3}
        moreLinkText={(n) => `+${n} mais`}
        eventClassNames="cursor-pointer rounded text-xs"
      />

      <style jsx global>{`
        .fc-event-completed {
          opacity: 0.5 !important;
          text-decoration: line-through;
        }
        .fc-daygrid-event-dot {
          display: none;
        }
      `}</style>

      <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}
