import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Choose your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-panel">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label="armsquare home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary-ink">Account access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How will you use armsquare?
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink-2">
            Choose the account that fits. Your assistant acts within the limits you set.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <AccountChoice
            title="I’m shopping"
            description="Find products, compare offers, and let your Customer Agent help with the search."
            loginHref="/auth/user/login?next=/market/kloppy"
            signupHref="/auth/user/signup"
          />
          <AccountChoice
            title="I run a business"
            description="Set up a business account and decide what your Business Agent can do."
            loginHref="/auth/business/login"
            signupHref="/auth/business/signup"
          />
        </div>

        <p className="mt-8 text-sm text-ink-3">
          You can browse the marketplace without signing in.{" "}
          <Link href="/market" className="font-semibold text-info underline underline-offset-4">
            Go to shops
          </Link>
        </p>
      </section>
    </main>
  );
}

function AccountChoice({
  description,
  loginHref,
  signupHref,
  title,
}: {
  description: string;
  loginHref: string;
  signupHref: string;
  title: string;
}) {
  return (
    <section className="card flex min-h-64 flex-col p-6 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-md flex-1 text-base leading-7 text-ink-2">{description}</p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link
          href={signupHref}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-on-primary transition-colors hover:bg-primary-hover active:translate-y-px"
        >
          Create account
        </Link>
        <Link
          href={loginHref}
          className="inline-flex h-11 items-center justify-center rounded-full px-3 text-base font-semibold text-info underline underline-offset-4 hover:text-ink"
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}
