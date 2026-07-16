-- 1. Create table 'kategori_artikel'
CREATE TABLE IF NOT EXISTS kategori_artikel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add 'kategori_id' foreign key to 'penyebab_card'
ALTER TABLE penyebab_card
ADD COLUMN IF NOT EXISTS kategori_id UUID REFERENCES kategori_artikel(id) ON DELETE SET NULL;

-- 3. Insert the 4 initial categories
INSERT INTO kategori_artikel (key, title, subtitle, description, display_order)
VALUES 
  ('penjelasan_umum', 'Apa itu TB?', 'Penjelasan Umum', 'Kumpulan artikel edukasi seputar pengertian dasar Tuberkulosis, bakteri penyebab, dan mekanisme infeksi.', 1),
  ('gejala', 'Gejala TB', 'Gejala & Diagnosis', 'Artikel mengenai tanda-tanda klinis TB, metode diagnosis, serta pentingnya deteksi dini.', 2),
  ('pengobatan', 'Skema Pengobatan', 'Pengobatan & Kepatuhan', 'Artikel mengenai rejimen OAT, peran PMO, dan pentingnya kepatuhan minum obat selama terapi.', 3),
  ('pencegahan', 'Pencegahan Penularan', 'Pencegahan & Proteksi', 'Artikel mengenai cara mencegah penularan TB melalui etika batuk, ventilasi, dan gaya hidup sehat.', 4)
ON CONFLICT (key) DO NOTHING;

-- 4. Update the existing penyebab_card rows to link with the new kategori_artikel rows
UPDATE penyebab_card
SET kategori_id = (SELECT id FROM kategori_artikel WHERE key = 'penjelasan_umum')
WHERE slug LIKE '%bakteri%' OR slug LIKE '%imun%';

UPDATE penyebab_card
SET kategori_id = (SELECT id FROM kategori_artikel WHERE key = 'gejala')
WHERE slug LIKE '%gejala%';

UPDATE penyebab_card
SET kategori_id = (SELECT id FROM kategori_artikel WHERE key = 'pengobatan')
WHERE slug LIKE '%pmo%' OR slug LIKE '%obat%' OR slug LIKE '%dukungan%';

UPDATE penyebab_card
SET kategori_id = (SELECT id FROM kategori_artikel WHERE key = 'pencegahan')
WHERE slug LIKE '%droplet%' OR slug LIKE '%penularan%' OR slug LIKE '%lingkungan%' OR slug LIKE '%kontak%' OR slug LIKE '%rokok%' OR slug LIKE '%pencegahan%';
