-- ==============================================================================
-- DIGITAL DESA PRO - SEED DATA SCRIPT LENGKAP UNTUK SUPABASE / POSTGRESQL
-- Eksekusi file ini di Supabase SQL Editor setelah menjalankan schema.sql
-- ==============================================================================

-- 0. SELF-HEALING: Pastikan kolom tambahan ada jika tabel sudah terlanjur dibuat
ALTER TABLE IF EXISTS village_districts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS family_cards ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10) DEFAULT '16720';
ALTER TABLE IF EXISTS family_cards ADD COLUMN IF NOT EXISTS issued_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS residents ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5) DEFAULT '-';
ALTER TABLE IF EXISTS residents ADD COLUMN IF NOT EXISTS citizenship VARCHAR(20) DEFAULT 'WNI';
ALTER TABLE IF EXISTS letter_requests ADD COLUMN IF NOT EXISTS extra_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS letter_requests ADD COLUMN IF NOT EXISTS qr_code_hash VARCHAR(100);

-- 1. PENGATURAN IDENTITAS DESA (Application Settings)
INSERT INTO application_settings (
    id, village_name, district_name, regency_name, province_name, postal_code,
    office_address, phone, email, website, village_head_name, village_head_nip,
    secretary_name, letter_number_format, fiscal_year
) VALUES (
    'default', 'Desa Sukamaju', 'Kecamatan Ciawi', 'Kabupaten Bogor', 'Jawa Barat', '16720',
    'Jl. Raya Ciawi - Sukamaju No. 12, Kode Pos 16720', '(0251) 8245678', 'pemdes@sukamaju.desa.id',
    'https://sukamaju.desa.id', 'H. Ahmad Supriyatna, S.AP', '19750812 200212 1 003',
    'Budi Santoso, S.Kom', '{nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}', 2026
) ON CONFLICT (id) DO UPDATE SET
    village_name = EXCLUDED.village_name,
    district_name = EXCLUDED.district_name,
    regency_name = EXCLUDED.regency_name;

-- 2. HAK AKSES PENGGUNA (Roles RBAC)
INSERT INTO roles (code, name, description) VALUES
    ('superadmin', 'Super Admin', 'Hak akses penuh ke seluruh pengaturan, pengguna, dan audit log'),
    ('kades', 'Kepala Desa', 'Melihat laporan eksekutif dan menyetujui surat dinas resmi'),
    ('sekdes', 'Sekretaris Desa', 'Verifikasi berkas, penomoran surat, dan agenda surat masuk/keluar'),
    ('perangkat', 'Perangkat Desa', 'Pengelolaan aset inventaris, pengumuman, dan posyandu'),
    ('operator', 'Operator Loket', 'Entri data kependudukan, input KK, dan pelayanan loket'),
    ('warga', 'Warga Mandiri', 'Portal warga: pengajuan surat online dan pengaduan')
ON CONFLICT (code) DO NOTHING;

-- 3. WILAYAH DUSUN (Village Districts)
INSERT INTO village_districts (code, name, head_name, phone, notes) VALUES
    ('DSN-01', 'Dusun Krajan', 'Agus Salim', '081388776655', 'Pusat pemerintahan dan pasar desa'),
    ('DSN-02', 'Dusun Sukasari', 'Maman Suratman', '081266554433', 'Kawasan sentra pertanian dan kebun'),
    ('DSN-03', 'Dusun Mekarwangi', 'H. Tatang Sutisna', '081522334411', 'Kawasan perumahan dan perkampungan'),
    ('DSN-04', 'Dusun Pasirjati', 'Rahmat Hidayat', '081733445566', 'Kawasan agroforestri')
ON CONFLICT (code) DO NOTHING;

