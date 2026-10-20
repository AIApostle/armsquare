import { NextResponse, type NextRequest } from "next/server";

type AccountRole = "user" | "business";

const ACCESS_COOKIE = "armsquare_access_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function proxy(request: NextRequest) {
  const requiredRole: AccountRole = request.nextUrl.pathname.startsWith("/dashboard")
    ? "business"
    : "user";
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return redirectToSignIn(request, requiredRole);
  }

  const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    headers: { Cookie: `${ACCESS_COOKIE}=${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    return redirectToSignIn(request, requiredRole);
  }
  if (!response.ok) {
    return NextResponse.json(
      { detail: "Your sign-in could not be verified. Try again shortly." },
      { status: 503 },
    );
  }

  const profile: unknown = await response.json();
  const role = getAccountRole(profile);
  if (!role) {
    return NextResponse.json(
      { detail: "Your sign-in could not be verified. Try again shortly." },
      { status: 503 },
    );
  }
  if (role !== requiredRole) {
    return redirectToArea(request, role);
  }

  return NextResponse.next();
}

function redirectToSignIn(request: NextRequest, role: AccountRole) {
  const destination = request.nextUrl.clone();
  destination.pathname = `/auth/${role}/login`;
  destination.search = "";
  destination.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(destination);
}

function redirectToArea(request: NextRequest, role: AccountRole) {
  const destination = request.nextUrl.clone();
  destination.pathname = role === "user" ? "/market" : "/dashboard";
  destination.search = "";
  return NextResponse.redirect(destination);
}

function getAccountRole(value: unknown): AccountRole | null {
  if (typeof value !== "object" || value === null) return null;
  const profile = value as Record<string, unknown>;
  if (typeof profile.user_id !== "string") return null;
  return profile.role === "user" || profile.role === "business" ? profile.role : null;
}

export const config = {
  matcher: ["/market/:path*", "/dashboard/:path*"],
};
