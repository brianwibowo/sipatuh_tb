"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* Left Column: Contact Us */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contact Us</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span>Jl. Percetakan Negara No. 29, Jakarta Pusat, Indonesia</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span>+62 21 424 9000</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span>sipatuh.tb@kemkes.go.id</span>
              </li>
            </ul>

            <div className={styles.footerCareCard}>
              <Image
                src="/images/footer-care.png"
                alt="Doctor comforting patient illustration"
                width={160}
                height={120}
                className={styles.footerCareImg}
              />
            </div>
          </div>

          {/* Right Column: Socials and Links */}
          <div className={styles.column} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 className={styles.columnTitle}>Our Social Channels</h3>
              <p className={styles.socialDesc}>
                Akses informasi edukasi pencegahan tuberkulosis terkini, penelitian, 
                serta rilis berita program Kemenkes RI secara langsung.
              </p>

              <div className={styles.socialRow}>
                <a href="https://x.com" target="_blank" className={styles.socialIconBtn} aria-label="X (Twitter)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" className={styles.socialIconBtn} aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" className={styles.socialIconBtn} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" className={styles.socialIconBtn} aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Bottom Right Pills & Scroll up button */}
            <div className={styles.bottomPillRow}>
              <div className={styles.pillsList}>
                <Link href="/" className={styles.pillLink}>Beranda</Link>
                <Link href="/petugas" className={styles.pillLink}>Materi TB</Link>
                <Link href="/petugas/penyebab" className={styles.pillLink}>Penyebab</Link>
                <Link href="/pasien" className={styles.pillLink}>Video Pasien</Link>
              </div>

              <button onClick={scrollToTop} className={styles.scrollTopBtn} aria-label="Scroll back to top">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Bottom copyright row */}
        <div className={styles.bottomRow}>
          <div className={styles.legalLinks}>
            <span>Terms & conditions</span>
            <span className={styles.legalDivider}>|</span>
            <span>Sitemap</span>
            <span className={styles.legalDivider}>|</span>
            <span>Privacy Policy</span>
          </div>
          <div className={styles.copyrightText}>
            &copy; {currentYear} SIPATUH-TB. Hak Cipta Dilindungi Kemenkes RI.
          </div>
        </div>
      </div>
    </footer>
  );
}
