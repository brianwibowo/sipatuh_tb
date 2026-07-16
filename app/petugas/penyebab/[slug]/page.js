"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import styles from "./page.module.css";

export default function PetugasArtikelDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [artikel, setArtikel] = useState(null);
  const [penyebab, setPenyebab] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Get article by slug
      const res = await fetch(`/api/artikel?slug=${slug}`);
      const data = await res.json();

      if (res.ok && data.artikel) {
        setArtikel(data.artikel);
        setPenyebab(data.artikel.penyebab_card);
      } else {
        // If article not found by slug, it might be a penyebab_card slug! Let's fetch penyebab_card detail
        const cardRes = await fetch("/api/penyebab");
        const cardData = await cardRes.json();
        if (cardRes.ok && cardData.penyebab) {
          const card = cardData.penyebab.find((c) => c.slug === slug);
          if (card) {
            setPenyebab(card);
            // Now check if there is an article for this card
            const artRes = await fetch(`/api/artikel?penyebab_card_id=${card.id}`);
            const artData = await artRes.json();
            if (artRes.ok && artData.artikel) {
              setArtikel(artData.artikel);
            }
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat detail artikel", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const getLocalFallbackImage = (slugStr) => {
    if (!slugStr) return "/images/lungs-illustration.png";
    if (slugStr.includes("bakteri")) {
      return "/images/bacteria-illustration.png";
    }
    if (slugStr.includes("droplet") || slugStr.includes("penularan")) {
      return "/images/droplet-illustration.png";
    }
    if (slugStr.includes("imun") || slugStr.includes("kekebalan")) {
      return "/images/lungs-illustration.png";
    }
    return "/images/lungs-illustration.png";
  };

  return (
    <div className={styles.wrapper}>
      {/* Container */}
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/petugas/penyebab" className={styles.backLink}>
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
            <span>Kembali ke Penyebab</span>
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className="shimmer" style={{ height: "350px", borderRadius: "24px", marginBottom: "2rem" }}></div>
            <div className="shimmer" style={{ height: "40px", width: "60%", borderRadius: "8px", marginBottom: "1rem" }}></div>
            <div className="shimmer" style={{ height: "180px", borderRadius: "16px" }}></div>
          </div>
        ) : artikel ? (
          <div className={styles.articleLayout}>
            <article className={styles.article}>
              <div className={styles.heroImageContainer}>
                <Image
                  src={artikel.image_url || getLocalFallbackImage(penyebab?.slug)}
                  alt={artikel.title}
                  fill
                  className={styles.heroImage}
                  priority
                  sizes="100vw"
                />
              </div>

              <header className={styles.header}>
                <span className={styles.category}>Detail Materi TB</span>
                <h1 className={styles.title}>{artikel.title}</h1>
              </header>

              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: artikel.body }}
              />
            </article>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h2>Artikel Belum Tersedia</h2>
            <p>
              Konten edukasi medis untuk topik <strong>&ldquo;{penyebab?.title}&rdquo;</strong> belum 
              diterbitkan oleh petugas kesehatan. Silakan kembali lagi nanti.
            </p>
          </div>
        )}
      </div>

      {/* Floating Gear Menu */}
      <GearMenu />
    </div>
  );
}
