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
            <span className={styles.activeDot}></span> Home
          </Link>
          <Link href="/pasien" className={styles.navLink}>About Us</Link>
          <Link href="/petugas" className={styles.navLink}>Our Services</Link>
          <Link href="/petugas/penyebab" className={styles.navLink}>Programs</Link>
          <Link href="/pasien" className={styles.navLink}>Blog</Link>
        </div>

        {/* Center Logo */}
        <Link href="/" className={styles.logo}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
            {/* Medical Cross */}
            <path d="M19 10.5H13.5V5C13.5 4.17 12.83 3.5 12 3.5C11.17 3.5 10.5 4.17 10.5 5V10.5H5C4.17 10.5 3.5 11.17 3.5 12C3.5 12.83 4.17 13.5 5 13.5H10.5V19C10.5 19.83 11.17 20.5 12 20.5C12.83 20.5 13.5 19.83 13.5 19V13.5H19C19.83 13.5 20.5 12.83 20.5 12C20.5 11.17 19.83 10.5 19 10.5Z" fill="#0D5D49" />
            {/* Leaf shape accent */}
            <path d="M12 12C12 9.5 10 7.5 7.5 7.5C7.5 10 9.5 12 12 12Z" fill="#E07A5F" />
          </svg>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>BrightLife</span>
            <span className={styles.logoSubtitle}>Medical</span>
          </div>
        </Link>

        {/* Right Contact button */}
        <Link href="/pasien" className={styles.contactBtn}>
          <span>Contact Us</span>
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
            src="/images/medical-shaking-hands.png"
            alt="Doctor Shaking Hands with Patient"
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
            <span className={styles.starIcon}>★</span>
            <span className={styles.ratingText}>
              <strong>4.5</strong> Average Rating
            </span>
            <span className={styles.divider}>•</span>
            <span className={styles.reviewsText}><strong>560</strong> Reviews</span>
          </div>

          {/* Bottom Left Headline & Buttons */}
          <div className={styles.bottomLeftGroup}>
            <h1 className={styles.headline}>Your Health &<br />Wellness Simplified</h1>
            
            <div className={styles.actions}>
              <Link href="/pasien" className={styles.bookBtn}>
                <span>Book an Appointment</span>
                <span className={styles.arrowCircleWhite}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </Link>

              <Link href="/petugas" className={styles.exploreBtn}>
                <span>Explore Service</span>
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
            <div className={styles.supportHeader}>24/7 Support</div>
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
                <strong>50+</strong> Expert Consultant
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
