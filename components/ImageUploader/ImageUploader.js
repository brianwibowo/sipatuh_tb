"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./ImageUploader.module.css";

export default function ImageUploader({ onUploadSuccess, currentImageUrl, adminPassword }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentImageUrl || "");

  useEffect(() => {
    setPreview(currentImageUrl || "");
  }, [currentImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diizinkan");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    setLoading(true);
    setError("");

    // Show client side preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onUploadSuccess(data.url);
      } else {
        setError(data.error || "Gagal mengupload gambar.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat mengupload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {preview && (
        <div className={styles.previewContainer}>
          <Image
            src={preview}
            alt="Preview gambar"
            width={300}
            height={200}
            className={styles.previewImage}
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => {
              setPreview("");
              onUploadSuccess("");
            }}
          >
            Hapus Gambar
          </button>
        </div>
      )}

      {!preview && (
        <label className={styles.uploadZone}>
          <svg
            className={styles.uploadIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className={styles.uploadText}>
            {loading ? "Mengupload..." : "Pilih atau Seret Gambar ke Sini"}
          </span>
          <span className={styles.uploadSubtext}>Maksimal 5MB (JPG, PNG, WebP)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
            disabled={loading}
          />
        </label>
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
