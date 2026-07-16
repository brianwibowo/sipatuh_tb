"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasInfoPage() {
  const [contents, setContents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok && data.contents) {
        // Change the title of the pengobatan section to match Skema Pengobatan
        const modified = data.contents.map(c => {
          if (c.section_key === "pengobatan") {
            return { ...c, title: "Skema Pengobatan" };
          }
          return c;
        });
        setContents(modified);
      }
    } catch (err) {
      console.error("Gagal memuat data konten", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/artikel");
      const data = await res.json();
      if (res.ok && data.artikels) {
        setArticles(data.artikels);
      }
    } catch (err) {
      console.error("Gagal memuat artikel terkait", err);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchArticles();
  }, []);

  const getRelatedArticles = (sectionKey) => {
    switch (sectionKey) {
      case "penjelasan_umum":
        return articles.filter(art => 
          art.slug.includes("bakteri") || art.slug.includes("imun")
        );
      case "gejala":
        return articles.filter(art => 
          art.slug.includes("gejala")
        );
      case "pengobatan":
        return articles.filter(art => 
          art.slug.includes("pmo") || art.slug.includes("obat")
        );
      case "pencegahan":
        return articles.filter(art => 
          art.slug.includes("pencegahan") || art.slug.includes("udara") || art.slug.includes("penularan")
        );
      default:
        return [];
    }
  };

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

          <div className={styles.headerGroup}>
            <span className={styles.sub}>Informasi Umum</span>
            <h1 className={styles.mainTitle}>Informasi Kepatuhan TB</h1>
            <p className={styles.intro}>
              Berikut adalah materi edukasi medis resmi mengenai Tuberkulosis (TB),
              gejala, rejimen pengobatan, dan pencegahannya.
            </p>
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
                contents.map((content, idx) => (
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
                      
                      {/* Related articles links list */}
                      {getRelatedArticles(content.section_key).length > 0 && (
                        <div className={styles.relatedArticlesBox}>
                          <h4 className={styles.relatedTitle}>Artikel Mendalam Terkait:</h4>
                          <div className={styles.relatedList}>
                            {getRelatedArticles(content.section_key).map(art => (
                              <Link 
                                key={art.id} 
                                href={`/petugas/penyebab/${art.slug}`} 
                                className={styles.relatedLink}
                              >
                                <span className={styles.relatedIcon}>📄</span>
                                <span className={styles.relatedText}>{art.title}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.relatedArrow}>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                  <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Right Column: Menu Quick Navigation */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <div className={styles.sidebarCard}>
                  <h3 className={styles.sidebarTitle}>Navigasi Info</h3>
                  <div className={styles.sidebarNav}>
                    {/* Apa itu TB? */}
                    <div className={styles.navGroup}>
                      <a href="#penjelasan_umum" className={styles.navLink}>
                        <span className={styles.navIcon}>•</span> Apa itu TB?
                      </a>
                      <div className={styles.subLinks}>
                        {getRelatedArticles("penjelasan_umum").map(art => (
                          <Link key={art.id} href={`/petugas/penyebab/${art.slug}`} className={styles.subLink}>
                            📄 {art.title.replace("Mengenal ", "").replace(" dalam Infeksi TB", "")}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Gejala TB */}
                    <div className={styles.navGroup}>
                      <a href="#gejala" className={styles.navLink}>
                        <span className={styles.navIcon}>•</span> Gejala TB
                      </a>
                      {getRelatedArticles("gejala").length > 0 && (
                        <div className={styles.subLinks}>
                          {getRelatedArticles("gejala").map(art => (
                            <Link key={art.id} href={`/petugas/penyebab/${art.slug}`} className={styles.subLink}>
                              📄 {art.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skema Pengobatan */}
                    <div className={styles.navGroup}>
                      <a href="#pengobatan" className={styles.navLink}>
                        <span className={styles.navIcon}>•</span> Skema Pengobatan
                      </a>
                      <div className={styles.subLinks}>
                        {getRelatedArticles("pengobatan").map(art => (
                          <Link key={art.id} href={`/petugas/penyebab/${art.slug}`} className={styles.subLink}>
                            📄 {art.title.replace("Pentingnya Peran ", "").replace(" dan Kepatuhan Obat", " & Kepatuhan")}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Pencegahan Penularan */}
                    <div className={styles.navGroup}>
                      <a href="#pencegahan" className={styles.navLink}>
                        <span className={styles.navIcon}>•</span> Pencegahan Penularan
                      </a>
                      <div className={styles.subLinks}>
                        {getRelatedArticles("pencegahan").map(art => (
                          <Link key={art.id} href={`/petugas/penyebab/${art.slug}`} className={styles.subLink}>
                            📄 {art.title.replace("Mengenal ", "").replace(" TB Melalui Udara", "")}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
