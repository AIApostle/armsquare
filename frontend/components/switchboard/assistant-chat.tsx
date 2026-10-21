"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, Send } from "lucide-react";
import { businessApi, type BusinessStore } from "@/lib/api/business";
import { ErrorNotice } from "@/components/ui/notice";

type ChatEntry = {
  id: string;
  role: "owner" | "assistant";
  content: string;
};

type SocketStatus = "connecting" | "ready" | "disconnected" | "unavailable";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function socketUrl(): string {
  const url = new URL("/v1/agent/ws", API_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function textFrom(error: unknown): string {
  return error instanceof Error ? error.message : "Your shop could not be loaded.";
}

export function AssistantChat() {
  const [stores, setStores] = useState<BusinessStore[]>([]);
  const [storeId, setStoreId] = useState("");
  const [storeError, setStoreError] = useState<string | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const activeReplyId = useRef<string | null>(null);

  useEffect(() => {
    let live = true;
    businessApi
      .getStores()
      .then((result) => {
        if (!live) return;
        setStores(result);
        setStoreId(result[0]?.id ?? "");
      })
      .catch((cause: unknown) => {
        if (live) setStoreError(textFrom(cause));
      })
      .finally(() => {
        if (live) setLoadingStores(false);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const socket = new WebSocket(socketUrl());
    socketRef.current = socket;
    socket.onopen = () => setStatus("connecting");
    socket.onmessage = (event: MessageEvent<string>) => {
      let payload: { type?: string; code?: string; content?: string; message?: string };
      try {
        payload = JSON.parse(event.data) as typeof payload;
      } catch {
        setError("The assistant sent an unreadable response. Please reconnect and try again.");
        return;
      }

      if (payload.type === "ready") {
        setStatus("ready");
        setError(null);
      } else if (payload.type === "message.started") {
        const replyId = crypto.randomUUID();
        activeReplyId.current = replyId;
        setEntries((current) => [...current, { id: replyId, role: "assistant", content: "" }]);
      } else if (payload.type === "message.delta" && payload.content) {
        const replyId = activeReplyId.current;
        if (replyId) {
          setEntries((current) =>
            current.map((entry) =>
              entry.id === replyId ? { ...entry, content: entry.content + payload.content } : entry,
            ),
          );
        }
      } else if (payload.type === "message.completed") {
        activeReplyId.current = null;
        setSending(false);
      } else if (payload.type === "error") {
        setError(payload.message ?? "The assistant could not complete that request.");
        setSending(false);
        if (payload.code === "agent_unavailable" || payload.code === "agent_tools_unavailable") {
          setStatus("unavailable");
        }
      }
    };
    socket.onerror = () => {
      setStatus("disconnected");
      setSending(false);
    };
    socket.onclose = () => {
      socketRef.current = null;
      setStatus((current) => (current === "unavailable" ? current : "disconnected"));
      setSending(false);
    };
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const content = draft.trim();
      const socket = socketRef.current;
      const store = stores.find((item) => item.id === storeId);
      if (!content || !socket || socket.readyState !== WebSocket.OPEN || status !== "ready" || !store || sending) {
        return;
      }

      const prompt = `The selected shop is ${store.name} (shop id ${store.id}). Use that shop for any shop-specific tool call. The signed-in business member's access is checked by the server. Do not claim a product is published unless a tool confirms it. Owner request: ${content}`;
      if (new TextEncoder().encode(prompt).byteLength > 16_384) {
        setError("Please shorten your message and try again.");
        return;
      }

      setError(null);
      setEntries((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "owner", content },
      ]);
      socket.send(JSON.stringify({ type: "message", content: prompt }));
      setDraft("");
      setSending(true);
    },
    [draft, sending, status, storeId, stores],
  );

  const selectedStore = stores.find((store) => store.id === storeId);

  return (
    <section className="mt-8 overflow-hidden rounded-card border border-rule bg-surface shadow-card">
      <header className="flex flex-col gap-3 border-b border-rule p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-bold text-ink">Business assistant</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-2" aria-live="polite">
            <span
              aria-hidden
              className="size-2 rounded-full"
              data-tone={status === "ready" ? "assistant" : status === "unavailable" ? "stopped" : "waiting"}
            />
            {status === "ready"
              ? "Connected"
              : status === "connecting"
                ? "Connecting"
                : status === "unavailable"
                  ? "Not configured"
                  : "Connection lost"}
          </p>
        </div>
        {!loadingStores && stores.length > 1 && (
          <label className="text-sm font-medium text-ink-2">
            Shop
            <select
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              className="card mt-1 block h-10 w-full px-3 text-base text-ink sm:min-w-56"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <div
        className="flex min-h-80 flex-col gap-4 overflow-y-auto bg-panel/50 p-4 sm:max-h-[32rem] sm:p-6"
        aria-label="Conversation"
        aria-live="polite"
      >
        {loadingStores ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading your shop">
            <div className="h-14 w-3/4 animate-pulse rounded-inset bg-panel-raised" />
            <div className="ml-auto h-14 w-2/3 animate-pulse rounded-inset bg-info-wash" />
          </div>
        ) : storeError ? (
          <ErrorNotice>{storeError}</ErrorNotice>
        ) : !selectedStore ? (
          <div className="m-auto max-w-md py-10 text-center">
            <CircleAlert aria-hidden className="mx-auto size-8 text-info" />
            <p className="mt-3 font-bold text-ink">Create a shop first</p>
            <p className="mt-1 text-sm text-ink-2">
              Your assistant needs a shop to answer catalog questions and prepare product drafts.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="m-auto max-w-md py-10 text-center">
            <p className="font-bold text-ink">What would you like help with?</p>
            <p className="mt-1 text-sm text-ink-2">
              Ask about {selectedStore.name}&apos;s catalog or request a product draft. Your assistant cannot publish
              products or make purchases.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={
                entry.role === "owner"
                  ? "ml-auto max-w-[88%] rounded-[16px] bg-info-wash px-4 py-3 text-ink"
                  : "mr-auto max-w-[88%] rounded-[16px] border border-rule bg-surface px-4 py-3 text-ink"
              }
            >
              <p className="mb-1 text-xs font-bold text-ink-2">
                {entry.role === "owner" ? "You" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {entry.content || (sending && entry.role === "assistant" ? "Thinking..." : "")}
              </p>
            </article>
          ))
        )}
      </div>

      {error && (
        <div className="px-4 pt-4 sm:px-6">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <form onSubmit={send} className="border-t border-rule bg-surface p-4 sm:p-6">
        <label htmlFor="business-assistant-message" className="sr-only">
          Message your assistant
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="business-assistant-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={3500}
            rows={2}
            placeholder="Ask about your catalog or request a product draft"
            disabled={!selectedStore || status !== "ready" || sending}
            className="card min-h-12 flex-1 resize-y px-4 py-3 text-base text-ink placeholder:text-ink-3 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !selectedStore || status !== "ready" || sending}
            aria-label="Send message"
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-control bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send aria-hidden className="size-5" strokeWidth={2.25} />
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Responses are AI-generated. Check product details before publishing a draft.
        </p>
        {status !== "ready" && (
          <p className="mt-1 text-sm text-danger" role="status">
            {status === "connecting"
              ? "Connecting to the assistant..."
              : status === "unavailable"
                ? "The assistant service is not available. Contact your administrator."
                : "The assistant connection was lost. Reload this page to reconnect."}
          </p>
        )}
      </form>
    </section>
  );
}
