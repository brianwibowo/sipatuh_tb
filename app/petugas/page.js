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
  const [parsedEditBody, setParsedEditBody] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const updateParsedField = (key, value) => {
    setParsedEditBody((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateParsedStat = (idx, field, value) => {
    setParsedEditBody((prev) => {
      const newStats = [...prev.stats];
      newStats[idx] = { ...newStats[idx], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  const updateParsedTable = (idx, field, value) => {
    setParsedEditBody((prev) => {
      const newTable = [...prev.table];
      newTable[idx] = { ...newTable[idx], [field]: value };
      return { ...prev, table: newTable };
    });
  };

  const updateParsedPhase = (idx, field, value) => {
    setParsedEditBody((prev) => {
      const newPhases = [...prev.phases];
      newPhases[idx] = { ...newPhases[idx], [field]: value };
      return { ...prev, phases: newPhases };
    });
  };

  const updateParsedPillar = (idx, field, value) => {
    setParsedEditBody((prev) => {
      const newPillars = [...prev.pillars];
      newPillars[idx] = { ...newPillars[idx], [field]: value };
      return { ...prev, pillars: newPillars };
    });
  };

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
    try {
      const parsed = JSON.parse(content.body);
      setParsedEditBody(parsed);
      setEditBody("");
    } catch (e) {
      setParsedEditBody(null);
      setEditBody(content.body);
    }
    setSaveError("");
  };

  const handleSave = async (id) => {
    if (!editTitle.trim()) {
      setSaveError("Judul tidak boleh kosong");
      return;
    }

    let finalBodyString = editBody;
    if (parsedEditBody) {
      finalBodyString = JSON.stringify(parsedEditBody);
    }

    if (!finalBodyString.trim()) {
      setSaveError("Isi konten tidak boleh kosong");
      return;
    }

    setSaveLoading(true);
    setSaveError("");

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, title: editTitle, body: finalBodyString }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setContents(
          contents.map((item) =>
            item.id === id ? { ...item, title: editTitle, body: finalBodyString } : item
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

                          {parsedEditBody ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
                              {content.section_key === "penjelasan_umum" && (
                                <>
                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Paragraf Deskripsi</label>
                                    <textarea
                                      value={parsedEditBody.description || ""}
                                      onChange={(e) => updateParsedField("description", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={5}
                                      disabled={saveLoading}
                                    />
                                  </div>
                                  
                                  <div style={{ fontWeight: "700", color: "var(--primary-dark)", fontSize: "0.95rem" }}>Kartu Statistik Epidemiologi</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                                    {parsedEditBody.stats?.map((stat, sIdx) => (
                                      <div key={sIdx} style={{ border: "1px solid var(--border-medium)", padding: "10px", borderRadius: "8px", backgroundColor: "#ffffff" }}>
                                        <div className={styles.inputGroup} style={{ marginBottom: "8px" }}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Angka / Nilai (Kartu {sIdx+1})</label>
                                          <input
                                            type="text"
                                            value={stat.number || ""}
                                            onChange={(e) => updateParsedStat(sIdx, "number", e.target.value)}
                                            className={styles.editInput}
                                            style={{ fontSize: "0.95rem", padding: "6px 10px" }}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Label (Kartu {sIdx+1})</label>
                                          <input
                                            type="text"
                                            value={stat.label || ""}
                                            onChange={(e) => updateParsedStat(sIdx, "label", e.target.value)}
                                            className={styles.editInput}
                                            style={{ fontSize: "0.95rem", padding: "6px 10px" }}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Kutipan Penting (Quote)</label>
                                    <textarea
                                      value={parsedEditBody.quote || ""}
                                      onChange={(e) => updateParsedField("quote", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={3}
                                      disabled={saveLoading}
                                    />
                                  </div>

                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Deskripsi Patogenesis</label>
                                    <textarea
                                      value={parsedEditBody.patogenesis || ""}
                                      onChange={(e) => updateParsedField("patogenesis", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={5}
                                      disabled={saveLoading}
                                    />
                                  </div>
                                </>
                              )}

                              {content.section_key === "gejala" && (
                                <>
                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Deskripsi Pengantar</label>
                                    <textarea
                                      value={parsedEditBody.description || ""}
                                      onChange={(e) => updateParsedField("description", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={4}
                                      disabled={saveLoading}
                                    />
                                  </div>

                                  <div style={{ fontWeight: "700", color: "var(--primary-dark)", fontSize: "0.95rem" }}>Daftar Gejala & Patofisiologi (Tabel)</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {parsedEditBody.table?.map((row, rIdx) => (
                                      <div key={rIdx} style={{ border: "1px solid var(--border-medium)", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#ffffff" }}>
                                        <div style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.85rem" }}>Baris {rIdx+1}: {row.category}</div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Manifestasi Spesifik</label>
                                          <input
                                            type="text"
                                            value={row.manifestation || ""}
                                            onChange={(e) => updateParsedTable(rIdx, "manifestation", e.target.value)}
                                            className={styles.editInput}
                                            style={{ fontSize: "0.95rem", padding: "6px 10px" }}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Kondisi Patofisiologis</label>
                                          <textarea
                                            value={row.pathophysiology || ""}
                                            onChange={(e) => updateParsedTable(rIdx, "pathophysiology", e.target.value)}
                                            className={styles.editTextarea}
                                            rows={2}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Kesimpulan & Metode Diagnosis</label>
                                    <textarea
                                      value={parsedEditBody.conclusion || ""}
                                      onChange={(e) => updateParsedField("conclusion", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={4}
                                      disabled={saveLoading}
                                    />
                                  </div>
                                </>
                              )}

                              {content.section_key === "pengobatan" && (
                                <>
                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Deskripsi Pengantar</label>
                                    <textarea
                                      value={parsedEditBody.description || ""}
                                      onChange={(e) => updateParsedField("description", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={4}
                                      disabled={saveLoading}
                                    />
                                  </div>

                                  <div style={{ fontWeight: "700", color: "var(--primary-dark)", fontSize: "0.95rem" }}>Manajemen Rejimen Terapi OAT</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {parsedEditBody.phases?.map((phase, pIdx) => (
                                      <div key={pIdx} style={{ border: "1px solid var(--border-medium)", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#ffffff" }}>
                                        <div style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.95rem" }}>{phase.name}</div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Durasi</label>
                                          <input
                                            type="text"
                                            value={phase.duration || ""}
                                            onChange={(e) => updateParsedPhase(pIdx, "duration", e.target.value)}
                                            className={styles.editInput}
                                            style={{ fontSize: "0.95rem", padding: "6px 10px" }}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Komposisi Obat</label>
                                          <input
                                            type="text"
                                            value={phase.drugs || ""}
                                            onChange={(e) => updateParsedPhase(pIdx, "drugs", e.target.value)}
                                            className={styles.editInput}
                                            style={{ fontSize: "0.95rem", padding: "6px 10px" }}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Tujuan Klinis Utama</label>
                                          <textarea
                                            value={phase.objective || ""}
                                            onChange={(e) => updateParsedPhase(pIdx, "objective", e.target.value)}
                                            className={styles.editTextarea}
                                            rows={3}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Peringatan / Catatan Ketidakpatuhan</label>
                                    <textarea
                                      value={parsedEditBody.warning || ""}
                                      onChange={(e) => updateParsedField("warning", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={4}
                                      disabled={saveLoading}
                                    />
                                  </div>
                                </>
                              )}

                              {content.section_key === "pencegahan" && (
                                <>
                                  <div className={styles.inputGroup}>
                                    <label className={styles.label}>Deskripsi Pengantar</label>
                                    <textarea
                                      value={parsedEditBody.description || ""}
                                      onChange={(e) => updateParsedField("description", e.target.value)}
                                      className={styles.editTextarea}
                                      rows={4}
                                      disabled={saveLoading}
                                    />
                                  </div>

                                  <div style={{ fontWeight: "700", color: "var(--primary-dark)", fontSize: "0.95rem" }}>Pilar Pengendalian & Pencegahan</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {parsedEditBody.pillars?.map((pillar, plIdx) => (
                                      <div key={plIdx} style={{ border: "1px solid var(--border-medium)", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#ffffff" }}>
                                        <div style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.85rem" }}>Pilar {plIdx+1}: {pillar.title}</div>
                                        <div className={styles.inputGroup}>
                                          <label className={styles.label} style={{ fontSize: "0.75rem" }}>Penjelasan Detail</label>
                                          <textarea
                                            value={pillar.desc || ""}
                                            onChange={(e) => updateParsedPillar(plIdx, "desc", e.target.value)}
                                            className={styles.editTextarea}
                                            rows={3}
                                            disabled={saveLoading}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                              <label className={styles.label}>Isi Konten (HTML Textarea Fallback)</label>
                              <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className={styles.editTextarea}
                                rows={12}
                                placeholder="Gunakan format HTML seperti <p>, <h3>, <ul>, <li> untuk merapikan tulisan."
                                disabled={saveLoading}
                              />
                            </div>
                          )}

                          {saveError && <div className={styles.errorContainer}>⚠️ {saveError}</div>}
                          
                          <div className={styles.editorActions}>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className={styles.cancelBtn}
                              disabled={saveLoading}
                            >
                              ✕ Batal
                            </button>
                            <button
                              type="button"
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
                          {renderCardContent(content)}
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
