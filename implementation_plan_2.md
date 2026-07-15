# SIPATUH-TB — Implementation Plan (v2)

Platform edukasi kepatuhan pengobatan TB. Next.js + Supabase + Vanilla CSS.  
Deploy default ke **Vercel**, fallback ke **VPS via Docker**.

---

## Resolved Decisions

| # | Keputusan | Detail |
|---|---|---|
| 1 | **Database & Storage** | Supabase — SQL migration script siap copas |
| 2 | **Domain** | Belum beli. Pakai Vercel default URL dulu (`*.vercel.app`). Domain ditambah nanti |
| 3 | **Konten** | Seed data berisi konten ilmiah TB terpercaya (sumber: WHO, Kemenkes RI) |
| 4 | **Terminal commands** | User yang jalankan manual. Agent hanya tulis file kode |

> [!IMPORTANT]
> **Supabase Credentials (sudah dikonfigurasi)**
> - URL: `https://oxizjpttntrfbztiyylf.supabase.co`
> - Anon Key: `sb_publishable_GA2SXP0ZuKWoyRA667LQoA_4TrXZ8Tr`
> - Service Role Key: **(belum ada — perlu dari dashboard Supabase > Settings > API)**

> [!WARNING]
> **Service Role Key dibutuhkan** untuk operasi admin (upload gambar, mutasi data via API routes). Kamu bisa ambil nanti di Supabase Dashboard → Settings → API → `service_role` key. Akan disimpan di `.env.local` sebagai `SUPABASE_SERVICE_ROLE_KEY`.

---

## SQL Migration Script

Copy-paste ke **Supabase Dashboard → SQL Editor → New Query → Run**.

### Part 1: Tables

```sql
-- ============================================
-- SIPATUH-TB: Database Migration
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tabel konten halaman Info TB (Laman 1)
CREATE TABLE petugas_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel card penyebab TB (Laman 2)
CREATE TABLE penyebab_card (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT,
  description TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel artikel per penyebab (Laman 3)
CREATE TABLE artikel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  penyebab_card_id UUID REFERENCES penyebab_card(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel video pasien
CREATE TABLE video_pasien (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Index untuk performa query
CREATE INDEX idx_penyebab_card_slug ON penyebab_card(slug);
CREATE INDEX idx_artikel_slug ON artikel(slug);
CREATE INDEX idx_artikel_penyebab ON artikel(penyebab_card_id);
CREATE INDEX idx_video_active ON video_pasien(is_active) WHERE is_active = true;

-- 6. Function auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers
CREATE TRIGGER trg_petugas_content_updated
  BEFORE UPDATE ON petugas_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_penyebab_card_updated
  BEFORE UPDATE ON penyebab_card
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_artikel_updated
  BEFORE UPDATE ON artikel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_video_pasien_updated
  BEFORE UPDATE ON video_pasien
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Part 2: Row Level Security (RLS)

```sql
-- ============================================
-- RLS Policies
-- Karena app tanpa auth user, kita:
--   - ENABLE RLS (best practice Supabase)
--   - Allow SELECT untuk semua orang (anon)
--   - INSERT/UPDATE/DELETE hanya via service_role (API routes)
-- ============================================

-- petugas_content
ALTER TABLE petugas_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON petugas_content
  FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON petugas_content
  FOR ALL USING (auth.role() = 'service_role');

-- penyebab_card
ALTER TABLE penyebab_card ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON penyebab_card
  FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON penyebab_card
  FOR ALL USING (auth.role() = 'service_role');

-- artikel
ALTER TABLE artikel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON artikel
  FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON artikel
  FOR ALL USING (auth.role() = 'service_role');

-- video_pasien
ALTER TABLE video_pasien ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON video_pasien
  FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON video_pasien
  FOR ALL USING (auth.role() = 'service_role');
```

### Part 3: Storage Bucket

```sql
-- ============================================
-- Storage: Buat bucket untuk gambar
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('images', 'images', true, 5242880);  -- 5MB max per file

