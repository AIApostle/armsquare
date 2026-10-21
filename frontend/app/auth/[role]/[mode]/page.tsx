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

  const isBusiness = role === "business";
  return (
    <main className="flex min-h-dvh flex-col bg-panel">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label="armsquare home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.9fr)] lg:gap-14 lg:py-12">
        <section className="hidden min-w-0 flex-col lg:flex">
          <div
            aria-hidden="true"
            className="h-[22rem] rounded-card bg-panel-raised bg-cover bg-center"
            style={{
              backgroundImage: `url("https://picsum.photos/seed/armsquare-${isBusiness ? "business-owner" : "shopper"}/1200/900")`,
            }}
          />
          <div className="mt-6 max-w-lg">
            <p className="text-sm font-semibold text-primary-ink">
              {isBusiness ? "For business owners" : "For shoppers"}
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">
              {isBusiness
                ? "A better space for your business."
                : "Find better ways to shop."}
            </h2>
            <p className="mt-3 text-base leading-7 text-ink-2">
              {isBusiness
                ? "Set up your business account and decide how its assistant helps your customers."
                : "Keep your shopping preferences close while you compare products and manage orders."}
            </p>
          </div>
        </section>
        <div className="w-full justify-self-center lg:justify-self-end">
          <AuthForm role={role} mode={mode} />
        </div>
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