-- 4. KARTU KELUARGA (Family Cards)
INSERT INTO family_cards (card_number, head_family_name, address, rt, rw, district_name, postal_code, issued_date) VALUES
    ('3201122005080001', 'Bambang Wahyudi', 'Kp. Krajan RT 01 / RW 01', '01', '01', 'Dusun Krajan', '16720', '2020-05-18'),
    ('3201121008120005', 'Suparman Hadiningrat', 'Kp. Sukasari RT 02 / RW 03', '02', '03', 'Dusun Sukasari', '16720', '2019-11-20'),
    ('3201121501150009', 'Hendra Gunawan', 'Kp. Mekarwangi RT 01 / RW 04', '01', '04', 'Dusun Mekarwangi', '16720', '2021-08-14'),
    ('3201120209210012', 'Suryana Saputra', 'Kp. Pasirjati RT 01 / RW 05', '01', '05', 'Dusun Pasirjati', '16720', '2022-03-10')
ON CONFLICT (card_number) DO NOTHING;

-- 5. DATA PENDUDUK (Residents)
INSERT INTO residents (
    nik, card_number, full_name, birth_place, birth_date, gender, blood_type,
    religion, marital_status, family_role, education, occupation, citizenship,
    address, rt, rw, district_name, status
) VALUES
    ('3201121504880001', '3201122005080001', 'Bambang Wahyudi', 'Bogor', '1988-04-15', 'LAKI_LAKI', 'O', 'Islam', 'Kawin', 'Kepala Keluarga', 'S1', 'Wiraswasta', 'WNI', 'Kp. Krajan RT 01 / RW 01', '01', '01', 'Dusun Krajan', 'Tetap'),
    ('3201125208920003', '3201122005080001', 'Sari Wulandari', 'Sukabumi', '1992-08-12', 'PEREMPUAN', 'B', 'Islam', 'Kawin', 'Istri', 'D3', 'Karyawan Swasta', 'WNI', 'Kp. Krajan RT 01 / RW 01', '01', '01', 'Dusun Krajan', 'Tetap'),
    ('3201121102180002', '3201122005080001', 'Dimas Pratama Wahyudi', 'Bogor', '2018-02-11', 'LAKI_LAKI', 'O', 'Islam', 'Belum Kawin', 'Anak', 'SD', 'Pelajar', 'WNI', 'Kp. Krajan RT 01 / RW 01', '01', '01', 'Dusun Krajan', 'Tetap'),
    ('3201120406750002', '3201121008120005', 'Suparman Hadiningrat', 'Solo', '1975-06-04', 'LAKI_LAKI', 'A', 'Islam', 'Kawin', 'Kepala Keluarga', 'SMA', 'Petani / Pekebun', 'WNI', 'Kp. Sukasari RT 02 / RW 03', '02', '03', 'Dusun Sukasari', 'Tetap'),
    ('3201124803780004', '3201121008120005', 'Sri Rahayu', 'Bogor', '1978-03-08', 'PEREMPUAN', 'AB', 'Islam', 'Kawin', 'Istri', 'SMA', 'Mengurus Rumah Tangga', 'WNI', 'Kp. Sukasari RT 02 / RW 03', '02', '03', 'Dusun Sukasari', 'Tetap'),
    ('3201121905010005', '3201121008120005', 'Bagus Triadi', 'Bogor', '2001-05-19', 'LAKI_LAKI', 'A', 'Islam', 'Belum Kawin', 'Anak', 'SMA', 'Karyawan Swasta', 'WNI', 'Kp. Sukasari RT 02 / RW 03', '02', '03', 'Dusun Sukasari', 'Tetap'),
    ('3201122203820004', '3201121501150009', 'Hendra Gunawan', 'Cianjur', '1982-03-22', 'LAKI_LAKI', 'B', 'Islam', 'Kawin', 'Kepala Keluarga', 'S1', 'Guru / Pendidik', 'WNI', 'Kp. Mekarwangi RT 01 / RW 04', '01', '04', 'Dusun Mekarwangi', 'Tetap'),
    ('3201121807900006', '3201120209210012', 'Suryana Saputra', 'Bandung', '1990-07-18', 'LAKI_LAKI', 'O', 'Islam', 'Kawin', 'Kepala Keluarga', 'S1', 'Pedagang', 'WNI', 'Kp. Pasirjati RT 01 / RW 05', '01', '05', 'Dusun Pasirjati', 'Tetap')
