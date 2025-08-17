import { NextResponse } from "next/server";

function extractFilename(req: Request): string | null {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // /api/files/<filename>
    const i = parts.findIndex((p) => p === "files");
    return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const filename = extractFilename(req);

  // На Vercel локального диска нет; пока отдаём 404.
  // Когда подключим S3/R2 — здесь сделаем редирект/проксирование из бакета.
  return new NextResponse("Not found", {
    status: 404,
    headers: filename ? { "x-filename": filename } : {},
  });
}
