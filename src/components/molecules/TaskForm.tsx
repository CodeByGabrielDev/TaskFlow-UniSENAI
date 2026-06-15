"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskType, Priority, BugScope, Task } from "@/types/task";

const taskSchema = z
  .object({
    title: z.string().min(1, "Título obrigatório").max(120, "Máximo 120 caracteres"),
    description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
    dueDate: z.string().min(1, "Data de vencimento obrigatória"),
    priority: z.enum(["baixa", "media", "alta"] as [Priority, ...Priority[]], {
      required_error: "Prioridade obrigatória",
    }),
    taskType: z.enum(
      ["feature", "user_story", "bug", "melhoria", "tarefa"] as [TaskType, ...TaskType[]],
      { required_error: "Tipo obrigatório" }
    ),
    bugScope: z
      .enum(["bug_mercado", "bug_interno"] as [BugScope, ...BugScope[]])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.taskType === "bug" && !data.bugScope) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione o escopo do bug",
        path: ["bugScope"],
      });
    }
    const today = new Date().toISOString().split("T")[0];
    if (data.dueDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data não pode ser no passado",
        path: ["dueDate"],
      });
    }
  });

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  defaultValues?: Partial<Task>;
  mode?: "create" | "edit";
  loading?: boolean;
}

const inputClass =
  "w-full bg-app-surface border border-app-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:outline-none focus:border-app-accent transition-colors";
const labelClass = "block text-xs font-medium text-app-muted mb-1";
const errorClass = "text-xs text-red-400 mt-1";

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  mode = "create",
  loading = false,
}: TaskFormModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      priority: defaultValues?.priority ?? "media",
      taskType: defaultValues?.taskType ?? "tarefa",
      bugScope: defaultValues?.bugScope,
    },
  });

  const taskType = watch("taskType");

  useEffect(() => {
    if (!open) return;
    reset({
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      priority: defaultValues?.priority ?? "media",
      taskType: defaultValues?.taskType ?? "tarefa",
      bugScope: defaultValues?.bugScope,
    });
  }, [open, defaultValues, reset]);

  async function handleFormSubmit(data: TaskFormValues) {
    await onSubmit(data);
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={mode === "create" ? "Nova tarefa" : "Editar tarefa"}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative bg-app-surface border border-app-border rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
              <h2 className="text-base font-semibold text-app-text">
                {mode === "create" ? "Nova Tarefa" : "Editar Tarefa"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>Título *</label>
                <input
                  {...register("title")}
                  className={inputClass}
                  placeholder="Título da tarefa"
                  maxLength={120}
                />
                {errors.title && <p className={errorClass}>{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea
                  {...register("description")}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Descrição opcional"
                  maxLength={1000}
                />
                {errors.description && <p className={errorClass}>{errors.description.message}</p>}
              </div>

              {/* Due date */}
              <div>
                <label className={labelClass}>Data de Vencimento *</label>
                <input
                  {...register("dueDate")}
                  type="date"
                  min={today}
                  className={inputClass}
                />
                {errors.dueDate && <p className={errorClass}>{errors.dueDate.message}</p>}
              </div>

              {/* Priority + TaskType row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Prioridade *</label>
                  <select {...register("priority")} className={inputClass}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                  {errors.priority && <p className={errorClass}>{errors.priority.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Tipo *</label>
                  <select {...register("taskType")} className={inputClass}>
                    <option value="tarefa">Tarefa</option>
                    <option value="feature">Feature</option>
                    <option value="user_story">User Story</option>
                    <option value="bug">Bug</option>
                    <option value="melhoria">Melhoria</option>
                  </select>
                  {errors.taskType && <p className={errorClass}>{errors.taskType.message}</p>}
                </div>
              </div>

              {/* BugScope (conditional) */}
              {taskType === "bug" && (
                <div>
                  <label className={labelClass}>Escopo do Bug *</label>
                  <select {...register("bugScope")} className={inputClass}>
                    <option value="">Selecione o escopo</option>
                    <option value="bug_mercado">Bug de Mercado</option>
                    <option value="bug_interno">Bug Interno</option>
                  </select>
                  {errors.bugScope && <p className={errorClass}>{errors.bugScope.message}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-app-border text-app-muted hover:text-app-text hover:bg-app-card transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "create" ? "Criar Tarefa" : "Salvar"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
