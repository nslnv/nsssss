import { NextResponse } from "next/server";
type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = params;
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = params;
  let data: unknown = null;
  try { data = await req.json(); } catch {}
  return NextResponse.json({ ok: true, id, update: data ?? null });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = params;
  return new NextResponse(null, { status: 204, headers: { "x-lead-id": id } });
}
