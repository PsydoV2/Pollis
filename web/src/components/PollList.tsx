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
import styles from "../styles/PollList.module.css";
import PollSkeleton from "./PollSkeleton";

const PAGE_SIZE = 10;

type Poll = {
  pollID: bigint;
  question: string;
  votesYes: bigint;
  votesNo: bigint;
  creator: string;
  endsAt: bigint;
  isUnlisted: boolean;
};

function PollCard({ poll, index }: { poll: Poll; index: number }) {
  const { address } = useAccount();
  const [pendingVote, setPendingVote] = useState<boolean | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: voteError,
  } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const { data: hasVoted } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "hasVoted",
    args: address ? [BigInt(index), address] : undefined,
    query: { enabled: !!address },
  });

  const total = Number(poll.votesYes) + Number(poll.votesNo);
  const yesPercent =
    total > 0 ? Math.round((Number(poll.votesYes) / total) * 100) : 50;
  const noPercent = total > 0 ? 100 - yesPercent : 50;

  const isEnded = Date.now() > Number(poll.endsAt) * 1000;
  const timeLeft = !isEnded ? formatTimeLeft(Number(poll.endsAt)) : null;
  const isLoading = isPending || isConfirming;
  const voted = hasVoted as boolean | undefined;

  const handleVote = (voteYes: boolean) => {
    if (isLoading) return;
    setPendingVote(voteYes);
    writeContract({
      abi: POLLIS_ABI,
      address: POLLIS_ADDRESS,
      functionName: "vote",
      args: [BigInt(index), voteYes],
    });
  };

  return (
    <article className={styles.card} aria-label={poll.question}>
      <div className={styles.cardHeader}>
        <span
          className={`${styles.status} ${
            isEnded ? styles.statusEnded : styles.statusActive
          }`}
        >
          {isEnded ? "Ended" : `Ends ${timeLeft}`}
        </span>
        <span className={styles.pollId}>#{index + 1}</span>
      </div>

      <h2 className={styles.question}>{poll.question}</h2>

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
            disabled={isLoading}
            aria-label="Vote yes on this poll"
            aria-busy={isLoading}
          >
            {isLoading && pendingVote === true ? "Confirming…" : "Vote Yes"}
          </button>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnNo}`}
            onClick={() => handleVote(false)}
            disabled={isLoading}
            aria-label="Vote no on this poll"
            aria-busy={isLoading}
          >
            {isLoading && pendingVote === false ? "Confirming…" : "Vote No"}
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
    </article>
  );
}

function formatTimeLeft(endsAt: number): string {
  const diff = endsAt - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "now";
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return `in ${Math.floor(diff / 86400)}d`;
}

export default function PollList() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: pollCount } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "getPollCount",
  });

  const count = Number(pollCount ?? 0n);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const from = Math.max(0, count - (page + 1) * PAGE_SIZE);
  const batchSize = Math.min(PAGE_SIZE, count - page * PAGE_SIZE);

  const { data: batchRaw } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "getPollsBatch",
    args: [BigInt(from), BigInt(Math.max(0, batchSize))],
    query: { enabled: count > 0 },
  });

  // Invalidate all queries on new polls or votes — WebSocket on hardhat,
  // fallback polling on other networks (handled by wagmi transport config)
  useWatchContractEvent({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    eventName: "PollCreated",
    onLogs: () => queryClient.invalidateQueries(),
  });

  useWatchContractEvent({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    eventName: "Vote",
    onLogs: () => queryClient.invalidateQueries(),
  });

  const publicPolls = ((batchRaw as Poll[] | undefined) ?? [])
    .filter((p) => !p.isUnlisted)
    .reverse();

  // Still loading initial data — show skeletons
  if (pollCount === undefined) {
    return (
      <div className={styles.list}>
        {[0, 1, 2].map((i) => (
          <PollSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (count === 0 || publicPolls.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No polls yet</p>
        <p className={styles.emptyText}>Create the first one →</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <div className={styles.sectionLabel}>
        {count} poll{count !== 1 ? "s" : ""}
      </div>

      {publicPolls.map((poll) => {
        const realIndex = Number(poll.pollID);
        return <PollCard key={realIndex} poll={poll} index={realIndex} />;
      })}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className={styles.pageInfo} aria-live="polite">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
