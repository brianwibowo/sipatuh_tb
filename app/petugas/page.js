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
                categories.map((cat, idx) => {
                  const matchingContent = contents.find(c => c.section_key === cat.key);
                  return (
                    <article 
                      key={cat.id} 
                      className={styles.articleCard} 
                      id={cat.key}
                    >
                      <div className={styles.cardContent}>
                        <h2 className={styles.articleTitle}>
                          <span className={styles.titleIndex}>0{idx + 1}.</span> {cat.title}
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
                })
              )}
            </div>

            {/* Right Column: Menu Quick Navigation */}
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
        </div>
      </div>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
