import CreatePoll from "@/components/CreatePoll";
import PollList from "@/components/PollList";
import Header from "@/components/Header";
import styles from "../styles/page.module.css";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
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

        <Footer></Footer>
      </main>
    </div>
  );
}
