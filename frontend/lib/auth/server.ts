import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACCESS_COOKIE = "armsquare_access_token";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    headers: { Cookie: `${ACCESS_COOKIE}=${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Session verification failed (${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!isAuthUser(payload)) {
    throw new Error("The authentication service returned an invalid account profile.");
  }
  return payload;
}

export async function requireAccountRole(role: AuthUser["role"]): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    const destination = role === "user" ? "/market" : "/dashboard";
    redirect(`/auth/${role}/login?next=${encodeURIComponent(destination)}`);
  }

  if (user.role !== role) {
    redirect(user.role === "user" ? "/market" : "/dashboard");
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.user_id === "string" &&
    (typeof user.email === "string" || user.email === null) &&
    (user.role === "user" || user.role === "business")
  );
}
