import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Pollis",
  projectId: "f4edbd3beda85831ad555cde68eb0113",
  chains: [hardhat],
});
