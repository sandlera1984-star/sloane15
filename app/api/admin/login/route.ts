import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60 * 10;

export async function POST(request: Request) {
  const { code } = await request.json();
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const allowed = await checkRateLimit(
    `admin:login:${ip}`,
    MAX_ATTEMPTS,
    WINDOW_SECONDS
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  if (!process.env.ADMIN_CODE) {
    return NextResponse.json(
      { error: "Admin code not configured." },
      { status: 500 }
    );
  }

  if (code !== process.env.ADMIN_CODE) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  const token = await createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie(token));
  return response;
}
