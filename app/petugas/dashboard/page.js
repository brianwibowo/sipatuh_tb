"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import { useAdmin } from "@/hooks/useAdmin";
import styles from "./page.module.css";

export default function PetugasDashboardPage() {
  const { isAdmin, adminPassword, login, logout, getAdminHeaders, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState("materi"); // "materi" | "penyebab" | "video"
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Laman 1: Materi Edukasi states
  const [materiList, setMateriList] = useState([]);
  const [materiLoading, setMateriLoading] = useState(false);
  const [editingMateriId, setEditingMateriId] = useState(null);
  const [editMateriTitle, setEditMateriTitle] = useState("");
  const [parsedMateriBody, setParsedMateriBody] = useState(null);
  const [materiSaveLoading, setMateriSaveLoading] = useState(false);
  const [materiSaveError, setMateriSaveError] = useState("");

  // Laman 2: Penyebab states
  const [penyebabList, setPenyebabList] = useState([]);
  const [penyebabLoading, setPenyebabLoading] = useState(false);
  const [editingPenyebabId, setEditingPenyebabId] = useState(null); // null = not editing, "new" = adding, UUID = editing card
  const [editPenyebabTitle, setEditPenyebabTitle] = useState("");
  const [editPenyebabDesc, setEditPenyebabDesc] = useState("");
  const [editPenyebabImg, setEditPenyebabImg] = useState("");
  const [penyebabSaveLoading, setPenyebabSaveLoading] = useState(false);
  const [penyebabSaveError, setPenyebabSaveError] = useState("");

  // Laman Pasien: Video states
  const [videoList, setVideoList] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoSaveLoading, setVideoSaveLoading] = useState(false);
  const [videoSaveError, setVideoSaveError] = useState("");

  // Fetch data functions
  const fetchMateri = async () => {
    setMateriLoading(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok && data.contents) {
        setMateriList(data.contents);
      }
    } catch (err) {
      console.error("Gagal mengambil materi", err);
    } finally {
      setMateriLoading(false);
    }
  };

  const fetchPenyebab = async () => {
    setPenyebabLoading(true);
    try {
      const res = await fetch("/api/penyebab");
      const data = await res.json();
      if (res.ok && data.penyebab) {
        setPenyebabList(data.penyebab);
      }
    } catch (err) {
      console.error("Gagal mengambil penyebab", err);
    } finally {
      setPenyebabLoading(false);
    }
  };

  const fetchVideos = async () => {
    setVideoLoading(true);
    try {
      const res = await fetch("/api/video");
      const data = await res.json();
      if (res.ok && data.videos) {
        setVideoList(data.videos);
      }
    } catch (err) {
      console.error("Gagal mengambil video", err);
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMateri();
      fetchPenyebab();
      fetchVideos();
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError("Password wajib diisi");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(passwordInput);
      } else {
        setLoginError(data.error || "Password akses salah.");
      }
    } catch (err) {
      setLoginError("Terjadi kesalahan jaringan.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Structured Editor state update helper functions
  const updateParsedField = (key, value) => {
    setParsedMateriBody((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateParsedStat = (idx, field, value) => {
    setParsedMateriBody((prev) => {
      const newStats = [...prev.stats];
      newStats[idx] = { ...newStats[idx], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  const updateParsedTable = (idx, field, value) => {
    setParsedMateriBody((prev) => {
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
    setParsedMateriBody((prev) => {
      const newPillars = [...prev.pillars];
      newPillars[idx] = { ...newPillars[idx], [field]: value };
      return { ...prev, pillars: newPillars };
    });
  };

  // CRUD: Laman 1 - Materi Edukasi
  const handleStartEditMateri = (materi) => {
    setEditingMateriId(materi.id);
    setEditMateriTitle(materi.title);
    try {
      const parsed = JSON.parse(materi.body);
      setParsedMateriBody(parsed);
    } catch (e) {
      // Fallback
      setParsedMateriBody({
        description: materi.body,
      });
    }
    setMateriSaveError("");
  };

  const handleSaveMateri = async (e) => {
    e.preventDefault();
    if (!editMateriTitle.trim()) {
      setMateriSaveError("Judul tidak boleh kosong");
      return;
    }

    setMateriSaveLoading(true);
    setMateriSaveError("");

    const bodyString = JSON.stringify(parsedMateriBody);

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: editingMateriId,
          title: editMateriTitle,
          body: bodyString,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEditingMateriId(null);
        fetchMateri();
      } else {
        setMateriSaveError(data.error || "Gagal menyimpan materi.");
      }
    } catch (err) {
      setMateriSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setMateriSaveLoading(false);
    }
  };

  // CRUD: Laman 2 - Penyebab TB
  const handleStartEditPenyebab = (card) => {
    setEditingPenyebabId(card.id);
    setEditPenyebabTitle(card.title);
    setEditPenyebabDesc(card.description || "");
    setEditPenyebabImg(card.image_url || "");
    setPenyebabSaveError("");
  };

  const handleStartAddPenyebab = () => {
    setEditingPenyebabId("new");
    setEditPenyebabTitle("");
    setEditPenyebabDesc("");
    setEditPenyebabImg("");
    setPenyebabSaveError("");
  };

  const handleSavePenyebab = async (e) => {
    e.preventDefault();
    if (!editPenyebabTitle.trim()) {
      setPenyebabSaveError("Nama penyebab wajib diisi");
      return;
    }

    setPenyebabSaveLoading(true);
    setPenyebabSaveError("");

    const method = editingPenyebabId === "new" ? "POST" : "PUT";
    const payload = {
      title: editPenyebabTitle,
      description: editPenyebabDesc,
      image_url: editPenyebabImg || "/images/lungs-illustration.png",
    };

    if (editingPenyebabId !== "new") {
      payload.id = editingPenyebabId;
    }

    try {
      const res = await fetch("/api/penyebab", {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEditingPenyebabId(null);
        fetchPenyebab();
      } else {
        setPenyebabSaveError(data.error || "Gagal menyimpan card penyebab.");
      }
    } catch (err) {
      setPenyebabSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setPenyebabSaveLoading(false);
    }
  };

  const handleDeletePenyebab = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bagian penyebab ini? Menghapus penyebab juga akan menghapus artikel detailnya.")) return;
    try {
      const res = await fetch(`/api/penyebab?id=${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchPenyebab();
      }
    } catch (err) {
      console.error("Gagal menghapus penyebab", err);
    }
  };

  // CRUD: Laman Pasien - Video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      setVideoSaveError("Judul dan URL video wajib diisi");
      return;
    }

    setVideoSaveLoading(true);
    setVideoSaveError("");

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ title: newVideoTitle, embed_url: newVideoUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNewVideoTitle("");
        setNewVideoUrl("");
        fetchVideos();
      } else {
        setVideoSaveError(data.error || "Gagal menambahkan video.");
      }
    } catch (err) {
      setVideoSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setVideoSaveLoading(false);
    }
  };

  const handleToggleVideo = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/video", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error("Gagal mengupdate status video", err);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus video ini?")) return;
    try {
      const res = await fetch(`/api/video?id=${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error("Gagal menghapus video", err);
    }
  };

  // Login view if not logged in
  if (!isAdmin) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <span className={styles.loginLogo}>SIPATUH<span className={styles.logoHighlight}>-TB</span></span>
            <h1 className={styles.loginTitle}>Akses Dashboard Petugas</h1>
            <p className={styles.loginSubtitle}>
              Silakan masukkan password otorisasi petugas kesehatan untuk masuk ke panel administrasi.
            </p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password Akses</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={styles.input}
                disabled={loginLoading}
                required
              />
            </div>

            {loginError && <div className={styles.errorContainer}>⚠️ {loginError}</div>}

            <button type="submit" className={styles.loginBtn} disabled={loginLoading}>
              {loginLoading ? "⏳ Memverifikasi..." : "Masuk ke Panel"}
            </button>
          </form>

          <Link href="/" className={styles.backHomeBtn}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard workspace once logged in
  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h3>SIPATUH-TB</h3>
          <span className={styles.sidebarSub}>Panel Administrasi</span>
        </div>

        <nav className={styles.sidebarNav}>
          <button 
            onClick={() => { setActiveTab("materi"); setEditingMateriId(null); }}
            className={`${styles.sidebarBtn} ${activeTab === "materi" ? styles.sidebarBtnActive : ""}`}
          >
            📄 Materi Edukasi (L1)
          </button>
          <button 
            onClick={() => { setActiveTab("penyebab"); setEditingPenyebabId(null); }}
            className={`${styles.sidebarBtn} ${activeTab === "penyebab" ? styles.sidebarBtnActive : ""}`}
          >
            🦠 Penyebab & Penularan (L2)
          </button>
          <button 
            onClick={() => { setActiveTab("video"); }}
            className={`${styles.sidebarBtn} ${activeTab === "video" ? styles.sidebarBtnActive : ""}`}
          >
            🎥 Video Edukasi Pasien
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={logout} className={styles.logoutBtn}>
            Log Out (Keluar Sesi)
          </button>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main className={styles.mainWorkspace}>
        {/* TAB 1: MATERI EDUKASI (LAMAN 1) */}
        {activeTab === "materi" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h2>Kelola Materi Edukasi (Laman 1)</h2>
              <p>Sunting data penjelasan umum, klasifikasi gejala, skema pengobatan, dan metode pencegahan.</p>
            </div>

            {materiLoading ? (
              <div className={styles.loading}>Memuat bagian materi...</div>
            ) : editingMateriId ? (
              // Structured Layperson Form Editor
              <form onSubmit={handleSaveMateri} className={styles.editorForm}>
                <div className={styles.editorFormHeader}>
                  <h3>Mengedit: {editMateriTitle}</h3>
                  <button type="button" onClick={() => setEditingMateriId(null)} className={styles.cancelLinkBtn}>
                    ← Kembali ke Daftar
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Judul Bagian</label>
                  <input
                    type="text"
                    value={editMateriTitle}
                    onChange={(e) => setEditMateriTitle(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                {parsedMateriBody && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
                    {/* Form fields based on the section key */}
                    {materiList.find(m => m.id === editingMateriId)?.section_key === "penjelasan_umum" && (
                      <>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Paragraf Deskripsi</label>
                          <textarea
                            value={parsedMateriBody.description || ""}
                            onChange={(e) => updateParsedField("description", e.target.value)}
                            className={styles.textarea}
                            rows={5}
                            required
                          />
                        </div>

                        <div className={styles.sectionTitle}>Tabel Ringkasan Statistik</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          {parsedMateriBody.stats?.map((stat, sIdx) => (
                            <div key={sIdx} className={styles.nestedCard}>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Nilai / Angka (Kartu {sIdx+1})</label>
                                <input
                                  type="text"
                                  value={stat.number || ""}
                                  onChange={(e) => updateParsedStat(sIdx, "number", e.target.value)}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Keterangan Label (Kartu {sIdx+1})</label>
                                <input
                                  type="text"
                                  value={stat.label || ""}
                                  onChange={(e) => updateParsedStat(sIdx, "label", e.target.value)}
                                  className={styles.input}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Kutipan Peringatan (Quote Kemenkes/WHO)</label>
                          <textarea
                            value={parsedMateriBody.quote || ""}
                            onChange={(e) => updateParsedField("quote", e.target.value)}
                            className={styles.textarea}
                            rows={3}
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Deskripsi Patogenesis</label>
                          <textarea
                            value={parsedMateriBody.patogenesis || ""}
                            onChange={(e) => updateParsedField("patogenesis", e.target.value)}
                            className={styles.textarea}
                            rows={5}
                          />
                        </div>
                      </>
                    )}

                    {materiList.find(m => m.id === editingMateriId)?.section_key === "gejala" && (
                      <>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Paragraf Pengantar</label>
                          <textarea
                            value={parsedMateriBody.description || ""}
                            onChange={(e) => updateParsedField("description", e.target.value)}
                            className={styles.textarea}
                            rows={4}
                            required
                          />
                        </div>

                        <div className={styles.sectionTitle}>Tabel Gejala Klinis</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {parsedMateriBody.table?.map((row, rIdx) => (
                            <div key={rIdx} className={styles.nestedCard}>
                              <div style={{ fontWeight: "700", marginBottom: "8px", color: "var(--primary)" }}>{row.category}</div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Gejala Fisik</label>
                                <input
                                  type="text"
                                  value={row.manifestation || ""}
                                  onChange={(e) => updateParsedTable(rIdx, "manifestation", e.target.value)}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Patofisiologi / Penjelasan Medis</label>
                                <textarea
                                  value={row.pathophysiology || ""}
                                  onChange={(e) => updateParsedTable(rIdx, "pathophysiology", e.target.value)}
                                  className={styles.textarea}
                                  rows={2}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Paragraf Kesimpulan</label>
                          <textarea
                            value={parsedMateriBody.conclusion || ""}
                            onChange={(e) => updateParsedField("conclusion", e.target.value)}
                            className={styles.textarea}
                            rows={4}
                          />
                        </div>
                      </>
                    )}

                    {materiList.find(m => m.id === editingMateriId)?.section_key === "pengobatan" && (
                      <>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Paragraf Pengantar</label>
                          <textarea
                            value={parsedMateriBody.description || ""}
                            onChange={(e) => updateParsedField("description", e.target.value)}
                            className={styles.textarea}
                            rows={4}
                            required
                          />
                        </div>

                        <div className={styles.sectionTitle}>Dua Fase Terapi Pengobatan</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {parsedMateriBody.phases?.map((phase, pIdx) => (
                            <div key={pIdx} className={styles.nestedCard}>
                              <div style={{ fontWeight: "700", marginBottom: "8px", color: "var(--primary)" }}>{phase.name}</div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Durasi Fase</label>
                                <input
                                  type="text"
                                  value={phase.duration || ""}
                                  onChange={(e) => {
                                    const nextPhases = [...parsedMateriBody.phases];
                                    nextPhases[pIdx] = { ...nextPhases[pIdx], duration: e.target.value };
                                    setParsedMateriBody({ ...parsedMateriBody, phases: nextPhases });
                                  }}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Jenis Komposisi Obat</label>
                                <input
                                  type="text"
                                  value={phase.drugs || ""}
                                  onChange={(e) => {
                                    const nextPhases = [...parsedMateriBody.phases];
                                    nextPhases[pIdx] = { ...nextPhases[pIdx], drugs: e.target.value };
                                    setParsedMateriBody({ ...parsedMateriBody, phases: nextPhases });
                                  }}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Tujuan Klinis Pengobatan</label>
                                <textarea
                                  value={phase.objective || ""}
                                  onChange={(e) => {
                                    const nextPhases = [...parsedMateriBody.phases];
                                    nextPhases[pIdx] = { ...nextPhases[pIdx], objective: e.target.value };
                                    setParsedMateriBody({ ...parsedMateriBody, phases: nextPhases });
                                  }}
                                  className={styles.textarea}
                                  rows={3}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Catatan Bahaya Non-Kepatuhan (Warning)</label>
                          <textarea
                            value={parsedMateriBody.warning || ""}
                            onChange={(e) => updateParsedField("warning", e.target.value)}
                            className={styles.textarea}
                            rows={4}
                          />
                        </div>
                      </>
                    )}

                    {materiList.find(m => m.id === editingMateriId)?.section_key === "pencegahan" && (
                      <>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Paragraf Pengantar</label>
                          <textarea
                            value={parsedMateriBody.description || ""}
                            onChange={(e) => updateParsedField("description", e.target.value)}
                            className={styles.textarea}
                            rows={4}
                            required
                          />
                        </div>

                        <div className={styles.sectionTitle}>Pilar Pencegahan</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {parsedMateriBody.pillars?.map((pillar, plIdx) => (
                            <div key={plIdx} className={styles.nestedCard}>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Judul Pilar ({pillar.title})</label>
                                <input
                                  type="text"
                                  value={pillar.title || ""}
                                  onChange={(e) => updateParsedPillar(plIdx, "title", e.target.value)}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Keterangan Detail</label>
                                <textarea
                                  value={pillar.desc || ""}
                                  onChange={(e) => updateParsedPillar(plIdx, "desc", e.target.value)}
                                  className={styles.textarea}
                                  rows={3}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {materiSaveError && <div className={styles.errorContainer}>⚠️ {materiSaveError}</div>}

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setEditingMateriId(null)} 
                    className={styles.cancelBtn}
                    disabled={materiSaveLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={materiSaveLoading}
                  >
                    {materiSaveLoading ? "⏳ Menyimpan..." : "Simpan Konten"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.dataGrid}>
                {materiList.map((materi) => (
                  <div key={materi.id} className={styles.materiRow}>
                    <div className={styles.rowInfo}>
                      <h4>{materi.title}</h4>
                      <span className={styles.badge}>Bagian: {materi.section_key}</span>
                    </div>
                    <button 
                      onClick={() => handleStartEditMateri(materi)} 
                      className={styles.rowEditBtn}
                    >
                      ✏️ Edit Materi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENYEBAB & PENULARAN (LAMAN 2) */}
        {activeTab === "penyebab" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Kelola Penyebab & Penularan (Laman 2)</h2>
                <p>Tambah, edit, atau hapus kartu penyebab TB yang tampil di grid Laman 2.</p>
              </div>
              {!editingPenyebabId && (
                <button onClick={handleStartAddPenyebab} className={styles.addBtn}>
                  ➕ Tambah Penyebab Baru
                </button>
              )}
            </div>

            {penyebabLoading ? (
              <div className={styles.loading}>Memuat data penyebab...</div>
            ) : editingPenyebabId ? (
              // Add / Edit form causa card
              <form onSubmit={handleSavePenyebab} className={styles.editorForm}>
                <div className={styles.editorFormHeader}>
                  <h3>{editingPenyebabId === "new" ? "Tambah Penyebab Baru" : "Edit Penyebab"}</h3>
                  <button type="button" onClick={() => setEditingPenyebabId(null)} className={styles.cancelLinkBtn}>
                    ← Kembali ke Daftar
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nama Penyebab / Judul Kartu</label>
                  <input
                    type="text"
                    value={editPenyebabTitle}
                    onChange={(e) => setEditPenyebabTitle(e.target.value)}
                    placeholder="Contoh: Infeksi Bakteri Latent"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Deskripsi Singkat</label>
                  <textarea
                    value={editPenyebabDesc}
                    onChange={(e) => setEditPenyebabDesc(e.target.value)}
                    placeholder="Jelaskan secara ringkas mengenai penyebab ini..."
                    className={styles.textarea}
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Ilustrasi Gambar</label>
                  <ImageUploader
                    adminPassword={adminPassword}
                    onUploadSuccess={setEditPenyebabImg}
                    currentImageUrl={editPenyebabImg}
                  />
                </div>

                {penyebabSaveError && <div className={styles.errorContainer}>⚠️ {penyebabSaveError}</div>}

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setEditingPenyebabId(null)} 
                    className={styles.cancelBtn}
                    disabled={penyebabSaveLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={penyebabSaveLoading}
                  >
                    {penyebabSaveLoading ? "⏳ Menyimpan..." : "Simpan Penyebab"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.causesList}>
                {penyebabList.map((card) => (
                  <div key={card.id} className={styles.causeRow}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", overflow: "hidden" }}>
                      <div className={styles.causeRowThumbnail}>
                        <Image
                          src={card.image_url || "/images/lungs-illustration.png"}
                          alt={card.title}
                          fill
                          sizes="60px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className={styles.rowInfo}>
                        <h4>{card.title}</h4>
                        <p className={styles.rowDesc}>{card.description}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => handleStartEditPenyebab(card)} 
                        className={styles.rowEditBtn}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePenyebab(card.id)} 
                        className={styles.rowDeleteBtn}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIDEO PASIEN */}
        {activeTab === "video" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h2>Kelola Video Edukasi Pasien</h2>
              <p>Tambahkan link video YouTube baru atau sembunyikan (ON/OFF) video yang aktif untuk pasien.</p>
            </div>

            {/* Quick form add video */}
            <form onSubmit={handleAddVideo} className={styles.videoAddForm}>
              <h4>➕ Tambah Video YouTube Baru</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Judul Video</label>
                  <input
                    type="text"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="Contoh: Tutorial Minum Obat OAT"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>URL Video YouTube</label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              {videoSaveError && <div className={styles.errorContainer} style={{ marginTop: "10px" }}>⚠️ {videoSaveError}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="submit" className={styles.submitBtn} disabled={videoSaveLoading}>
                  {videoSaveLoading ? "⏳ Menyimpan..." : "Tambah Video"}
                </button>
              </div>
            </form>

            <div className={styles.sectionTitle} style={{ marginTop: "2rem" }}>Daftar Video di Halaman Pasien</div>
            {videoLoading ? (
              <div className={styles.loading}>Memuat list video...</div>
            ) : (
              <div className={styles.videoList}>
                {videoList.length === 0 ? (
                  <p className={styles.emptyText}>Belum ada video. Silakan tambahkan di form atas.</p>
                ) : (
                  videoList.map((vid) => (
                    <div key={vid.id} className={styles.videoRow}>
                      <div className={styles.rowInfo}>
                        <h4>{vid.title}</h4>
                        <span className={styles.videoUrl} title={vid.embed_url}>{vid.embed_url}</span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button 
                          onClick={() => handleToggleVideo(vid.id, vid.is_active)}
                          className={`${styles.toggleBtn} ${vid.is_active ? styles.toggleOn : styles.toggleOff}`}
                        >
                          {vid.is_active ? "🟢 AKTIF (Tampil)" : "🔴 NONAKTIF (Sembunyi)"}
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(vid.id)} 
                          className={styles.rowDeleteBtn}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
