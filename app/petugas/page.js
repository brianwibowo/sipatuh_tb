"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasInfoPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok && data.contents) {
        setContents(data.contents);
      }
    } catch (err) {
      console.error("Gagal memuat data konten", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const renderCardContent = (content) => {
    try {
      const parsed = JSON.parse(content.body);
      
      switch (content.section_key) {
        case "penjelasan_umum":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}
              
              {parsed.stats && (
                <div className={styles.statGrid}>
                  {parsed.stats.map((stat, sIdx) => (
                    <div key={sIdx} className={styles.statCard}>
                      <div className={styles.statNumber}>{stat.number}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {parsed.quote && (
                <div className={styles.quoteWrapper}>
                  <span className={styles.quoteQuote}>“</span>
                  <blockquote className={styles.premiumQuote}>{parsed.quote}</blockquote>
                </div>
              )}

              {parsed.patogenesis && (
                <div className={styles.patogenesisBox}>
                  <h4 className={styles.boxTitle}>Patogenesis & Penularan</h4>
                  <p>{parsed.patogenesis}</p>
                </div>
              )}
            </div>
          );
        case "gejala":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}

              {parsed.table && (
                <div className={styles.symptomCardGrid}>
                  {parsed.table.map((row, rIdx) => {
                    // Set severity classes/badges based on category
                    let severityClass = styles.badgePrimary;
                    let cardBorderClass = "";
                    if (row.category.toLowerCase().includes("utama")) {
                      severityClass = styles.badgeDanger;
                      cardBorderClass = styles.cardBorderDanger;
                    } else if (row.category.toLowerCase().includes("respiratorik")) {
                      severityClass = styles.badgePrimary;
                      cardBorderClass = styles.cardBorderPrimary;
                    } else {
                      severityClass = styles.badgeSecondary;
                      cardBorderClass = styles.cardBorderSecondary;
                    }

                    return (
                      <div key={rIdx} className={`${styles.symptomCard} ${cardBorderClass}`}>
                        <div className={styles.symptomHeader}>
                          <span className={`${styles.badge} ${severityClass}`}>{row.category}</span>
                        </div>
                        <h4 className={styles.symptomTitle}>{row.manifestation}</h4>
                        <div className={styles.pathophysiologyBox}>
                          <span className={styles.physioLabel}>Fisiologis:</span>
                          <span className={styles.physioText}>{row.pathophysiology}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {parsed.conclusion && (
                <div className={styles.conclusionAlert}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.alertIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>{parsed.conclusion}</p>
                </div>
              )}
            </div>
          );
        case "pengobatan":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}

              {parsed.phases && (
                <div className={styles.timeline}>
                  {parsed.phases.map((phase, pIdx) => (
                    <div key={pIdx} className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>
                        <div className={pIdx === 0 ? styles.markerDotPrimary : styles.markerDotSecondary}>
                          {pIdx + 1}
                        </div>
                        {pIdx < parsed.phases.length - 1 && <div className={styles.markerLine}></div>}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                          <h4 className={styles.timelineTitle}>{phase.name}</h4>
                          <span className={pIdx === 0 ? styles.timelineBadgePrimary : styles.timelineBadgeSecondary}>
                            ⏱️ {phase.duration}
                          </span>
                        </div>
                        <div className={styles.timelineDetails}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Paduan OAT:</span>
                            <code className={styles.detailCode}>{phase.drugs}</code>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Tujuan Klinis:</span>
                            <span className={styles.detailDesc}>{phase.objective}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {parsed.warning && (
                <div className={styles.warningAlert}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.warningIcon}>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <div>
                    <strong>Peringatan Kepatuhan:</strong> {parsed.warning}
                  </div>
                </div>
              )}
            </div>
          );
        case "pencegahan":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}

              {parsed.pillars && (
                <div className={styles.preventionGrid}>
                  {parsed.pillars.map((pillar, plIdx) => {
                    // Custom outline SVG icons for each prevention action
                    let iconSvg = (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    );

                    if (pillar.title.toLowerCase().includes("obat") || pillar.title.toLowerCase().includes("teratur")) {
                      iconSvg = (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                          <path d="m8.5 8.5 7 7"></path>
                        </svg>
                      );
                    } else if (pillar.title.toLowerCase().includes("etika") || pillar.title.toLowerCase().includes("batuk")) {
                      iconSvg = (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="5"></circle>
                          <path d="M3 21c0-4.5 3.5-8 8-8s8 3.5 8 8"></path>
                          <path d="m14 17 2 2 4-4"></path>
                        </svg>
                      );
                    } else if (pillar.title.toLowerCase().includes("masker")) {
                      iconSvg = (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="6" width="18" height="12" rx="2"></rect>
                          <path d="M3 10c4 0 4 4 8 4s4-4 8-4"></path>
                          <path d="M3 14c4 0 4-4 8-4s4 4 8 4"></path>
                        </svg>
                      );
                    } else if (pillar.title.toLowerCase().includes("ventilasi") || pillar.title.toLowerCase().includes("cahaya") || pillar.title.toLowerCase().includes("udara")) {
                      iconSvg = (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                          <line x1="15" y1="3" x2="15" y2="21"></line>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="3" y1="15" x2="21" y2="15"></line>
                        </svg>
                      );
                    }

                    return (
                      <div key={plIdx} className={styles.preventionCard}>
                        <div className={styles.preventionIconBox}>
                          {iconSvg}
                        </div>
                        <h4 className={styles.preventionTitle}>{pillar.title}</h4>
                        <p className={styles.preventionDesc}>{pillar.desc}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        default:
          return <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: content.body }} />;
      }
    } catch (e) {
      return <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: content.body }} />;
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Banner Area */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/" className={styles.backLink}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={styles.backIcon}
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.headerGroup}>
              <span className={styles.sub}>Informasi Umum</span>
              <h1 className={styles.mainTitle}>Informasi Kepatuhan TB</h1>
              <p className={styles.intro}>
                Berikut adalah materi edukasi medis resmi mengenai Tuberkulosis (TB),
                gejala, rejimen pengobatan, dan pencegahannya.
              </p>
            </div>
            <div className={styles.heroImageWrapper}>
              <Image
                src="/images/lungs-illustration.png"
                alt="Lungs Illustration"
                width={280}
                height={280}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* Left Column: Content list */}
            <div className={styles.articles}>
              {loading ? (
                <div className={styles.loadingWrapper}>
                  <div className="shimmer" style={{ height: "120px", borderRadius: "16px", marginBottom: "2rem" }}></div>
                  <div className="shimmer" style={{ height: "200px", borderRadius: "16px" }}></div>
                </div>
              ) : (
                contents.map((content, idx) => {
                  const isSplitCard = idx >= 1 && idx <= 3;
                  const images = [
                    "", // Card 1
                    "/images/tb-education-hero.png", // Card 2
                    "/images/medical-shaking-hands.png", // Card 3
                    "/images/footer-care.png" // Card 4
                  ];

                  if (isSplitCard) {
                    return (
                      <article 
                        key={content.id} 
                        className={styles.articleCardSplit} 
                        id={content.section_key}
                      >
                        <div className={styles.articleImageSide}>
                          <Image
                            src={images[idx]}
                            alt={content.title}
                            fill
                            sizes="(max-width: 968px) 100vw, 320px"
                            className={styles.splitImage}
                          />
                        </div>
                        <div className={styles.articleContentSide}>
                          <h2 className={styles.articleTitle}>
                            <span className={styles.titleIndex}>0{idx + 1}.</span> {content.title}
                          </h2>
                          {renderCardContent(content)}
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article 
                      key={content.id} 
                      className={styles.articleCard} 
                      id={content.section_key}
                    >
                      <div className={styles.cardContent}>
                        <h2 className={styles.articleTitle}>
                          <span className={styles.titleIndex}>0{idx + 1}.</span> {content.title}
                        </h2>
                        {renderCardContent(content)}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            
            {/* Bottom Navigation Section: 3 CTA Cards */}
            <section className={styles.bottomNavSection}>
              <h2 className={styles.bottomNavTitle}>Layanan & Navigasi Portal</h2>
              <div className={styles.bottomNavGrid}>
                {/* Card 1: Penyebab TB */}
                <div className={`${styles.bottomNavCard} ${styles.ctaCard}`}>
                  <h3 className={styles.ctaTitle}>Penyebab & Penularan</h3>
                  <p className={styles.ctaDesc}>
                    Pelajari faktor pemicu utama, droplet udara, dan kerentanan imun.
                  </p>
                  <Link href="/petugas/penyebab" className={styles.ctaLink}>
                    <span>Buka Penyebab & Penularan</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaIcon}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>

                {/* Card 2: Video Edukasi Pasien */}
                <div className={`${styles.bottomNavCard} ${styles.videoCtaCard}`}>
                  <h3 className={styles.ctaTitle}>Video Edukasi Pasien</h3>
                  <p className={styles.ctaDesc}>
                    Tonton materi video interaktif kepatuhan minum obat bagi pasien.
                  </p>
                  <Link href="/pasien" className={styles.ctaLink}>
                    <span>Tonton Video Pasien</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaIcon}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>

                {/* Card 3: Portal Petugas */}
                <div className={`${styles.bottomNavCard} ${styles.dashboardCtaCard}`}>
                  <h3 className={styles.ctaTitle}>Portal Editor Petugas</h3>
                  <p className={styles.ctaDesc}>
                    Akses petugas kesehatan untuk menyunting materi & mengelola video.
                  </p>
                  <Link href="/petugas/dashboard" target="_blank" className={styles.ctaLink}>
                    <span>Buka Portal Petugas</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaIcon}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