-- Policy: siapa saja bisa lihat gambar (public bucket)
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Policy: hanya service_role bisa upload/edit/hapus
CREATE POLICY "Service role upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Service role update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'service_role');
```

### Part 4: Seed Data (Konten Ilmiah TB)

```sql
-- ============================================
-- Seed Data — Konten Ilmiah TB
-- Sumber: WHO Global TB Report, Kemenkes RI, CDC
-- ============================================

-- Laman 1: Info TB (petugas_content)
INSERT INTO petugas_content (section_key, title, body, display_order) VALUES
(
  'penjelasan_umum',
  'Apa Itu Tuberkulosis (TB)?',
  '<p>Tuberkulosis (TB) adalah penyakit menular yang disebabkan oleh bakteri <em>Mycobacterium tuberculosis</em>. Bakteri ini paling sering menyerang paru-paru, namun juga dapat menyerang organ lain seperti ginjal, tulang belakang, dan otak.</p>
  <p>Menurut World Health Organization (WHO), TB tetap menjadi salah satu penyakit menular paling mematikan di dunia. Pada tahun 2023, sekitar 10,8 juta orang jatuh sakit akibat TB dan 1,25 juta orang meninggal karenanya secara global.</p>
  <p>Indonesia menempati peringkat ke-2 dunia dengan beban TB tertinggi setelah India, dengan estimasi 1.060.000 kasus baru per tahun (WHO Global TB Report, 2024).</p>',
  1
),
(
  'gejala',
  'Gejala Tuberkulosis',
  '<p>Gejala utama TB paru yang perlu diwaspadai meliputi:</p>
  <ul>
    <li><strong>Batuk terus-menerus selama 2 minggu atau lebih</strong> — ini adalah gejala kardinal yang menjadi indikator utama pemeriksaan TB</li>
    <li><strong>Batuk berdahak</strong>, kadang disertai darah (hemoptisis)</li>
    <li><strong>Demam hilang-timbul</strong>, terutama sore/malam hari (subfebris)</li>
    <li><strong>Keringat malam</strong> tanpa aktivitas fisik</li>
    <li><strong>Penurunan berat badan</strong> tanpa sebab yang jelas</li>
    <li><strong>Nafsu makan menurun</strong></li>
    <li><strong>Rasa lelah dan lemas</strong> berkepanjangan</li>
    <li><strong>Sesak napas</strong> pada tahap lanjut</li>
  </ul>
  <p>Jika mengalami batuk lebih dari 2 minggu, segera periksakan diri ke fasilitas kesehatan terdekat untuk skrining TB.</p>',
  2
),
(
  'pengobatan',
  'Pengobatan TB — OAT (Obat Anti Tuberkulosis)',
  '<p>TB <strong>dapat disembuhkan</strong> dengan pengobatan yang tepat dan tuntas. Program pengobatan standar menggunakan rejimen OAT (Obat Anti Tuberkulosis) yang terdiri dari dua fase:</p>
  <h3>Fase Intensif (2 bulan pertama)</h3>
  <p>Kombinasi 4 obat: <strong>Isoniazid (H)</strong>, <strong>Rifampisin (R)</strong>, <strong>Pirazinamid (Z)</strong>, dan <strong>Etambutol (E)</strong>. Fase ini bertujuan membunuh sebagian besar bakteri TB secara cepat.</p>
  <h3>Fase Lanjutan (4 bulan berikutnya)</h3>
  <p>Kombinasi 2 obat: <strong>Isoniazid (H)</strong> dan <strong>Rifampisin (R)</strong>. Fase ini bertujuan membunuh bakteri persisten yang tersisa.</p>
  <h3>Pentingnya Kepatuhan</h3>
  <p>Total pengobatan berlangsung <strong>minimal 6 bulan tanpa putus</strong>. Menghentikan pengobatan sebelum waktunya dapat menyebabkan:</p>
  <ul>
    <li>Kekambuhan penyakit</li>
    <li>Berkembangnya <strong>TB Resisten Obat (TB-RO/MDR-TB)</strong> yang jauh lebih sulit dan mahal diobati</li>
    <li>Penularan bakteri resisten ke orang lain</li>
  </ul>',
  3
),
(
  'pencegahan',
  'Pencegahan Penularan TB',
  '<p>Langkah-langkah pencegahan penularan TB meliputi:</p>
  <ul>
    <li><strong>Etika batuk</strong> — tutup mulut dan hidung saat batuk/bersin dengan siku bagian dalam atau tisu</li>
    <li><strong>Ventilasi ruangan</strong> — pastikan sirkulasi udara yang baik di rumah dan tempat kerja</li>
    <li><strong>Tidak meludah sembarangan</strong></li>
    <li><strong>Vaksinasi BCG</strong> pada bayi baru lahir</li>
    <li><strong>Terapi pencegahan TB (TPT)</strong> untuk kontak erat pasien TB</li>
    <li><strong>Deteksi dan pengobatan dini</strong> untuk memutus rantai penularan</li>
  </ul>
  <p>Pasien TB yang sudah menjalani pengobatan selama 2 minggu dengan benar umumnya sudah tidak menularkan ke orang lain.</p>',
  4
);

