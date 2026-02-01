import { NextResponse } from "next/server";
import { checkRateLimit } from "../../../lib/rateLimit";
import { sendSupportEmail } from "../../../lib/email";

export const runtime = "nodejs";

const MAX_REQUESTS = 3;
const WINDOW_SECONDS = 60 * 10;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const allowed = await checkRateLimit(
    `support:${ip}`,
    MAX_REQUESTS,
    WINDOW_SECONDS
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { name, email, description, honeypot } = await request.json();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !description) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (wordCount(description) > 200) {
    return NextResponse.json(
      { error: "Description exceeds 200 words." },
      { status: 400 }
    );
  }

  const emailOk = /.+@.+\..+/.test(email);
  if (!emailOk) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    await sendSupportEmail({ name, email, description });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to send email. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
