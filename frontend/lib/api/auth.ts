const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type AccountRole = "user" | "business";

export type AuthUser = {
  user_id: string;
  email: string | null;
  role: AccountRole;
  email_confirmed: boolean;
};

export type AuthResult = AuthUser & {
  authenticated: boolean;
  email_confirmation_required: boolean;
};

type SignupInput = {
  email: string;
  password: string;
  display_name: string;
  role: AccountRole;
  business_name?: string;
};

type SigninInput = {
  email: string;
  password: string;
  role: AccountRole;
};

export const authApi = {
  signUp: (input: SignupInput) => request<AuthResult>("/v1/auth/signup", input),
  signIn: (input: SigninInput) => request<AuthResult>("/v1/auth/signin", input),
  signOut: () => request<{ signed_out: boolean }>("/v1/auth/signout", {}),
  currentUser: () => request<AuthUser>("/v1/auth/me", undefined, "GET"),
};

async function request<T>(
  path: string,
  body: unknown,
  method: "GET" | "POST" = "POST",
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      credentials: "include",
      cache: "no-store",
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" } }),
    });
  } catch (cause) {
    if (cause instanceof TypeError) {
      throw new Error("We couldn't reach the sign-in service. Check your connection and try again.");
    }
    throw cause;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
        ? payload.detail
        : `The request could not be completed (${response.status}).`;
    throw new Error(detail);
  }
  if (payload === undefined) {
    throw new Error("The sign-in service returned an unreadable response.");
  }
  return payload as T;
}
