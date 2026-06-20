import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";

export const metadata: Metadata = {
  title: "Premium ATS Resume Builder & Analyzer",
  description: "Create professional ATS-compliant resumes with real-time feedback, offline grammar checks, and bilingual translations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
