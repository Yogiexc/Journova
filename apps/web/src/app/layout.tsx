import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Journova",
    default: "Journova Press - Modern Scientific Publishing",
  },
  description: "An open-access editorial platform dedicated to the rapid dissemination of high-quality, peer-reviewed research.",
  keywords: ["Journal", "Research", "Open Access", "Scientific Publishing", "Peer Review"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
