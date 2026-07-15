"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import { useAdmin } from "@/hooks/useAdmin";
import styles from "./page.module.css";

export default function PetugasArtikelDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { isAdmin, adminPassword, getAdminHeaders, loading: adminLoading } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);

  const [artikel, setArtikel] = useState(null);
  const [penyebab, setPenyebab] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editImgUrl, setEditImgUrl] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Create article states (if card exists but no article is created yet)
  const [isCreating, setIsCreating] = useState(false);

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

  useEffect(() => {
    if (!isAdmin) {
      setIsEditing(false);
      setIsCreating(false);
    }
  }, [isAdmin]);

  const handleStartEdit = () => {
    if (artikel) {
      setEditTitle(artikel.title);
      setEditBody(artikel.body);
      setEditImgUrl(artikel.image_url || "");
    } else {
      setEditTitle(penyebab ? `Detail: ${penyebab.title}` : "");
      setEditBody("");
      setEditImgUrl(penyebab ? penyebab.image_url || "" : "");
    }
    setSaveError("");
    setIsCreating(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editBody.trim()) {
      setSaveError("Judul dan isi artikel harus diisi");
      return;
    }

    setSaveLoading(true);
    setSaveError("");

    try {
      const url = "/api/artikel";
      const method = artikel ? "PUT" : "POST";
      const payload = {
        title: editTitle,
        body: editBody,
        image_url: editImgUrl,
      };

      if (artikel) {
        payload.id = artikel.id;
      } else {
        payload.penyebab_card_id = penyebab.id;
      }

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setArtikel(data.artikel);
        setIsCreating(false);
        setIsEditing(false);
        fetchData(); // reload
      } else {
        setSaveError(data.error || "Gagal menyimpan artikel.");
      }
    } catch (err) {
      setSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Container */}
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/petugas/penyebab" className={styles.backLink}>
            <svg
              width="20"
              height="20"
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
        ) : (
          <div className={styles.articleLayout}>
            {/* If Editing/Creating Mode */}
            {isEditing && isCreating ? (
              <div className={styles.editorCard}>
                <h2 className={styles.editorTitle}>
                  {artikel ? "Edit Artikel" : "Tulis Artikel Baru"}
                </h2>
                <form onSubmit={handleSave} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Judul Artikel</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Gambar Header</label>
                    <ImageUploader
                      adminPassword={adminPassword}
                      onUploadSuccess={setEditImgUrl}
                      currentImageUrl={editImgUrl}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Isi Artikel (Mendukung HTML)</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className={styles.textarea}
                      rows={15}
                      placeholder="Gunakan tag HTML dasar seperti <p>, <h3>, <ul>, <li> untuk merapikan tulisan."
                      required
                    />
                  </div>

                  {saveError && <span className={styles.error}>{saveError}</span>}

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setIsCreating(false)}
                      disabled={saveLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={saveLoading}
                    >
                      {saveLoading ? "Menyimpan..." : "Simpan Artikel"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* Main Article Render */}
                {artikel ? (
                  <article className={styles.article}>
                    {isEditing && (
                      <div className={styles.adminEditHeader}>
                        <button onClick={handleStartEdit} className={styles.editArticleBtn}>
                          ✏️ Edit Artikel Detail
                        </button>
                      </div>
                    )}

                    {artikel.image_url && (
                      <div className={styles.heroImageContainer}>
                        <Image
                          src={artikel.image_url}
                          alt={artikel.title}
                          fill
                          className={styles.heroImage}
                          priority
                          sizes="100vw"
                        />
                      </div>
                    )}

                    <header className={styles.header}>
                      {penyebab && <span className={styles.category}>Penyebab: {penyebab.title}</span>}
                      <h1 className={styles.title}>{artikel.title}</h1>
                    </header>

                    <div
                      className={styles.body}
                      dangerouslySetInnerHTML={{ __html: artikel.body }}
                    />
                  </article>
                ) : (
                  // Empty State - No article yet
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📄</div>
                    <h2>Belum Ada Artikel Detail</h2>
                    <p>
                      Materi penjelasan lengkap untuk penyebab <strong>&quot;{penyebab?.title}&quot;</strong> belum ditulis.
                    </p>
                    {isEditing ? (
                      <button onClick={handleStartEdit} className={styles.createBtn}>
                        Tulis Artikel Sekarang
                      </button>
                    ) : (
                      <p className={styles.hint}>Hubungi administrator petugas kesehatan untuk melengkapi konten ini.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Gear Menu controls */}
      {!adminLoading && (
        <GearMenu isEditing={isEditing} onToggleEditMode={setIsEditing} />
      )}
    </div>
  );
}
