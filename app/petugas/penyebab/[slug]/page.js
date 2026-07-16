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
  const [allArticles, setAllArticles] = useState([]);
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

      // Fetch all articles for related list
      const allRes = await fetch("/api/artikel");
      const allData = await allRes.json();
      if (allRes.ok && allData.artikels) {
        setAllArticles(allData.artikels);
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

  const getRelatedArticles = () => {
    if (!artikel) return [];
    const currentSlug = artikel.slug;
    
    // Determine category of current article
    let category = "";
    if (currentSlug.includes("bakteri") || currentSlug.includes("imun")) {
      category = "penjelasan_umum";
    } else if (currentSlug.includes("gejala")) {
      category = "gejala";
    } else if (currentSlug.includes("pmo") || currentSlug.includes("obat")) {
      category = "pengobatan";
    } else {
      category = "pencegahan";
    }
    
    // Filter other articles in same category
    return allArticles.filter(art => {
      if (art.slug === currentSlug) return false;
      
      let artCat = "";
      if (art.slug.includes("bakteri") || art.slug.includes("imun")) {
        artCat = "penjelasan_umum";
      } else if (art.slug.includes("gejala")) {
        artCat = "gejala";
      } else if (art.slug.includes("pmo") || art.slug.includes("obat")) {
        artCat = "pengobatan";
      } else {
        artCat = "pencegahan";
      }
      
      return artCat === category;
    });
  };

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

              {(() => {
                try {
                  const parsed = JSON.parse(artikel.body);
                  if (parsed && typeof parsed === "object" && parsed.blocks) {
                    return (
                      <div className={styles.body}>
                        {parsed.author && (
                          <div className={styles.authorMeta}>
                            ✍️ Ditulis oleh: <strong>{parsed.author}</strong>
                          </div>
                        )}
                        
                        {parsed.blocks.map((block, idx) => {
                          if (block.type === "text") {
                            // Split by newline to preserve paragraph breaks
                            return block.value.split("\n").map((para, pidx) => (
                              para.trim() && <p key={`${idx}-${pidx}`} className={styles.paragraph}>{para}</p>
                            ));
                          } else if (block.type === "image") {
                            return (
                              <div key={idx} className={styles.articleImageBlock}>
                                <img src={block.value} alt="Ilustrasi materi" className={styles.blockImg} />
                              </div>
                            );
                          }
                          return null;
                        })}

                        {parsed.external_link && (
                          <div className={styles.externalLinkMeta}>
                            🔗 Link Eksternal:{" "}
                            <a href={parsed.external_link} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                              {parsed.external_link}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }
                } catch (e) {}

                return <div className={styles.body} dangerouslySetInnerHTML={{ __html: artikel.body }} />;
              })()}

              {/* Related articles at the bottom */}
              {getRelatedArticles().length > 0 && (
                <div className={styles.relatedBox}>
                  <h3 className={styles.relatedTitle}>Artikel Terkait Lainnya</h3>
                  <div className={styles.relatedGrid}>
                    {getRelatedArticles().map(art => (
                      <Link key={art.id} href={`/petugas/penyebab/${art.slug}`} className={styles.relatedCard}>
                        <div className={styles.relatedCardBody}>
                          <span className={styles.relatedBadge}>BACA ARTIKEL</span>
                          <h4 className={styles.relatedCardTitle}>{art.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
