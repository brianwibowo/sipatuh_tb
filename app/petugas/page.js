"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasInfoPage() {
  const [contents, setContents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [penyebabCards, setPenyebabCards] = useState([]);
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

  const fetchPenyebabCards = async () => {
    try {
      const res = await fetch("/api/penyebab");
      const data = await res.json();
      if (res.ok && data.penyebab) {
        setPenyebabCards(data.penyebab);
      }
    } catch (err) {
      console.error("Gagal memuat penyebab cards", err);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchArticles();
    fetchPenyebabCards();
  }, []);

  const getLocalFallbackImage = (slug) => {
    if (slug.includes("pencegahan")) {
      return "/images/caring_nurse_comforting_patient_1784200678670.png";
    }
    if (slug.includes("pmo") || slug.includes("dukungan")) {
      return "/images/medical_shaking_hands_1784200384280.png";
    }
    if (slug.includes("gejala")) {
      return "/images/lungs_illustration_1784100215238.png";
    }
    if (slug.includes("bakteri")) {
      return "/images/bacteria-illustration.png";
    }
    if (slug.includes("droplet") || slug.includes("penularan")) {
      return "/images/droplet-illustration.png";
    }
    if (slug.includes("imun") || slug.includes("kekebalan")) {
      return "/images/lungs-illustration.png";
    }
    return "/images/lungs-illustration.png";
  };

  const getCardDetails = (slug) => {
    if (slug.includes("pencegahan")) {
      return {
        type: "Pencegahan",
        risk: "Imunisasi & APD",
        riskClass: styles.badgePrimary,
        target: "Komunitas & Keluarga",
        transmission: "Vaksinasi & Kontrol Udara"
      };
    }
    if (slug.includes("pmo") || slug.includes("dukungan")) {
      return {
        type: "Dukungan",
        risk: "Kepatuhan OAT",
        riskClass: styles.badgePrimary,
        target: "Kedisiplinan Terapi SO/MDR",
        transmission: "Keluarga & Petugas Siaga"
      };
    }
    if (slug.includes("gejala")) {
      return {
        type: "Diagnosis",
        risk: "Deteksi Dini",
        riskClass: styles.badgePrimary,
        target: "Fasilitas Kesehatan & Komunitas",
        transmission: "TCM GeneXpert & BTA"
      };
    }
    if (slug.includes("bakteri")) {
      return {
        type: "Biologis",
        risk: "Sangat Tinggi",
        riskClass: styles.badgeDanger,
        target: "Paru-paru & Ekstra-paru",
        transmission: "Inhalasi Nuklei Droplet"
      };
    }
    if (slug.includes("droplet") || slug.includes("penularan")) {
      return {
        type: "Transmisi",
        risk: "Sangat Cepat",
        riskClass: styles.badgeDanger,
        target: "Kontak Udara Terbuka",
        transmission: "Bersin, Batuk, Berbicara"
      };
    }
    if (slug.includes("imun") || slug.includes("kekebalan")) {
      return {
        type: "Fisiologis",
        risk: "Tinggi",
        riskClass: styles.badgeWarning,
        target: "Rentan Reaktivasi",
        transmission: "Kondisi Komorbid (HIV, DM)"
      };
    }
    if (slug.includes("lingkungan") || slug.includes("padat")) {
      return {
        type: "Lingkungan",
        risk: "Tinggi",
        riskClass: styles.badgeWarning,
        target: "Kluster Rumah Tangga",
        transmission: "Sirkulasi & Sinar UV Buruk"
      };
    }
    if (slug.includes("kontak") || slug.includes("erat")) {
      return {
        type: "Sosial",
        risk: "Sangat Tinggi",
        riskClass: styles.badgeDanger,
        target: "Keluarga & Rekan Kerja",
        transmission: "Interaksi Intens Harian"
      };
    }
    if (slug.includes("rokok") || slug.includes("merokok")) {
      return {
        type: "Perilaku",
        risk: "Sedang-Tinggi",
        riskClass: styles.badgeWarning,
        target: "Kerusakan Silia Paru",
        transmission: "Paparan Asap Kronis"
      };
    }
    return {
      type: "Faktor Risiko",
      risk: "Bervariasi",
      riskClass: styles.badgeWarning,
      target: "Sistemik",
      transmission: "Multi-faktor"
    };
  };

  const getCardsForSection = (sectionKey) => {
    switch (sectionKey) {
      case "penjelasan_umum":
        return penyebabCards.filter(c => c.slug.includes("bakteri") || c.slug.includes("imun"));
      case "gejala":
        return penyebabCards.filter(c => c.slug.includes("gejala"));
      case "pengobatan":
        return penyebabCards.filter(c => c.slug.includes("pmo") || c.slug.includes("obat"));
      case "pencegahan":
        return penyebabCards.filter(c => 
          c.slug.includes("droplet") || 
          c.slug.includes("penularan") || 
          c.slug.includes("lingkungan") || 
          c.slug.includes("kontak") || 
          c.slug.includes("rokok") || 
          c.slug.includes("pencegahan")
        );
      default:
        return [];
    }
  };

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
                  <h3 className={styles.sidebarTitle}>Navigasi Artikel</h3>
                  <div className={styles.sidebarNav}>
                    <Link href="/petugas/kategori/penjelasan_umum" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Apa itu TB?
                    </Link>
                    <Link href="/petugas/kategori/gejala" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Gejala TB
                    </Link>
                    <Link href="/petugas/kategori/pengobatan" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Skema Pengobatan
                    </Link>
                    <Link href="/petugas/kategori/pencegahan" className={styles.navLink}>
                      <span className={styles.navIcon}>•</span> Pencegahan Penularan
                    </Link>
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
