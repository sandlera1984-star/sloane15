import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { removeMedia } from "../../../lib/store";
import { getAdminSessionFromCookies, isValidAdminSession } from "../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = await getAdminSessionFromCookies();
  const isValid = await isValidAdminSession(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, kind } = await request.json();

  if (!id || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const item = await removeMedia(kind, id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await del(item.url);

  return NextResponse.json({ ok: true });
}
