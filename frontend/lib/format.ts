const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function money(amount: number) {
  return usd.format(amount);
}

export function moneyWhole(amount: number) {
  return usd.format(amount).replace(/\.00$/, "");
}

/** "4h 12m", "38m", "2m 05s" style remaining-time label. */
export function remaining(seconds: number) {
  if (seconds <= 0) return "Expired";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m >= 10) return `${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ---- API values to display text. Fixed locale and UTC so server and browser agree.

const dayDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const hourMinute = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

/** "Thu, Oct 15" */
export const formatDay = (iso: string) => dayDate.format(new Date(iso));
/** "Oct 15" */
export const formatMonthDay = (iso: string) => monthDay.format(new Date(iso));
/** "Mar 2026" */
export const formatMonthYear = (iso: string) => monthYear.format(new Date(iso));
/** "10:58" */
export const formatTime = (iso: string) => hourMinute.format(new Date(iso));
/** "Oct 14, 11:07" */
export const formatStamp = (iso: string) => `${formatMonthDay(iso)}, ${formatTime(iso)}`;

/** "1,320" */
export const count = (n: number) => n.toLocaleString("en-US");

/** Platform-measured reply time, in words. */
export function replyTime(seconds: number | null) {
  if (seconds === null) return "Too new to say how fast it replies";
  if (seconds < 60) return "Replies in under a minute";
  if (seconds < 3600) return `Replies in about ${Math.round(seconds / 60)} minutes`;
  return "Replies within the day";
}