-- Laman 2: Penyebab TB (penyebab_card)
INSERT INTO penyebab_card (title, description, slug, display_order) VALUES
(
  'Bakteri Mycobacterium tuberculosis',
  'Penyebab utama TB adalah bakteri Mycobacterium tuberculosis yang menyebar melalui udara saat penderita batuk, bersin, atau berbicara.',
  'bakteri-mycobacterium',
  1
),
(
  'Penularan Melalui Droplet Udara',
  'TB menular melalui percikan dahak (droplet nuclei) berukuran 1-5 mikron yang terhirup ke saluran napas orang lain.',
  'penularan-droplet',
  2
),
(
  'Sistem Imun yang Lemah',
  'Orang dengan daya tahan tubuh rendah — seperti penderita HIV/AIDS, diabetes, malnutrisi, atau pengguna imunosupresan — lebih rentan terinfeksi TB.',
  'sistem-imun-lemah',
  3
),
(
  'Lingkungan Padat & Ventilasi Buruk',
  'Tinggal di lingkungan padat penghuni dengan sirkulasi udara yang buruk meningkatkan risiko penularan bakteri TB secara signifikan.',
  'lingkungan-padat',
  4
),
(
  'Kontak Erat dengan Penderita TB Aktif',
  'Orang yang tinggal serumah atau sering berkontak dekat dengan penderita TB aktif yang belum diobati memiliki risiko tertular 10-15 kali lebih tinggi.',
  'kontak-erat',
  5
),
(
  'Kebiasaan Merokok',
  'Merokok merusak mekanisme pertahanan paru-paru dan meningkatkan risiko infeksi TB hingga 2-3 kali lipat dibandingkan non-perokok (WHO, 2024).',
  'kebiasaan-merokok',
  6
);

