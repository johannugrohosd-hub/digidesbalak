export type UserRole = 'superadmin' | 'kades' | 'sekdes' | 'perangkat' | 'operator' | 'warga';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  residentId?: string; // Links to resident if role is warga
  nik?: string;
  isActive: boolean;
  lastLoginAt?: string;
  password?: string;
  recoveryKey?: string;
}

export interface PasswordResetLog {
  id: string;
  username: string;
  email?: string;
  resetMethod: string;
  status: string;
  createdAt: string;
}

export interface VillageSettings {
  id: string;
  villageName: string; // e.g. Desa Sukamaju
  districtName: string; // e.g. Kecamatan Ciawi
  regencyName: string; // e.g. Kabupaten Bogor
  provinceName: string; // e.g. Jawa Barat
  postalCode: string;
  officeAddress: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  letterheadBannerUrl?: string; // Uploaded custom Kop Surat banner image
  letterheadType?: 'STANDARD' | 'CUSTOM_BANNER'; // Choice of Kop format
  secondLogoUrl?: string; // Optional right logo (e.g. Garuda emblem)
  letterheadTitle1?: string; // e.g. PEMERINTAH KABUPATEN BOGOR
  letterheadTitle2?: string; // e.g. KECAMATAN CIAWI
  letterheadTitle3?: string; // e.g. KANTOR KEPALA DESA SUKAMAJU
  letterheadSubtext?: string; // e.g. Alamat, Telp, Kode Pos
  tagline?: string;
  vision?: string;
  mission?: string[];
  villageHeadName: string; // H. Ahmad Supriyatna, S.AP
  villageHeadNip: string; // NIP / NIAP
  secretaryName: string; // Budi Santoso, S.Kom
  letterNumberFormat: string; // e.g. {nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}
  fiscalYear: number;
}

export type Gender = 'LAKI_LAKI' | 'PEREMPUAN';
export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
export type MaritalStatus = 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
export type FamilyRole = 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Famili Lain';
export type ResidentStatus = 'Tetap' | 'Pindah Masuk' | 'Pindah Keluar' | 'Meninggal' | 'Sementara';

export interface Resident {
  id: string;
  nik: string; // 16 digit
  cardNumber: string; // No KK 16 digit
  fullName: string;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  bloodType: string;
  religion: Religion;
  maritalStatus: MaritalStatus;
  familyRole: FamilyRole;
  education: string;
  occupation: string;
  citizenship: string;
  fatherName?: string;
  motherName?: string;
  address: string;
  rt: string;
  rw: string;
  districtName: string; // Dusun
  phone?: string;
  status: ResidentStatus;
  deathDate?: string;
  moveDate?: string;
  isArchived?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyCard {
  id: string;
  cardNumber: string;
  headFamilyName: string;
  headFamilyNik?: string;
  address: string;
  rt: string;
  rw: string;
  districtName: string;
  postalCode: string;
  issuedDate: string;
  memberCount?: number;
}

export interface VillageDistrict {
  id: string;
  code: string;
  name: string; // Dusun
  headName: string; // Kepala Dusun
  phone: string;
  rwCount: number;
  rtCount: number;
  populationCount?: number;
}

export interface NeighborhoodUnit {
  id: string;
  districtName: string;
  rwNumber: string;
  rtNumber: string;
  chairpersonName: string;
  phone: string;
}

export type LetterStatus = 
  | 'Draft' 
  | 'Diajukan' 
  | 'Diproses' 
  | 'Menunggu Persetujuan' 
  | 'Disetujui' 
  | 'Ditolak' 
  | 'Selesai';

export interface LetterType {
  id: string;
  code: string; // SKU, SKTM, SKD, SKCK, SKL, SKM, SKBM, SKP, SKU-P, SKU-U
  name: string;
  category: string;
  description: string;
  requiredDocuments: string[];
  validityDays: number;
}

export interface LetterRequest {
  id: string;
  requestNumber: string; // e.g. REQ-2026-0042
  officialLetterNumber?: string; // e.g. 470/042/DS-SKM/X/2026
  letterTypeCode: string;
  letterTypeName: string;
  residentId: string;
  nik: string;
  residentName: string;
  purpose: string;
  extraFields: Record<string, string>;
  status: LetterStatus;
  submissionChannel: 'Loket Kantor' | 'Portal Warga';
  rejectionReason?: string;
  submittedAt: string;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  qrCodeHash: string;
}

export interface VillageOfficial {
  id: string;
  name: string;
  nipd: string;
  position: string;
  phone: string;
  email: string;
  photoUrl: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Pelayanan' | 'Kegiatan' | 'Bantuan Sosial' | 'Pembangunan' | 'Umum';
  content: string;
  isPinned: boolean;
  publishedDate: string;
  authorName: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  residentId?: string;
  residentName: string;
  nik: string;
  phone: string;
  category: 'Infrastruktur' | 'Bansos' | 'Pelayanan' | 'Keamanan' | 'Kebersihan';
  subject: string;
  description: string;
  location?: string;
  status: 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';
  responseNotes?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface VillageAsset {
  id: string;
  itemCode: string;
  itemName: string;
  category: 'Tanah' | 'Gedung/Bangunan' | 'Kendaraan' | 'Peralatan & Mesin' | 'Aset Tetap Lainnya';
  acquisitionYear: number;
  sourceOfFunds: string;
  purchaseCost: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  picOfficial: string;
  notes?: string;
}

export interface AgendaLetter {
  id: string;
  type: 'MASUK' | 'KELUAR';
  agendaNumber: string;
  letterNumber: string;
  correspondent: string; // Pengirim atau Penerima
  letterDate: string;
  receivedOrSentDate: string;
  subject: string;
  dispositionOrSigner?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  module: string;
  description: string;
}
