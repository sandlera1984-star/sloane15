import { kv } from "@vercel/kv";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
) {
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, windowSeconds);
  }
  return count <= limit;
}
