"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GearMenu from "@/components/GearMenu/GearMenu";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import { useAdmin } from "@/hooks/useAdmin";
import styles from "./page.module.css";

export default function PetugasPenyebabPage() {
  const { isAdmin, adminPassword, getAdminHeaders, loading: adminLoading } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [penyebabList, setPenyebabList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating a new card
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImgUrl, setNewImgUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Edit states
  const [editingCardId, setEditingCardId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImgUrl, setEditImgUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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

  const fetchPenyebab = async () => {
    try {
      const res = await fetch("/api/penyebab");
      const data = await res.json();
      if (res.ok && data.penyebab) {
        setPenyebabList(data.penyebab);
      }
    } catch (err) {
      console.error("Gagal memuat penyebab", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenyebab();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setIsEditing(false);
      setShowAddForm(false);
      setEditingCardId(null);
    }
  }, [isAdmin]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError("Judul penyebab wajib diisi");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/penyebab", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          image_url: newImgUrl || "/images/lungs-illustration.png", // fallback image
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPenyebabList([...penyebabList, data.penyebab]);
        setNewTitle("");
        setNewDesc("");
        setNewImgUrl("");
        setShowAddForm(false);
      } else {
        setFormError(data.error || "Gagal membuat card.");
      }
    } catch (err) {
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartEdit = (card) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditDesc(card.description || "");
    setEditImgUrl(card.image_url || "");
    setEditError("");
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("Judul wajib diisi");
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/penyebab", {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: editingCardId,
          title: editTitle,
          description: editDesc,
          image_url: editImgUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPenyebabList(
          penyebabList.map((card) =>
            card.id === editingCardId ? data.penyebab : card
          )
        );
        setEditingCardId(null);
      } else {
        setEditError(data.error || "Gagal memperbarui card.");
      }
    } catch (err) {
      setEditError("Terjadi kesalahan jaringan.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penyebab ini? Menghapus penyebab juga akan menghapus artikel detailnya.")) return;

    try {
      const res = await fetch(`/api/penyebab?id=${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      if (res.ok) {
        setPenyebabList(penyebabList.filter((card) => card.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus card", err);
    }
  };

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

      {/* Main content grid */}
      <div className={styles.contentSection}>
        <div className={styles.container}>
          {/* Admin: Add New Card Trigger */}
          {isEditing && !showAddForm && (
            <div className={styles.adminActionContainer}>
              <button
                className={styles.addTriggerBtn}
                onClick={() => setShowAddForm(true)}
              >
                ➕ Tambah Penyebab Baru
              </button>
            </div>
          )}

          {/* Admin: Create New Card Form */}
          {showAddForm && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Tambah Penyebab Baru</h3>
              <form onSubmit={handleAddCard} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nama Penyebab</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Bakteri Mycobacterium tuberculosis"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Deskripsi Singkat</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Jelaskan secara singkat mengenai penyebab ini"
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gambar Ilustrasi</label>
                  <ImageUploader
                    adminPassword={adminPassword}
                    onUploadSuccess={setNewImgUrl}
                    currentImageUrl={newImgUrl}
                  />
                </div>

                {formError && <span className={styles.error}>{formError}</span>}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowAddForm(false)}
                    disabled={formLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={formLoading}
                  >
                    {formLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid Layout */}
          {loading ? (
            <div className={styles.grid}>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ height: "320px", borderRadius: "24px" }}></div>
            </div>
          ) : (
            <div className={styles.grid}>
              {penyebabList.map((card) => {
                const isCurrentEditing = editingCardId === card.id;

                if (isCurrentEditing) {
                  return (
                    <div key={card.id} className={styles.editFormCard}>
                      <h3 className={styles.formTitle}>Edit Penyebab</h3>
                      <form onSubmit={handleUpdateCard} className={styles.form}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Nama Penyebab</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className={styles.input}
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Deskripsi Singkat</label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className={styles.textarea}
                            rows={3}
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Gambar Ilustrasi</label>
                          <ImageUploader
                            adminPassword={adminPassword}
                            onUploadSuccess={setEditImgUrl}
                            currentImageUrl={editImgUrl}
                          />
                        </div>

                        {editError && <span className={styles.error}>{editError}</span>}

                        <div className={styles.formActions}>
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => setEditingCardId(null)}
                            disabled={editLoading}
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={editLoading}
                          >
                            {editLoading ? "Menyimpan..." : "Update"}
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div key={card.id} className={styles.card}>
                    <div className={styles.cardImageContainer}>
                      <Image
                        src={card.image_url || getLocalFallbackImage(card.slug)}
                        alt={card.title}
                        fill
                        className={styles.cardImage}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{card.title}</h2>
                      <p className={styles.cardDesc}>{card.description}</p>
                      
                      <div className={styles.cardFooter}>
                        <Link href={`/petugas/penyebab/${card.slug}`} className={styles.readMoreLink}>
                          <span>Baca Detail</span>
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

                        {isEditing && (
                          <div className={styles.adminBtns}>
                            <button
                              onClick={() => handleStartEdit(card)}
                              className={styles.editBtn}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className={styles.deleteBtn}
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Gear Menu controls */}
      {!adminLoading && (
        <GearMenu isEditing={isEditing} onToggleEditMode={setIsEditing} />
      )}
    </div>
  );
}
