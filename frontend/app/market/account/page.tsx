import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Account",
};

export default function ShopperAccountPage() {
  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="account-heading">
      <h1 id="account-heading" className="text-2xl font-bold text-ink">
        Account
      </h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        Manage the settings your shopping assistant uses when searching for you.
      </p>
      <Link
        href="/market/account/assistant"
        className="card mt-8 flex items-center justify-between gap-4 p-5 transition-colors hover:bg-panel-raised sm:p-6"
      >
        <span>
          <span className="block text-lg font-semibold text-ink">My assistant</span>
          <span className="mt-1 block text-base text-ink-2">
            Review your preferences, budget, and purchase approval settings.
          </span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0 text-info" />
      </Link>
    </section>
  );
}
