import styles from "../styles/PollList.module.css";

export default function PollSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={`${styles.skeletonLine} ${styles.skeletonHeader}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonBar}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonStats}`} />
    </div>
  );
}
