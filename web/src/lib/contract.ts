import PollisArtifact from "../../../artifacts/contracts/Pollis.sol/Pollis.json";
import { Abi } from "viem";

export const POLLIS_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
) as `0x${string}`;

export const POLLIS_ABI = PollisArtifact.abi as Abi;