ON CONFLICT (nik) DO NOTHING;

-- 6. JENIS SURAT LAYANAN (Letter Types)
INSERT INTO letter_types (code, name, category, description, required_documents, validity_period_days) VALUES
    ('SKD', 'Surat Keterangan Domisili', 'Kependudukan', 'Keterangan tempat tinggal/domisili warga di wilayah desa.', ARRAY['KTP Asli', 'Kartu Keluarga', 'Surat Pengantar RT/RW'], 30),
    ('SKU', 'Surat Keterangan Usaha', 'Perekonomian', 'Keterangan izin dan legalitas tempat usaha warga.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Foto Tempat Usaha', 'Pengantar RT'], 60),
    ('SKTM', 'Surat Keterangan Tidak Mampu', 'Kesejahteraan Sosial', 'Keterangan kondisi ekonomi tidak mampu untuk beasiswa atau pembebasan biaya RS.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Pengantar RT/RW', 'Foto Rumah'], 90),
    ('SKCK', 'Surat Pengantar SKCK', 'Kepolisian', 'Surat pengantar permohonan SKCK di Polsek/Polres.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Pas Foto 4x6 (2 lbr)', 'Pengantar RT'], 30),
    ('SKL', 'Surat Keterangan Kelahiran', 'Kependudukan', 'Surat bukti pencatatan peristiwa kelahiran anak di wilayah desa.', ARRAY['KTP Orang Tua', 'Buku Nikah', 'Surat Bidan/RS', 'Kartu Keluarga'], 60),
    ('SKM', 'Surat Keterangan Kematian', 'Kependudukan', 'Surat keterangan pencatatan warga meninggal dunia.', ARRAY['KTP Almarhum', 'Kartu Keluarga', 'KTP Saksi', 'Surat Pengantar RT'], 0),
    ('SKBM', 'Surat Keterangan Belum Menikah', 'Pernikahan', 'Keterangan status belum pernah menikah untuk lamaran kerja atau pernikahan.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Surat Pernyataan Belum Menikah'], 60),
    ('SKP', 'Surat Pengantar Pindah Penduduk', 'Kependudukan', 'Surat pengantar permohonan surat pindah antar wilayah.', ARRAY['KTP Asli', 'KK Asli', 'Pas Foto 3x4 (4 lbr)', 'Pengantar RT'], 30),
    ('SK-PENGHASILAN', 'Surat Keterangan Penghasilan', 'Perekonomian', 'Keterangan estimasi penghasilan per bulan bagi wiraswasta/pekerja mandiri.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Pernyataan Penghasilan'], 60),
    ('SKU-U', 'Surat Keterangan Umum / Serbaguna', 'Pelayanan Umum', 'Surat keterangan serbaguna untuk keperluan administrasi lainnya.', ARRAY['KTP Pemohon', 'Kartu Keluarga', 'Pengantar RT'], 30)
ON CONFLICT (code) DO NOTHING;

