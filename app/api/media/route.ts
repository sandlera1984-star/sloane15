import { NextResponse } from "next/server";
import { getSiteSettings, listMedia } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, images, videos] = await Promise.all([
    getSiteSettings(),
    listMedia("image"),
    listMedia("video")
  ]);

  return NextResponse.json({
    settings,
    images,
    videos
  });
}
