import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, sepolia, mainnet } from "wagmi/chains";
import { http, webSocket } from "wagmi";

export const config = getDefaultConfig({
  appName: "Pollis",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [hardhat, sepolia, mainnet],
  transports: {
    [hardhat.id]: webSocket("ws://127.0.0.1:8545"),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
