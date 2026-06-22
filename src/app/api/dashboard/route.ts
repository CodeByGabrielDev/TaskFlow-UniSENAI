import { NextRequest, NextResponse } from "next/server";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;
/**/ 
function extractIdToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function parseFirestoreValue(v: Record<string, unknown>): unknown {
  if ("stringValue"  in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("nullValue"    in v) return null;
  if ("arrayValue"   in v) {
    const arr = v.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values ?? []).map(parseFirestoreValue);
  }
  if ("mapValue" in v) {
    const map = v.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(map.fields ?? {})) out[k] = parseFirestoreValue(val);
    return out;
  }
  return null;
}

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Query: ?uid=<firebaseUid>
// Returns: { pending, completedThisWeek, overdue, total }
export async function GET(req: NextRequest) {
  const token = extractIdToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid query param required" }, { status: 400 });
  }

  try {
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "tasks" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "uid" },
            op: "EQUAL",
            value: { stringValue: uid },
          },
        },
        limit: 500,
      },
    };

    const res = await fetch(
      `${FIRESTORE_BASE.replace("/documents", "")}:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryBody),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const results: Array<{ document?: Record<string, unknown> }> = await res.json();

    const tasks = results
      .filter((r) => r.document)
      .map((r) => {
        const fields = (r.document!.fields ?? {}) as Record<string, Record<string, unknown>>;
        const task: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(fields)) task[k] = parseFirestoreValue(v);
        return task;
      });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = tasks.length;

    const pending = tasks.filter(
      (t) => t.status === "a_fazer" || t.status === "fazendo"
    ).length;

    const completedThisWeek = tasks.filter((t) => {
      if (t.status !== "concluido" || !t.completedAt) return false;
      return new Date(t.completedAt as string) >= sevenDaysAgo;
    }).length;

    const overdue = tasks.filter(
      (t) =>
        t.status !== "concluido" &&
        typeof t.dueDate === "string" &&
        t.dueDate < todayStr
    ).length;

    const byPriority = { alta: 0, media: 0, baixa: 0 } as Record<string, number>;
    const byStatus   = { a_fazer: 0, fazendo: 0, concluido: 0 } as Record<string, number>;

    tasks.forEach((t) => {
      const p = t.priority as string;
      const s = t.status as string;
      if (p in byPriority) byPriority[p]++;
      if (s in byStatus)   byStatus[s]++;
    });

    return NextResponse.json(
      { total, pending, completedThisWeek, overdue, byPriority, byStatus },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
