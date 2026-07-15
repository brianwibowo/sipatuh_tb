# SIPATUH-TB 🩺

**Sistem Informasi Kepatuhan Pengobatan Tuberkulosis**

SIPATUH-TB (sipatuh-tb.com) adalah platform edukasi digital modern yang dirancang untuk mendukung kepatuhan pengobatan pasien Tuberkulosis (TB). Platform ini dirancang ringan, cepat, tanpa sistem registrasi/login yang kompleks, serta mudah dikelola oleh satu orang admin/petugas kesehatan.

---

## ✨ Fitur Utama

### 1. Menu Pasien (`/pasien`)
*   **Galeri Video Edukasi & Motivasi**: Menampilkan daftar video panduan medis yang aktif (status ON dari admin).
*   **Pemutar Video Modal**: Menonton video secara responsif (16:9) tanpa meninggalkan halaman utama.
*   **Desain Ergonomis & Bersahabat**: Menggunakan typography *Poppins*, spasi longgar, dan palet warna *Warm Clinical* untuk mengurangi kecemasan pasien.

### 2. Menu Petugas & Kontrol Admin (`/petugas`)
*   **Autentikasi Sandi Bersama (Shared Password)**: Akses instan mode edit melalui tombol mengambang gear tanpa perlu registrasi akun.
*   **Inline Content Editor**: Mengubah teks, sub-judul, dan artikel penjelasan umum TB secara langsung di halaman.
*   **Card grid CRUD**: Menambah, memperbarui, dan menghapus kartu informasi penyebab penularan TB.
*   **Media Storage Upload**: Upload gambar langsung ke Supabase Storage dengan kompresi gambar otomatis di sisi klien.
*   **Video Panel**: Menyematkan tautan (embed URL) YouTube/Vimeo baru serta mengaktifkan/menonaktifkan (ON/OFF) status tayang video bagi pasien.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router, JavaScript, Standalone Mode)
*   **Database & Storage**: Supabase (PostgreSQL & Supabase Storage Bucket)
*   **Video Player**: React Player (Dynamic Lazy Load, Client-Side Only)
*   **Styling**: Vanilla CSS Modules (Aesthetic Warm Clinical)
*   **Deployment**: Vercel (Default) / Docker (VPS standalone deployment)

---

## 🚀 Memulai (Lokal)

### 1. Prasyarat
Pastikan Anda sudah menginstal:
*   [Node.js (v20+)](https://nodejs.org)
*   [npm](https://www.npmjs.com/)

### 2. Setup Berkas Lingkungan (.env)
Buat berkas `.env.local` di direktori utama proyek dengan menyalin isi template berikut:

```bash
cp .env.local.example .env.local
```

Isi variabel di `.env.local` dengan kredensial Supabase Anda:
*   `NEXT_PUBLIC_SUPABASE_URL`: URL proyek Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci publik anon Supabase.
*   `SUPABASE_SERVICE_ROLE_KEY`: Kunci rahasia `service_role` dari Supabase Dashboard -> Settings -> API (diperlukan untuk mutasi data admin & upload berkas).
*   `ADMIN_PASSWORD`: Password yang diinginkan untuk mode admin petugas (default: `admin123`).

### 3. Setup Database Supabase
Salin isi skrip migrasi SQL di dalam file `implementation_plan.md` ke **Supabase SQL Editor** Anda dan jalankan (**Run**). Ini akan membuat:
*   Tabel database (`petugas_content`, `penyebab_card`, `artikel`, `video_pasien`).
*   Row Level Security (RLS) policies untuk akses baca publik dan tulis service-role.
*   Bucket penyimpanan berkas public bernama `images`.
*   Data benih awal (seed data) berupa konten medis TB resmi dari Kemenkes RI/WHO.

### 4. Jalankan Server Dev
Jalankan perintah berikut di terminal Anda:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🐳 Deployment (Docker & VPS)

Proyek ini telah dikonfigurasi untuk build standalone, siap dijalankan dalam kontainer Docker demi keamanan dan efisiensi memori (< 300MB idle).

### Menjalankan Kontainer
Gunakan file `docker-compose.yml` untuk membuild dan menjalankan aplikasi di VPS:

```bash
# Isi kredensial di file .env.production terlebih dahulu
docker-compose up -d --build
```

Aplikasi akan otomatis berjalan di port `3000` dengan dukungan monitoring healthcheck.
