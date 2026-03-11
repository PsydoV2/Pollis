"use client";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { POLLIS_ADDRESS, POLLIS_ABI } from "@/lib/contract";
import { useState } from "react";
import styles from "../styles/PollList.module.css";

type Poll = {
  pollID: bigint;
  question: string;
  votesYes: bigint;
  votesNo: bigint;
  creator: string;
  endsAt: bigint;
  isPrivate: boolean;
};

function PollCard({ poll, index }: { poll: Poll; index: number }) {
  const { address } = useAccount();
  const [pendingVote, setPendingVote] = useState<boolean | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const { data: hasVoted } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "hasVoted",
    args: address ? [BigInt(index), address] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
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
    setPendingVote(voteYes);
    writeContract({
      abi: POLLIS_ABI,
      address: POLLIS_ADDRESS,
      functionName: "vote",
      args: [BigInt(index), voteYes],
    });
  };

  return (
    <article className={styles.card}>
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

      <div className={styles.bar}>
        <div className={styles.barYes} style={{ width: `${yesPercent}%` }} />
        <div className={styles.barNo} style={{ width: `${noPercent}%` }} />
      </div>

      <div className={styles.stats}>
        <span className={styles.statYes}>
          {poll.votesYes.toString()} Yes ({yesPercent}%)
        </span>
        <span className={styles.statNo}>
          {poll.votesNo.toString()} No ({noPercent}%)
        </span>
      </div>

      {!isEnded && !voted && (
        <div className={styles.actions}>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnYes}`}
            onClick={() => handleVote(true)}
            disabled={isLoading}
          >
            {isLoading && pendingVote === true ? "Confirming…" : "Vote Yes"}
          </button>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnNo}`}
            onClick={() => handleVote(false)}
            disabled={isLoading}
          >
            {isLoading && pendingVote === false ? "Confirming…" : "Vote No"}
          </button>
        </div>
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
  const { data: pollCount } = useReadContract({
    address: POLLIS_ADDRESS,
    abi: POLLIS_ABI,
    functionName: "getPollCount",
    query: { refetchInterval: 3000 },
  });

  const pollIds = pollCount
    ? Array.from({ length: Number(pollCount) }, (_, i) => i)
    : [];

  const { data: polls } = useReadContracts({
    contracts: pollIds.map((id) => ({
      address: POLLIS_ADDRESS,
      abi: POLLIS_ABI,
      functionName: "getPoll",
      args: [BigInt(id)],
    })),
    query: { refetchInterval: 3000 },
  });

  // Filter out private polls
  const publicPolls = polls?.filter((poll) => {
    const data = poll.result as Poll | undefined;
    return data && !data.isPrivate;
  });

  if (!pollCount || Number(pollCount) === 0 || publicPolls?.length === 0) {
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
        {publicPolls?.length} public poll{publicPolls?.length !== 1 ? "s" : ""}
      </div>
      {[...(publicPolls ?? [])].reverse().map((poll) => {
        const data = poll.result as Poll | undefined;
        if (!data) return null;
        const realIndex = Number(data.pollID);
        return <PollCard key={realIndex} poll={data} index={realIndex} />;
      })}
    </div>
  );
}
