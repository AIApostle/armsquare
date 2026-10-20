"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { kloppyGet, kloppyRequest, rankSnapshot, type KloppyDocument, type KloppyEntity } from "@/lib/api/kloppy";
import { KloppyDocumentDrawer } from "./kloppy-document-drawer";

const capabilities = [
  { id: "enrich", number: "01", title: "Cultural data enrichment", summary: "Resolve a record and attach Qloo attributes." },
  { id: "taste", number: "02", title: "Taste intelligence", summary: "Describe the interests and explore likely affinities." },
  { id: "recommendations", number: "03", title: "Recommendations", summary: "Carry a taste signal across categories." },
  { id: "locality", number: "04", title: "Locality intelligence", summary: "Explore nearby affinity and heatmap context." },
  { id: "ground", number: "05", title: "AI & agent grounding", summary: "Give an agent factual options ranked for a person." },
  { id: "offline", number: "06", title: "On-device intelligence", summary: "Re-rank a downloaded Qloo snapshot on this device." },
  { id: "marketing", number: "07", title: "Marketing copilot", summary: "Draft campaigns grounded in Qloo cultural intelligence." },
] as const;
type Capability = (typeof capabilities)[number]["id"];
type ClarifyingQuestion = { id: string; question: string; options: string[] };

export function KloppyWorkspace() {
  const [active, setActive] = useState<Capability>("ground");
  const [query, setQuery] = useState("I Sodi");
  const [interests, setInterests] = useState("Brian Eno, Jil Sander");
  const [location, setLocation] = useState("Copenhagen");
  const [instruction, setInstruction] = useState("Find a place for dinner that suits my taste");
  const [product, setProduct] = useState("Artisan bakery delivery");
  const [goal, setGoal] = useState("Increase first orders");
  const [audience, setAudience] = useState("Local customers who enjoy independent food businesses");
  const [offer, setOffer] = useState("");
  const [channel, setChannel] = useState("Instagram");
  const [brandVoice, setBrandVoice] = useState("Warm, local, and distinctive");
  const [entityType, setEntityType] = useState("place");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [snapshot, setSnapshot] = useState<KloppyEntity[]>([]);
  const [documents, setDocuments] = useState<KloppyDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<KloppyDocument | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarificationChoices, setClarificationChoices] = useState<Record<string, string>>({});
  const entities = useMemo(() => collectEntities(result), [result]);
  const candidates = snapshot.length ? snapshot : entities;
  const localRanking = useMemo(() => rankSnapshot(candidates, interests.split(",").map((x) => x.trim())), [candidates, interests]);

  async function loadDocuments() {
    try {
      setDocuments(await kloppyGet<KloppyDocument[]>("documents"));
      setAuthRequired(false);
      setDocumentsError("");
    } catch (cause) {
      const status = (cause as Error & { status?: number }).status;
      if (status === 401) setAuthRequired(true);
      else setDocumentsError((cause as Error).message);
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function run(clarificationAnswers: Array<{ question: string; answer: string }> = []) {
    setBusy(true); setError(""); setResult(null);
    const terms = interests.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      let response: Record<string, unknown>;
      if (active === "enrich") response = await kloppyRequest("enrich", { query, type: entityType });
      else if (active === "taste") response = await kloppyRequest("taste", { interests: terms });
      else if (active === "recommendations") response = await kloppyRequest("recommendations", { interests: terms });
      else if (active === "locality") response = await kloppyRequest("locality", { interests: terms, location });
      else if (active === "ground") response = await kloppyRequest("ground", { interests: terms, location, instruction, target_type: entityType });
      else if (active === "marketing") response = await kloppyRequest("marketing-plan", { interests: terms, product, goal, audience, offer, location, channel, brand_voice: brandVoice, target_type: entityType, clarification_answers: clarificationAnswers });
      else response = { ranked: localRanking, mode: "local snapshot ranking", source: "previously downloaded Qloo-grounded candidates" };
      setResult(response);
      if (active === "marketing") {
        const clarification = response as { clarification_required?: boolean; questions?: ClarifyingQuestion[] };
        if (clarification.clarification_required && clarification.questions?.length) {
          setClarifyingQuestions(clarification.questions);
          setClarificationChoices({});
          return;
        }
        setClarifyingQuestions([]);
        const saved = (response as { document?: KloppyDocument }).document;
        if (saved) {
          setDocuments((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
          setAuthRequired(false);
          setSelectedDocument(saved);
        }
      }
    } catch (cause) {
      const status = (cause as Error & { status?: number }).status;
      if (status === 401) setAuthRequired(true);
      setError((cause as Error).message);
    }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-ink">Kloppy · cultural intelligence</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Ground choices in real taste.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-ink-2">Qloo is Kloppy’s built-in default tool. It grounds each campaign automatically, with no integration switch to enable. Campaigns open as one shared document with sections for Overview, Audience, Strategy, and Launch &amp; Learn.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((item) => (
          <button key={item.id} onClick={() => { setActive(item.id); setResult(null); setError(""); }} className={`rounded-2xl border p-5 text-left transition-colors ${active === item.id ? "border-info bg-info-wash" : "border-rule bg-surface hover:bg-panel-raised"}`}>
            <span className="text-xs font-semibold tracking-widest text-info">{item.number} / {item.id === "marketing" ? "KLOPPY" : "BUILT IN"}</span>
            <span className="mt-3 block text-lg font-semibold text-ink">{item.title}</span>
            <span className="mt-1 block text-sm leading-5 text-ink-2">{item.summary}</span>
          </button>
        ))}
      </div>

      {authRequired && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-info/30 bg-info-wash p-4"><p className="text-sm text-ink-2">Sign in to save and view your campaign documents in your private account.</p><Link href="/account" className="rounded-full bg-info px-4 py-2 text-sm font-semibold text-white">Sign in</Link></div>}
      {documentsError && <p role="alert" className="rounded-xl bg-danger-wash p-4 text-sm text-danger">Couldn’t load saved documents: {documentsError}</p>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-2xl border border-rule bg-surface p-6 shadow-[var(--card-shadow)]">
          <p className="text-sm font-semibold text-ink">Request context</p>
          <div className="mt-5 space-y-4">
            {(active === "enrich") && <label className="block text-sm text-ink-2">Record or entity<input value={query} onChange={(e) => setQuery(e.target.value)} className={inputClass} placeholder="e.g. I Sodi" /></label>}
            {["enrich", "ground", "marketing"].includes(active) && <label className="block text-sm text-ink-2">Entity category<select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={inputClass}>{["place", "artist", "brand", "book", "movie", "destination", "person", "podcast", "tv_show"].map((x) => <option key={x}>{x}</option>)}</select></label>}
            {active !== "enrich" && active !== "offline" && <label className="block text-sm text-ink-2">Interests <span className="text-ink-3">(comma separated)</span><input value={interests} onChange={(e) => setInterests(e.target.value)} className={inputClass} placeholder="Brian Eno, Jil Sander" /></label>}
            {["locality", "ground", "marketing"].includes(active) && <label className="block text-sm text-ink-2">Location<input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Copenhagen" /></label>}
            {active === "ground" && <label className="block text-sm text-ink-2">What should Kloppy help with?<input value={instruction} onChange={(e) => setInstruction(e.target.value)} className={inputClass} /></label>}
            {active === "marketing" && <>
              <label className="block text-sm text-ink-2">Product or service<input value={product} onChange={(e) => setProduct(e.target.value)} className={inputClass} /></label>
              <label className="block text-sm text-ink-2">Campaign goal<input value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass} /></label>
              <label className="block text-sm text-ink-2">Audience description<input value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass} /></label>
              <label className="block text-sm text-ink-2">Offer or facts to include <span className="text-ink-3">(optional)</span><input value={offer} onChange={(e) => setOffer(e.target.value)} className={inputClass} /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-ink-2">Channel<input value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass} /></label>
                <label className="block text-sm text-ink-2">Brand voice<input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} className={inputClass} /></label>
              </div>
            </>}
            {active === "offline" && <p className="rounded-xl bg-info-wash p-4 text-sm leading-6 text-ink-2">Rank candidates already downloaded from a Qloo grounded request. The preference matching runs in this browser and sends no request.</p>}
            <button onClick={() => { void run(); }} disabled={busy || (active === "offline" && !candidates.length)} className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">{busy ? (active === "marketing" ? "Grounding and building document…" : "Asking Qloo…") : active === "offline" ? "Rank on this device" : active === "marketing" ? "Build campaign document" : "Run capability"}</button>
          </div>
        </div>

        <div className="min-h-72 rounded-2xl border border-rule bg-surface p-6 shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink">Grounded output</p><span className="rounded-full bg-success-wash px-3 py-1 text-xs font-medium text-success">{Boolean(result?.clarification_required) ? "Waiting for your choices" : active === "marketing" ? "Qloo grounded · model drafted" : "Qloo source"}</span></div>
          {error && <p role="alert" className="mt-5 rounded-xl bg-danger-wash p-4 text-sm text-danger">{error}</p>}
          {busy && <div className="mt-8 rounded-2xl bg-info-wash p-5" role="status" aria-live="polite"><p className="font-semibold text-ink">Kloppy is building your campaign thread</p><p className="mt-2 text-sm leading-6 text-ink-2">Qloo is grounding the brief. Kloppy is preparing the same campaign document for Overview, Audience, Strategy, and Launch &amp; Learn.</p></div>}
          {!result && !error && !busy && <div className="mt-12 text-center"><p className="text-ink-2">Your structured result will appear here.</p><p className="mt-2 text-sm text-ink-3">Kloppy returns grounded data for review before an agent acts.</p></div>}
          {result && <ResultView data={result} entities={active === "offline" ? localRanking : entities} onSave={setSnapshot} snapshotCount={snapshot.length} />}
        </div>
      </section>
      <section aria-labelledby="saved-documents-heading" className="space-y-4">
        <div><h2 id="saved-documents-heading" className="text-xl font-semibold text-ink">Campaign documents</h2><p className="mt-1 text-sm text-ink-3">Each document is a single campaign thread with the same saved content across all four sections. Private to your Supabase account.</p></div>
        {documents.length ? <div className="grid gap-3 sm:grid-cols-2">{documents.map((document) => <button key={document.id} type="button" onClick={() => setSelectedDocument(document)} className="rounded-2xl border border-rule bg-surface p-5 text-left transition-colors hover:border-info/50 hover:bg-info-wash"><span className="text-xs font-semibold uppercase tracking-wide text-info">Word campaign document</span><span className="mt-2 block text-base font-semibold text-ink">{document.title}</span><span className="mt-2 block text-xs text-ink-3">Updated {new Date(document.updated_at).toLocaleDateString()}</span><span className="mt-4 inline-flex rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-info">Open document →</span></button>)}</div> : <p className="rounded-2xl border border-dashed border-rule-strong p-6 text-sm text-ink-3">{authRequired ? "Sign in to see saved Kloppy documents." : "Campaign documents prepared with Kloppy will appear here."}</p>}
      </section>
      <p className="text-xs leading-5 text-ink-3">Qloo grounds discovery and context. Availability, schedules, and booking details must be confirmed by the connected source before action.</p>
      {selectedDocument && <KloppyDocumentDrawer key={selectedDocument.id} document={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {clarifyingQuestions.length > 0 && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="clarification-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-rule bg-surface p-6 shadow-2xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-info">Campaign choices</p>
          <h2 id="clarification-title" className="mt-2 text-2xl font-semibold text-ink">A few choices before Kloppy drafts</h2>
          <p className="mt-2 text-sm leading-6 text-ink-2">Your answers will carry into the same campaign document and its sections.</p>
          <div className="mt-6 space-y-6">{clarifyingQuestions.map((item, index) => <fieldset key={item.id} className="space-y-3"><legend className="font-medium leading-6 text-ink">{item.question}</legend>{item.options.map((option) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-rule p-3 hover:bg-panel-raised"><input type="radio" name={item.id} value={option} checked={clarificationChoices[item.id] === option} onChange={() => setClarificationChoices((current) => ({ ...current, [item.id]: option }))} className="mt-1 accent-[var(--info)]" /><span className="text-sm text-ink-2">{option}</span></label>)}</fieldset>)}</div>
          <div className="mt-7 flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} onClick={() => { const answers = clarifyingQuestions.map((item) => ({ question: item.question, answer: clarificationChoices[item.id] || "Use your best judgment" })); setClarifyingQuestions([]); void run(answers); }} className="rounded-full border border-rule px-4 py-2.5 text-sm font-medium text-ink hover:bg-panel-raised disabled:opacity-50">{Object.keys(clarificationChoices).length ? "Continue campaign" : "Let Kloppy decide"}</button></div>
          <p className="mt-3 text-right text-xs text-ink-3">Choice {Math.min(Object.keys(clarificationChoices).length, clarifyingQuestions.length)} of {clarifyingQuestions.length}</p>
        </section>
      </div>}
    </div>
  );
}

const inputClass = "mt-1.5 block h-11 w-full rounded-xl border border-rule-strong bg-surface px-3 text-sm text-ink outline-none focus:border-info";

function collectEntities(data: Record<string, unknown> | null): KloppyEntity[] {
  if (!data) return [];
  const found: KloppyEntity[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const candidate = value as Record<string, unknown>;
      if (typeof candidate.name === "string" && (candidate.id || candidate.tags || candidate.properties)) found.push(candidate as unknown as KloppyEntity);
      else Object.values(candidate).forEach(walk);
    }
  };
  walk(data);
  return found;
}

function ResultView({ data, entities, onSave, snapshotCount }: { data: Record<string, unknown>; entities: KloppyEntity[]; onSave: (entities: KloppyEntity[]) => void; snapshotCount: number }) {
  const printable = { ...data };
  delete printable.categories;
  delete printable.grounding;
  delete printable.places;
  delete printable.facts;
  delete printable.ranked_options;
  delete printable.descriptive;
  delete printable.predictive;
  const marketingDraft = data.draft as Record<string, unknown> | undefined;
  const categories = data.categories as Record<string, KloppyEntity[]> | undefined;
  const defaultLists: Array<[string, KloppyEntity[]]> = [
    ["Resolved / ranked options", (data.ranked_options as KloppyEntity[] | undefined) ?? entities],
    ["Descriptive taste", (data.descriptive as KloppyEntity[] | undefined) ?? []],
    ["Predictive taste", (data.predictive as KloppyEntity[] | undefined) ?? []],
    ["Nearby places", (data.places as KloppyEntity[] | undefined) ?? []],
    ["Factual context", (data.facts as KloppyEntity[] | undefined) ?? []],
  ];
  const lists: Array<[string, KloppyEntity[]]> = categories ? Object.entries(categories) : defaultLists.filter(([, rows]) => rows.length > 0);
  return <div className="mt-5 space-y-5">
    {marketingDraft && <div className="rounded-xl border border-info/30 bg-info-wash p-4"><h3 className="font-semibold text-ink">Campaign draft for review</h3><pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-2">{JSON.stringify(marketingDraft, null, 2)}</pre></div>}
    {Boolean(data.grounding) && <p className="text-xs text-ink-3">Cultural grounding was fetched from Qloo before the draft was generated. Review all copy before publishing.</p>}
    <pre className="max-h-40 overflow-auto rounded-xl bg-surface-sunk p-4 text-xs leading-5 text-ink-2">{JSON.stringify(printable, null, 2)}</pre>
    {lists.map(([label, rows]) => <div key={label}><h3 className="mb-2 text-sm font-semibold text-ink">{label}</h3><div className="space-y-2">{rows.slice(0, 10).map((row, index) => <div key={`${row.id ?? row.name}-${index}`} className="rounded-xl border border-rule p-3"><div className="flex items-baseline justify-between gap-3"><span className="font-medium text-ink">{index + 1}. {row.name}</span>{row.score != null && <span className="text-xs text-info">{row.score}</span>}</div><p className="mt-1 text-xs text-ink-3">{row.tags?.slice(0, 4).join(" · ") || row.description || row.type}</p></div>)}</div></div>)}
    {entities.length > 0 && <button className="text-sm font-medium text-info underline underline-offset-4" onClick={() => onSave(entities)}>{snapshotCount ? `${snapshotCount} candidates saved for offline ranking` : "Save these candidates for offline ranking"}</button>}
  </div>;
}
