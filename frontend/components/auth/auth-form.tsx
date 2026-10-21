"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authApi, type AccountRole } from "@/lib/api/auth";

type AuthMode = "login" | "signup";

export function AuthForm({ role, mode }: { role: AccountRole; mode: AuthMode }) {
  const router = useRouter();
  const isBusiness = role === "business";
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) {
        await authApi.signUp({
          email,
          password,
          display_name: name,
          role,
          ...(isBusiness ? { business_name: businessName } : {}),
        });
      } else {
        await authApi.signIn({ email, password, role });
      }
      const next = safeNextPath(
        new URLSearchParams(window.location.search).get("next"),
        role,
      );
      router.replace(next ?? (isBusiness ? "/dashboard" : "/market"));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete that request.");
    } finally {
      setBusy(false);
    }
  }

  const alternateRole: AccountRole = isBusiness ? "user" : "business";
  const alternateAudience = isBusiness ? "shopper" : "business";
  return (
    <div className="card w-full max-w-lg overflow-hidden">
      <div className="h-1.5 bg-primary" aria-hidden="true" />
      <div className="p-6 sm:p-8">
        <div className="mb-7 border-b border-rule pb-5">
          <p className="text-sm font-semibold text-primary-ink">
            {isBusiness ? "Business account" : "Shopper account"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-base leading-6 text-ink-2">
            {isBusiness
              ? "Set up your business space and decide how its assistant can help customers."
              : "Keep your shopping preferences and orders together in one place."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isSignup && (
            <Field label="Your name" htmlFor="display-name">
              <input
                id="display-name"
                name="name"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
            </Field>
          )}
          {isSignup && isBusiness && (
            <Field label="Business name" htmlFor="business-name">
              <input
                id="business-name"
                name="organization"
                required
                autoComplete="organization"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                className={inputClass}
              />
            </Field>
          )}
          <Field label="Email address" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={isSignup ? 8 : 1}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-control text-ink-3 transition-colors hover:text-ink focus-visible:z-10"
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Eye size={20} strokeWidth={1.8} aria-hidden="true" />
                )}
              </button>
            </div>
            {isSignup && (
              <span className="block text-sm text-ink-3">Use at least 8 characters.</span>
            )}
          </Field>

          {error && (
            <p role="alert" className="rounded-control border border-danger/30 bg-danger-wash p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-on-primary transition-[background-color,transform] duration-150 hover:bg-primary-hover active:translate-y-px disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
          >
            {busy ? "Please wait" : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-ink-3">
          <p>
            {isSignup ? "Already have an account?" : "New to armsquare?"}{" "}
            <Link
              href={authPath(role, isSignup ? "login" : "signup")}
              className="font-semibold text-info underline underline-offset-4"
            >
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>
          <p>
            {isSignup
              ? `Looking for a ${alternateAudience} account?`
              : `Here as a ${alternateAudience}?`}{" "}
            <Link
              href={authPath(alternateRole, mode)}
              className="font-semibold text-info underline underline-offset-4"
            >
              {isSignup
                ? `Create a ${alternateAudience} account`
                : `Use the ${alternateAudience} sign-in`}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

function authPath(role: AccountRole, mode: AuthMode) {
  return `/auth/${role}/${mode}`;
}

function safeNextPath(path: string | null, role: AccountRole): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return null;
  }
  const destination = new URL(path, window.location.origin);
  const allowedPrefix = role === "user" ? "/market/" : "/dashboard/";
  if (
    destination.origin !== window.location.origin ||
    !destination.pathname.startsWith(allowedPrefix)
  ) {
    return null;
  }
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

const inputClass =
  "block h-12 w-full rounded-control border border-rule-strong bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-info focus:ring-2 focus:ring-info/20";
