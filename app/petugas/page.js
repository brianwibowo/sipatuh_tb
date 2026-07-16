"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import { useAdmin } from "@/hooks/useAdmin";
import styles from "./page.module.css";

export default function PetugasInfoPage() {
  const { isAdmin, adminPassword, getAdminHeaders, loading: adminLoading } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  // Sync isEditing with admin status
  useEffect(() => {
    if (!isAdmin) {
      setIsEditing(false);
    }
  }, [isAdmin]);

  const handleStartEdit = (content) => {
    setEditingId(content.id);
    setEditTitle(content.title);
    setEditBody(content.body);
    setSaveError("");
  };

  const handleSave = async (id) => {
    if (!editTitle.trim() || !editBody.trim()) {
      setSaveError("Judul dan isi tidak boleh kosong");
      return;
    }

    setSaveLoading(true);
    setSaveError("");

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, title: editTitle, body: editBody }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setContents(
          contents.map((item) =>
            item.id === id ? { ...item, title: editTitle, body: editBody } : item
          )
        );
        setEditingId(null);
      } else {
        setSaveError(data.error || "Gagal menyimpan konten.");
      }
    } catch (err) {
      setSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Edit Mode Sticky Banner */}
      {isEditing && (
        <div className={styles.editorBanner}>
          <div className={styles.editorBannerContent}>
            <span className={styles.editorBannerText}>
              🔧 <strong>Mode Edit Aktif</strong> — Klik tombol edit pada kartu konten untuk mengubah teks artikel ilmiah.
            </span>
            <button 
              onClick={() => setIsEditing(false)}
              className={styles.editorBannerClose}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

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
                contents.map((content, idx) => {
                  const isCurrentEditing = editingId === content.id;

                  return (
                    <article 
                      key={content.id} 
                      className={`${styles.articleCard} ${isEditing ? styles.editableCard : ""}`} 
                      id={content.section_key}
                    >
                      {/* Rich Edit Header inside card instead of cheap floating button */}
                      {isEditing && !isCurrentEditing && (
                        <div className={styles.cardEditHeader}>
                          <span className={styles.sectionNumber}>Bagian {idx + 1}</span>
                          <button
                            onClick={() => handleStartEdit(content)}
                            className={styles.editBtn}
                          >
                            ✏️ Edit Bagian Ini
                          </button>
                        </div>
                      )}

                      {isCurrentEditing ? (
                        <div className={styles.editor}>
                          <h3 className={styles.editorTitle}>Mengedit Bagian Konten</h3>
                          
                          <div className={styles.inputGroup}>
                            <label className={styles.label}>Judul Bagian</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={styles.editInput}
                              placeholder="Judul Seksi Konten"
                              disabled={saveLoading}
                            />
                          </div>

                          <div className={styles.inputGroup}>
                            <label className={styles.label}>Isi Konten (Mendukung tag HTML)</label>
                            <textarea
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              className={styles.editTextarea}
                              rows={12}
                              placeholder="Gunakan format HTML seperti <p>, <h3>, <ul>, <li> untuk merapikan tulisan."
                              disabled={saveLoading}
                            />
                            <p className={styles.editorHelper}>
                              💡 Tip: Gunakan <code>&lt;p&gt;</code> untuk paragraf baru dan <code>&lt;strong&gt;teks&lt;/strong&gt;</code> untuk menebalkan teks penting.
                            </p>
                          </div>

                          {saveError && <div className={styles.errorContainer}>⚠️ {saveError}</div>}
                          
                          <div className={styles.editorActions}>
                            <button
                              onClick={() => setEditingId(null)}
                              className={styles.cancelBtn}
                              disabled={saveLoading}
                            >
                              ✕ Batal
                            </button>
                            <button
                              onClick={() => handleSave(content.id)}
                              className={styles.saveBtn}
                              disabled={saveLoading}
                            >
                              {saveLoading ? "⏳ Menyimpan..." : "✓ Simpan Perubahan"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.cardContent}>
                          <h2 className={styles.articleTitle}>
                            <span className={styles.titleIndex}>0{idx + 1}.</span> {content.title}
                          </h2>
                          <div
                            className={styles.articleBody}
                            dangerouslySetInnerHTML={{ __html: content.body }}
                          />
                        </div>
                      )}
                    </article>
                  );
                })
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

      {/* Floating Gear Menu controls */}
      {!adminLoading && (
        <GearMenu isEditing={isEditing} onToggleEditMode={setIsEditing} />
      )}
    </div>
  );
}
