import type { Metadata } from "next";
import "../styles/globals.css";
import Web3Provider from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "Pollis — Decentralized Polling",
  description:
    "Create polls, vote with your wallet. Results are final, transparent, and permanent on the Ethereum blockchain.",
  keywords: ["polling", "web3", "ethereum", "blockchain", "decentralized"],
  authors: [{ name: "PsydoV2", url: "https://github.com/PsydoV2" }],
  openGraph: {
    title: "Pollis — Decentralized Polling",
    description:
      "Create polls, vote with your wallet. Results are final, transparent, and permanent.",
    url: "https://github.com/PsydoV2/Pollis",
    siteName: "Pollis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
