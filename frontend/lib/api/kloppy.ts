const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type KloppyEntity = {
  id?: string;
  name: string;
  type?: string;
  description?: string | null;
  tags?: string[];
  properties?: Record<string, unknown>;
  score?: number | string | null;
};

export type KloppyDocument = {
  id: string;
  account_id: string;
  project_id: string;
  title: string;
  document: {
    kind?: string;
    brief?: Record<string, string>;
    draft?: Record<string, unknown>;
    qloo_context?: Record<string, unknown>;
    sources?: Record<string, string>;
  };
  docx_path?: string | null;
  created_at: string;
  updated_at: string;
};

export async function kloppyRequest<T>(path: string, body: unknown): Promise<T> {
  return request<T>(`/v1/kloppy/${path}`, { method: "POST", body: JSON.stringify(body) });
}

export async function kloppyGet<T>(path: string): Promise<T> {
  return request<T>(`/v1/kloppy/${path}`, { method: "GET" });
}

export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(`/v1/auth/${path}`, { method: body ? "POST" : "GET", ...(body ? { body: JSON.stringify(body) } : {}) });
}

export async function downloadKloppyDocument(documentId: string, title: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/v1/kloppy/documents/${documentId}/download`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("Kloppy could not reach the backend. Check that the API is running.");
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail ?? `Word document download failed (${response.status}).`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${title.trim().replace(/[\\/:*?"<>|]/g, "-").slice(0, 120) || "kloppy-campaign"}.docx`;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error("Kloppy could not reach the backend. Check that the API is running.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail ?? `Request failed (${response.status}).`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return payload as T;
}

/** Rank downloaded Qloo-grounded candidates without sending preferences over the network. */
export function rankSnapshot(candidates: KloppyEntity[], preferences: string[]) {
  const terms = preferences.map((value) => value.toLocaleLowerCase()).filter(Boolean);
  return [...candidates].sort((a, b) => score(b, terms) - score(a, terms));
}

function score(entity: KloppyEntity, preferences: string[]) {
  const text = [entity.name, entity.description ?? "", ...(entity.tags ?? [])].join(" ").toLocaleLowerCase();
  const matches = preferences.reduce((total, preference) => total + (text.includes(preference) ? 1 : 0), 0);
  const popularity = Number(entity.properties?.popularity ?? 0);
  return matches * 10 + (Number.isFinite(popularity) ? popularity : 0);
}
