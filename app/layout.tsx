import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "KABUR18",
  description: "TACTICAL AIRFORCE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <body
        className={`antialiased`}
      >
        <div className="min-h-screen items-center justify-center font-sans bg-linear-to-br from-zinc-950 via-neutral-900 to-zinc-950">
          <Header showStats={true} isLoading={false} />
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
