import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Pollis", function () {
  it("Should create a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");

    await pollis.createPoll("Ist Hardhat cool?", 86400n); // 1 Tag

    const count = await pollis.getPollCount();
    expect(count).to.equal(1n);
  });

  it("Should vote on a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");

    await pollis.createPoll("Ist Web3 cool?", 86400n);
    await pollis.vote(0n, true);

    const poll = await pollis.getPoll(0n);
    expect(poll.votesYes).to.equal(1n);
  });

  it("Should accept only one vote on a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");

    await pollis.createPoll("Ist Web2 uncool?", 86400n);
    await pollis.vote(0n, true);

    await expect(pollis.vote(0n, true)).to.be.revertedWith(
      "You can only vote once!",
    );
  });

  it("Should fail because poll ended", async function () {
    const pollis = await ethers.deployContract("Pollis");

    await pollis.createPoll("Versteh ich was ich hier mache?", 0n);

    await expect(pollis.vote(0n, true)).to.be.revertedWith("Poll has ended!");
  });
});
