"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasInfoPage() {
  const [contents, setContents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/kategori");
      const data = await res.json();
      if (res.ok && data.kategori) {
        setCategories(data.kategori);
      }
    } catch (err) {
      console.error("Gagal memuat kategori", err);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchArticles();
    fetchCategories();
  }, []);

  const renderCardContent = (content) => {
    try {
      const parsed = JSON.parse(content.body);

      return (
        <div className={styles.articleBody}>
          {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}
          
          {content.section_key === "penjelasan_umum" && parsed.stats && (
            <div className={styles.statGrid}>
              {parsed.stats.map((stat, sIdx) => (
                <div key={sIdx} className={styles.statCard}>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {content.section_key === "penjelasan_umum" && parsed.quote && (
            <div className={styles.quoteWrapper}>
              <span className={styles.quoteQuote}>"</span>
              <blockquote className={styles.premiumQuote}>{parsed.quote}</blockquote>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: content.body }} />;
    }
  };

  const splitCard1Content = (content) => {
    try {
      const parsed = JSON.parse(content.body);
      return {
        isJson: true,
        top: (
          <div className={styles.articleBody}>
            {parsed.description && <p className={styles.leadText}>{parsed.description}</p>}
          </div>
        ),
        bottom: (
          <div className={styles.articleBody}>
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
                <span className={styles.quoteQuote}>"</span>
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
        )
      };
    } catch (e) {
      const html = content.body;
      let topHtml = html;
      let bottomHtml = "";
      
      const splitIndex = html.indexOf('<div class="statGrid">');
      if (splitIndex !== -1) {
        topHtml = html.substring(0, splitIndex);
        bottomHtml = html.substring(splitIndex);
      } else {
        const blockquoteIndex = html.indexOf('<blockquote>');
        if (blockquoteIndex !== -1) {
          topHtml = html.substring(0, blockquoteIndex);
          bottomHtml = html.substring(blockquoteIndex);
        }
      }
      
      return {
        isJson: false,
        top: <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: topHtml }} />,
        bottom: <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: bottomHtml }} />
      };
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <section className={styles.headerSection}>
        <div className={styles.container} style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "0", right: "0", zIndex: 10 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ffffff",
                color: "#5F5E5A",
                border: "1px solid rgba(95, 94, 90, 0.2)",
                padding: "8px 16px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.85rem",
                boxShadow: "0 2px 8px rgba(95, 94, 90, 0.04)",
                transition: "all 0.2s ease",
                textDecoration: "none"
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className={styles.headerGroup}>
            <span className={styles.sub}>MEDIA EDUKASI & MOTIVASI</span>
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
          {/* Top Row: Card 1 + Sidebar (L-shape) */}
          <div className={styles.topRow}>
            {/* First card only (Top half of L-shape) */}
            <div className={styles.topRowMain}>
              {loading ? (
                <div className="shimmer" style={{ height: "200px", borderRadius: "16px" }}></div>
              ) : categories.length > 0 && (() => {
                const cat = categories[0];
                const matchingContent = contents.find(c => c.section_key === cat.key);
                const splitContent = matchingContent ? splitCard1Content(matchingContent) : null;
                
                return (
                  <article className={`${styles.articleCard} ${styles.card1Top}`} id={cat.key}>
                    <div className={styles.cardContent}>
                      <h2 className={styles.articleTitle}>
                        <span className={styles.titleIndex}>01.</span> {cat.title}
                      </h2>
                      {splitContent ? (
                        splitContent.top
                      ) : (
                        <div className={styles.articleBody}>
                          <p className={styles.leadText}>{cat.description}</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })()}
            </div>

            {/* Right Column: Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <div className={styles.sidebarCard}>
                  <h3 className={styles.sidebarTitle}>Navigasi Artikel</h3>
                  <div className={styles.sidebarNav}>
                    {categories.map(cat => (
                      <Link key={cat.id} href={`/petugas/kategori/${cat.key}`} className={styles.navLink}>
                        <span className={styles.navIcon}>•</span> {cat.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom half of L-shape (Card 1 Bottom) and other cards */}
          <div className={styles.bottomCards}>
            {/* Card 1 Bottom (Seamless bottom part of L-shape spanning full width) */}
            {!loading && categories.length > 0 && (() => {
              const cat = categories[0];
              const matchingContent = contents.find(c => c.section_key === cat.key);
              const splitContent = matchingContent ? splitCard1Content(matchingContent) : null;
              if (!splitContent) return null;
              
              return (
                <article className={`${styles.articleCard} ${styles.card1Bottom}`}>
                  <div className={styles.cardContent}>
                    {splitContent.bottom}

                    <div className={styles.viewArticlesRow} style={{ marginTop: "2rem" }}>
                      <Link href={`/petugas/kategori/${cat.key}`} className={styles.viewCategoryLink}>
                        <span>Buka Kumpulan Artikel {cat.title}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.arrowIcon}>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })()}

            {/* Other cards (Card 2, 3, 4) spanning full width */}
            {!loading && categories.slice(1).map((cat, idx) => {
              const matchingContent = contents.find(c => c.section_key === cat.key);
              return (
                <article 
                  key={cat.id} 
                  className={styles.articleCard} 
                  id={cat.key}
                >
                  <div className={styles.cardContent}>
                    <h2 className={styles.articleTitle}>
                      <span className={styles.titleIndex}>0{idx + 2}.</span> {cat.title}
                    </h2>
                    {matchingContent ? (
                      renderCardContent(matchingContent)
                    ) : (
                      <div className={styles.articleBody}>
                        <p className={styles.leadText}>{cat.description}</p>
                      </div>
                    )}

                    <div className={styles.viewArticlesRow}>
                      <Link href={`/petugas/kategori/${cat.key}`} className={styles.viewCategoryLink}>
                        <span>Buka Kumpulan Artikel {cat.title}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.arrowIcon}>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
