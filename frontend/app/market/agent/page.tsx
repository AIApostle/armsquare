import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My assistant",
};

export default function AgentPage() {
  redirect("/market/account/assistant");
}
