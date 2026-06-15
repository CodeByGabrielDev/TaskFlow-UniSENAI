import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  Subtask,
  WorkLog,
} from "@/types/task";

const COLLECTION = "tasks";

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function subscribeTasks(
  userUid: string,
  callback: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Sem orderBy para evitar necessidade de índice composto no Firestore.
  // A ordenação é feita no cliente.
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", userUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() })) as Task[];

      // Ordena por dueDate no cliente
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });

      callback(tasks);
    },
    (err) => onError?.(err)
  );
}

export function subscribeTask(
  taskId: string,
  callback: (task: Task | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, taskId),
    (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Task) : null);
    },
    (err) => onError?.(err)
  );
}

export async function createTask(userUid: string, data: CreateTaskData): Promise<string> {
  const payload: Omit<Task, "id"> = {
    uid: userUid,
    title: data.title,
    description: data.description ?? "",
    dueDate: data.dueDate,
    priority: data.priority,
    status: "a_fazer",
    taskType: data.taskType,
    ...(data.taskType === "bug" && data.bugScope ? { bugScope: data.bugScope } : {}),
    subtasks: [],
    workLogs: [],
    createdAt: now(),
    updatedAt: now(),
  };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

export async function updateTask(taskId: string, data: UpdateTaskData): Promise<void> {
  const updates: Record<string, unknown> = { ...data, updatedAt: now() };
  if (data.status === "concluido" && !data.completedAt) {
    updates.completedAt = now();
  } else if (data.status && data.status !== "concluido") {
    updates.completedAt = null;
  }
  if (data.taskType && data.taskType !== "bug") {
    updates.bugScope = null;
  }
  await updateDoc(doc(db, COLLECTION, taskId), updates);
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, taskId));
}

export async function addSubtask(taskId: string, title: string): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, taskId));
  if (!snap.exists()) return;
  const task = snap.data() as Omit<Task, "id">;
  const subtasks: Subtask[] = task.subtasks ?? [];
  if (subtasks.length >= 50) throw new Error("Limite de 50 sub-tarefas atingido.");
  await updateDoc(doc(db, COLLECTION, taskId), {
    subtasks: [...subtasks, { id: uid(), title, completed: false, createdAt: now() }],
    updatedAt: now(),
  });
}

export async function toggleSubtask(
  taskId: string,
  subtaskId: string,
  completed: boolean
): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, taskId));
  if (!snap.exists()) return;
  const task = snap.data() as Omit<Task, "id">;
  const subtasks = (task.subtasks ?? []).map((s: Subtask) =>
    s.id === subtaskId ? { ...s, completed } : s
  );
  await updateDoc(doc(db, COLLECTION, taskId), { subtasks, updatedAt: now() });
}

export async function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, taskId));
  if (!snap.exists()) return;
  const task = snap.data() as Omit<Task, "id">;
  const subtasks = (task.subtasks ?? []).filter((s: Subtask) => s.id !== subtaskId);
  await updateDoc(doc(db, COLLECTION, taskId), { subtasks, updatedAt: now() });
}

export async function addWorkLog(
  taskId: string,
  content: string,
  userUid: string,
  authorName: string | null
): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, taskId));
  if (!snap.exists()) return;
  const task = snap.data() as Omit<Task, "id">;
  const workLogs: WorkLog[] = task.workLogs ?? [];
  const newLog: WorkLog = {
    id: uid(),
    content,
    timestamp: now(),
    uid: userUid,
    authorName,
  };
  await updateDoc(doc(db, COLLECTION, taskId), {
    workLogs: [...workLogs, newLog],
    updatedAt: now(),
  });
}
