"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeTasks } from "@/services/task.service";
import { Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsub = subscribeTasks(
      user.uid,
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      () => {
        setError("Falha ao carregar dados.");
        setLoading(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    const unsub = load();
    return () => unsub?.();
  }, [load]);

  return { tasks, loading, error, reload: load };
}
