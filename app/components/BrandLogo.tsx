import styles from "./BrandLogo.module.css";

export default function BrandLogo() {
  return (
    <span className={styles.logo}>
      <span className={styles.visuallyHidden}>The Meta Insurance</span>
      <span className={styles.topLine} aria-hidden="true">
        the
      </span>
      <span className={styles.bottomLine} aria-hidden="true">
        metAInsurance
      </span>
    </span>
  );
}