-- Laman 3: Artikel detail per penyebab
INSERT INTO artikel (penyebab_card_id, title, slug, body) VALUES
(
  (SELECT id FROM penyebab_card WHERE slug = 'bakteri-mycobacterium'),
  'Mengenal Bakteri Mycobacterium tuberculosis',
  'mengenal-bakteri-tb',
  '<p><em>Mycobacterium tuberculosis</em> (M.tb) adalah bakteri berbentuk batang (basil) yang pertama kali ditemukan oleh Robert Koch pada 24 Maret 1882 — tanggal yang kini diperingati sebagai Hari TB Sedunia.</p>
  <h3>Karakteristik Bakteri</h3>
  <p>Bakteri ini memiliki sifat unik yang membuatnya sulit diberantas:</p>
  <ul>
    <li><strong>Tahan asam (acid-fast)</strong> — dinding selnya mengandung asam mikolat yang tebal, membuatnya tahan terhadap banyak disinfektan dan antibiotik umum</li>
    <li><strong>Aerob obligat</strong> — membutuhkan oksigen untuk hidup, sehingga paling sering menginfeksi paru-paru (organ dengan kadar oksigen tertinggi)</li>
    <li><strong>Tumbuh sangat lambat</strong> — waktu generasi 15-20 jam (bakteri lain biasanya 20 menit), sehingga gejala TB berkembang perlahan dan pengobatan membutuhkan waktu lama</li>
    <li><strong>Dapat bertahan dalam fase dorman</strong> — bakteri bisa "tidur" dalam tubuh selama bertahun-tahun (TB laten) dan aktif kembali saat daya tahan tubuh menurun</li>
  </ul>
  <h3>Bagaimana M.tb Menginfeksi Tubuh</h3>
  <p>Setelah terhirup, bakteri TB masuk ke alveolus paru-paru dan dimakan oleh sel makrofag. Namun, M.tb dapat bertahan hidup di dalam makrofag dan bahkan berkembang biak di dalamnya. Sistem imun kemudian membentuk granuloma (tuberkel) untuk mengisolasi bakteri — ini adalah ciri khas infeksi TB.</p>
  <p>Pada 90% orang sehat, sistem imun berhasil mengendalikan infeksi dalam bentuk TB laten (tidak sakit, tidak menular). Namun pada 5-10% kasus, bakteri berhasil lolos dan menyebabkan TB aktif.</p>'
),
(
  (SELECT id FROM penyebab_card WHERE slug = 'penularan-droplet'),
  'Mekanisme Penularan TB Melalui Udara',
  'penularan-tb-udara',
  '<p>TB adalah penyakit <em>airborne</em> — menular melalui udara, bukan melalui sentuhan, makanan, atau air. Memahami mekanisme penularan ini penting untuk pencegahan yang efektif.</p>
  <h3>Proses Penularan</h3>
  <ol>
    <li><strong>Penderita TB aktif batuk, bersin, berbicara, atau bernyanyi</strong> — aktivitas ini melepaskan ribuan droplet nuclei ke udara</li>
    <li><strong>Droplet nuclei berukuran sangat kecil (1-5 mikron)</strong> — cukup kecil untuk melayang di udara selama berjam-jam</li>
    <li><strong>Orang lain menghirup udara yang terkontaminasi</strong> — droplet nuclei yang mengandung bakteri TB masuk ke saluran napas bawah</li>
    <li><strong>Bakteri mencapai alveolus paru-paru</strong> — di sinilah infeksi dimulai</li>
  </ol>
  <h3>Fakta Penting</h3>
  <ul>
    <li>Satu kali batuk dapat menghasilkan hingga <strong>3.000 droplet nuclei</strong></li>
    <li>Bersin dapat menghasilkan hingga <strong>40.000 droplet nuclei</strong></li>
    <li>Droplet nuclei dapat bertahan di udara dalam ruangan tertutup selama <strong>beberapa jam</strong></li>
    <li>Sinar matahari (ultraviolet) dapat membunuh bakteri TB dalam hitungan menit</li>
    <li>TB <strong>TIDAK</strong> menular melalui jabat tangan, berbagi alat makan, atau menyentuh permukaan benda</li>
  </ul>'
),
(
  (SELECT id FROM penyebab_card WHERE slug = 'sistem-imun-lemah'),
  'Peran Sistem Imun dalam Infeksi TB',
  'sistem-imun-dan-tb',
  '<p>Sistem kekebalan tubuh adalah garis pertahanan utama melawan bakteri TB. Ketika sistem imun melemah, risiko berkembangnya TB laten menjadi TB aktif meningkat drastis.</p>
  <h3>Faktor Risiko Penurunan Imunitas</h3>
  <ul>
    <li><strong>HIV/AIDS</strong> — faktor risiko terbesar. Orang dengan HIV memiliki risiko 15-22 kali lebih besar untuk mengembangkan TB aktif. TB adalah penyebab kematian nomor 1 pada penderita HIV</li>
    <li><strong>Diabetes Mellitus</strong> — meningkatkan risiko TB 2-3 kali lipat. Kadar gula darah tinggi mengganggu fungsi sel imun</li>
    <li><strong>Malnutrisi</strong> — kekurangan gizi, terutama protein, zinc, dan vitamin D, melemahkan respons imun terhadap TB</li>
    <li><strong>Terapi imunosupresan</strong> — obat seperti kortikosteroid, kemoterapi kanker, dan obat anti-rejection transplantasi organ</li>
    <li><strong>Usia lanjut</strong> — penurunan fungsi imun alami (immunosenescence)</li>
    <li><strong>Bayi dan anak balita</strong> — sistem imun belum matang sempurna</li>
  </ul>
  <h3>Mengapa Ini Penting untuk Kepatuhan Pengobatan</h3>
  <p>Pasien TB dengan kondisi imun lemah memerlukan pemantauan lebih ketat dan kepatuhan pengobatan yang maksimal. Putus obat pada kelompok ini memiliki konsekuensi yang lebih berat, termasuk mortalitas yang lebih tinggi dan risiko resistensi obat.</p>'
);

