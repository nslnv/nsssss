import { NextResponse } from "next/server";

function extractId(req: Request): string | null {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // /api/leads/<id>
    const i = parts.findIndex((p) => p === "leads");
    return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const id = extractId(req);
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  const id = extractId(req);
  let data: unknown = null;
  try {
    data = await req.json();
  } catch {}
  return NextResponse.json({ ok: true, id, update: data ?? null });
}

export async function DELETE(req: Request) {
  const id = extractId(req);
  return new NextResponse(null, {
    status: 204,
    headers: id ? { "x-lead-id": id } : {},
  });
}
