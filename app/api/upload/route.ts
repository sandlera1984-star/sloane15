import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { addMedia, setSiteSetting } from "../../../lib/store";
import { getAdminSessionFromCookies, isValidAdminSession } from "../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = await getAdminSessionFromCookies();
  const isValid = await isValidAdminSession(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const kind = formData.get("kind")?.toString();

  if (!file || !kind) {
    return NextResponse.json({ error: "Missing file or kind" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "public",
    contentType: file.type
  });

  if (kind === "banner" || kind === "profile") {
    await setSiteSetting(kind, blob.url);
    return NextResponse.json({ url: blob.url });
  }

  if (kind !== "image" && kind !== "video") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const item = {
    id: crypto.randomUUID(),
    url: blob.url,
    type: kind,
    createdAt: new Date().toISOString()
  } as const;

  await addMedia(kind, item);

  return NextResponse.json({ item });
}
