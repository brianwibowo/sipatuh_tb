"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <div className={styles.heroWrapper}>
      {/* Hero Image Container */}
      <section className={styles.heroContainer}>
        {/* Background Image */}
        <div className={styles.heroBgImageWrapper}>
          <Image
            src="/images/tb-education-hero.png"
            alt="Doctor explaining tuberculosis using lung diagram"
            fill
            priority
            className={styles.heroBgImage}
            sizes="100vw"
          />
          {/* Overlay shadow gradient to read text clearly */}
          <div className={styles.gradientOverlay}></div>
        </div>

        {/* Floating elements inside container */}
        <div className={styles.heroContent}>
          {/* Top Left Rating Badge */}
          <div className={styles.ratingBadge}>
            <span className={styles.starIcon}>🛡️</span>
            <span className={styles.ratingText}>
              <strong>Edukasi Kepatuhan TB</strong>
            </span>
            <span className={styles.divider}>•</span>
            <span className={styles.reviewsText}>Panduan Resmi</span>
          </div>

          {/* Bottom Left Headline & Buttons */}
          <div className={styles.bottomLeftGroup}>
            <h1 className={styles.headline}>Bersama Sembuh<br />dari Tuberkulosis</h1>

            <div className={styles.actions}>
              <Link href="/petugas" className={styles.bookBtn}>
                <span>Menu Petugas</span>
                <span className={styles.arrowCircleWhite}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </Link>

              <Link href="/pasien" className={styles.exploreBtn}>
                <span>Menu Pasien</span>
                <span className={styles.arrowCircleTeal}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Bottom Right Support Card */}
          <div className={styles.supportCard}>
            <div className={styles.supportHeader}>Artikel Lengkap</div>
            <div className={styles.supportBody}>
              <div className={styles.avatarGroup}>
                <div className={styles.avatar}>
                  <Image src="/images/avatar1.png" alt="Doctor avatar 1" width={32} height={32} className={styles.avatarImg} />
                </div>
                <div className={styles.avatar}>
                  <Image src="/images/avatar2.png" alt="Doctor avatar 2" width={32} height={32} className={styles.avatarImg} />
                </div>
                <div className={styles.avatar}>
                  <Image src="/images/avatar3.png" alt="Doctor avatar 3" width={32} height={32} className={styles.avatarImg} />
                </div>
              </div>
              <div className={styles.supportText}>
                <strong>Artikel Terupdate</strong> Bantu Belajar Kamu
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
