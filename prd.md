# PRD: SIPATUH-TB.com
## Sistem Informasi Kepatuhan Pengobatan Tuberkulosis

**Versi:** 2.0 (revisi — simplified scope)
**Tanggal:** 15 Juli 2026

---

## 1. Overview

**Nama Produk:** SIPATUH-TB (sipatuh-tb.com)

**Tujuan:** Platform edukasi untuk mendukung kepatuhan pengobatan pasien TB, dengan dua akses: petugas kesehatan (single admin, pengelola konten) dan pasien (konsumen konten edukasi + video).

**Prinsip desain:** Tanpa autentikasi, tanpa role management kompleks. Aplikasi ringan, sederhana, mudah dikelola satu orang admin.

**Target User:**
- **Petugas:** Satu admin tunggal yang mengelola seluruh konten edukasi TB dan video
- **Pasien:** Penderita TB yang mengakses materi edukasi dan video motivasi/panduan, tanpa perlu login

**Font:** Poppins (seluruh aplikasi)

---

## 2. User Roles & Akses

| Role | Akses | Autentikasi |
|---|---|---|
| **Petugas** | View konten (laman 1-3), tambah/edit/hapus konten via gear icon, upload link video embed, toggle on/off visibility konten pasien | **Tidak ada** — gear icon langsung bisa diakses |
| **Pasien** | View card video yang aktif (on), play video | Tidak perlu |

**Catatan penting soal "tanpa autentikasi":** Karena gear icon terbuka untuk siapa saja yang menemukan tombolnya, ini cocok untuk kebutuhan internal/terbatas (mis. dipakai satu puskesmas/klinik dengan akses terkontrol secara fisik atau jaringan). Tidak direkomendasikan jika sipatuh-tb.com akan diakses publik luas tanpa kontrol jaringan apa pun, karena siapa pun bisa mengubah/menghapus konten. Kalau ini jadi concern di kemudian hari, alternatif paling ringan (bukan overengineering) adalah **satu shared password** disimpan di environment variable, dicek client-side sebelum masuk mode edit — bukan sistem user/login penuh.

---

## 3. Site Map & Halaman

### 3.1 Home (`/`)
- 2 tombol besar: **Petugas** dan **Pasien**
- Visual kesehatan (ilustrasi/icon medis) sebagai aksen
- Tidak ada konten lain — clean landing page

### 3.2 Menu Petugas

**Laman 1 — Info TB (`/petugas`)**
- Penjelasan umum TB: penyebab, pengobatan, dst (format artikel/section)
- Section "Penyebab" bisa diklik → ke Laman 2
- Gear icon (pojok kanan atas) → mode edit konten

**Laman 2 — Penyebab TB (`/petugas/penyebab`)**
- Grid card berisi gambar + penyebab-penyebab TB
- Klik card → ke Laman 3
- Gear icon tetap ada untuk tambah/edit/hapus card

**Laman 3 — Artikel/Berita (`/petugas/penyebab/[slug]`)**
- Layout artikel: gambar header + teks
- Gear icon untuk tambah/edit/hapus artikel

**Fitur Gear Icon (semua laman petugas):**
- Toggle mode edit
- CRUD konten teks & gambar di Laman 1-3
- Tambah link video (embed URL) yang akan muncul sebagai card baru di menu pasien
- **Toggle switch on/off** per video/konten pasien — video yang di-off tidak muncul di `/pasien`, tapi tetap tersimpan di database (bisa diaktifkan lagi kapan saja)

### 3.3 Menu Pasien (`/pasien`)
- Grid card video — **hanya menampilkan video berstatus "on"**
- Klik card → video player
- Video diputar via embed (`react-player`), bukan file yang di-hosting sendiri

---

## 4. Fitur Detail

### 4.1 Video — Embed Only
- Petugas paste link video (YouTube/Vimeo) di form gear icon
- Sistem simpan URL + judul + status on/off ke database
- Render pakai `react-player` di `/pasien` — support multi-source, ringan, tidak perlu logic parsing manual per platform
- Tidak ada upload/hosting file video sendiri → hemat storage & bandwidth VPS/Vercel

