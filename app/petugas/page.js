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
      {/* Top Banner Area */}
      <section className={styles.heroSection} style={{ padding: "4rem 2rem 2rem", borderBottom: "1px solid rgba(15, 110, 86, 0.08)", position: "relative" }}>
        <div className={styles.container} style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ position: "absolute", top: "-2rem", right: "0", zIndex: 10 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ffffff",
                color: "#5F5E5A",
                border: "1px solid rgba(95, 94, 90, 0.2)",
                padding: "8px 16px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.85rem",
                boxShadow: "0 2px 8px rgba(95, 94, 90, 0.04)",
                transition: "all 0.2s ease",
                textDecoration: "none"
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", alignItems: "center", gap: "3rem", width: "100%" }}>
            <div className={styles.headerGroup} style={{ maxWidth: "800px" }}>
              <span className={styles.sub} style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "#0F6E56", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                Informasi Umum
              </span>
              <h1 className={styles.mainTitle} style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0A5A45", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                Informasi Kepatuhan TB
              </h1>
              <p className={styles.intro} style={{ fontSize: "1.15rem", color: "#5F5E5A", lineHeight: 1.7 }}>
                Berikut adalah materi edukasi medis resmi mengenai Tuberkulosis (TB),
                gejala, rejimen pengobatan, dan pencegahannya.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Image
                src="/images/lungs-illustration.png"
                alt="Lungs Illustration"
                width={240}
                height={240}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(95, 94, 90, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.4)"
                }}
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
                contents.map((content) => {
                  const isCurrentEditing = editingId === content.id;

                  return (
                    <article key={content.id} className={styles.articleCard} id={content.section_key}>
                      {isEditing && !isCurrentEditing && (
                        <div className={styles.editBadge}>
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
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className={styles.editInput}
                            disabled={saveLoading}
                          />
                          <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className={styles.editTextarea}
                            rows={10}
                            disabled={saveLoading}
                          />
                          {saveError && <span className={styles.error}>{saveError}</span>}
                          <div className={styles.editorActions}>
                            <button
                              onClick={() => setEditingId(null)}
                              className={styles.cancelBtn}
                              disabled={saveLoading}
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSave(content.id)}
                              className={styles.saveBtn}
                              disabled={saveLoading}
                            >
                              {saveLoading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className={styles.articleTitle}>{content.title}</h2>
                          <div
                            className={styles.articleBody}
                            dangerouslySetInnerHTML={{ __html: content.body }}
                          />
                        </>
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
                      Apa itu TB?
                    </a>
                    <a href="#gejala" className={styles.navLink}>
                      Gejala TB
                    </a>
                    <a href="#pengobatan" className={styles.navLink}>
                      Skema Pengobatan OAT
                    </a>
                    <a href="#pencegahan" className={styles.navLink}>
                      Pencegahan Penularan
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
                      strokeWidth="2"
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
