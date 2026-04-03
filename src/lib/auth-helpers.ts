import { auth } from "@/lib/auth";

export async function getAuthSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return null;
  }
  return session;
}
