"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasPenyebabPage() {
  const [penyebabList, setPenyebabList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLocalFallbackImage = (slug) => {
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

  const fetchPenyebab = async () => {
    try {
      const res = await fetch("/api/penyebab");
      const data = await res.json();
      if (res.ok && data.penyebab) {
        setPenyebabList(data.penyebab);
      }
    } catch (err) {
      console.error("Gagal mengambil data penyebab", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenyebab();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <section className={styles.headerSection}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/petugas" className={styles.backLink}>
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
              <span>Kembali ke Info TB</span>
            </Link>
          </div>

          <div className={styles.headerGroup}>
            <span className={styles.sub}>Etiologi & Transmisi</span>
            <h1 className={styles.mainTitle}>Penyebab & Penularan TB</h1>
            <p className={styles.intro}>
              Kenali apa saja faktor pemicu utama, cara penularan melalui udara, 
              serta kerentanan imunitas terhadap bakteri Mycobacterium tuberculosis.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          {loading ? (
            <div className={styles.grid}>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
            </div>
          ) : (
            <div className={styles.grid}>
              {penyebabList.map((card, index) => {
                const details = getCardDetails(card.slug);

                return (
                  <div key={card.id} className={styles.card}>
                    <div className={styles.cardImageContainer}>
                      <Image
                        src={card.image_url || getLocalFallbackImage(card.slug)}
                        alt={card.title}
                        fill
                        className={styles.cardImage}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 2}
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeaderRow}>
                        <span className={styles.typeBadge}>{details.type}</span>
                        <span className={`${styles.riskBadge} ${details.riskClass}`}>Risiko: {details.risk}</span>
                      </div>

                      <h2 className={styles.cardTitle}>{card.title}</h2>
                      <p className={styles.cardDesc}>{card.description}</p>

                      <div className={styles.cardMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Fokus Dampak:</span>
                          <span className={styles.metaValue}>{details.target}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Mekanisme:</span>
                          <span className={styles.metaValue}>{details.transmission}</span>
                        </div>
                      </div>
                      
                      <div className={styles.cardFooter}>
                        <Link href={`/petugas/penyebab/${card.slug}`} className={styles.readMoreLink}>
                          <span>Baca Detail Artikel</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={styles.arrowIcon}
                          >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
