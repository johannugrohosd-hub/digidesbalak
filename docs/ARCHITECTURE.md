# Dokumentasi Arsitektur Digital Desa Pro (SIM Desa)

## 1. Ringkasan Eksekutif & Tujuan Aplikasi
**Digital Desa Pro** adalah Sistem Informasi Manajemen Desa (SIM Desa) komprehensif yang dirancang untuk aparatur pemerintah desa dan masyarakat desa di Indonesia dengan referensi alur kerja standar seperti Digides dan OpenSID.

Aplikasi ini mencakup seluruh domain tata kelola desa:
1. **Administrasi Kependudukan Terpadu**: Pengelolaan data penduduk (NIK 16 digit), Kartu Keluarga (No KK 16 digit), Dusun, RW, dan RT.
2. **Pelayanan Surat-Menyurat (E-Surat)**: Otomasi pembuatan 10 jenis surat dinas desa (SKD, SKU, SKTM, SKCK, SKL, SKM, SKBM, SKP, SK-Penghasilan, Ket Umum) dengan format kop resmi desa, nomor registrasi berurutan anti-ganda, tanda tangan elektronik, stempel digital, dan verifikasi QR Code.
3. **Portal Pelayanan Mandiri Warga**: Portal warga terpisah dengan kontrol privasi ketat (warga hanya dapat melihat permohonan dan datanya sendiri), pengajuan surat online, unggah berkas, pelacakan status alur verifikasi, serta pengaduan aspirasi.
4. **Tata Kelola Pemerintahan & Aset Desa**: Struktur SOTK, buku inventaris aset desa (nilai perolehan, sumber APBDes, kondisi fisik), buku agenda surat masuk & keluar beserta disposisi.
5. **Role-Based Access Control (RBAC)**: Pembagian peran ketat (Super Admin, Kepala Desa, Sekretaris Desa, Perangkat Desa, Operator Loket, dan Warga Mandiri).
6. **Laporan & Ekspor Dokumen**: Laporan demografi, rekap surat, dan aset yang dapat difilter dan diekspor ke Microsoft Excel (.xls), format CSV, dan cetak PDF resmi.

---

