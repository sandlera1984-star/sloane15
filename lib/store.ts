import { Redis } from "@upstash/redis";

export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  url: string;
  type: MediaKind;
  createdAt: string;
};

export type SiteSettings = {
  bannerUrl: string | null;
  profileUrl: string | null;
};

const IMAGE_KEY = "media:images";
const VIDEO_KEY = "media:videos";
const BANNER_KEY = "settings:banner";
const PROFILE_KEY = "settings:profile";

const redis = Redis.fromEnv();

export async function getSiteSettings(): Promise<SiteSettings> {
  const [bannerUrl, profileUrl] = await Promise.all([
    redis.get<string>(BANNER_KEY),
    redis.get<string>(PROFILE_KEY)
  ]);

  return {
    bannerUrl: bannerUrl ?? null,
    profileUrl: profileUrl ?? null
  };
}

export async function setSiteSetting(
  key: "banner" | "profile",
  url: string
) {
  const mapKey = key === "banner" ? BANNER_KEY : PROFILE_KEY;
  await redis.set(mapKey, url);
}

export async function listMedia(kind: MediaKind): Promise<MediaItem[]> {
  const key = kind === "image" ? IMAGE_KEY : VIDEO_KEY;
  const items = await redis.get<MediaItem[]>(key);
  return items ?? [];
}

export async function addMedia(kind: MediaKind, item: MediaItem) {
  const key = kind === "image" ? IMAGE_KEY : VIDEO_KEY;
  const items = await listMedia(kind);
  await redis.set(key, [item, ...items]);
}

export async function removeMedia(kind: MediaKind, id: string) {
  const key = kind === "image" ? IMAGE_KEY : VIDEO_KEY;
  const items = await listMedia(kind);
  const nextItems = items.filter((item) => item.id !== id);
  await redis.set(key, nextItems);
  return items.find((item) => item.id === id) ?? null;
}
