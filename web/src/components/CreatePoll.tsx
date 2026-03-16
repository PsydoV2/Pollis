"use client";
import { POLLIS_ADDRESS, POLLIS_ABI } from "@/lib/contract";
import { useMemo, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, type AbiEvent } from "viem";
import styles from "../styles/CreatePoll.module.css";

const DURATION_OPTIONS = [
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "1 week", value: 604800 },
];

const POLL_CREATED_EVENT = POLLIS_ABI.find(
  (x) => "name" in x && x.name === "PollCreated",
) as AbiEvent | undefined;

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState(86400);
  const [isUnlisted, setIsUnlisted] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const handleCreate = () => {
    if (!question.trim()) return;
    writeContract({
      abi: POLLIS_ABI,
      address: POLLIS_ADDRESS,
      functionName: "createPoll",
      args: [question, BigInt(duration), isUnlisted],
    });
  };

  const createdPollId = useMemo(() => {
    if (!receipt || !POLL_CREATED_EVENT) return null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: [POLL_CREATED_EVENT],
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "PollCreated") {
          const args = decoded.args as { pollID: bigint };
          return Number(args.pollID);
        }
      } catch {
        // log belongs to a different event, skip
      }
    }
    return null;
  }, [receipt]);

  const isLoading = isPending || isConfirming;
  const pollUrl =
    typeof window !== "undefined" && createdPollId !== null
      ? `${window.location.origin}/?poll=${createdPollId}`
      : null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pollUrl) return;
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const txError = writeError ?? receiptError;

  return (
    <div className={styles.container}>
      <div className={styles.sectionLabel}>New poll</div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="poll-question">
          Question
        </label>
        <textarea
          id="poll-question"
          className={styles.textarea}
          placeholder="What do you want to ask?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={200}
        />
        <span className={styles.charCount}>{question.length}/200</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Duration</label>
        <div className={styles.durationGrid}>
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.durationBtn} ${
                duration === opt.value ? styles.durationActive : ""
              }`}
              onClick={() => setDuration(opt.value)}
              type="button"
              aria-pressed={duration === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${
            isUnlisted ? styles.toggleActive : ""
          }`}
          onClick={() => setIsUnlisted(!isUnlisted)}
          aria-pressed={isUnlisted}
          aria-label={
            isUnlisted
              ? "Switch to public poll"
              : "Switch to unlisted poll"
          }
        >
          <span className={styles.toggleIcon}>
            {isUnlisted ? "🔒" : "🌐"}
          </span>
          <span className={styles.toggleText}>
            {isUnlisted
              ? "Unlisted — only people with the link can see this"
              : "Public — visible to everyone"}
          </span>
        </button>
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleCreate}
        disabled={isLoading || !question.trim()}
        aria-busy={isLoading}
      >
        {isPending
          ? "Confirm in wallet…"
          : isConfirming
          ? "Creating…"
          : "Create poll"}
      </button>

      {txError && (
        <p className={styles.errorMsg} role="alert">
          {txError.message.split("\n")[0]}
        </p>
      )}

      {isSuccess && createdPollId !== null && (
        <div className={styles.successBox}>
          <p className={styles.successMsg}>✓ Poll created</p>
          {isUnlisted && pollUrl && (
            <div className={styles.linkBox}>
              <p className={styles.linkLabel}>Share this link:</p>
              <div className={styles.linkRow}>
                <code className={styles.linkCode}>{pollUrl}</code>
                <button
                  className={`${styles.copyBtn} ${
                    copied ? styles.copyBtnSuccess : ""
                  }`}
                  onClick={handleCopy}
                  aria-label="Copy shareable link"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
