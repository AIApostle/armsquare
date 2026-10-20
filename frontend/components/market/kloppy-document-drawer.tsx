"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { downloadKloppyDocument, type KloppyDocument } from "@/lib/api/kloppy";

const sections = ["Overview", "Audience", "Strategy", "Launch & Learn"] as const;
type Section = (typeof sections)[number];
type Data = Record<string, unknown>;

export function KloppyDocumentDrawer({ document, onClose }: { document: KloppyDocument; onClose: () => void }) {
  const [section, setSection] = useState<Section>("Overview");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const brief = document.document.brief ?? {};
  const draft = document.document.draft ?? {};
  const context = document.document.qloo_context ?? {};
  const audienceNotes = strings(draft.audience_guidance);
  const variants = records(draft.variants);
  const kpis = strings(draft.suggested_kpis);
  const resolved = records(context.taste_inputs ?? context.resolved_interests);
  const related = records(context.ranked_options ?? context.related_entities);

  return (
    <aside aria-label="Saved Kloppy campaign document" className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-rule bg-surface shadow-2xl sm:w-[min(44rem,54vw)]">
      <header className="flex items-start gap-4 border-b border-rule px-5 py-5 sm:px-7">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-info">Kloppy campaign document</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-ink">{document.title}</h2>
          <p className="mt-1 text-xs text-ink-3">Saved {new Date(document.created_at).toLocaleString()} · Draft for review</p>
          <button type="button" disabled={downloading} onClick={async () => {
            setDownloading(true);
            setDownloadError("");
            try {
              await downloadKloppyDocument(document.id, document.title);
            } catch (error) {
              setDownloadError(error instanceof Error ? error.message : "Could not download the Word document.");
            } finally {
              setDownloading(false);
            }
          }} className="mt-3 inline-flex items-center gap-2 rounded-full border border-rule px-3 py-2 text-sm font-medium text-ink hover:bg-panel-raised disabled:cursor-not-allowed disabled:opacity-50">
            <Download aria-hidden className="size-4" />
            {downloading ? "Preparing download…" : "Download Word document"}
          </button>
          {downloadError && <p role="alert" className="mt-2 text-sm text-danger">{downloadError}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close document" title="Close document" className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-panel-raised hover:text-ink">
          <X aria-hidden className="size-5" />
        </button>
      </header>
      <nav aria-label="Campaign document sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-rule px-4 py-2 sm:px-6">
        {sections.map((name) => <button key={name} type="button" aria-current={section === name ? "page" : undefined} onClick={() => setSection(name)} className={`shrink-0 rounded-full px-3 py-2 text-sm transition-colors ${section === name ? "bg-info-wash font-semibold text-info" : "text-ink-2 hover:bg-panel-raised"}`}>{name}</button>)}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        {section === "Overview" && <>
          <StatusBlock label="Campaign status" value="Draft · review before use" />
          <h3 className="mt-7 text-lg font-semibold text-ink">Overview</h3>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-ink-2">{text(draft.campaign_summary, "Campaign summary is not available in this draft.")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Fact label="Product or service" value={brief.product} />
            <Fact label="Goal" value={brief.goal} />
            <Fact label="Channel" value={brief.channel} />
            <Fact label="Location" value={brief.location} />
          </div>
          <section className="mt-7 rounded-2xl bg-info-wash p-4">
            <p className="text-sm font-semibold text-ink">Qloo grounding</p>
            <p className="mt-1 text-sm leading-6 text-ink-2">Based on {resolved.length} resolved interests and {related.length} related cultural entities from Qloo.</p>
          </section>
        </>}
        {section === "Audience" && <>
          <h3 className="text-lg font-semibold text-ink">Audience</h3>
          <Fact className="mt-4" label="Brief description" value={brief.audience} />
          <ListBlock className="mt-6" title="Audience guidance from the draft" items={audienceNotes} empty="No additional audience guidance was saved." />
          <p className="mt-6 rounded-xl bg-surface-sunk p-4 text-sm leading-6 text-ink-3">Cultural affinity is a relevance signal. It does not establish an individual’s identity, consent, or likelihood to buy.</p>
        </>}
        {section === "Strategy" && <>
          <h3 className="text-lg font-semibold text-ink">Strategy</h3>
          <Fact className="mt-4" label="Cultural rationale" value={draft.cultural_rationale} />
          <Fact className="mt-4" label="Creative direction" value={draft.creative_direction} />
          <Fact className="mt-4" label="Test hypothesis" value={draft.test_hypothesis} />
          <ListBlock className="mt-6" title="Suggested measures" items={kpis} empty="No measures were included." />
        </>}
        {section === "Launch & Learn" && <>
          <h3 className="text-lg font-semibold text-ink">Launch & Learn</h3>
          <p className="mt-2 leading-6 text-ink-2">Review the variants and confirm the offer, channel, audience permissions, and destination before publishing. Kloppy has saved a draft; it has not launched a campaign.</p>
          {variants.length ? variants.map((variant, index) => <article key={`${text(variant.name, "variant")}-${index}`} className="mt-4 rounded-2xl border border-rule p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-info">{text(variant.name, `Variant ${index + 1}`)}</p>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-ink">{text(variant.copy, "")}</p>
            <p className="mt-3 text-sm leading-6 text-ink-3">{text(variant.rationale, "")}</p>
          </article>) : <p className="mt-4 text-ink-3">No creative variants were saved.</p>}
          <ListBlock className="mt-6" title="Learn from these measures" items={kpis} empty="No KPIs were suggested." />
          <p className="mt-6 rounded-xl bg-primary-wash p-4 text-sm leading-6 text-primary-ink">{text(draft.approval_note, "A business owner should review and approve this draft before launch.")}</p>
        </>}
      </div>
      <footer className="border-t border-rule px-5 py-3 text-xs text-ink-3 sm:px-7">Project {document.project_id} · Account-isolated in Supabase</footer>
    </aside>
  );
}

function StatusBlock({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl bg-success-wash px-4 py-3"><span className="text-sm text-ink-2">{label}</span><span className="text-sm font-semibold text-success">{value}</span></div>;
}

function Fact({ label, value, className = "" }: { label: string; value: unknown; className?: string }) {
  return <div className={`rounded-xl border border-rule p-4 ${className}`}><p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{text(value, "Not provided")}</p></div>;
}

function ListBlock({ title, items, empty, className = "" }: { title: string; items: string[]; empty: string; className?: string }) {
  return <section className={className}><h4 className="text-sm font-semibold text-ink">{title}</h4>{items.length ? <ul className="mt-3 space-y-2">{items.map((item, i) => <li key={`${item}-${i}`} className="flex gap-3 text-sm leading-6 text-ink-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-info" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-ink-3">{empty}</p>}</section>;
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
function records(value: unknown): Data[] {
  return Array.isArray(value) ? value.filter((item): item is Data => !!item && typeof item === "object" && !Array.isArray(item)) : [];
}
