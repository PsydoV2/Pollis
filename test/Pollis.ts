import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

describe("Pollis", function () {
  // ── createPoll ─────────────────────────────────────────────────────────────

  it("Should create a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Ist Hardhat cool?", 86400n, false);
    expect(await pollis.getPollCount()).to.equal(1n);
  });

  it("Should increment pollCount for each poll", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Frage 1", 3600n, false);
    await pollis.createPoll("Frage 2", 3600n, false);
    await pollis.createPoll("Frage 3", 3600n, false);
    expect(await pollis.getPollCount()).to.equal(3n);
  });

  it("Should store isUnlisted flag correctly", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Unlisted poll", 3600n, true);
    const poll = await pollis.getPoll(0n);
    expect(poll.isUnlisted).to.equal(true);
  });

  it("Should emit PollCreated event with correct args", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const [owner] = await ethers.getSigners();
    await expect(pollis.createPoll("Event test", 3600n, true))
      .to.emit(pollis, "PollCreated")
      .withArgs(0n, owner.address, true);
  });

  it("Should revert on empty question", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await expect(pollis.createPoll("", 86400n, false)).to.be.revertedWith(
      "Question cannot be empty",
    );
  });

  it("Should revert when question exceeds 200 characters", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const longQuestion = "a".repeat(201);
    await expect(
      pollis.createPoll(longQuestion, 86400n, false),
    ).to.be.revertedWith("Question too long");
  });

  it("Should accept question of exactly 200 characters", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const maxQuestion = "a".repeat(200);
    await pollis.createPoll(maxQuestion, 3600n, false);
    expect(await pollis.getPollCount()).to.equal(1n);
  });

  it("Should revert when duration is less than 1 hour", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await expect(
      pollis.createPoll("Zu kurz?", 3599n, false),
    ).to.be.revertedWith("Minimum duration is 1 hour");
  });

  it("Should revert when duration exceeds 30 days", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await expect(
      pollis.createPoll("Zu lang?", 2592001n, false),
    ).to.be.revertedWith("Maximum duration is 30 days");
  });

  // ── vote ───────────────────────────────────────────────────────────────────

  it("Should vote yes on a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Ist Web3 cool?", 86400n, false);
    await pollis.vote(0n, true);
    const poll = await pollis.getPoll(0n);
    expect(poll.votesYes).to.equal(1n);
    expect(poll.votesNo).to.equal(0n);
  });

  it("Should vote no on a poll", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Ist Web2 uncool?", 86400n, false);
    await pollis.vote(0n, false);
    const poll = await pollis.getPoll(0n);
    expect(poll.votesNo).to.equal(1n);
    expect(poll.votesYes).to.equal(0n);
  });

  it("Should set hasVoted to true after voting", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const [owner] = await ethers.getSigners();
    await pollis.createPoll("Hat man abgestimmt?", 86400n, false);
    await pollis.vote(0n, true);
    expect(await pollis.hasVoted(0n, owner.address)).to.equal(true);
  });

  it("Should allow two different accounts to vote", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const [, addr1, addr2] = await ethers.getSigners();
    await pollis.createPoll("Mehrere Stimmen?", 86400n, false);
    await pollis.connect(addr1).vote(0n, true);
    await pollis.connect(addr2).vote(0n, false);
    const poll = await pollis.getPoll(0n);
    expect(poll.votesYes).to.equal(1n);
    expect(poll.votesNo).to.equal(1n);
  });

  it("Should accept only one vote per wallet", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Ist Web2 uncool?", 86400n, false);
    await pollis.vote(0n, true);
    await expect(pollis.vote(0n, true)).to.be.revertedWith(
      "You can only vote once!",
    );
  });

  it("Should revert vote on nonexistent poll", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await expect(pollis.vote(99n, true)).to.be.revertedWith(
      "Poll does not exist!",
    );
  });

  it("Should emit Vote event with correct args", async function () {
    const pollis = await ethers.deployContract("Pollis");
    const [owner] = await ethers.getSigners();
    await pollis.createPoll("Vote event test", 3600n, false);
    await expect(pollis.vote(0n, true))
      .to.emit(pollis, "Vote")
      .withArgs(0n, owner.address, true);
  });

  it("Should fail because poll ended", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Versteh ich was ich hier mache?", 3600n, false);
    await increaseTime(3601);
    await expect(pollis.vote(0n, true)).to.be.revertedWith("Poll has ended!");
  });

  // ── getPoll / getPollsBatch ────────────────────────────────────────────────

  it("Should revert getPoll on out-of-range ID", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await expect(pollis.getPoll(0n)).to.be.revertedWith("Poll does not exist!");
  });

  it("Should return correct batch of polls", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Poll A", 3600n, false);
    await pollis.createPoll("Poll B", 3600n, false);
    await pollis.createPoll("Poll C", 3600n, false);
    const batch = await pollis.getPollsBatch(0n, 2n);
    expect(batch.length).to.equal(2);
    expect(batch[0].question).to.equal("Poll A");
    expect(batch[1].question).to.equal("Poll B");
  });

  it("Should clamp batch end when requesting more polls than exist", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Poll A", 3600n, false);
    await pollis.createPoll("Poll B", 3600n, false);
    const batch = await pollis.getPollsBatch(0n, 100n);
    expect(batch.length).to.equal(2);
  });

  it("getPollsBatch returns empty array when from equals pollCount", async function () {
    const pollis = await ethers.deployContract("Pollis");
    await pollis.createPoll("Poll A", 3600n, false);
    const batch = await pollis.getPollsBatch(1n, 10n);
    expect(batch.length).to.equal(0);
  });
});
