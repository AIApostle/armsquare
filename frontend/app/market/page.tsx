import type { Metadata } from "next";
import { ShopperAssistant } from "@/components/market/shopper-assistant";

export const metadata: Metadata = {
  title: "Ask",
};

export default function MarketPage() {
  return <ShopperAssistant />;
}
