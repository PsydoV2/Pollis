"use client";
import CreatePoll from "@/components/CreatePoll";
import PollList from "@/components/PollList";
import styles from "../styles/page.module.css";

export default function HomeView() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Decentralized
          <br />
          <em>polling</em> for
          <br />
          everyone.
        </h1>
        <p className={styles.subtitle}>
          Create polls, vote with your wallet.
          <br />
          Results are final, transparent, and permanent.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.content}>
        <div className={styles.sidebar}>
          <CreatePoll />
        </div>
        <div className={styles.feed}>
          <PollList />
        </div>
      </section>
    </main>
  );
}
