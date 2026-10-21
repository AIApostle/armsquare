import type { Metadata } from "next";
import { Board } from "@/components/switchboard/board";

export const metadata: Metadata = {
  title: "Deals",
};

export default function LinesPage() {
  return <Board />;
}
