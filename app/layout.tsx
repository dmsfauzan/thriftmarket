import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeScript } from "@/components/theme-script";

export const metadata: Metadata = { title: "ThriftMarket — Ship Amazing Thrift Finds", description: "Marketplace thrifting ala Metronic SaaS" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className="bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
          <Providers>
            <SiteChrome>{children}</SiteChrome>
          </Providers>
        </div>
      </body>
    </html>
  );
}
