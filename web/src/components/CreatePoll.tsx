"use client";
import { POLLIS_ADDRESS, POLLIS_ABI } from "@/lib/contract";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import styles from "../styles/CreatePoll.module.css";

const DURATION_OPTIONS = [
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "1 week", value: 604800 },
];

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState(86400);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreate = () => {
    if (!question.trim()) return;
    writeContract({
      abi: POLLIS_ABI,
      address: POLLIS_ADDRESS,
      functionName: "createPoll",
      args: [question, BigInt(duration)],
    });
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className={styles.container}>
      <div className={styles.sectionLabel}>New poll</div>

      <div className={styles.field}>
        <label className={styles.label}>Question</label>
        <textarea
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
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleCreate}
        disabled={isLoading || !question.trim()}
      >
        {isPending
          ? "Confirm in wallet…"
          : isConfirming
          ? "Creating…"
          : "Create poll"}
      </button>

      {isSuccess && (
        <p className={styles.successMsg}>✓ Poll created successfully</p>
      )}
    </div>
  );
}