-- Video pasien (contoh video edukasi TB dari YouTube)
INSERT INTO video_pasien (title, embed_url, is_active, display_order) VALUES
(
  'Apa Itu TBC? - Penjelasan Singkat',
  'https://www.youtube.com/watch?v=PaGPwFdMqHk',
  true,
  1
),
(
  'Cara Penularan dan Pencegahan TB',
  'https://www.youtube.com/watch?v=4hAFgEjQHiE',
  true,
  2
),
(
  'Pentingnya Minum Obat TB Sampai Tuntas',
  'https://www.youtube.com/watch?v=0M4eUbWCm3Y',
  true,
  3
);
```

---

## Tech Stack Final

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | **Next.js 15** (App Router, JavaScript) | Versi stabil terbaru |
| Styling | **Vanilla CSS** (CSS Modules) | Per-komponen, zero runtime overhead |
| Font | **Poppins** via `next/font/google` | Self-hosted otomatis oleh Next.js |
| Video Player | **react-player/lazy** | Lazy-loaded, multi-source embed |
| Database | **Supabase Postgres** | Free tier, managed, GUI dashboard |
| Image Storage | **Supabase Storage** | 1GB free, public bucket `images` |
| Deployment | **Vercel** (default) / **Docker** (VPS) | Standalone build, multi-stage Dockerfile |

---

## Design Philosophy — "Warm Clinical, Bukan Template AI"

| Aspek | Pendekatan |
|---|---|
| **Warna** | Palet dari PRD + warm neutrals (`#FAF8F5` cream, `#F0EDE8` warm gray) sebagai background agar tidak steril |
| **Layout** | Asimetris — hero split layout, card grid dengan spacing organik |
| **Tipografi** | Poppins dengan hierarki tegas: heading bold 700, sub-heading medium 500, body regular 400. Line-height 1.7 |
| **Spacing** | Generous whitespace. Section padding 80-120px |
| **Ilustrasi** | AI-generated medical illustration, warm hand-drawn style |
| **Animasi** | Fade-in on scroll, subtle hover lift. Tidak ada bouncing/pulsing |
| **Detail** | Rounded corners 12-16px, soft shadows, border tipis |

---

## Project Structure

