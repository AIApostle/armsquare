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

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary-ink">Account access</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Choose how to join armsquare
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-2">
            Whether you are shopping or running a business, your account keeps your work in the right place.
          </p>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-2">
          <AccountChoice
            title="I’m shopping"
            description="Explore products, compare options, and keep your orders together."
            loginHref="/auth/user/login?next=/market"
            signupHref="/auth/user/signup"
            imageUrl="https://picsum.photos/seed/armsquare-user-shopping/1200/720"
          />
          <AccountChoice
            title="I run a business"
            description="Create your business space and choose how its assistant supports your customers."
            loginHref="/auth/business/login"
            signupHref="/auth/business/signup"
            imageUrl="https://picsum.photos/seed/armsquare-independent-business/1200/720"
          />
        </div>
      </section>
    </main>
  );
}

function AccountChoice({
  description,
  loginHref,
  signupHref,
  title,
  imageUrl,
}: {
  description: string;
  imageUrl: string;
  loginHref: string;
  signupHref: string;
  title: string;
}) {
  return (
    <section className="card group overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-1 motion-reduce:transition-none">
      <div
        aria-hidden="true"
        className="h-48 bg-panel-raised bg-cover bg-center sm:h-56"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
      <div className="flex min-h-56 flex-col p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 max-w-md flex-1 text-base leading-7 text-ink-2">{description}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href={signupHref}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-on-primary transition-colors hover:bg-primary-hover active:translate-y-px motion-reduce:transition-none"
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
      </div>
    </section>
  );
}
