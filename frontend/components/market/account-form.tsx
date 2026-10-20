"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authRequest } from "@/lib/api/kloppy";

export function AccountForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      const result = await authRequest<{ email_confirmation_required?: boolean }>(mode, {
        email,
        password,
        role: "user",
        ...(mode === "signup" ? { display_name: displayName } : {}),
      });
      if (result.email_confirmation_required) setMessage("Check your email to confirm the account, then sign in here.");
      else router.push("/market/kloppy");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  return <div className="mt-7 rounded-2xl border border-rule bg-surface p-6 shadow-[var(--card-shadow)]">
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && <label className="block text-sm font-medium text-ink-2">Name<input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} autoComplete="name" /></label>}
      <label className="block text-sm font-medium text-ink-2">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" /></label>
      <label className="block text-sm font-medium text-ink-2">Password<input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
      {error && <p role="alert" className="rounded-xl bg-danger-wash p-3 text-sm text-danger">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-info-wash p-3 text-sm text-ink-2">{message}</p>}
      <button disabled={busy} className="h-11 w-full rounded-full bg-primary px-5 text-sm font-semibold text-on-primary disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    </form>
    <p className="mt-5 text-center text-sm text-ink-3">{mode === "signin" ? "New to armsquare?" : "Already have an account?"}{" "}<button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="font-semibold text-info underline underline-offset-4">{mode === "signin" ? "Create account" : "Sign in"}</button></p>
    <Link href="/market/kloppy" className="mt-4 block text-center text-sm text-ink-3 underline underline-offset-4">Back to Kloppy</Link>
  </div>;
}

const inputClass = "mt-1.5 block h-11 w-full rounded-xl border border-rule-strong bg-surface px-3 text-sm text-ink outline-none focus:border-info";
