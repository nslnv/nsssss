import { NextResponse } from "next/server";
export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  return new NextResponse("Not found", { status: 404 });
}
