"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./VideoCard.module.css";

export default function VideoCard({ video, onPlay }) {
  const [imgError, setImgError] = useState(false);

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(video.embed_url);
  const thumbnailUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;

  return (
    <div className={styles.card} onClick={() => onPlay(video)}>
      <div className={styles.thumbnailContainer}>
        {thumbnailUrl && !imgError ? (
          <Image
            src={thumbnailUrl}
            alt={video.title}
            fill
            className={styles.thumbnail}
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.fallbackThumbnail}>
            <svg
              className={styles.lungsIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H17" />
            </svg>
          </div>
        )}

        <div className={styles.playOverlay}>
          <div className={styles.playButton}>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.playIcon}
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{video.title}</h3>
        <span className={styles.category}>Panduan Edukasi</span>
      </div>
    </div>
  );
}
