"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function KategoriPage({ params }) {
  const resolvedParams = use(params);
  const { key } = resolvedParams;

  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch current category meta
        const metaRes = await fetch(`/api/kategori?key=${key}`);
        const metaData = await metaRes.json();
        if (metaRes.ok && metaData.kategori) {
          setMeta(metaData.kategori);
        } else {
          setMeta(null);
        }

        // 2. Fetch all categories for sidebar
        const catsRes = await fetch("/api/kategori");
        const catsData = await catsRes.json();
        if (catsRes.ok && catsData.kategori) {
          setCategories(catsData.kategori);
        }

        // 3. Fetch cards for this category
        const cardsRes = await fetch(`/api/penyebab?kategori_key=${key}`);
        const cardsData = await cardsRes.json();
        if (cardsRes.ok && cardsData.penyebab) {
          setCards(cardsData.penyebab);
        }
      } catch (err) {
        console.error("Gagal memuat data kategori", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [key]);

  const getLocalFallbackImage = (slug) => {
    if (slug.includes("pencegahan")) return "/images/caring_nurse_comforting_patient_1784200678670.png";
    if (slug.includes("pmo") || slug.includes("dukungan")) return "/images/medical_shaking_hands_1784200384280.png";
    if (slug.includes("gejala")) return "/images/lungs_illustration_1784100215238.png";
    if (slug.includes("bakteri")) return "/images/bacteria-illustration.png";
    if (slug.includes("droplet") || slug.includes("penularan")) return "/images/droplet-illustration.png";
    return "/images/lungs-illustration.png";
  };

  if (!meta) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h2>Kategori tidak ditemukan</h2>
            <Link href="/petugas" className={styles.backLink}>
              ← Kembali ke Info TB
            </Link>
          </div>
        </div>
        <GearMenu />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <section className={styles.headerSection}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/petugas" className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.backIcon}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Kembali ke Info TB</span>
            </Link>
          </div>

          <div className={styles.headerGroup}>
            <span className={styles.sub}>{meta.subtitle}</span>
            <h1 className={styles.mainTitle}>{meta.title}</h1>
            <p className={styles.intro}>{meta.description}</p>
          </div>
        </div>
      </section>

      {/* Card Grid & Sidebar */}
      <div className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* Left Column: Cards grid */}
            <div className={styles.articles}>
              {loading ? (
                <div className={styles.loadingGrid}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer" style={{ height: "320px", borderRadius: "16px" }}></div>
                  ))}
                </div>
              ) : cards.length > 0 ? (
                <div className={styles.grid}>
                  {cards.map((card) => (
                    <Link key={card.id} href={`/petugas/penyebab/${card.slug}`} className={styles.card}>
                      <div className={styles.cardImageContainer}>
                        <Image
                          src={card.image_url || getLocalFallbackImage(card.slug)}
                          alt={card.title}
                          fill
                          className={styles.cardImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        <p className={styles.cardDesc}>{card.description}</p>
                        <div className={styles.cardFooter}>
                          <span className={styles.readMoreLabel}>
                            Lihat Detail
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📂</div>
                  <h2>Belum Ada Artikel</h2>
                  <p>Artikel untuk kategori <strong>{meta.title}</strong> belum tersedia.</p>
                </div>
              )}
            </div>

            {/* Right Column: Menu Quick Navigation */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <div className={styles.sidebarCard}>
                  <h3 className={styles.sidebarTitle}>Navigasi Artikel</h3>
                  <div className={styles.sidebarNav}>
                    {categories.map(cat => (
                      <Link 
                        key={cat.id} 
                        href={`/petugas/kategori/${cat.key}`} 
                        className={`${styles.navLink} ${cat.key === key ? styles.activeNavLink : ""}`}
                      >
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

      <GearMenu />
    </div>
  );
}
