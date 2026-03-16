"use client";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useWatchContractEvent,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { POLLIS_ADDRESS, POLLIS_ABI } from "@/lib/contract";
import { useState } from "react";
import styles from "../styles/poll.module.css";
import Link from "next/link";

type Poll = {
  pollID: bigint;
  question: string;
  votesYes: bigint;
  votesNo: bigint;
  creator: string;
  endsAt: bigint;
  isUnlisted: boolean;
};

function formatTimeLeft(endsAt: number): string {
  const diff = endsAt - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "now";
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return `in ${Math.floor(diff / 86400)}d`;
}

export default function PollView({ id }: { id: string }) {
  const pollId = BigInt(id);
  const { address } = useAccount();
  const [pendingVote, setPendingVote] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  const {
    data: pollRaw,
    isLoading,
    isError,
  } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "getPoll",
    args: [pollId],
  });

  const { data: hasVoted } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "hasVoted",
    args: address ? [pollId, address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error: voteError,
  } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Refresh poll data in real time via events
  useWatchContractEvent({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    eventName: "Vote",
    onLogs: () => queryClient.invalidateQueries(),
  });

  const poll = pollRaw as Poll | undefined;
  const voted = hasVoted as boolean | undefined;
  const isLoadingVote = isPending || isConfirming;

  const handleVote = (voteYes: boolean) => {
    if (isLoadingVote) return;
    setPendingVote(voteYes);
    writeContract({
      abi: POLLIS_ABI,
      address: POLLIS_ADDRESS,
      functionName: "vote",
      args: [pollId, voteYes],
    });
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonPoll}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonBar} />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !poll) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.error}>Poll not found.</p>
          <Link href="/" className={styles.back}>
            ← All polls
          </Link>
        </div>
      </main>
    );
  }

  const total = Number(poll.votesYes) + Number(poll.votesNo);
  const yesPercent =
    total > 0 ? Math.round((Number(poll.votesYes) / total) * 100) : 50;
  const noPercent = total > 0 ? 100 - yesPercent : 50;
  const isEnded = Date.now() > Number(poll.endsAt) * 1000;
  const timeLeft = !isEnded ? formatTimeLeft(Number(poll.endsAt)) : null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.meta}>
          <span
            className={`${styles.status} ${
              isEnded ? styles.statusEnded : styles.statusActive
            }`}
          >
            {isEnded ? "Ended" : `Ends ${timeLeft}`}
          </span>
          {poll.isUnlisted && (
            <span className={styles.unlistedBadge}>🔒 Unlisted</span>
          )}
          <span className={styles.pollId}>#{Number(poll.pollID) + 1}</span>
        </div>

        <h1 className={styles.question}>{poll.question}</h1>

        <div
          className={styles.bar}
          role="img"
          aria-label={`${yesPercent}% Yes, ${noPercent}% No`}
        >
          <div className={styles.barYes} style={{ width: `${yesPercent}%` }} />
          <div className={styles.barNo} style={{ width: `${noPercent}%` }} />
        </div>

        <div className={styles.stats}>
          <span className={styles.statYes} aria-live="polite">
            {poll.votesYes.toString()} Yes ({yesPercent}%)
          </span>
          <span className={styles.statNo} aria-live="polite">
            {poll.votesNo.toString()} No ({noPercent}%)
          </span>
        </div>

        {!isEnded && !voted && (
          <div className={styles.actions}>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnYes}`}
              onClick={() => handleVote(true)}
              disabled={isLoadingVote}
              aria-label="Vote yes on this poll"
              aria-busy={isLoadingVote}
            >
              {isLoadingVote && pendingVote === true
                ? "Confirming…"
                : "Vote Yes"}
            </button>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnNo}`}
              onClick={() => handleVote(false)}
              disabled={isLoadingVote}
              aria-label="Vote no on this poll"
              aria-busy={isLoadingVote}
            >
              {isLoadingVote && pendingVote === false
                ? "Confirming…"
                : "Vote No"}
            </button>
          </div>
        )}

        {voteError && (
          <p className={styles.errorMsg} role="alert">
            {voteError.message.split("\n")[0]}
          </p>
        )}

        {voted && <p className={styles.votedMsg}>✓ You voted on this poll</p>}
        {isEnded && <p className={styles.endedMsg}>This poll has ended</p>}

        <Link href="/" className={styles.back}>
          ← All polls
        </Link>
      </div>
    </main>
  );
}
