import { NextRequest, NextResponse } from "next/server";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

function extractIdToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function firestoreDocToTask(doc: Record<string, unknown>): Record<string, unknown> {
  const name = doc.name as string;
  const id = name.split("/").pop();
  const fields = doc.fields as Record<string, Record<string, unknown>>;

  function parseValue(v: Record<string, unknown>): unknown {
    if ("stringValue"  in v) return v.stringValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("nullValue"    in v) return null;
    if ("arrayValue"   in v) {
      const arr = v.arrayValue as { values?: Record<string, unknown>[] };
      return (arr.values ?? []).map(parseValue);
    }
    if ("mapValue" in v) {
      const map = v.mapValue as { fields?: Record<string, Record<string, unknown>> };
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(map.fields ?? {})) out[k] = parseValue(val);
      return out;
    }
    return null;
  }

  const task: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(fields ?? {})) task[k] = parseValue(v);
  return task;
}

// ─── GET /api/tasks/[id] ──────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractIdToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const res = await fetch(`${FIRESTORE_BASE}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const doc = await res.json();
    return NextResponse.json({ task: firestoreDocToTask(doc) }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── PATCH /api/tasks/[id] ────────────────────────────────────────────────────
// Body: Partial<{ title, description, dueDate, priority, status, taskType, bugScope }>
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractIdToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const fields: Record<string, unknown> = { updatedAt: { stringValue: now } };
    const updateMask: string[] = ["updatedAt"];

    const stringFields = ["title", "description", "dueDate", "priority", "status", "taskType", "bugScope", "completedAt"];
    for (const field of stringFields) {
      if (field in body) {
        fields[field] = body[field] === null ? { nullValue: null } : { stringValue: body[field] };
        updateMask.push(field);
      }
    }

    // Auto-set completedAt when status changes to concluido
    if (body.status === "concluido" && !("completedAt" in body)) {
      fields.completedAt = { stringValue: now };
      updateMask.push("completedAt");
    } else if (body.status && body.status !== "concluido" && !("completedAt" in body)) {
      fields.completedAt = { nullValue: null };
      updateMask.push("completedAt");
    }

    const maskQuery = updateMask.map((f) => `updateMask.fieldPaths=${f}`).join("&");

    const res = await fetch(`${FIRESTORE_BASE}/tasks/${id}?${maskQuery}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const doc = await res.json();
    return NextResponse.json({ task: firestoreDocToTask(doc) }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── DELETE /api/tasks/[id] ───────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractIdToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const res = await fetch(`${FIRESTORE_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
