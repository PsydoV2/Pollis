import Link from "next/link";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>Pollis</span>
        <span className={styles.text}>
          Decentralized polling on Ethereum &copy; 2026 Sebastian Falter
        </span>

        <Link
          href="https://github.com/PsydoV2/Pollis"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub →
        </Link>
        <Link
          href="https://sfalter.de"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Profile →
        </Link>
      </div>
    </footer>
  );
}
