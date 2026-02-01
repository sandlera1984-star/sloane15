import AdminClient from "../../components/AdminClient";
import { getAdminSessionFromCookies, isValidAdminSession } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = await getAdminSessionFromCookies();
  const isAdmin = await isValidAdminSession(token);

  return <AdminClient isAdmin={isAdmin} />;
}
