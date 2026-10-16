import type { Metadata } from "next";
import { business, ourAgent } from "@/lib/demo-data";
import { arrivals, closedToday, lines } from "@/lib/lines";
import { Board } from "@/components/switchboard/board";

export const metadata: Metadata = {
  title: "Lines",
};

export default function LinesPage() {
  return (
    <Board
      lines={lines}
      arrivals={arrivals}
      home={ourAgent}
      homeNote={`Acting for ${business.name}`}
      ownerInitials={business.owner.initials}
      closedCount={closedToday.length}
    />
  );
}