## 2. Struktur Direktori Proyek
```text
├── docs/
│   ├── ARCHITECTURE.md          # Dokumen rancangan arsitektur dan RBAC
│   └── INSTALLATION.md          # Petunjuk instalasi lokal dan konfigurasi Supabase
├── prisma/
│   └── schema.prisma            # Skema Prisma ORM untuk PostgreSQL
├── supabase/
│   ├── schema.sql               # Skema DDL PostgreSQL (Tabel, Index, Constraints)
│   └── seed.sql                 # Data seed awal desa
├── src/
│   ├── types/
│   │   └── index.ts             # Definisi tipe data TypeScript lengkap
│   ├── data/
│   │   └── seedData.ts          # Data simulasi awal desa fiktif
│   ├── services/
│   │   └── storageService.ts    # Service layer penyimpanan, validasi, dan audit trail
│   ├── utils/
│   │   └── formatters.ts        # Formatter tanggal Indo, Rupiah, CSV, dan Excel
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Header dengan quick-role switcher, notif, dan profil
│   │   │   ├── Sidebar.tsx      # Navigasi sidebar responsif dengan filter role
│   │   │   └── Breadcrumb.tsx   # Breadcrumb navigasi hierarki
│   │   ├── common/
│   │   │   ├── Modal.tsx        # Dialog modal standar aksesibilitas
│   │   │   └── Toast.tsx        # Toast notifikasi sukses/gagal
│   │   ├── auth/
│   │   │   └── LoginView.tsx    # Halaman login dengan pemilih akun demo 1-klik
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx # Dashboard statistik kependudukan & grafik Recharts
│   │   ├── penduduk/
│   │   │   ├── PendudukList.tsx # Tabel penduduk, pencarian, filter, dan pagination
│   │   │   ├── PendudukModal.tsx# Form input penduduk dengan validasi NIK 16 digit
│   │   │   ├── PendudukDetailModal.tsx # Pratinjau KTP elektronik dan biodata
│   │   │   └── ImportExportModal.tsx   # Impor/ekspor file CSV & Excel
│   │   ├── kartuKeluarga/
│   │   │   ├── KartuKeluargaList.tsx   # Daftar KK dan pencatatan nomor KK
│   │   │   └── KartuKeluargaDetailModal.tsx # Blanko Kartu Keluarga resmi Dukcapil
│   │   ├── layananSurat/
│   │   │   ├── LayananSuratList.tsx    # Antrean permohonan dan workflow approval
│   │   │   ├── BuatSuratModal.tsx      # Formulir permohonan surat di loket desa
│   │   │   └── SuratPreviewModal.tsx   # Dokumen surat dinas cetak & QR Code
│   │   ├── portalWarga/
│   │   │   └── PortalWargaView.tsx     # Portal mandiri warga (privat, e-surat, aduan)
│   │   ├── perangkatDesa/
│   │   │   └── PerangkatDesaView.tsx   # SOTK aparatur desa
│   │   ├── wilayah/
│   │   │   └── WilayahView.tsx         # Data Dusun, RW, dan RT
│   │   ├── aset/
│   │   │   └── AsetDesaView.tsx        # Buku inventaris barang milik desa
│   │   ├── agendaSurat/
│   │   │   └── AgendaSuratView.tsx     # Agenda surat masuk/keluar & disposisi
│   │   ├── pengaduan/
│   │   │   └── PengaduanAdminView.tsx  # Manajemen tanggapan aduan warga
│   │   ├── pengumuman/
│   │   │   └── PengumumanView.tsx      # Pengumuman publik balai desa
│   │   ├── laporan/
│   │   │   └── LaporanView.tsx         # Rekapitulasi laporan & cetak PDF berttd
│   │   └── pengaturan/
│   │       └── PengaturanView.tsx      # Konfigurasi desa, kop surat, backup/restore
│   ├── App.tsx                         # Router utama aplikasi
│   ├── main.tsx                        # Entry point React 19
│   └── index.css                       # Tailwind CSS v4 & stylesheet cetak resmi
```

---

## 3. Matriks Hak Akses Pengguna (RBAC)

| Modul / Fitur | Super Admin | Kepala Desa | Sekdes | Perangkat Desa | Operator Loket | Warga Mandiri |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard Utama** | Penuh | Eksekutif | Penuh | Terbatas | Terbatas | - |
| **Data Penduduk & KK** | CRUD + Ekspor | Lihat + Ekspor | CRUD + Ekspor | Lihat | CRUD | Hanya Profil Pribadi |
| **Layanan E-Surat** | Penuh | **Approval/TTD** | Verifikasi | Proses Loket | Entri & Cetak | Ajukan & Unduh Milik Sendiri |
| **Buku Agenda Surat** | Penuh | Disposisi | Kelola | Lihat | Entri | - |
| **Inventaris Aset** | Penuh | Lihat Laporan | Pantau | Input & Update | - | - |
| **Pengaduan Warga** | Monitor | Tindak Lanjut | Tindak Lanjut | - | - | Buat Aduan Sendiri |
| **Manajemen Pengguna**| Ya | - | - | - | - | - |
| **Pengaturan Identitas Desa**| Ya | Ya | - | - | - | - |
| **Audit Trail Log** | Ya | - | - | - | - | - |
| **Backup & Restore DB**| Ya | - | - | - | - | - |

---

## 4. Keamanan & Tata Kelola Data
1. **Validasi Unik NIK & No KK**: Mencegah duplikasi data identitas kependudukan 16 digit.
2. **Nomor Surat Berurutan Otomatis**: Dihasilkan dengan pola aman (`{nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}`) untuk mencegah nomor ganda.
3. **Audit Trail**: Setiap perubahan status surat, entri penduduk, dan konfigurasi desa dicatat beserta identitas petugas, aksi, modul, dan cap waktu.
4. **Verifikasi QR Code**: Dokumen surat resmi yang diterbitkan memiliki hash verifikasi legalitas digital.
