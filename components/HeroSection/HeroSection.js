import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={`${styles.content} animate-fade-in`}>
          <div className={styles.badge}>
            <svg
              className={styles.badgeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Platform Edukasi Kepatuhan TB</span>
          </div>
          
          <h1 className={styles.title}>
            Bersama Sembuh dari <span className={styles.highlight}>Tuberkulosis</span>
          </h1>
          
          <p className={styles.subtitle}>
            Akses informasi ilmiah tepercaya dan dukung kepatuhan pengobatan Anda 
            melalui materi edukasi, visualisasi interaktif, dan panduan video. 
            Disiplin OAT, raih kesembuhan penuh.
          </p>
          
          <div className={styles.actions}>
            <Link href="/pasien" className={styles.btnPrimary}>
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Akses Menu Pasien</span>
            </Link>
            
            <Link href="/petugas" className={styles.btnSecondary}>
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>Akses Menu Petugas</span>
            </Link>
          </div>
        </div>

        <div className={`${styles.imageWrapper} animate-scale-up`}>
          <div className={styles.imageBackgroundGlow}></div>
          <Image
            src="/images/hero-illustration.png"
            alt="Caring Doctor and Patient Illustration"
            width={600}
            height={600}
            priority
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
