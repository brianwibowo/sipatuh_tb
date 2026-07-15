"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VideoCard from "@/components/VideoCard/VideoCard";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import styles from "./page.module.css";

export default function PasienVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/video?active_only=true");
      const data = await res.json();
      if (res.ok && data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error("Gagal memuat video", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <section className={styles.headerSection}>
        <div className={styles.container} style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "0", right: "0", zIndex: 10 }}>
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

          <div className={styles.headerGroup}>
            <span className={styles.sub}>Media Edukasi & Motivasi</span>
            <h1 className={styles.mainTitle}>Daftar Panduan Video Pasien</h1>
            <p className={styles.intro}>
              Tonton video penjelasan medis, kisah motivasi kesembuhan, dan tata cara 
              minum obat Tuberkulosis (OAT) secara disiplin dan tuntas.
            </p>
          </div>
        </div>
      </section>

      {/* Grid and Player Modal */}
      <div className={styles.contentSection}>
        <div className={styles.container}>
          {loading ? (
            <div className={styles.grid}>
              <div className="shimmer" style={{ aspectRatio: "16/13", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ aspectRatio: "16/13", borderRadius: "24px" }}></div>
              <div className="shimmer" style={{ aspectRatio: "16/13", borderRadius: "24px" }}></div>
            </div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎥</div>
              <h2>Belum Ada Video Edukasi</h2>
              <p className={styles.emptyDesc}>
                Saat ini petugas kesehatan belum mengaktifkan video panduan. 
                Silakan kembali lagi di lain waktu.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={(v) => setActiveVideo(v)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal Overlay */}
      {activeVideo && (
        <div className={styles.overlay} onClick={() => setActiveVideo(null)}>
          <div className={`${styles.modal} animate-scale-up`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{activeVideo.title}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setActiveVideo(null)}
                aria-label="Tutup pemutar video"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <VideoPlayer url={activeVideo.embed_url} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
