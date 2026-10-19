import type { Metadata } from "next";
import { Board } from "@/components/switchboard/board";

export const metadata: Metadata = {
  title: "Lines",
};

export default function LinesPage() {
  return <Board />;
}
