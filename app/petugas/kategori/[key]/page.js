"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

const CATEGORY_META = {
  penjelasan_umum: {
    title: "Apa itu TB?",
    subtitle: "Penjelasan Umum",
    description: "Kumpulan artikel edukasi seputar pengertian dasar Tuberkulosis, bakteri penyebab, dan mekanisme infeksi.",
    filterFn: (slug) => slug.includes("bakteri") || slug.includes("imun"),
  },
  gejala: {
    title: "Gejala TB",
    subtitle: "Gejala & Diagnosis",
    description: "Artikel mengenai tanda-tanda klinis TB, metode diagnosis, serta pentingnya deteksi dini.",
    filterFn: (slug) => slug.includes("gejala"),
  },
  pengobatan: {
    title: "Skema Pengobatan",
    subtitle: "Pengobatan & Kepatuhan",
    description: "Artikel mengenai rejimen OAT, peran PMO, dan pentingnya kepatuhan minum obat selama terapi.",
    filterFn: (slug) => slug.includes("pmo") || slug.includes("obat") || slug.includes("dukungan"),
  },
  pencegahan: {
    title: "Pencegahan Penularan",
    subtitle: "Pencegahan & Proteksi",
    description: "Artikel mengenai cara mencegah penularan TB melalui etika batuk, ventilasi, dan gaya hidup sehat.",
    filterFn: (slug) =>
      slug.includes("droplet") ||
      slug.includes("penularan") ||
      slug.includes("lingkungan") ||
      slug.includes("kontak") ||
      slug.includes("rokok") ||
      slug.includes("pencegahan"),
  },
};

export default function KategoriPage({ params }) {
  const resolvedParams = use(params);
  const { key } = resolvedParams;

  const meta = CATEGORY_META[key];

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch("/api/penyebab");
        const data = await res.json();
        if (res.ok && data.penyebab && meta) {
          setCards(data.penyebab.filter((c) => meta.filterFn(c.slug)));
        }
      } catch (err) {
        console.error("Gagal memuat data kartu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
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

      {/* Card Grid */}
      <div className={styles.contentSection}>
        <div className={styles.container}>
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
      </div>

      <GearMenu />
    </div>
  );
}