-- 7. CONTOH PERMOHONAN SURAT (Letter Requests)
INSERT INTO letter_requests (
    request_number, official_letter_number, letter_type_code, letter_type_name,
    nik, resident_name, purpose, extra_fields, status, submission_channel, qr_code_hash
) VALUES
    ('REQ-2026-0038', '503/038/DS-SKM/X/2026', 'SKU', 'Surat Keterangan Usaha', '3201121504880001', 'Bambang Wahyudi', 'Pengajuan Kredit Usaha Rakyat (KUR) Bank BRI', '{"namaUsaha": "Toko Berkah Mandiri", "jenisUsaha": "Sembako"}'::jsonb, 'Selesai', 'Portal Warga', 'VERIF-SKU-2026-0038-DS-SKM'),
    ('REQ-2026-0041', '470/041/DS-SKM/X/2026', 'SKD', 'Surat Keterangan Domisili', '3201125208920003', 'Sari Wulandari', 'Kelengkapan berkas mutasi kepegawaian', '{}'::jsonb, 'Menunggu Persetujuan', 'Portal Warga', 'VERIF-SKD-2026-0041-DS-SKM'),
    ('REQ-2026-0042', NULL, 'SKTM', 'Surat Keterangan Tidak Mampu', '3201120406750002', 'Suparman Hadiningrat', 'Permohonan Keringanan Uang Kuliah Tunggal (UKT) UI', '{"namaAnak": "Bagus Triadi"}'::jsonb, 'Diproses', 'Loket Kantor', 'VERIF-SKTM-2026-0042-DS-SKM')
ON CONFLICT (request_number) DO NOTHING;

-- 8. INVENTARIS ASET DESA (Village Assets)
INSERT INTO village_assets (
    item_code, item_name, category, acquisition_year, source_of_funds,
    purchase_cost, condition, location, pic_official
) VALUES
    ('AST-TNH-001', 'Tanah Kas Desa (Tanah Bengkok Kades 25.000 m2)', 'Tanah', 1985, 'Swadaya / Asal-Usul Desa', 2500000000, 'Baik', 'Blok Sawah Tengah Dusun Krajan', 'H. Ahmad Supriyatna, S.AP'),
    ('AST-GDG-002', 'Gedung Balai Desa & Loket Pelayanan Terpadu', 'Gedung/Bangunan', 2018, 'APBDes & Bantuan Provinsi', 850000000, 'Baik', 'Jl. Raya Ciawi - Sukamaju No. 12', 'Budi Santoso, S.Kom'),
    ('AST-KND-003', 'Mobil Siaga Desa (Ambulance Suzuki APV)', 'Kendaraan', 2022, 'Dana Desa (DDS)', 265000000, 'Baik', 'Garasi Balai Desa Sukamaju', 'Siti Rahmawati, S.Sos'),
    ('AST-MSN-004', 'Traktor Tangan Quick Capung Metal (Unit Pertanian)', 'Peralatan & Mesin', 2021, 'Kementerian Pertanian / APBDes', 35000000, 'Baik', 'Gudang Gapoktan Dusun Sukasari', 'Agus Salim'),
    ('AST-KOM-005', 'Paket Komputer Server & PC Loket Pelayanan Digital (4 Unit)', 'Peralatan & Mesin', 2024, 'APBDes', 48000000, 'Baik', 'Ruang Server & Loket SIM Desa', 'Budi Santoso, S.Kom')
ON CONFLICT (item_code) DO NOTHING;

-- 9. PENGADUAN & ASPIRASI WARGA (Complaints)
INSERT INTO complaints (
    ticket_number, resident_name, nik, phone, category,
    subject, description, location, status, response_notes, responded_by
) VALUES
    ('PGD-2026-0012', 'Bambang Wahyudi', '3201121504880001', '081277665544', 'Infrastruktur', 'Jalan berlubang di tanjakan Musholla Kp. Krajan RT 01', 'Jalan rusak membahayakan pengendara motor setelah hujan deras.', 'Kp. Krajan RT 01 / RW 01', 'Diproses', 'Tim kaur pembangunan telah meninjau lokasi, perbaikan penambalan aspal dijadwalkan hari Jumat ini.', 'Budi Santoso, S.Kom (Sekdes)'),
    ('PGD-2026-0013', 'Suparman Hadiningrat', '3201120406750002', '085211998877', 'Pelayanan', 'Lampu Penerangan Jalan Umum (PJU) mati 4 malam', 'Kondisi jalan gelap gulita saat malam hari.', 'Jl. Utama Kp. Sukasari RT 02 / RW 03', 'Menunggu', NULL, NULL)
ON CONFLICT (ticket_number) DO NOTHING;
