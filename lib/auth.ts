import { kv } from "@vercel/kv";
import { cookies } from "next/headers";

const SESSION_PREFIX = "admin:session";
const SESSION_TTL = 60 * 60 * 4;

export async function createAdminSession() {
  const token = crypto.randomUUID();
  await kv.set(`${SESSION_PREFIX}:${token}`, { createdAt: Date.now() }, { ex: SESSION_TTL });
  return token;
}

export async function isValidAdminSession(token: string | undefined) {
  if (!token) return false;
  const session = await kv.get(`${SESSION_PREFIX}:${token}`);
  return Boolean(session);
}

export async function getAdminSessionFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value;
}

export function adminSessionCookie(token: string) {
  return {
    name: "admin_session",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL
  };
}
