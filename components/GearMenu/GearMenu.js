"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import AdminPasswordModal from "../AdminPasswordModal/AdminPasswordModal";
import styles from "./GearMenu.module.css";

export default function GearMenu({ isEditing, onToggleEditMode }) {
  const { isAdmin, login, logout, getAdminHeaders } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  // Fetch videos for the admin panel
  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/video");
      const data = await res.json();
      if (res.ok && data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error("Failed to fetch videos", err);
    }
  };

  useEffect(() => {
    if (isAdmin && isPanelOpen) {
      fetchVideos();
    }
  }, [isAdmin, isPanelOpen]);

  const handleVerify = (password) => {
    login(password);
    onToggleEditMode(true);
  };

  const handleGearClick = () => {
    if (!isAdmin) {
      setIsModalOpen(true);
    } else {
      setIsPanelOpen(!isPanelOpen);
    }
  };

  const handleLogout = () => {
    logout();
    onToggleEditMode(false);
    setIsPanelOpen(false);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      setVideoError("Judul dan URL video harus diisi");
      return;
    }

    setVideoLoading(true);
    setVideoError("");

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ title: newTitle, embed_url: newUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNewTitle("");
        setNewUrl("");
        fetchVideos();
      } else {
        setVideoError(data.error || "Gagal menambahkan video.");
      }
    } catch (err) {
      setVideoError("Terjadi kesalahan jaringan.");
    } finally {
      setVideoLoading(false);
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
        // Optimistic UI update or fetch
        setVideos(
          videos.map((vid) =>
            vid.id === id ? { ...vid, is_active: !currentStatus } : vid
          )
        );
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
        setVideos(videos.filter((vid) => vid.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus video", err);
    }
  };

  return (
    <>
      {/* Floating Gear Button */}
      <button
        className={`${styles.floatingBtn} ${isEditing ? styles.activeGear : ""}`}
        onClick={handleGearClick}
        aria-label="Admin control panel"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.gearIcon}
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* Admin Verification Modal */}
      <AdminPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handleVerify}
      />

      {/* Slide-over Control Panel */}
      {isAdmin && (
        <div className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : ""}`}>
          <div className={styles.panelHeader}>
            <h3>Panel Kontrol Petugas</h3>
            <button className={styles.closePanelBtn} onClick={() => setIsPanelOpen(false)}>
              ✕
            </button>
          </div>

          <div className={styles.panelBody}>
            {/* Quick Actions */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Mode Halaman</h4>
              <button
                className={`${styles.actionBtn} ${
                  isEditing ? styles.btnEditing : styles.btnNotEditing
                }`}
                onClick={() => onToggleEditMode(!isEditing)}
              >
                {isEditing ? "Matikan Mode Edit Konten" : "Aktifkan Mode Edit Konten"}
              </button>
            </div>

            {/* Manage Video Pasien */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Tambah Video Pasien</h4>
              <form onSubmit={handleAddVideo} className={styles.videoForm}>
                <input
                  type="text"
                  placeholder="Judul Video"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={styles.panelInput}
                  disabled={videoLoading}
                />
                <input
                  type="url"
                  placeholder="Link YouTube/Vimeo (Embed URL)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className={styles.panelInput}
                  disabled={videoLoading}
                />
                {videoError && <span className={styles.panelError}>{videoError}</span>}
                <button
                  type="submit"
                  className={styles.addVideoBtn}
                  disabled={videoLoading}
                >
                  {videoLoading ? "Menyimpan..." : "Tambah Video"}
                </button>
              </form>
            </div>

            {/* Video List */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Daftar Video Pasien</h4>
              {videos.length === 0 ? (
                <p className={styles.noVideos}>Belum ada video ditambahkan.</p>
              ) : (
                <div className={styles.videoList}>
                  {videos.map((vid) => (
                    <div key={vid.id} className={styles.videoItem}>
                      <div className={styles.videoInfo}>
                        <span className={styles.videoItemTitle}>{vid.title}</span>
                        <span className={styles.videoItemUrl} title={vid.embed_url}>
                          {vid.embed_url}
                        </span>
                      </div>
                      <div className={styles.videoActions}>
                        <button
                          className={`${styles.toggleBtn} ${
                            vid.is_active ? styles.toggleOn : styles.toggleOff
                          }`}
                          onClick={() => handleToggleVideo(vid.id, vid.is_active)}
                          title={vid.is_active ? "Sembunyikan dari pasien" : "Tampilkan ke pasien"}
                        >
                          {vid.is_active ? "ON" : "OFF"}
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteVideo(vid.id)}
                          title="Hapus video"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.panelFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log Out (Keluar Sesi)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
