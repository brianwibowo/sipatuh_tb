"use client";

import styles from "./VideoPlayer.module.css";

export default function VideoPlayer({ url }) {
  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isGoogleDrive = url.includes("drive.google.com");
  const videoId = getYouTubeId(url);

  if (isGoogleDrive) {
    return (
      <div 
        className={styles.placeholder} 
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          textAlign: "center",
          gap: "1.25rem",
          backgroundColor: "var(--bg-muted-light)",
          border: "2.5px dashed var(--border-medium)",
          minHeight: "300px"
        }}
      >
        <span style={{ fontSize: "2.5rem" }}>⚙️</span>
        <strong style={{ fontSize: "1.1rem", color: "var(--primary-dark)" }}>Video belum bisa dimainkan secara langsung</strong>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "420px", lineHeight: "1.6" }}>
          Video panduan ini disimpan di Google Drive dan saat ini masih dalam proses peninjauan atau konversi sistem. Anda tetap dapat membukanya secara eksternal.
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            padding: "0.65rem 1.25rem",
            borderRadius: "var(--radius-md)",
            fontWeight: "700",
            fontSize: "0.9rem",
            textDecoration: "none",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-light)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary)";
            e.currentTarget.style.transform = "none";
          }}
        >
          <span>Buka Video di Google Drive</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div 
        className={styles.placeholder}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-muted)",
          minHeight: "300px"
        }}
      >
        <span>Format video tidak didukung. Harap masukkan link YouTube yang valid.</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
        title="YouTube Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={styles.player}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      ></iframe>
    </div>
  );
}
