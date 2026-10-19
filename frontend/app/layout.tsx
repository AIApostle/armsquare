import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// One typeface for the whole site, numbers included.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "armsquare",
    template: "%s · armsquare",
  },
  description:
    "Your assistant finds shops, gets prices and haggles for you, and asks before it spends more than you allow.",
};

// Applies a saved theme before first paint; without one, the OS preference wins via CSS.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
