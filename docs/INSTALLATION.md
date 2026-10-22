# Petunjuk Instalasi & Panduan Supabase - Digital Desa Pro

## 1. Menjalankan Aplikasi Secara Lokal (Development)

Aplikasi telah dikonfigurasi lengkap menggunakan React 19, TypeScript, Tailwind CSS v4, dan Express.

### Langkah Instalasi:
```bash
# 1. Install seluruh dependensi
npm install

# 2. Jalankan development server
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---

## 2. Akun Demo Bawaan (Role-Based Access)

Anda dapat masuk menggunakan form login utama atau menggunakan tombol cepat "Simulasi Akun Demo" di header:

| Peran (Role) | Username | Password Contoh | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` | Konfigurasi desa, RBAC pengguna, audit log, backup/restore |
| **Kepala Desa** | `kades` | `kades123` | Persetujuan surat resmi, penandatanganan, monitoring laporan |
| **Sekretaris Desa** | `sekdes` | `sekdes123` | Agenda surat masuk/keluar, verifikasi draf permohonan |
| **Perangkat Desa** | `perangkat` | `perangkat123` | Pengelolaan buku inventaris aset desa, pengumuman |
| **Operator Loket** | `operator` | `operator123` | Input data penduduk, entri KK, pelayanan loket fisik |
| **Warga Mandiri** | `warga` | `warga123` | Portal mandiri warga: pengajuan surat online & aduan |

*Catatan: Pada lingkungan produksi, semua password awal wajib segera diganti melalui menu Pengaturan Profil.*

---

## 3. Integrasi Database PostgreSQL & Supabase

Proyek telah dilengkapi dengan berkas migrasi SQL lengkap untuk database PostgreSQL di Supabase.

### Berkas Terkait:
- `/supabase/schema.sql`: DDL seluruh tabel relasional (`application_settings`, `users`, `roles`, `residents`, `family_cards`, `village_districts`, `letter_types`, `letter_requests`, `village_assets`, `complaints`, `audit_logs`).
- `/supabase/seed.sql`: Data inisialisasi awal desa.
- `/prisma/schema.prisma`: Skema Prisma ORM.

### Cara Menghubungkan ke Supabase:
1. Buka dashboard proyek Anda di [https://supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Buka berkas `supabase/schema.sql` dan salin seluruh kueri DDL ke SQL Editor Supabase, lalu klik **Run**.
4. Buka berkas `supabase/seed.sql` dan jalankan kueri untuk mengisikan data awal.
5. Salin Connection String Database Anda dari **Project Settings > Database > Connection string** ke file `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```
6. Jalankan migrasi Prisma jika ingin menggunakan Prisma Client:
```bash
npx prisma generate
npx prisma db push
```

---

## 4. Prosedur Cadangan & Pemulihan Data (Backup & Restore)

1. Masuk sebagai **Super Admin**.
2. Buka menu **Laporan & Sistem > Pengaturan Sistem Desa**.
3. Di bagian **Cadangan & Pemulihan Data**, klik tombol **"Unduh Berkas Backup JSON"**.
4. Seluruh snapshot database akan terunduh dalam berkas JSON berstempel waktu.
5. Untuk memulihkan, pilih berkas JSON atau gunakan opsi Reset Data Demo.
