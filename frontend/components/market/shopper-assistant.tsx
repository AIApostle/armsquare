"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type AgentEvent =
  | { type: "ready"; role: string }
  | { type: "message.started" }
  | { type: "message.delta"; content: string }
  | { type: "message.completed" }
  | { type: "error"; code?: string; message?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function agentSocketUrl(): string {
  const url = new URL("/v1/agent/ws", API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function parseAgentEvent(value: unknown): AgentEvent | null {
  if (typeof value !== "object" || value === null || !("type" in value)) return null;

  if (value.type === "ready" && "role" in value && typeof value.role === "string") {
    return { type: "ready", role: value.role };
  }
  if (value.type === "message.started" || value.type === "message.completed") {
    return { type: value.type };
  }
  if (
    value.type === "message.delta" &&
    "content" in value &&
    typeof value.content === "string"
  ) {
    return { type: "message.delta", content: value.content };
  }
  if (value.type === "error") {
    return {
      type: "error",
      code: "code" in value && typeof value.code === "string" ? value.code : undefined,
      message:
        "message" in value && typeof value.message === "string" ? value.message : undefined,
    };
  }
  return null;
}

export function ShopperAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingMessage = useRef<string | null>(null);
  const nextId = useRef(0);
  const conversationEndRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    return () => socketRef.current?.close(1000, "Page closed.");
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || busy) return;
    setInput("");
    setError(null);
    setNeedsSignIn(false);
    setBusy(true);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", content },
    ]);

    const existing = socketRef.current;
    if (existing?.readyState === WebSocket.OPEN) {
      existing.send(JSON.stringify({ type: "message", content }));
      return;
    }
    if (existing?.readyState === WebSocket.CONNECTING) {
      setError("Connecting to your assistant. Please try again in a moment.");
      setBusy(false);
      return;
    }

    pendingMessage.current = content;
    const socket = new WebSocket(agentSocketUrl());
    socketRef.current = socket;
    socket.onopen = () => setConnected(true);
    socket.onmessage = (message) => {
      let agentEvent: AgentEvent;
      try {
        const parsed = parseAgentEvent(JSON.parse(message.data) as unknown);
        if (!parsed) throw new Error("Invalid agent event.");
        agentEvent = parsed;
      } catch {
        setError("Your assistant sent an unreadable response. Please try again.");
        setBusy(false);
        return;
      }

      if (agentEvent.type === "ready") {
        setConnected(true);
        const firstMessage = pendingMessage.current;
        pendingMessage.current = null;
        if (firstMessage) {
          socket.send(JSON.stringify({ type: "message", content: firstMessage }));
        }
      } else if (agentEvent.type === "message.started") {
        setMessages((current) => [
          ...current,
          { id: nextId.current++, role: "assistant", content: "" },
        ]);
      } else if (agentEvent.type === "message.delta") {
        setMessages((current) => {
          const last = current.at(-1);
          if (!last || last.role !== "assistant") return current;
          return [...current.slice(0, -1), { ...last, content: last.content + agentEvent.content }];
        });
      } else if (agentEvent.type === "message.completed") {
        setBusy(false);
      } else if (agentEvent.type === "error") {
        setError(agentEvent.message || "Your assistant couldn't complete that request.");
        setBusy(false);
      }
    };
    socket.onerror = () => {
      setError("We couldn't reach your assistant. Check your connection and try again.");
      setBusy(false);
    };
    socket.onclose = (event) => {
      setConnected(false);
      if (event.code === 4401) {
        setNeedsSignIn(true);
        setError("Sign in to use your shopping assistant.");
      }
      if (pendingMessage.current) {
        pendingMessage.current = null;
        setBusy(false);
        setError("Your assistant couldn't connect. Check your sign-in and try again.");
      }
    };
  }

  return (
    <section
      aria-labelledby="shopper-assistant-heading"
      className="mx-auto flex min-h-[calc(100dvh-14rem)] w-full max-w-4xl flex-1 flex-col md:min-h-[calc(100dvh-10rem)]"
    >
      <h1 id="shopper-assistant-heading" className="text-lg font-semibold text-ink">
        Ask
      </h1>
      <ol
        aria-label="Conversation with your shopping assistant"
        aria-live="polite"
        className="flex flex-1 flex-col gap-6 overflow-y-auto py-6"
      >
        {messages.length === 0 ? (
          <li className="m-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What can I help you find?
            </h2>
          </li>
        ) : (
          messages.map((message) => (
            <li
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[90%] whitespace-pre-wrap rounded-card px-4 py-3 text-base leading-relaxed sm:max-w-[80%] ${
                  message.role === "user"
                    ? "bg-info-wash text-ink"
                    : "text-ink"
                }`}
              >
                {message.content || (busy ? "Searching published shops..." : "No response returned.")}
              </p>
            </li>
          ))
        )}
        <li ref={conversationEndRef} aria-hidden="true" />
      </ol>

      {error && (
        <div role="alert" className="mb-3 rounded-control bg-danger-wash px-4 py-3 text-sm text-danger">
          <p>{error}</p>
          {needsSignIn && (
            <Link
              href="/auth/user/login?next=/market"
              className="mt-2 inline-block font-semibold underline underline-offset-2"
            >
              Sign in
            </Link>
          )}
        </div>
      )}

      <form onSubmit={send} className="rounded-card border border-rule bg-panel px-3 py-3 shadow-sm sm:px-4">
        <label htmlFor="shopper-assistant-input" className="sr-only">
          Message your shopping assistant
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="shopper-assistant-input"
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 4000))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder="Message armsquare"
            className="min-h-11 min-w-0 flex-1 resize-y bg-transparent px-2 py-2.5 text-base text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={busy ? "Waiting for assistant" : "Send message"}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-primary text-on-primary transition-colors hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send aria-hidden className="size-4" />
          </button>
        </div>
        <p className="mt-2 px-2 text-xs text-ink-3" aria-live="polite">
          {connected
            ? "Results show listing details, not confirmed stock or purchase offers."
            : "Searches published Armsquare listings. It cannot place orders or make purchases yet."}
        </p>
      </form>
    </section>
  );
}