```
sipatuh_tb/
├── app/
│   ├── layout.js               # Root layout + Poppins font
│   ├── page.js                 # Home — 2 tombol Petugas & Pasien
│   ├── page.module.css
│   ├── globals.css             # CSS variables, reset, design tokens
│   │
│   ├── petugas/
│   │   ├── page.js             # Laman 1 — Info TB
│   │   ├── page.module.css
│   │   └── penyebab/
│   │       ├── page.js         # Laman 2 — Grid card penyebab
│   │       ├── page.module.css
│   │       └── [slug]/
│   │           ├── page.js     # Laman 3 — Artikel detail
│   │           └── page.module.css
│   │
│   ├── pasien/
│   │   ├── page.js             # Grid card video (is_active = true)
│   │   └── page.module.css
│   │
│   └── api/
│       ├── admin/
│       │   └── verify/
│       │       └── route.js    # POST: cek password admin
│       ├── content/
│       │   └── route.js        # CRUD petugas_content
│       ├── penyebab/
│       │   └── route.js        # CRUD penyebab_card
│       ├── artikel/
│       │   └── route.js        # CRUD artikel
│       ├── video/
│       │   └── route.js        # CRUD video_pasien + toggle
│       └── upload/
│           └── route.js        # Upload gambar ke Supabase Storage
│
├── components/
│   ├── Navbar/
│   │   ├── Navbar.js
│   │   └── Navbar.module.css
│   ├── GearMenu/
│   │   ├── GearMenu.js         # Floating gear + admin panel
│   │   └── GearMenu.module.css
│   ├── AdminPasswordModal/
│   │   ├── AdminPasswordModal.js
│   │   └── AdminPasswordModal.module.css
│   ├── ContentEditor/
│   │   ├── ContentEditor.js    # Inline text editor
│   │   └── ContentEditor.module.css
│   ├── CardGrid/
│   │   ├── CardGrid.js
│   │   └── CardGrid.module.css
│   ├── VideoPlayer/
│   │   ├── VideoPlayer.js      # react-player wrapper
│   │   └── VideoPlayer.module.css
│   ├── VideoCard/
│   │   ├── VideoCard.js
│   │   └── VideoCard.module.css
│   ├── ToggleSwitch/
│   │   ├── ToggleSwitch.js
│   │   └── ToggleSwitch.module.css
│   ├── ImageUploader/
│   │   ├── ImageUploader.js
│   │   └── ImageUploader.module.css
│   ├── HeroSection/
│   │   ├── HeroSection.js
│   │   └── HeroSection.module.css
│   └── Footer/
│       ├── Footer.js
│       └── Footer.module.css
│
├── lib/
│   ├── supabase.js             # Supabase client (browser)
│   ├── supabase-server.js      # Supabase client (server, service_role)
│   └── admin.js                # Helper: verifikasi admin password
│
├── hooks/
│   └── useAdmin.js             # Hook: cek admin session
│
├── public/
│   └── images/                 # AI-generated illustrations
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.local                  # Credentials (gitignored)
├── .env.local.example          # Template
├── next.config.mjs
├── package.json
└── prd.md
```

---

## Proposed Changes — Fase per Fase

---

### Fase 1: Project Foundation

> [!NOTE]
> **🧑‍💻 Manual step oleh user:**
> ```bash
> cd /Users/mymac/Documents/Codes/sipatuh_tb
> npx -y create-next-app@latest ./ --js --app --no-tailwind --no-eslint --no-turbopack --no-src-dir --import-alias "@/*"
> npm install @supabase/supabase-js react-player
> ```

#### [NEW] `next.config.mjs`
- `output: 'standalone'` (siap Docker dari awal)
- `images.remotePatterns` untuk `oxizjpttntrfbztiyylf.supabase.co`

#### [NEW] `app/globals.css`
Design tokens lengkap: CSS variables (warna, spacing, radius, shadow, transition), CSS reset, utility classes, responsive breakpoints.

#### [MODIFY] `app/layout.js`
- Poppins via `next/font/google`
- Meta tags SEO dasar
- Include Navbar + Footer

