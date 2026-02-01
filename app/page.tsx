import HomeClient from "../components/HomeClient";
import { getSiteSettings } from "../lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return <HomeClient settings={settings} />;
}
