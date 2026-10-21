import type { Metadata } from "next";
import { AssistantChat } from "@/components/switchboard/assistant-chat";

export const metadata: Metadata = {
  title: "Assistant",
};

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Your assistant</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        Ask about your catalog or have it prepare a product draft. You review drafts before they appear in your shop.
      </p>
      <AssistantChat />
    </div>
  );
}