#### [NEW] `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://oxizjpttntrfbztiyylf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GA2SXP0ZuKWoyRA667LQoA_4TrXZ8Tr
SUPABASE_SERVICE_ROLE_KEY=<ambil dari Supabase Dashboard>
ADMIN_PASSWORD=<tentukan password admin>
```

#### [NEW] `lib/supabase.js` & `lib/supabase-server.js`
- Browser client: pakai anon key (untuk SELECT publik)
- Server client: pakai service_role key (untuk CRUD admin)

---

### Fase 2: Home Page + Navigasi + Ilustrasi

#### [NEW] `app/page.js` + `app/page.module.css`
- Split hero: kiri teks + 2 tombol besar, kanan ilustrasi medis AI-generated
- Tombol **Petugas** (teal) dan **Pasien** (biru)
- Fade-in animation on load

#### [NEW] `components/Navbar/`
- Logo SIPATUH-TB kiri, nav links kanan
- Responsive hamburger menu mobile
- Sticky + blur backdrop

#### [NEW] `components/Footer/`
- Copyright + info singkat
- Dark background

#### 🎨 AI-Generated Illustrations
Generate 4+ ilustrasi:
1. Hero illustration — tenaga kesehatan mendampingi pasien, warm editorial style
2. TB bacteria — Mycobacterium tuberculosis, informatif & friendly
3. Lungs — paru-paru, warm colors
4. Medical icons — obat, jadwal, stethoscope

---

### Fase 3: Menu Petugas (Laman 1-3) + Admin System

#### [NEW] `app/petugas/page.js` — Laman 1: Info TB
- Render sections dari `petugas_content` (ordered by `display_order`)
- Section "Penyebab" clickable → `/petugas/penyebab`
- Gear icon → admin mode

#### [NEW] `app/petugas/penyebab/page.js` — Laman 2: Grid Card Penyebab
- Grid responsive: 3 kolom desktop, 2 tablet, 1 mobile
- Card: gambar + title + description
- Klik → `/petugas/penyebab/[slug]`

#### [NEW] `app/petugas/penyebab/[slug]/page.js` — Laman 3: Artikel
- Gambar header + judul + body text
- Breadcrumb navigation

#### [NEW] `components/GearMenu/`
- Floating button pojok kanan bawah
- Klik pertama → AdminPasswordModal
- Setelah auth → toggle mode edit
- Panel: manage video, toggle on/off, CRUD

#### [NEW] `components/AdminPasswordModal/`
- Modal input password
- POST ke `/api/admin/verify`
- Sukses → `sessionStorage` flag

#### [NEW] `components/ContentEditor/`
- Inline editing (textarea/contentEditable)
- Basic formatting
- Save/Cancel buttons

#### [NEW] `components/ImageUploader/`
- Drag & drop + file picker
- Client-side compress (max 1200px, quality 80%)
- Upload ke Supabase Storage

#### [NEW] API Routes
- `api/admin/verify` — cek password vs env var
- `api/content` — CRUD `petugas_content`
- `api/penyebab` — CRUD `penyebab_card`
- `api/artikel` — CRUD `artikel`
- `api/upload` — upload ke Supabase Storage
- Semua mutasi dicek admin password via header `x-admin-password`

---

### Fase 4: Menu Pasien

#### [NEW] `app/pasien/page.js`
- Grid video cards: `WHERE is_active = true ORDER BY display_order`
- Klik card → modal video player

#### [NEW] `components/VideoCard/`
- Thumbnail + play overlay + title
- Hover: scale + shadow

#### [NEW] `components/VideoPlayer/`
- `react-player/lazy`, `'use client'`
- 16:9 responsive container
- Modal fullscreen

#### [NEW] `api/video/route.js`
- GET: list (optional `?active_only=true`)
- POST: tambah video
- PUT: edit / toggle `is_active`
- DELETE: hapus

---

### Fase 5: Polish & Responsiveness

- Responsive breakpoints: 480, 768, 1024, 1280px
- Skeleton loaders untuk loading states
- Error states dengan friendly message
- Scroll animations (Intersection Observer)
- Accessibility: semantic HTML, aria labels, keyboard nav
- SEO: meta tags per halaman, Open Graph

---

### Fase 6: Docker & Deployment

#### [NEW] `Dockerfile`
Multi-stage build:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

#### [NEW] `docker-compose.yml`
```yaml
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### [NEW] `.dockerignore`
#### [NEW] `.env.local.example`

---

## Verification Plan

### Build & Docker Check
```bash
npm run build
docker build -t sipatuh-tb .
docker run --rm -p 3000:3000 --env-file .env.local sipatuh-tb
```

### Manual Verification Checklist
1. ✅ Home: 2 tombol navigasi, ilustrasi, animasi
2. ✅ Petugas Laman 1 → 2 → 3: navigasi + konten dari DB
3. ✅ Admin: gear → password → mode edit → CRUD → upload gambar
4. ✅ Pasien: grid video (hanya active) → klik → play video
5. ✅ Toggle: admin off video → hilang di pasien → on → muncul
6. ✅ Responsive: 4 breakpoint (mobile/tablet/desktop/wide)
7. ✅ Docker: build + run container → semua fitur OK
8. ✅ Lighthouse: target 90+
