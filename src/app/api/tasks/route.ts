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

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
// Query: ?uid=<firebaseUid>
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
    const url =
      `${FIRESTORE_BASE}/tasks?` +
      new URLSearchParams([
        ["pageSize", "200"],
        ['structured_query.where.fieldFilter.field.fieldPath', 'uid'],
        ['structured_query.where.fieldFilter.op', 'EQUAL'],
        ['structured_query.where.fieldFilter.value.stringValue', uid],
      ]);

    // Use Firestore runQuery for filtered fetch
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
        orderBy: [{ field: { fieldPath: "dueDate" }, direction: "ASCENDING" }],
        limit: 200,
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
      .map((r) => firestoreDocToTask(r.document!));

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
// Body: { uid, title, description, dueDate, priority, taskType, bugScope? }
export async function POST(req: NextRequest) {
  const token = extractIdToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { uid, title, description, dueDate, priority, taskType, bugScope } = body;

    if (!uid || !title || !dueDate || !priority || !taskType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const fields: Record<string, unknown> = {
      uid:         { stringValue: uid },
      title:       { stringValue: title },
      description: { stringValue: description ?? "" },
      dueDate:     { stringValue: dueDate },
      priority:    { stringValue: priority },
      status:      { stringValue: "a_fazer" },
      taskType:    { stringValue: taskType },
      subtasks:    { arrayValue: { values: [] } },
      workLogs:    { arrayValue: { values: [] } },
      createdAt:   { stringValue: now },
      updatedAt:   { stringValue: now },
    };

    if (taskType === "bug" && bugScope) {
      fields.bugScope = { stringValue: bugScope };
    }

    const res = await fetch(`${FIRESTORE_BASE}/tasks`, {
      method: "POST",
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
    const task = firestoreDocToTask(doc);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
