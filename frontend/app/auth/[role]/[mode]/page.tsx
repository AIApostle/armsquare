import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Account access",
  robots: { index: false, follow: false },
};

type AuthPageProps = {
  params: Promise<{ role: string; mode: string }>;
};

export default function AuthPage({ params }: AuthPageProps) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPageContent params={params} />
    </Suspense>
  );
}

async function AuthPageContent({ params }: AuthPageProps) {
  const { role, mode } = await params;
  if (
    (role !== "user" && role !== "business") ||
    (mode !== "login" && mode !== "signup")
  ) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-panel">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label="armsquare home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>
      <div className="grid flex-1 place-items-center px-4 py-8 sm:px-6">
        <AuthForm role={role} mode={mode} />
      </div>
      <footer className="pb-6 text-center text-sm text-ink-3">
        <Link href="/account" className="underline underline-offset-4 hover:text-ink">
          All account options
        </Link>
      </footer>
    </main>
  );
}

function AuthLoading() {
  return (
    <div
      role="status"
      aria-label="Loading account access"
      className="card h-96 w-full max-w-md animate-pulse"
    />
  );
}
