"use client";

import { useState } from "react";
import styles from "./AdminPasswordModal.module.css";

export default function AdminPasswordModal({ isOpen, onClose, onVerified }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onVerified(password);
        onClose();
        setPassword("");
      } else {
        setError(data.error || "Password salah, silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} animate-scale-up`}>
        <div className={styles.header}>
          <h3 className={styles.title}>Verifikasi Petugas</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.closeIcon}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.desc}>
            Masukkan password administrator untuk mengaktifkan mode edit konten.
          </p>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              disabled={loading}
              autoFocus
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
