"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (isSignup) {
        const result = await authApi.signUp({
          email,
          password,
          display_name: name,
          role,
          ...(isBusiness ? { business_name: businessName } : {}),
        });
        if (result.email_confirmation_required) {
          setMessage("Check your email to confirm your account. Then come back here to sign in.");
          return;
        }
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
  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <div className="mb-7 border-b border-rule pb-5">
        <p className="text-sm font-medium text-primary-ink">
          {isBusiness ? "Business account" : "Shopper account"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-base leading-6 text-ink-2">
          {isBusiness
            ? "Set up your business access. You stay in control of what its agent can do."
            : "Sign in to manage your shopping assistant, preferences, and orders."}
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
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={isSignup ? 8 : 1}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
          {isSignup && <span className="mt-1 block text-sm text-ink-3">Use at least 8 characters.</span>}
        </Field>

        {error && (
          <p role="alert" className="rounded-control border border-danger/30 bg-danger-wash p-3 text-sm text-danger">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-control border border-info/30 bg-info-wash p-3 text-sm text-ink-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-on-primary transition-[background-color,transform] duration-150 hover:bg-primary-hover active:translate-y-px disabled:cursor-wait disabled:opacity-60"
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
          Here as a {isBusiness ? "shopper" : "business"}?{" "}
          <Link
            href={authPath(alternateRole, mode)}
            className="font-semibold text-info underline underline-offset-4"
          >
            Use the {isBusiness ? "shopper" : "business"} sign-in
          </Link>
        </p>
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
    <label htmlFor={htmlFor} className="block text-base font-medium text-ink">
      {label}
      {children}
    </label>
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
  "mt-1.5 block h-12 w-full rounded-control border border-rule-strong bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-info focus:ring-2 focus:ring-info/20";