### 4.2 Content Toggle (on/off)
- Setiap card video punya switch di mode edit petugas
- Field `is_active` (boolean) di database
- Query `/pasien` hanya `SELECT * WHERE is_active = true`

---

## 5. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| **Framework** | Next.js 14+ (App Router), output `standalone` jika pindah ke VPS | Ekosistem matang, cukup ringan dengan standalone build |
| **Styling** | Tailwind CSS | Utility-first, tanpa overhead CSS-in-JS |
| **Font** | Poppins (via `next/font/google`) | Konsisten di seluruh aplikasi, self-hosted otomatis oleh Next.js (tanpa request eksternal ke Google Fonts saat runtime) |
| **Video player** | `react-player` | Multi-source embed, ringan, setup cepat |
| **Database (default)** | Vercel Postgres atau Supabase (Postgres) | Simpel, tanpa server DB terpisah |
| **Storage gambar (default)** | Vercel Blob | Cukup untuk gambar artikel/penyebab TB, tanpa perlu setup storage server sendiri |
| **Deployment (default)** | Vercel | Zero-config, cocok karena aplikasi tanpa auth kompleks dan traffic kemungkinan tidak besar |
| **Fallback jika Vercel bermasalah** | VPS + Docker/PM2 + Nginx, database tetap Postgres (self-host atau tetap Supabase), gambar disimpan di VPS local storage atau tetap Vercel Blob | Kamu sudah punya VPS aktif — tinggal pindah proses `node server.js` ke sana kalau limit/biaya Vercel jadi masalah |

**Rencana migrasi (jika suatu saat error/limit di Vercel):**
1. Ganti `output: 'standalone'` di `next.config.js`
2. Build → copy folder `.next/standalone` + `.next/static` ke VPS
3. Jalankan dengan PM2, reverse proxy via Nginx
4. Database & Vercel Blob tetap bisa dipakai (tidak terkunci ke Vercel hosting), atau migrasi ke Postgres self-hosted di VPS yang sama

---

## 6. Database Schema (Sederhana)

```
petugas_content (Laman 1 - Info TB)
├── id
├── section (enum: penjelasan, penyebab, pengobatan, dst)
├── title
├── body (text/rich text)
└── updated_at

penyebab_card (Laman 2)
├── id
├── title
├── image_url
├── description
└── created_at

artikel (Laman 3)
├── id
├── penyebab_card_id (FK)
├── title
├── image_url
├── body (text)
└── created_at

video_pasien
├── id
├── title
├── embed_url
├── is_active (boolean, default true)
└── created_at
```

Tidak ada tabel `users`/`petugas` karena tanpa autentikasi.

---

## 7. Design System — Medical Color Palette

| Warna | Hex | Fungsi |
|---|---|---|
| Primer — teal | `#0F6E56` | Tombol utama, header |
| Sekunder — biru | `#185FA5` | Link, ikon informasi |
| Netral — abu | `#5F5E5A` | Teks, border, background |
| Aksen — merah | `#A32D2D` | Alert, hapus, peringatan |

**Tipografi:** Poppins — seluruh heading dan body text.

---

## 8. Non-Functional Requirements

- **Responsive:** Mobile-first, breakpoint standar Tailwind
- **Performance:** Target Lighthouse 90+, gunakan Next.js Image untuk gambar
- **RAM:** Target < 300MB idle jika di-deploy ke VPS (standalone mode)
- **SEO dasar:** Meta tags untuk laman publik

---

## 9. Out of Scope (Sengaja Tidak Dibuat)

- Login/autentikasi user maupun petugas
- Role management multi-user
- Upload/hosting file video sendiri
- Tracking kepatuhan pengobatan per-individu pasien (sesuai nama app, tapi berdasarkan requirement final ini murni edukasi + video)
- Approval workflow konten (petugas = single admin, publish langsung)
- Template UI dari GitHub (dibangun dari nol dengan Tailwind yang presisi standar industri)