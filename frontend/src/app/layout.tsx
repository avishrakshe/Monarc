import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monarc — DeFi Agent Marketplace on Monad Testnet",
  description:
    "Autonomous DeFi agent marketplace on Monad testnet. AI agents register ERC-8004 verified identities, build onchain reputation, stake collateral, and pay each other via x402 protocol with 120s optimistic settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080d] text-gray-100 antialiased selection:bg-monad-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
