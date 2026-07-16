"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <div className={styles.heroWrapper}>
      {/* Centered Brand Navbar */}
      <header className={styles.navbar}>
        {/* Left Pill Navigation */}
        <div className={styles.navPill}>
          <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>
            <span className={styles.activeDot}></span> Beranda
          </Link>
          <Link href="/petugas" className={styles.navLink}>Materi TB</Link>
          <Link href="/petugas/penyebab" className={styles.navLink}>Penyebab</Link>
          <Link href="/pasien" className={styles.navLink}>Video Pasien</Link>
        </div>

        {/* Center Logo */}
        <Link href="/" className={styles.logo}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
            {/* Cross at the top */}
            <path d="M12 2V8M9 5H15" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Left Lung */}
            <path d="M10.5 9.5C8.5 7.5 5 9 5 12.5C5 16 8 18 10.5 17" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Lung */}
            <path d="M13.5 9.5C15.5 7.5 19 9 19 12.5C19 16 16 18 13.5 17" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Central Leaf */}
            <path d="M12 9C10.5 12 11 16 12 18.5C13 16 13.5 12 12 9Z" fill="#34A853" stroke="#137333" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SIPATUH</span>
            <span className={styles.logoSubtitle}>-TB Edukasi</span>
          </div>
        </Link>

        {/* Right Contact button */}
        <Link href="/petugas/dashboard" target="_blank" className={styles.contactBtn}>
          <span>Dashboard Petugas</span>
          <span className={styles.arrowCircle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </span>
        </Link>
      </header>

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
            <div className={styles.supportHeader}>Dampingi PMO</div>
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
                <strong>Petugas Siaga</strong> Bantu Disiplin OAT
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
