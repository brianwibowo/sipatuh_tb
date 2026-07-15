import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brandTitle}>
            SIPATUH<span className={styles.brandHighlight}>-TB</span>
          </Link>
          <p className={styles.brandDesc}>
            Sistem Informasi Kepatuhan Pengobatan Tuberkulosis. Mendukung kepatuhan 
            pengobatan pasien demi mencapai kesembuhan total dan memutus rantai penularan.
          </p>
        </div>
        
        <div className={styles.divider}></div>
        
        <div className={styles.copyrightSection}>
          <p className={styles.copyrightText}>
            &copy; {currentYear} SIPATUH-TB. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className={styles.disclaimer}>
            Platform ini disediakan untuk tujuan edukasi informasi kesehatan dan bukan pengganti saran medis profesional.
          </p>
        </div>
      </div>
    </footer>
  );
}
