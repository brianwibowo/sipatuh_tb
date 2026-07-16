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
              {parsed.description && <p>{parsed.description}</p>}
              
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
                <blockquote>{parsed.quote}</blockquote>
              )}

              {parsed.patogenesis && (
                <p>{parsed.patogenesis}</p>
              )}
            </div>
          );
        case "gejala":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p>{parsed.description}</p>}

              {parsed.table && (
                <table>
                  <thead>
                    <tr>
                      <th>Kategori Gejala</th>
                      <th>Manifestasi Spesifik</th>
                      <th>Kondisi Patofisiologis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.table.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td><strong>{row.category}</strong></td>
                        <td>{row.manifestation}</td>
                        <td>{row.pathophysiology}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {parsed.conclusion && <p>{parsed.conclusion}</p>}
            </div>
          );
        case "pengobatan":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p>{parsed.description}</p>}

              {parsed.phases && (
                <table>
                  <thead>
                    <tr>
                      <th>Fase Terapi</th>
                      <th>Durasi</th>
                      <th>Komposisi Obat Anti Tuberkulosis (OAT)</th>
                      <th>Tujuan Klinis Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.phases.map((phase, pIdx) => (
                      <tr key={pIdx}>
                        <td>
                          <span className={pIdx === 0 ? styles.badgePrimary : styles.badgeSecondary}>
                            {phase.name}
                          </span>
                        </td>
                        <td>{phase.duration}</td>
                        <td>{phase.drugs}</td>
                        <td>{phase.objective}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {parsed.warning && (
                <blockquote>
                  <strong>Peringatan Mutlak:</strong> {parsed.warning}
                </blockquote>
              )}
            </div>
          );
        case "pencegahan":
          return (
            <div className={styles.articleBody}>
              {parsed.description && <p>{parsed.description}</p>}

              {parsed.pillars && (
                <ul>
                  {parsed.pillars.map((pillar, plIdx) => (
                    <li key={plIdx} style={{ marginBottom: "1rem" }}>
                      <strong>{pillar.title}:</strong> {pillar.desc}
                    </li>
                  ))}
                </ul>
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
                    <a href="#penjelasan_umum" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Apa itu TB?
                    </a>
                    <a href="#gejala" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Gejala TB
                    </a>
                    <a href="#pengobatan" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Skema Pengobatan OAT
                    </a>
                    <a href="#pencegahan" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Pencegahan Penularan
                    </a>
                  </div>
                </div>

                <div className={`${styles.sidebarCard} ${styles.ctaCard}`}>
                  <h3 className={styles.ctaTitle}>Lanjut ke Penyebab TB</h3>
                  <p className={styles.ctaDesc}>
                    Lihat daftar detail penyebab tuberkulosis, cara penularan,
                    serta faktor risiko infeksi pada pasien.
                  </p>
                  <Link href="/petugas/penyebab" className={styles.ctaLink}>
                    <span>Lihat Penyebab TB</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.ctaIcon}
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
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
