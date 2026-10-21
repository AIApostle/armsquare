import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";

type WorkflowAction = {
  href: string;
  label: string;
};

export function WorkflowNotice({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: WorkflowAction[];
}) {
  return (
    <section className="card mt-8 p-5 sm:p-7" aria-labelledby="workflow-notice-heading">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-info-wash text-info">
          <CircleHelp aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-info">Not available yet</p>
          <h2 id="workflow-notice-heading" className="mt-1 text-xl font-bold text-ink">
            {title}
          </h2>
          <p className="mt-2 max-w-[65ch] text-base leading-relaxed text-ink-2">{description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-base font-medium text-on-primary transition-colors hover:bg-primary-hover"
              >
                {action.label}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
