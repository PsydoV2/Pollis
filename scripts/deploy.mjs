#!/usr/bin/env node
// Auto-deploy script: deploys Pollis contract and updates web/.env.local
// Usage:
//   node scripts/deploy.mjs                    (deploys to hardhatMainnet)
//   node scripts/deploy.mjs --network sepolia  (deploys to Sepolia)
//   node scripts/deploy.mjs --network mainnet  (deploys to mainnet)

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Parse --network argument
const networkArgIdx = process.argv.indexOf("--network");
const network =
  networkArgIdx !== -1 ? process.argv[networkArgIdx + 1] : "hardhatMainnet";

console.log(`\n Deploying Pollis to network: ${network}\n`);

// Run Hardhat Ignition deployment
execSync(
  `npx hardhat ignition deploy ignition/modules/Pollis.ts --network ${network} --reset`,
  { stdio: "inherit", cwd: ROOT },
);

// Find the deployed_addresses.json — pick the most recently modified chain-* folder
const deploymentsDir = join(ROOT, "ignition", "deployments");

if (!existsSync(deploymentsDir) || readdirSync(deploymentsDir).length === 0) {
  console.error("No deployment found in ignition/deployments/");
  process.exit(1);
}

const chainDir = readdirSync(deploymentsDir)
  .filter((d) => d.startsWith("chain-"))
  .sort()
  .at(-1);

const addressesFile = join(deploymentsDir, chainDir, "deployed_addresses.json");

if (!existsSync(addressesFile)) {
  console.error(`deployed_addresses.json not found at: ${addressesFile}`);
  process.exit(1);
}

const addresses = JSON.parse(readFileSync(addressesFile, "utf-8"));
const contractAddress = addresses["PollisModule#Pollis"];

if (!contractAddress) {
  console.error("PollisModule#Pollis not found in deployed_addresses.json");
  console.error("Keys found:", Object.keys(addresses).join(", "));
  process.exit(1);
}

// Update web/.env.local
const envPath = join(ROOT, "web", ".env.local");
let envContent = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";

if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
  envContent = envContent.replace(
    /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`,
  );
} else {
  envContent =
    envContent.trimEnd() +
    `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
}

writeFileSync(envPath, envContent, "utf-8");

console.log(`\n Contract deployed at:  ${contractAddress}`);
console.log(` Updated web/.env.local\n`);
