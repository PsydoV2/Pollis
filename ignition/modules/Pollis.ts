import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PollisModule", (m) => {
  const pollis = m.contract("Pollis");
  return { pollis };
});
