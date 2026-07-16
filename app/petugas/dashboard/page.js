"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";
import ReactPaginate from "react-paginate";
import { useAdmin } from "@/hooks/useAdmin";
import styles from "./page.module.css";

export default function PetugasDashboardPage() {
  const { isAdmin, adminPassword, login, logout, getAdminHeaders, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState("penyebab"); // "kategori" | "penyebab" | "video"
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
  const [editPenyebabKategoriId, setEditPenyebabKategoriId] = useState("");
  const [editPenyebabBody, setEditPenyebabBody] = useState("");
  const [penyebabSaveLoading, setPenyebabSaveLoading] = useState(false);
  const [penyebabSaveError, setPenyebabSaveError] = useState("");

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategoriId, setFilterKategoriId] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const [editPenyebabAuthor, setEditPenyebabAuthor] = useState("");
  const [editPenyebabIsPublished, setEditPenyebabIsPublished] = useState(true);
  const [editPenyebabExternalLink, setEditPenyebabExternalLink] = useState("");
  const [editPenyebabBlocks, setEditPenyebabBlocks] = useState([]);
  const [editPenyebabNewKategoriTitle, setEditPenyebabNewKategoriTitle] = useState("");

  // Kategori states
  const [kategoriList, setKategoriList] = useState([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [editingKategoriId, setEditingKategoriId] = useState(null); // null = not editing, "new" = adding, UUID = editing
  const [editKategoriTitle, setEditKategoriTitle] = useState("");
  const [editKategoriSubtitle, setEditKategoriSubtitle] = useState("");
  const [editKategoriDesc, setEditKategoriDesc] = useState("");
  const [editKategoriOrder, setEditKategoriOrder] = useState(1);
  const [kategoriSaveLoading, setKategoriSaveLoading] = useState(false);
  const [kategoriSaveError, setKategoriSaveError] = useState("");

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

  const fetchKategori = async () => {
    setKategoriLoading(true);
    try {
      const res = await fetch("/api/kategori");
      const data = await res.json();
      if (res.ok && data.kategori) {
        setKategoriList(data.kategori);
      }
    } catch (err) {
      console.error("Gagal mengambil kategori", err);
    } finally {
      setKategoriLoading(false);
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
      fetchKategori();
      fetchVideos();
    }
  }, [isAdmin]);

  const filteredPenyebabList = penyebabList.filter((card) => {
    const matchesSearch = searchQuery.trim() === "" ||
      card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterKategoriId === "" || card.kategori_id === filterKategoriId;
    return matchesSearch && matchesCategory;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filterKategoriId]);

  const pageCount = Math.ceil(filteredPenyebabList.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredPenyebabList.slice(offset, offset + itemsPerPage);

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

  // CRUD: Laman 2 - Penyebab TB (Artikel & Card)
  const handleStartEditPenyebab = (card) => {
    setEditingPenyebabId(card.id);
    setEditPenyebabTitle(card.title);
    setEditPenyebabDesc(card.description || "");
    setEditPenyebabImg(card.image_url || "");
    setEditPenyebabKategoriId(card.kategori_id || "");
    setEditPenyebabBody(card.article_body || "");
    setEditPenyebabNewKategoriTitle("");
    setPenyebabSaveError("");

    try {
      const parsed = JSON.parse(card.article_body);
      if (parsed && typeof parsed === "object" && parsed.blocks) {
        setEditPenyebabAuthor(parsed.author || "");
        setEditPenyebabIsPublished(parsed.is_published !== false);
        setEditPenyebabExternalLink(parsed.external_link || "");
        setEditPenyebabBlocks(parsed.blocks || []);
      } else {
        setEditPenyebabAuthor("");
        setEditPenyebabIsPublished(true);
        setEditPenyebabExternalLink("");
        setEditPenyebabBlocks([
          { id: Date.now() + Math.random(), type: "text", value: card.article_body || "" }
        ]);
      }
    } catch (e) {
      setEditPenyebabAuthor("");
      setEditPenyebabIsPublished(true);
      setEditPenyebabExternalLink("");
      setEditPenyebabBlocks([
        { id: Date.now() + Math.random(), type: "text", value: card.article_body || "" }
      ]);
    }
  };

  const handleStartAddPenyebab = () => {
    setEditingPenyebabId("new");
    setEditPenyebabTitle("");
    setEditPenyebabDesc("");
    setEditPenyebabImg("");
    setEditPenyebabKategoriId(kategoriList[0]?.id || "");
    setEditPenyebabBody("");
    setEditPenyebabAuthor("");
    setEditPenyebabIsPublished(true);
    setEditPenyebabExternalLink("");
    setEditPenyebabNewKategoriTitle("");
    setEditPenyebabBlocks([
      { id: Date.now() + Math.random(), type: "text", value: "" }
    ]);
    setPenyebabSaveError("");
  };

  const handleAddTextBlock = () => {
    setEditPenyebabBlocks([
      ...editPenyebabBlocks,
      { id: Date.now() + Math.random(), type: "text", value: "" }
    ]);
  };

  const handleAddImageBlock = () => {
    setEditPenyebabBlocks([
      ...editPenyebabBlocks,
      { id: Date.now() + Math.random(), type: "image", value: "" }
    ]);
  };

  const handleUpdateBlockValue = (id, val) => {
    setEditPenyebabBlocks(
      editPenyebabBlocks.map((b) => (b.id === id ? { ...b, value: val } : b))
    );
  };

  const handleDeleteBlock = (id) => {
    setEditPenyebabBlocks(editPenyebabBlocks.filter((b) => b.id !== id));
  };

  const handleMoveBlockUp = (index) => {
    if (index === 0) return;
    const newBlocks = [...editPenyebabBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;
    setEditPenyebabBlocks(newBlocks);
  };

  const handleMoveBlockDown = (index) => {
    if (index === editPenyebabBlocks.length - 1) return;
    const newBlocks = [...editPenyebabBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;
    setEditPenyebabBlocks(newBlocks);
  };

  const handleSavePenyebab = async (e) => {
    e.preventDefault();
    if (!editPenyebabTitle.trim()) {
      setPenyebabSaveError("Judul berita wajib diisi");
      return;
    }
    if (!editPenyebabKategoriId) {
      setPenyebabSaveError("Kategori wajib dipilih");
      return;
    }
    if (editPenyebabKategoriId === "new" && !editPenyebabNewKategoriTitle.trim()) {
      setPenyebabSaveError("Nama kategori baru wajib diisi");
      return;
    }

    setPenyebabSaveLoading(true);
    setPenyebabSaveError("");

    try {
      let finalKategoriId = editPenyebabKategoriId;

      // 1. If adding a new category first
      if (editPenyebabKategoriId === "new") {
        const catRes = await fetch("/api/kategori", {
          method: "POST",
          headers: getAdminHeaders(),
          body: JSON.stringify({
            title: editPenyebabNewKategoriTitle.trim()
          })
        });
        const catData = await catRes.json();
        if (!catRes.ok) {
          throw new Error(catData.error || "Gagal membuat kategori baru");
        }
        finalKategoriId = catData.kategori.id;
        // Refresh categories so it shows up in general navigation
        await fetchKategori();
      }

      // 2. Serialize blocks and metadata
      const serializedBody = JSON.stringify({
        author: editPenyebabAuthor.trim(),
        external_link: editPenyebabExternalLink.trim(),
        is_published: editPenyebabIsPublished,
        blocks: editPenyebabBlocks.map(b => ({ type: b.type, value: b.value }))
      });

      const method = editingPenyebabId === "new" ? "POST" : "PUT";
      const payload = {
        title: editPenyebabTitle,
        description: editPenyebabDesc,
        image_url: editPenyebabImg || "/images/lungs-illustration.png",
        kategori_id: finalKategoriId,
        article_body: serializedBody
      };

      if (editingPenyebabId !== "new") {
        payload.id = editingPenyebabId;
      }

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
        setPenyebabSaveError(data.error || "Gagal menyimpan artikel.");
      }
    } catch (err) {
      setPenyebabSaveError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setPenyebabSaveLoading(false);
    }
  };

  // CRUD: Kategori Artikel
  const handleStartEditKategori = (cat) => {
    setEditingKategoriId(cat.id);
    setEditKategoriTitle(cat.title);
    setEditKategoriSubtitle(cat.subtitle || "");
    setEditKategoriDesc(cat.description || "");
    setEditKategoriOrder(cat.display_order || 1);
    setKategoriSaveError("");
  };

  const handleStartAddKategori = () => {
    setEditingKategoriId("new");
    setEditKategoriTitle("");
    setEditKategoriSubtitle("");
    setEditKategoriDesc("");
    setEditKategoriOrder(kategoriList.length + 1);
    setKategoriSaveError("");
  };

  const handleSaveKategori = async (e) => {
    e.preventDefault();
    if (!editKategoriTitle.trim()) {
      setKategoriSaveError("Nama kategori wajib diisi");
      return;
    }

    setKategoriSaveLoading(true);
    setKategoriSaveError("");

    const method = editingKategoriId === "new" ? "POST" : "PUT";
    const payload = {
      title: editKategoriTitle,
      subtitle: editKategoriSubtitle,
      description: editKategoriDesc,
      display_order: parseInt(editKategoriOrder) || 1
    };

    if (editingKategoriId !== "new") {
      payload.id = editingKategoriId;
    }

    try {
      const res = await fetch("/api/kategori", {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEditingKategoriId(null);
        fetchKategori();
      } else {
        setKategoriSaveError(data.error || "Gagal menyimpan kategori.");
      }
    } catch (err) {
      setKategoriSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setKategoriSaveLoading(false);
    }
  };

  const handleDeleteKategori = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini? Menghapus kategori akan merusak tautan artikel di dalamnya.")) return;
    try {
      const res = await fetch(`/api/kategori?id=${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchKategori();
      }
    } catch (err) {
      console.error("Gagal menghapus kategori", err);
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

  const handleSetVideoStatus = async (id, targetStatus) => {
    try {
      const res = await fetch("/api/video", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, is_active: targetStatus }),
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
          {/* 
          <button 
            onClick={() => { setActiveTab("materi"); setEditingMateriId(null); }}
            className={`${styles.sidebarBtn} ${activeTab === "materi" ? styles.sidebarBtnActive : ""}`}
          >
            📄 Pengantar Materi (L1)
          </button>
          */}
          {/* 
          <button 
            onClick={() => { setActiveTab("kategori"); setEditingKategoriId(null); }}
            className={`${styles.sidebarBtn} ${activeTab === "kategori" ? styles.sidebarBtnActive : ""}`}
          >
            📂 Kategori Navigasi
          </button>
          */}
          <button
            onClick={() => { setActiveTab("penyebab"); setEditingPenyebabId(null); }}
            className={`${styles.sidebarBtn} ${activeTab === "penyebab" ? styles.sidebarBtnActive : ""}`}
          >
            🦠 Kelola Artikel
          </button>
          <button
            onClick={() => { setActiveTab("video"); }}
            className={`${styles.sidebarBtn} ${activeTab === "video" ? styles.sidebarBtnActive : ""}`}
          >
            🎥 Video Edukasi Pasien
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => setShowLogoutConfirm(true)} className={styles.logoutBtn}>
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
                        <div className={styles.videoFormGrid}>
                          {parsedMateriBody.stats?.map((stat, sIdx) => (
                            <div key={sIdx} className={styles.nestedCard}>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Nilai / Angka (Kartu {sIdx + 1})</label>
                                <input
                                  type="text"
                                  value={stat.number || ""}
                                  onChange={(e) => updateParsedStat(sIdx, "number", e.target.value)}
                                  className={styles.input}
                                  required
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label className={styles.label}>Keterangan Label (Kartu {sIdx + 1})</label>
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
            <div className={styles.tabHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2>Kelola Artikel</h2>
                <p>Tambah, edit, atau hapus artikel edukasi Tuberkulosis beserta isi materi detailnya.</p>
              </div>
              {!editingPenyebabId && (
                <button onClick={handleStartAddPenyebab} className={styles.addBtn}>
                  <span style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", marginRight: "6px", display: "inline-block", transform: "translateY(-1px)" }}>+</span> Tambah Artikel Baru
                </button>
              )}
            </div>

            {!editingPenyebabId && (
              <div className={styles.filterBar} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "0.5rem 0 1rem 0", backgroundColor: "var(--bg-muted-light)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-medium)" }}>
                <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className={styles.label} style={{ fontSize: "0.8rem", fontWeight: "700" }}>Cari Artikel</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan judul..."
                    className={styles.input}
                    style={{ backgroundColor: "#ffffff" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className={styles.label} style={{ fontSize: "0.8rem", fontWeight: "700" }}>Filter Kategori</label>
                  <select
                    value={filterKategoriId}
                    onChange={(e) => setFilterKategoriId(e.target.value)}
                    className={styles.input}
                    style={{ backgroundColor: "#ffffff", padding: "0.7rem 1rem" }}
                  >
                    <option value="">Semua Kategori</option>
                    {kategoriList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {penyebabLoading ? (
              <div className={styles.loading}>Memuat data penyebab...</div>
            ) : editingPenyebabId ? (
              // Add / Edit form causa card
              <form onSubmit={handleSavePenyebab} className={styles.editorForm}>
                <div className={styles.editorFormHeader}>
                  <h3>{editingPenyebabId === "new" ? "Tambah Artikel Baru" : "Edit Artikel"}</h3>
                  <button type="button" onClick={() => setEditingPenyebabId(null)} className={styles.cancelLinkBtn}>
                    ← Kembali ke Daftar
                  </button>
                </div>

                <div className={styles.editorGrid}>
                  {/* Left Column: Informasi Utama */}
                  <div className={styles.editorLeftCol}>
                    <div className={styles.editorPanel}>
                      <h4 className={styles.panelTitle}>Informasi Utama</h4>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Judul Berita <span style={{ color: "red" }}>*</span></label>
                        <input
                          type="text"
                          value={editPenyebabTitle}
                          onChange={(e) => setEditPenyebabTitle(e.target.value)}
                          placeholder="Masukkan judul berita yang menarik..."
                          className={styles.input}
                          required
                        />
                      </div>

                      <div className={styles.inputRow}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                          <label className={styles.label}>Kategori <span style={{ color: "red" }}>*</span></label>
                          <select
                            value={editPenyebabKategoriId}
                            onChange={(e) => setEditPenyebabKategoriId(e.target.value)}
                            className={styles.input}
                            required
                          >
                            <option value="" disabled>-- Pilih Kategori --</option>
                            {kategoriList.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.title}
                              </option>
                            ))}
                            <option value="new">+ Tambah Kategori Baru...</option>
                          </select>
                        </div>

                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                          <label className={styles.label}>Penulis <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            value={editPenyebabAuthor}
                            onChange={(e) => setEditPenyebabAuthor(e.target.value)}
                            placeholder="Nama penulis..."
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>

                      {editPenyebabKategoriId === "new" && (
                        <div className={styles.inputGroup} style={{ borderLeft: "3px solid var(--secondary)", paddingLeft: "10px", margin: "10px 0" }}>
                          <label className={styles.label} style={{ color: "var(--secondary)" }}>Nama Kategori Baru <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            value={editPenyebabNewKategoriTitle}
                            onChange={(e) => setEditPenyebabNewKategoriTitle(e.target.value)}
                            placeholder="Masukkan nama kategori baru..."
                            className={styles.input}
                            required
                          />
                        </div>
                      )}

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Ringkasan Singkat <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          value={editPenyebabDesc}
                          onChange={(e) => setEditPenyebabDesc(e.target.value)}
                          placeholder="Tulis ringkasan berita satu atau dua kalimat untuk kartu halaman utama..."
                          className={styles.textarea}
                          rows={4}
                          required
                        />
                      </div>
                    </div>

                    {/* Section: Isi Konten Berita (Dinamis) */}
                    <div className={styles.editorPanel} style={{ marginTop: "1.5rem" }}>
                      <div className={styles.blocksHeader}>
                        <h4 className={styles.panelTitle} style={{ margin: 0 }}>Isi Konten Berita (Dinamis)</h4>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button type="button" onClick={handleAddTextBlock} className={styles.addBlockBtn}>
                            ➕ Teks
                          </button>
                          <button type="button" onClick={handleAddImageBlock} className={styles.addBlockBtn}>
                            ➕ Gambar
                          </button>
                        </div>
                      </div>

                      <div className={styles.blocksList}>
                        {editPenyebabBlocks.length === 0 ? (
                          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                            Belum ada konten. Klik tombol "+ Teks" atau "+ Gambar" untuk menambahkan konten dinamis.
                          </p>
                        ) : (
                          editPenyebabBlocks.map((block, index) => (
                            <div key={block.id} className={styles.blockCard}>
                              <div className={styles.blockCardHeader}>
                                <span className={styles.blockTitle}>
                                  {block.type === "text" ? "📄 BLOK TEKS" : "🖼️ BLOK GAMBAR"}
                                </span>
                                <div className={styles.blockCardActions}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlockUp(index)}
                                    disabled={index === 0}
                                    className={styles.actionIconBtn}
                                    title="Pindahkan ke Atas"
                                  >
                                    ⬆️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlockDown(index)}
                                    disabled={index === editPenyebabBlocks.length - 1}
                                    className={styles.actionIconBtn}
                                    title="Pindahkan ke Bawah"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className={styles.deleteBlockBtn}
                                    title="Hapus Blok"
                                  >
                                    🗑️ Hapus
                                  </button>
                                </div>
                              </div>

                              <div className={styles.blockCardBody}>
                                {block.type === "text" ? (
                                  <RichTextEditor
                                    value={block.value}
                                    onChange={(htmlVal) => handleUpdateBlockValue(block.id, htmlVal)}
                                    placeholder="Tulis isi berita di sini... Gunakan toolbar di atas untuk memformat teks secara visual."
                                  />
                                ) : (
                                  <div>
                                    <label className={styles.label} style={{ fontSize: "0.8rem", marginBottom: "5px" }}>Upload / Pilih Gambar Blok</label>
                                    <ImageUploader
                                      adminPassword={adminPassword}
                                      onUploadSuccess={(url) => handleUpdateBlockValue(block.id, url)}
                                      currentImageUrl={block.value}
                                    />
                                    {block.value && (
                                      <div className={styles.blockImagePreview}>
                                        <img src={block.value} alt="Preview" style={{ maxHeight: "150px", borderRadius: "8px", marginTop: "10px" }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pengaturan Publikasi & Cover */}
                  <div className={styles.editorRightCol}>
                    {/* Panel 1: Pengaturan Publikasi */}
                    <div className={styles.editorPanel}>
                      <h4 className={styles.panelTitle}>Pengaturan Publikasi</h4>

                      <div className={styles.publicationToggle}>
                        <div style={{ flex: 1 }}>
                          <span className={styles.toggleLabel}>Publikasikan Segera</span>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            Berita langsung terlihat di web publik
                          </p>
                        </div>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={editPenyebabIsPublished}
                            onChange={(e) => setEditPenyebabIsPublished(e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                        <label className={styles.label}>Link Eksternal (Opsional)</label>
                        <input
                          type="text"
                          value={editPenyebabExternalLink}
                          onChange={(e) => setEditPenyebabExternalLink(e.target.value)}
                          placeholder="Contoh: https://youtube.com/..."
                          className={styles.input}
                        />
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "5px" }}>
                          Tautkan ke video liputan Youtube atau berita media luar jika ada.
                        </p>
                      </div>
                    </div>

                    {/* Panel 2: Gambar Utama / Cover */}
                    <div className={styles.editorPanel} style={{ marginTop: "1.5rem" }}>
                      <h4 className={styles.panelTitle}>Gambar Utama / Cover</h4>
                      <ImageUploader
                        adminPassword={adminPassword}
                        onUploadSuccess={setEditPenyebabImg}
                        currentImageUrl={editPenyebabImg}
                      />
                    </div>
                  </div>
                </div>

                {penyebabSaveError && <div className={styles.errorContainer} style={{ marginTop: "1.5rem" }}>⚠️ {penyebabSaveError}</div>}

                <div className={styles.formActions} style={{ marginTop: "1.5rem" }}>
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
                    {penyebabSaveLoading ? "⏳ Menyimpan..." : "Simpan Artikel"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.causesList}>
                {currentItems.length === 0 ? (
                  <p className={styles.emptyText}>Tidak ada artikel yang cocok dengan pencarian atau filter kategori Anda.</p>
                ) : (
                  <>
                    {currentItems.map((card) => (
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
                            <span className={styles.rowCategoryBadge}>
                              📁 Kategori: {kategoriList.find(c => c.id === card.kategori_id)?.title || "Tidak Terkategori"}
                            </span>
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

                    {pageCount > 1 && (
                      <div style={{ marginTop: "1rem" }}>
                        <ReactPaginate
                          previousLabel={"←"}
                          nextLabel={"→"}
                          breakLabel={"..."}
                          pageCount={pageCount}
                          marginPagesDisplayed={2}
                          pageRangeDisplayed={3}
                          onPageChange={({ selected }) => setCurrentPage(selected)}
                          containerClassName={styles.pagination}
                          activeClassName={styles.activePage}
                          pageClassName={styles.pageItem}
                          previousClassName={styles.pageItem}
                          nextClassName={styles.pageItem}
                          breakClassName={styles.pageItem}
                          disabledClassName={styles.disabledPage}
                          forcePage={currentPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KATEGORI NAVIGASI */}
        {activeTab === "kategori" && (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Kelola Kategori Navigasi (Sidebar)</h2>
                <p>Tambah, edit, atau hapus kategori artikel utama yang tampil di menu navigasi sidebar.</p>
              </div>
              {!editingKategoriId && (
                <button onClick={handleStartAddKategori} className={styles.addBtn}>
                  ➕ Tambah Kategori Baru
                </button>
              )}
            </div>

            {kategoriLoading ? (
              <div className={styles.loading}>Memuat data kategori...</div>
            ) : editingKategoriId ? (
              // Add / Edit form kategori
              <form onSubmit={handleSaveKategori} className={styles.editorForm}>
                <div className={styles.editorFormHeader}>
                  <h3>{editingKategoriId === "new" ? "Tambah Kategori Baru" : "Edit Kategori"}</h3>
                  <button type="button" onClick={() => setEditingKategoriId(null)} className={styles.cancelLinkBtn}>
                    ← Kembali ke Daftar
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Judul Kategori (Tampil di Sidebar)</label>
                  <input
                    type="text"
                    value={editKategoriTitle}
                    onChange={(e) => setEditKategoriTitle(e.target.value)}
                    placeholder="Contoh: Nutrisi & Gizi TB"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Sub-Judul (Tampil di Header Halaman)</label>
                  <input
                    type="text"
                    value={editKategoriSubtitle}
                    onChange={(e) => setEditKategoriSubtitle(e.target.value)}
                    placeholder="Contoh: Diet Sehat & Gizi Seimbang"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Deskripsi Pengantar Kategori</label>
                  <textarea
                    value={editKategoriDesc}
                    onChange={(e) => setEditKategoriDesc(e.target.value)}
                    placeholder="Jelaskan secara ringkas mengenai gizi seimbang bagi penderita TB..."
                    className={styles.textarea}
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Urutan Tampil (Display Order)</label>
                  <input
                    type="number"
                    value={editKategoriOrder}
                    onChange={(e) => setEditKategoriOrder(e.target.value)}
                    placeholder="1"
                    min="1"
                    className={styles.input}
                    required
                  />
                </div>

                {kategoriSaveError && <div className={styles.errorContainer}>⚠️ {kategoriSaveError}</div>}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setEditingKategoriId(null)}
                    className={styles.cancelBtn}
                    disabled={kategoriSaveLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={kategoriSaveLoading}
                  >
                    {kategoriSaveLoading ? "⏳ Menyimpan..." : "Simpan Kategori"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.causesList}>
                {kategoriList.map((cat) => (
                  <div key={cat.id} className={styles.causeRow}>
                    <div className={styles.rowInfo}>
                      <h4>{cat.title}</h4>
                      <p className={styles.rowDesc} style={{ fontSize: "0.85rem" }}>
                        <strong>Sub-judul:</strong> {cat.subtitle} | <strong>Order:</strong> {cat.display_order}
                      </p>
                      <p className={styles.rowDesc} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {cat.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleStartEditKategori(cat)}
                        className={styles.rowEditBtn}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteKategori(cat.id)}
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
              <div className={styles.videoFormGrid}>
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
                        <a
                          href={vid.embed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.videoLink}
                          title="Klik untuk membuka link video"
                        >
                          {vid.embed_url} 🔗
                        </a>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className={styles.statusWrapper}>
                          <select
                            value={vid.is_active ? "active" : "inactive"}
                            onChange={(e) => handleSetVideoStatus(vid.id, e.target.value === "active")}
                            className={`${styles.statusSelect} ${vid.is_active ? styles.selectActive : styles.selectInactive}`}
                          >
                            <option value="active">🟢 AKTIF (Tampil)</option>
                            <option value="inactive">🔴 NONAKTIF (Sembunyi)</option>
                          </select>
                          <span
                            className={styles.infoIcon}
                            onClick={() => alert("Info Status Video:\n\n🟢 AKTIF (Tampil): Video akan muncul dan dapat dimainkan oleh pasien di portal edukasi.\n🔴 NONAKTIF (Sembunyi): Video akan disembunyikan sementara dari halaman portal pasien.")}
                            title="Status video menentukan apakah video ini akan muncul (Aktif) atau disembunyikan (Nonaktif) pada aplikasi portal pasien."
                            style={{ cursor: "pointer" }}
                          >
                            !
                          </span>
                        </div>
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={`${styles.confirmModal} animate-scale-up`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <span className={styles.confirmIcon}>🚪</span>
              <h3>Konfirmasi Keluar Sesi</h3>
            </div>
            <p className={styles.confirmText}>
              Apakah Anda yakin ingin keluar dari panel administrasi petugas kesehatan?
            </p>
            <div className={styles.confirmActions}>
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={styles.confirmCancelBtn}
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }} 
                className={styles.confirmSubmitBtn}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
