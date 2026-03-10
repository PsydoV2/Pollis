"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>𝕻</span>
          <span className={styles.name}>Pollis</span>
        </div>
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="address"
        />
      </div>
    </header>
  );
}
