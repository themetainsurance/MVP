import Image from "next/image";
import styles from "./BrandLogo.module.css";

type BrandLogoProps = {
  inverse?: boolean;
};

export default function BrandLogo({ inverse = false }: BrandLogoProps) {
  return (
    <span className={styles.logo}>
      <Image
        src="/brand/the-meta-insurance-logo.png"
        alt="The Meta Insurance"
        width={2172}
        height={724}
        sizes="(max-width: 600px) 155px, 188px"
        className={`${styles.image} ${inverse ? styles.inverse : ""}`}
        unoptimized
        priority
      />
    </span>
  );
}
