import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../styles/page.module.css";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <HomeClient />
      <Footer />
    </div>
  );
}
