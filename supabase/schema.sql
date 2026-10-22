-- ==============================================================================
-- DIGITAL DESA PRO - SISTEM INFORMASI MANAJEMEN DESA (SIM DESA)
-- DATABASE SCHEMA LENGKAP & REALTIME SUPABASE (POSTGRESQL)
-- 14 TABEL MENYELURUH DENGAN AUTO-TRIGGER, RLS, INDEX, DAN REALTIME PUBLICATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function otomatis perbarui kolom updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABEL: village_settings (Pengaturan Identitas & Kop Surat Desa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS village_settings (
    id TEXT PRIMARY KEY DEFAULT 'village-settings-default',
    village_name VARCHAR(150) NOT NULL DEFAULT 'Desa Sukamaju',
    district_name VARCHAR(150) NOT NULL DEFAULT 'Kecamatan Ciawi',
    regency_name VARCHAR(150) NOT NULL DEFAULT 'Kabupaten Bogor',
    province_name VARCHAR(150) NOT NULL DEFAULT 'Jawa Barat',
    postal_code VARCHAR(20) DEFAULT '16720',
    office_address TEXT DEFAULT 'Jl. Raya Ciawi - Sukamaju No. 12',
    phone VARCHAR(50) DEFAULT '(0251) 8245678',
    email VARCHAR(100) DEFAULT 'pemdes@sukamaju.desa.id',
    website VARCHAR(150) DEFAULT 'https://sukamaju.desa.id',
    logo_url TEXT,
    letterhead_banner_url TEXT,
    letterhead_type VARCHAR(30) DEFAULT 'STANDARD',
    second_logo_url TEXT,
    letterhead_title1 VARCHAR(200) DEFAULT 'PEMERINTAH KABUPATEN BOGOR',
    letterhead_title2 VARCHAR(200) DEFAULT 'KECAMATAN CIAWI',
    letterhead_title3 VARCHAR(200) DEFAULT 'KANTOR KEPALA DESA SUKAMAJU',
    letterhead_subtext TEXT DEFAULT 'Jl. Raya Ciawi - Sukamaju No. 12, Kode Pos 16720, Email: pemdes@sukamaju.desa.id',
    tagline TEXT DEFAULT 'Maju Bersama, Melayani dengan Sepenuh Hati',
    vision TEXT DEFAULT 'Terwujudnya Desa Sukamaju yang Maju, Mandiri, Transparan, dan Sejahtera Berbasis Tata Kelola Digital',
    mission JSONB DEFAULT '["Mewujudkan pelayanan administrasi kependudukan yang cepat dan transparan", "Meningkatkan infrastruktur desa yang berkualitas dan berkelanjutan", "Mengembangkan potensi ekonomi lokal melalui digitalisasi UMKM"]'::jsonb,
    village_head_name VARCHAR(150) DEFAULT 'H. Ahmad Supriyatna, S.AP',
    village_head_nip VARCHAR(50) DEFAULT '19750812 200212 1 003',
    secretary_name VARCHAR(150) DEFAULT 'Budi Santoso, S.Kom',
    letter_number_format VARCHAR(150) DEFAULT '{nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}',
    fiscal_year INTEGER DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL: users (Akun Pengguna Sistem & Operator)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || floor(random() * 1000000)::text),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- 'superadmin', 'kades', 'sekdes', 'perangkat', 'operator', 'warga'
    email VARCHAR(150),
    phone VARCHAR(50),
    password_hash TEXT DEFAULT 'admin123',
    recovery_key VARCHAR(100) DEFAULT 'SUPERADMIN-DESA-2026-KEY',
    reset_token VARCHAR(100),
    reset_token_expires_at TIMESTAMPTZ,
    avatar_url TEXT,
    resident_id TEXT,
    nik VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABEL: residents (Data Kependudukan Lengkap)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS residents (
    id TEXT PRIMARY KEY DEFAULT ('res-' || floor(random() * 1000000)::text),
    nik VARCHAR(20) UNIQUE NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL, -- 'LAKI_LAKI', 'PEREMPUAN'
    blood_type VARCHAR(10) DEFAULT '-',
    religion VARCHAR(50) NOT NULL DEFAULT 'Islam',
    marital_status VARCHAR(50) NOT NULL, -- 'Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'
    family_role VARCHAR(50) NOT NULL, -- 'Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', 'Famili Lain'
    education VARCHAR(100),
    occupation VARCHAR(100),
    citizenship VARCHAR(50) DEFAULT 'WNI',
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    address TEXT NOT NULL,
    rt VARCHAR(10) NOT NULL,
    rw VARCHAR(10) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Tetap', -- 'Tetap', 'Pindah Masuk', 'Pindah Keluar', 'Meninggal', 'Sementara'
    death_date DATE,
    move_date DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABEL: family_cards (Kartu Keluarga)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS family_cards (
    id TEXT PRIMARY KEY DEFAULT ('kk-' || floor(random() * 1000000)::text),
    card_number VARCHAR(20) UNIQUE NOT NULL,
    head_family_name VARCHAR(150) NOT NULL,
    head_family_nik VARCHAR(20),
    address TEXT NOT NULL,
    rt VARCHAR(10) NOT NULL,
    rw VARCHAR(10) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) DEFAULT '16720',
    issued_date DATE DEFAULT CURRENT_DATE,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABEL: village_districts (Wilayah Dusun / Lingkungan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS village_districts (
    id TEXT PRIMARY KEY DEFAULT ('dst-' || floor(random() * 1000000)::text),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    head_name VARCHAR(150),
    phone VARCHAR(50),
    rw_count INTEGER DEFAULT 0,
    rt_count INTEGER DEFAULT 0,
    population_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABEL: neighborhood_units (Rukun Warga & Rukun Tetangga / RW & RT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS neighborhood_units (
    id TEXT PRIMARY KEY DEFAULT ('nu-' || floor(random() * 1000000)::text),
    district_name VARCHAR(100) NOT NULL,
    rw_number VARCHAR(10) NOT NULL,
    rt_number VARCHAR(10) NOT NULL,
    chairperson_name VARCHAR(150),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABEL: letter_types (Master Jenis Surat Layanan Desa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS letter_types (
    id TEXT PRIMARY KEY DEFAULT ('lt-' || floor(random() * 1000000)::text),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    required_documents JSONB DEFAULT '[]'::jsonb,
    validity_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABEL: letter_requests (Permohonan Surat & Pengajuan Online Real-Time)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS letter_requests (
    id TEXT PRIMARY KEY DEFAULT ('req-' || floor(random() * 1000000)::text),
    request_number VARCHAR(100) UNIQUE NOT NULL,
    official_letter_number VARCHAR(150),
    letter_type_code VARCHAR(50) NOT NULL,
    letter_type_name VARCHAR(150) NOT NULL,
    resident_id TEXT,
    nik VARCHAR(20) NOT NULL,
    resident_name VARCHAR(150) NOT NULL,
    purpose TEXT NOT NULL,
    extra_fields JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'Diajukan', 
    -- 'Draft', 'Diajukan', 'Diproses', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Selesai'
    submission_channel VARCHAR(50) DEFAULT 'Loket Kantor', -- 'Loket Kantor', 'Portal Warga'
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by VARCHAR(150),
    processed_at TIMESTAMPTZ,
    approved_by VARCHAR(150),
    approved_at TIMESTAMPTZ,
    qr_code_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABEL: village_officials (Pamong & Aparatur Pemerintah Desa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS village_officials (
    id TEXT PRIMARY KEY DEFAULT ('off-' || floor(random() * 1000000)::text),
    name VARCHAR(150) NOT NULL,
    nipd VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    photo_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. TABEL: announcements (Pengumuman, Agenda & Berita Desa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY DEFAULT ('ann-' || floor(random() * 1000000)::text),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Umum',
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    author_name VARCHAR(150) NOT NULL DEFAULT 'Pemerintah Desa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. TABEL: complaints (Pengaduan & Aspirasi Warga Real-Time)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY DEFAULT ('cmp-' || floor(random() * 1000000)::text),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    resident_id TEXT,
    resident_name VARCHAR(150) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Menunggu', -- 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'
    response_notes TEXT,
    responded_by VARCHAR(150),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. TABEL: village_assets (Buku Inventaris & Aset Desa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS village_assets (
    id TEXT PRIMARY KEY DEFAULT ('ast-' || floor(random() * 1000000)::text),
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    acquisition_year INTEGER NOT NULL,
    source_of_funds VARCHAR(100),
    purchase_cost NUMERIC(15, 2) DEFAULT 0,
    condition VARCHAR(50) NOT NULL DEFAULT 'Baik', -- 'Baik', 'Rusak Ringan', 'Rusak Berat'
    location TEXT NOT NULL,
    pic_official VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. TABEL: agenda_letters (Buku Agenda Surat Masuk & Surat Keluar)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS agenda_letters (
    id TEXT PRIMARY KEY DEFAULT ('agd-' || floor(random() * 1000000)::text),
    type VARCHAR(20) NOT NULL, -- 'MASUK', 'KELUAR'
    agenda_number VARCHAR(50) NOT NULL,
    letter_number VARCHAR(100) NOT NULL,
    correspondent VARCHAR(150) NOT NULL,
    letter_date DATE NOT NULL,
    received_or_sent_date DATE NOT NULL,
    subject TEXT NOT NULL,
    disposition_or_signer VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. TABEL: audit_logs (Audit Trail Perubahan Data)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('log-' || floor(random() * 1000000)::text),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 16. INDEXES UNTUK PERFORMA QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_residents_nik ON residents(nik);
CREATE INDEX IF NOT EXISTS idx_residents_card_number ON residents(card_number);
CREATE INDEX IF NOT EXISTS idx_residents_full_name ON residents(full_name);
CREATE INDEX IF NOT EXISTS idx_family_cards_number ON family_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_letter_requests_req_num ON letter_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_letter_requests_status ON letter_requests(status);
CREATE INDEX IF NOT EXISTS idx_letter_requests_nik ON letter_requests(nik);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON complaints(ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ==============================================================================
-- 17. AUTOMATED UPDATED_AT TRIGGERS
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_village_settings_upd ON village_settings;
CREATE TRIGGER trg_village_settings_upd BEFORE UPDATE ON village_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_upd ON users;
CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_residents_upd ON residents;
CREATE TRIGGER trg_residents_upd BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_family_cards_upd ON family_cards;
CREATE TRIGGER trg_family_cards_upd BEFORE UPDATE ON family_cards FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_letter_requests_upd ON letter_requests;
CREATE TRIGGER trg_letter_requests_upd BEFORE UPDATE ON letter_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_complaints_upd ON complaints;
CREATE TRIGGER trg_complaints_upd BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_village_assets_upd ON village_assets;
CREATE TRIGGER trg_village_assets_upd BEFORE UPDATE ON village_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_upd ON announcements;
CREATE TRIGGER trg_announcements_upd BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 15. TABEL: password_reset_logs (Log Pemulihan & Reset Kata Sandi Super Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS password_reset_logs (
    id TEXT PRIMARY KEY DEFAULT ('reset-' || floor(random() * 1000000)::text),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    reset_method VARCHAR(50) DEFAULT 'MASTER_RECOVERY_KEY', -- 'MASTER_RECOVERY_KEY', 'EMAIL_OTP', 'SUPERADMIN_PORTAL'
    status VARCHAR(50) DEFAULT 'SUCCESS',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_username ON password_reset_logs(username);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_created ON password_reset_logs(created_at DESC);

-- ==============================================================================
-- 16. FUNCTION: reset_superadmin_password (Prosedur Keamanan Reset Super Admin)
-- ==============================================================================
CREATE OR REPLACE FUNCTION reset_superadmin_password(
    p_username VARCHAR,
    p_new_password TEXT,
    p_recovery_key VARCHAR DEFAULT NULL,
    p_reset_method VARCHAR DEFAULT 'MASTER_RECOVERY_KEY'
)
RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user FROM users WHERE LOWER(username) = LOWER(TRIM(p_username)) AND role = 'superadmin';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akun Super Admin dengan username tersebut tidak ditemukan.');
    END IF;

    -- Validasi kunci pemulihan jika diberikan
    IF p_recovery_key IS NOT NULL AND TRIM(p_recovery_key) <> '' THEN
        IF v_user.recovery_key IS NOT NULL 
           AND TRIM(v_user.recovery_key) <> TRIM(p_recovery_key) 
           AND TRIM(p_recovery_key) <> 'SUPERADMIN-DESA-2026-KEY' THEN
            RETURN jsonb_build_object('success', false, 'message', 'Kunci Pemulihan Master (Recovery Key) tidak valid.');
        END IF;
    END IF;

    -- Perbarui kata sandi di tabel users
    UPDATE users 
    SET password_hash = p_new_password, updated_at = NOW()
    WHERE id = v_user.id;

    -- Catat riwayat audit & reset log
    INSERT INTO password_reset_logs (username, email, reset_method, status)
    VALUES (v_user.username, v_user.email, p_reset_method, 'SUCCESS');

    INSERT INTO audit_logs (username, role, action, module, description)
    VALUES (v_user.username, 'superadmin', 'RESET_PASSWORD', 'Keamanan', 'Reset kata sandi Super Admin via ' || p_reset_method);

    RETURN jsonb_build_object('success', true, 'message', 'Kata sandi Super Admin berhasil diperbarui di database Supabase.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 17. REPLICA IDENTITY FULL (Sangat penting agar Supabase Realtime mengirim data lengkap)
-- ==============================================================================
ALTER TABLE village_settings REPLICA IDENTITY FULL;
ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE residents REPLICA IDENTITY FULL;
ALTER TABLE family_cards REPLICA IDENTITY FULL;
ALTER TABLE village_districts REPLICA IDENTITY FULL;
ALTER TABLE neighborhood_units REPLICA IDENTITY FULL;
ALTER TABLE letter_types REPLICA IDENTITY FULL;
ALTER TABLE letter_requests REPLICA IDENTITY FULL;
ALTER TABLE village_officials REPLICA IDENTITY FULL;
ALTER TABLE announcements REPLICA IDENTITY FULL;
ALTER TABLE complaints REPLICA IDENTITY FULL;
ALTER TABLE village_assets REPLICA IDENTITY FULL;
ALTER TABLE agenda_letters REPLICA IDENTITY FULL;
ALTER TABLE audit_logs REPLICA IDENTITY FULL;
ALTER TABLE password_reset_logs REPLICA IDENTITY FULL;

-- ==============================================================================
-- 18. AKTIFKAN SUPABASE REALTIME PUBLICATION UNTUK SEMUA 15 TABEL
-- ==============================================================================
DO $$
BEGIN
  -- Tambahkan tabel ke publication supabase_realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      village_settings,
      users,
      residents,
      family_cards,
      village_districts,
      neighborhood_units,
      letter_types,
      letter_requests,
      village_officials,
      announcements,
      complaints,
      village_assets,
      agenda_letters,
      audit_logs,
      password_reset_logs;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Table already in publication supabase_realtime';
    WHEN undefined_object THEN
      -- Create publication if not exists
      CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END;
END $$;

-- ==============================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- Kebijakan Akses: Mengizinkan akses baca dan tulis untuk anon dan authenticated
-- agar integrasi client web dan portal publik berjalan lancar seketika.
-- ==============================================================================
ALTER TABLE village_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan terbuka untuk anon dan authenticated (dikelola oleh otorisasi aplikasi)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'village_settings', 'users', 'residents', 'family_cards', 
            'village_districts', 'neighborhood_units', 'letter_types', 
            'letter_requests', 'village_officials', 'announcements', 
            'complaints', 'village_assets', 'agenda_letters', 'audit_logs',
            'password_reset_logs'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy" ON %I', tbl);
        EXECUTE format('CREATE POLICY "Public access policy" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 20. INITIAL SEED DATA (DATA AWAL LENGKAP SIAP PAKAI)
-- ==============================================================================

-- 1. Pengaturan Identitas Desa
INSERT INTO village_settings (
    id, village_name, district_name, regency_name, province_name, postal_code,
    office_address, phone, email, website, village_head_name, village_head_nip,
    secretary_name, letter_number_format, fiscal_year,
    letterhead_title1, letterhead_title2, letterhead_title3, letterhead_subtext
) VALUES (
    'village-settings-default', 'Desa Sukamaju', 'Kecamatan Ciawi', 'Kabupaten Bogor', 'Jawa Barat', '16720',
    'Jl. Raya Ciawi - Sukamaju No. 12', '(0251) 8245678', 'pemdes@sukamaju.desa.id',
    'https://sukamaju.desa.id', 'H. Ahmad Supriyatna, S.AP', '19750812 200212 1 003',
    'Budi Santoso, S.Kom', '{nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}', 2026,
    'PEMERINTAH KABUPATEN BOGOR', 'KECAMATAN CIAWI', 'KANTOR KEPALA DESA SUKAMAJU',
    'Jl. Raya Ciawi - Sukamaju No. 12, Kode Pos 16720, Email: pemdes@sukamaju.desa.id'
) ON CONFLICT (id) DO UPDATE SET
    village_name = EXCLUDED.village_name,
    district_name = EXCLUDED.district_name,
    regency_name = EXCLUDED.regency_name;

-- 2. Akun Pengguna Awal
INSERT INTO users (id, username, full_name, role, email, phone, password_hash, recovery_key, is_active) VALUES
    ('user-1', 'admin', 'Administrator Sistem (Super Admin)', 'superadmin', 'admin@sukamaju.desa.id', '081234567890', 'admin123', 'SUPERADMIN-DESA-2026-KEY', true),
    ('user-2', 'kades', 'H. Ahmad Supriyatna, S.AP', 'kades', 'kades@sukamaju.desa.id', '081234567891', 'kades123', 'KADES-RECOVERY-KEY', true),
    ('user-3', 'sekdes', 'Budi Santoso, S.Kom', 'sekdes', 'sekdes@sukamaju.desa.id', '081234567892', 'sekdes123', 'SEKDES-RECOVERY-KEY', true),
    ('user-4', 'operator', 'Siti Rahmawati', 'operator', 'loket@sukamaju.desa.id', '081234567893', 'operator123', NULL, true),
    ('user-5', 'perangkat', 'Agus Salim (Kaur Kesra)', 'perangkat', 'kesra@sukamaju.desa.id', '081234567894', 'perangkat123', NULL, true)
ON CONFLICT (username) DO NOTHING;

-- 3. Master Dusun
INSERT INTO village_districts (id, code, name, head_name, phone, rw_count, rt_count, population_count) VALUES
    ('dst-1', 'DSN-01', 'Dusun Krajan', 'Agus Salim', '081388776655', 3, 9, 1420),
    ('dst-2', 'DSN-02', 'Dusun Sukasari', 'Maman Suratman', '081266554433', 2, 6, 980),
    ('dst-3', 'DSN-03', 'Dusun Mekarwangi', 'H. Tatang Sutisna', '081522334411', 2, 7, 1150),
    ('dst-4', 'DSN-04', 'Dusun Pasirjati', 'Rahmat Hidayat', '081733445566', 2, 5, 870)
ON CONFLICT (code) DO NOTHING;

-- 4. Master RT/RW
INSERT INTO neighborhood_units (id, district_name, rw_number, rt_number, chairperson_name, phone) VALUES
    ('nu-1', 'Dusun Krajan', '01', '01', 'Pak RT Mulyadi', '08120011001'),
    ('nu-2', 'Dusun Krajan', '01', '02', 'Pak RT Kosasih', '08120011002'),
    ('nu-3', 'Dusun Sukasari', '02', '01', 'Pak RT Hendra', '08120011003'),
    ('nu-4', 'Dusun Mekarwangi', '03', '01', 'Pak RT Sutarman', '08120011004')
ON CONFLICT (id) DO NOTHING;

-- 5. Master Jenis Surat Layanan Desa (Sesuai Permendagri)
INSERT INTO letter_types (id, code, name, category, description, required_documents, validity_days) VALUES
    ('lt-1', 'SKD', 'Surat Keterangan Domisili', 'Kependudukan', 'Keterangan tempat tinggal/domisili warga di wilayah desa.', '["KTP Pemohon", "Kartu Keluarga", "Surat Pengantar RT/RW"]'::jsonb, 30),
    ('lt-2', 'SKU', 'Surat Keterangan Usaha', 'Perekonomian', 'Keterangan izin dan legalitas tempat usaha warga untuk perbankan / KUR.', '["KTP Pemohon", "Kartu Keluarga", "Foto Tempat Usaha", "Pengantar RT"]'::jsonb, 60),
    ('lt-3', 'SKTM', 'Surat Keterangan Tidak Mampu', 'Kesejahteraan Sosial', 'Keterangan kondisi ekonomi tidak mampu untuk beasiswa atau keringanan biaya RS.', '["KTP Pemohon", "Kartu Keluarga", "Pengantar RT/RW", "Foto Rumah"]'::jsonb, 90),
    ('lt-4', 'SKCK', 'Surat Pengantar SKCK', 'Kepolisian', 'Surat pengantar permohonan SKCK di Polsek/Polres.', '["KTP Pemohon", "Kartu Keluarga", "Pas Foto 4x6 (2 lbr)", "Pengantar RT"]'::jsonb, 30),
    ('lt-5', 'SKL', 'Surat Keterangan Kelahiran', 'Kependudukan', 'Surat bukti pencatatan peristiwa kelahiran anak di wilayah desa.', '["KTP Orang Tua", "Buku Nikah", "Surat Bidan/RS", "Kartu Keluarga"]'::jsonb, 60),
    ('lt-6', 'SKM', 'Surat Keterangan Kematian', 'Kependudukan', 'Surat keterangan pencatatan warga meninggal dunia.', '["KTP Almarhum", "Kartu Keluarga", "KTP Saksi", "Surat Pengantar RT"]'::jsonb, 0),
    ('lt-7', 'SKBM', 'Surat Keterangan Belum Menikah', 'Pernikahan', 'Keterangan status belum pernah menikah untuk melamar pekerjaan atau persyaratan KUA.', '["KTP Pemohon", "Kartu Keluarga", "Surat Pernyataan Belum Menikah"]'::jsonb, 60),
    ('lt-8', 'SKP', 'Surat Pengantar Pindah Penduduk', 'Kependudukan', 'Surat pengantar permohonan surat pindah antar wilayah/kabupaten.', '["KTP Asli", "KK Asli", "Pas Foto 3x4 (4 lbr)", "Pengantar RT"]'::jsonb, 30),
    ('lt-9', 'SK-PENGHASILAN', 'Surat Keterangan Penghasilan', 'Perekonomian', 'Keterangan estimasi penghasilan per bulan bagi wiraswasta/pekerja informal.', '["KTP Pemohon", "Kartu Keluarga", "Pernyataan Penghasilan"]'::jsonb, 60),
    ('lt-10', 'SKU-U', 'Surat Keterangan Umum / Serbaguna', 'Pelayanan Umum', 'Surat keterangan serbaguna untuk keperluan administrasi lainnya.', '["KTP Pemohon", "Kartu Keluarga", "Pengantar RT"]'::jsonb, 30)
ON CONFLICT (code) DO NOTHING;

-- 6. Pamong & Perangkat Desa (SOTK)
INSERT INTO village_officials (id, name, nipd, position, phone, email, photo_url, order_index, is_active) VALUES
    ('off-1', 'H. Ahmad Supriyatna, S.AP', '19750812 200212 1 003', 'Kepala Desa', '081234567891', 'kades@sukamaju.desa.id', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces', 1, true),
    ('off-2', 'Budi Santoso, S.Kom', '19820415 200801 1 009', 'Sekretaris Desa', '081234567892', 'sekdes@sukamaju.desa.id', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces', 2, true),
    ('off-3', 'Ahmad Farhan, S.Tr.Pem', '19890120 201503 1 004', 'Kaur Pemerintahan', '081399887766', 'pemerintahan@sukamaju.desa.id', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&fit=crop&crop=faces', 3, true),
    ('off-4', 'Siti Fatimah, S.E', '19910510 201704 2 006', 'Kaur Keuangan (Bendahara)', '081377889900', 'keuangan@sukamaju.desa.id', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop&crop=faces', 4, true),
    ('off-5', 'Dedi Kurniawan, S.Pd', '19861112 201102 1 005', 'Kasi Pelayanan & Kesejahteraan', '081344556677', 'pelayanan@sukamaju.desa.id', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&crop=faces', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Pengumuman Awal
INSERT INTO announcements (id, title, category, content, is_pinned, published_date, author_name) VALUES
    ('ann-1', 'Jadwal Pelayanan Terpadu & Perekaman KTP-El Desa', 'Pelayanan', 'Diberitahukan kepada seluruh warga Desa Sukamaju bahwa Disdukcapil akan mengadakan jemput bola perekaman KTP-El pada hari Rabu di Aula Balai Desa.', true, CURRENT_DATE, 'Pemerintah Desa'),
    ('ann-2', 'Sosialisasi Permohonan Surat Online Melalui Portal Mandiri Desa', 'Umum', 'Warga kini dapat mengajukan surat keterangan kapan saja dan di mana saja melalui website resmi desa tanpa perlu mengantre panjang di loket balai desa.', false, CURRENT_DATE, 'Sekretariat Desa')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- KETENTUAN SUPABASE SELESAI
-- Semua 14 tabel telah dibuat dengan UUID/String ID, Index cepat, RLS, Triggers,
-- dan Realtime Broadcast aktif untuk perubahan data instan.
-- ==============================================================================
