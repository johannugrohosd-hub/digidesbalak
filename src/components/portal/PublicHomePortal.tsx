import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Users,
  CreditCard,
  ShieldCheck,
  Megaphone,
  UserCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Send,
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  X,
  Copy,
  ExternalLink,
  Menu
} from 'lucide-react';
import {
  VillageSettings,
  LetterType,
  LetterRequest,
  VillageOfficial,
  Announcement,
  VillageDistrict,
  Resident,
  FamilyCard,
  Complaint
} from '../../types';
import { formatDateIndo } from '../../utils/formatters';

interface PublicHomePortalProps {
  settings: VillageSettings;
  letterTypes: LetterType[];
  letterRequests: LetterRequest[];
  officials: VillageOfficial[];
  announcements: Announcement[];
  districts: VillageDistrict[];
  residents: Resident[];
  familyCards: FamilyCard[];
  complaints?: Complaint[];
  onOpenLogin: () => void;
  onSubmitComplaint?: (data: {
    residentName: string;
    nik: string;
    phone: string;
    category: Complaint['category'];
    subject: string;
    description: string;
    location?: string;
  }) => void;
  onSubmitLetterRequest?: (data: {
    letterTypeCode: string;
    residentId?: string;
    nik?: string;
    residentName?: string;
    purpose: string;
    extraFields?: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }) => void;
  isLoggedIn?: boolean;
  onBackToAdmin?: () => void;
}

export const PublicHomePortal: React.FC<PublicHomePortalProps> = ({
  settings,
  letterTypes,
  letterRequests,
  officials,
  announcements,
  districts,
  residents,
  familyCards,
  complaints = [],
  onOpenLogin,
  onSubmitComplaint,
  onSubmitLetterRequest,
  isLoggedIn = false,
  onBackToAdmin,
}) => {
  // Mobile nav state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Letter tracking state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<LetterRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected letter requirement modal
  const [selectedLetterType, setSelectedLetterType] = useState<LetterType | null>(null);

  // Public Online Letter Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    letterTypeCode: 'SKU',
    nik: '',
    fullName: '',
    phone: '',
    address: '',
    purpose: '',
    businessName: '',
  });
  const [submittedLetterResult, setSubmittedLetterResult] = useState<string | null>(null);

  // Public Complaint Modal
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    residentName: '',
    nik: '',
    phone: '',
    category: 'Pelayanan' as Complaint['category'],
    subject: '',
    description: '',
    location: '',
  });
  const [submittedComplaintTicket, setSubmittedComplaintTicket] = useState<string | null>(null);

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setHasSearched(true);
    const query = trackQuery.trim().toLowerCase();
    const found = letterRequests.find(
      r =>
        r.requestNumber.toLowerCase() === query ||
        (r.officialLetterNumber && r.officialLetterNumber.toLowerCase() === query) ||
        r.nik === query
    );
    setTrackResult(found || null);
  };

  const handleApplyLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyFormData.nik || !applyFormData.fullName || !applyFormData.purpose) return;

    const extraFields: Record<string, string> = {
      phone: applyFormData.phone,
      address: applyFormData.address,
    };
    if (applyFormData.letterTypeCode === 'SKU' && applyFormData.businessName) {
      extraFields.businessName = applyFormData.businessName;
    }

    if (onSubmitLetterRequest) {
      onSubmitLetterRequest({
        letterTypeCode: applyFormData.letterTypeCode,
        nik: applyFormData.nik,
        residentName: applyFormData.fullName,
        purpose: applyFormData.purpose,
        extraFields,
        submissionChannel: 'Portal Warga',
      });
    }

    // Generate dummy tracking code to immediately show confirmation
    const newSeq = letterRequests.length + 1;
    const reqCode = `REQ-2026-${String(newSeq).padStart(4, '0')}`;
    setSubmittedLetterResult(reqCode);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.residentName || !complaintForm.subject || !complaintForm.description) return;

    if (onSubmitComplaint) {
      onSubmitComplaint(complaintForm);
    }

    const count = complaints.length + 1;
    const ticket = `PGD-2026-${String(count).padStart(4, '0')}`;
    setSubmittedComplaintTicket(ticket);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Admin Mode Top Indicator Banner if logged in */}
      {isLoggedIn && (
        <div className="bg-emerald-900 text-white text-xs py-2 px-4 flex items-center justify-between border-b border-emerald-700 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Mode Pratinjau Administrator:</span>
            <span>Anda sedang melihat tampilan publik Portal Informasi Desa Sukamaju</span>
          </div>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-3 py-1 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard Admin</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Public Header Bar */}
      <header className={`sticky ${isLoggedIn ? 'top-8' : 'top-0'} z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Village Identity */}
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.villageName}
                  className="h-12 w-12 object-contain rounded-lg border border-slate-200 p-0.5 bg-white shadow-xs"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white font-black shadow-md ring-2 ring-emerald-600/20">
                  <Building2 className="h-6 w-6 text-emerald-100" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {settings.villageName}
                  </h1>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    PORTAL RESMI
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.districtName}, {settings.regencyName} • Prov. {settings.provinceName}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-600">
              <a href="#profil" className="hover:text-emerald-700 transition">Profil Desa</a>
              <a href="#layanan" className="hover:text-emerald-700 transition">Layanan E-Surat</a>
              <a href="#lacak" className="hover:text-emerald-700 transition">Lacak Surat</a>
              <a href="#aspirasi" className="hover:text-emerald-700 transition">Aspirasi & Pengaduan</a>
              <a href="#statistik" className="hover:text-emerald-700 transition">Statistik</a>
              <a href="#sotk" className="hover:text-emerald-700 transition">Aparatur</a>
              <a href="#pengumuman" className="hover:text-emerald-700 transition">Warta Desa</a>
            </nav>

            {/* Login CTA & Mobile Menu Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-emerald-300" />
                <span>Masuk ke Sistem</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 text-xs font-bold text-slate-700">
            <a href="#profil" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Profil Desa</a>
            <a href="#layanan" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Layanan E-Surat</a>
            <a href="#lacak" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Lacak Status Surat</a>
            <a href="#aspirasi" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Aspirasi & Pengaduan</a>
            <a href="#statistik" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Statistik Kependudukan</a>
            <a href="#sotk" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Aparatur Pemerintahan</a>
            <a href="#pengumuman" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-slate-50 rounded-lg">Pengumuman Resmi</a>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white py-16 sm:py-24">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>Pusat Informasi & Pelayanan Administrasi Digital {settings.villageName}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Selamat Datang di Portal Resmi {settings.villageName}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline || 'Maju, Mandiri, Transparan, dan Sejahtera'}
          </p>
          <p className="text-xs text-emerald-200/70 max-w-xl mx-auto">
            {settings.officeAddress} • Telp: {settings.phone}
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3 text-xs">
            <button
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 font-extrabold shadow-lg transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Ajukan Permohonan Surat Mandiri</span>
            </button>
            <a
              href="#lacak"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 font-bold backdrop-blur-md border border-white/20 transition"
            >
              <Search className="h-4 w-4" />
              <span>Cek & Lacak Berkas Surat</span>
            </a>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 font-extrabold shadow-lg transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Kirim Aspirasi / Pengaduan Warga</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-200 px-5 py-3 font-bold border border-emerald-500/30 transition cursor-pointer"
            >
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Login Aparatur / Warga</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Lacak Status Surat (Public Tracker Tool) */}
      <section id="lacak" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-6 sm:p-8 shadow-xs">
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                Layanan Mandiri Cek Berkas
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lacak Status Permohonan Surat Anda
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Masukkan Nomor Registrasi Surat (contoh: <code>REQ-2026-0001</code>) atau NIK Anda untuk memantau progres verifikasi aparat desa secara real-time.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  placeholder="Ketik Nomor Registrasi Surat atau NIK..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden shadow-inner font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
              >
                <span>Cari Status</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Tracking Result Display */}
            {hasSearched && (
              <div className="mt-6 pt-6 border-t border-emerald-200 max-w-xl mx-auto">
                {trackResult ? (
                  <div className="rounded-xl bg-white p-5 border border-emerald-300 shadow-md space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {trackResult.requestNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {trackResult.letterTypeName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Pemohon: <b>{trackResult.residentName}</b> (NIK: {trackResult.nik})
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        trackResult.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                        trackResult.status === 'Disetujui' ? 'bg-teal-100 text-teal-800' :
                        trackResult.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' :
                        trackResult.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Status: {trackResult.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                      <p><b>Keperluan:</b> {trackResult.purpose}</p>
                      <p><b>Tanggal Pengajuan:</b> {formatDateIndo(trackResult.submittedAt)}</p>
                      {trackResult.officialLetterNumber && (
                        <p className="font-mono text-emerald-800 font-bold">
                          <b>Nomor Surat Resmi:</b> {trackResult.officialLetterNumber}
                        </p>
                      )}
                      {trackResult.rejectionReason && (
                        <p className="text-red-700"><b>Catatan Penolakan:</b> {trackResult.rejectionReason}</p>
                      )}
                    </div>

                    {trackResult.status === 'Disetujui' || trackResult.status === 'Selesai' ? (
                      <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        Surat Anda telah disetujui Kepala Desa! Anda dapat mengambil dokumen fisik di loket Balai Desa {settings.villageName} atau login untuk mengunduh dokumen resmi digital ber-QR code.
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        Permohonan Anda sedang dalam antrean pelayanan aparatur desa.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-white p-5 border border-red-200 text-center space-y-1">
                    <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
                    <p className="text-xs font-bold text-slate-800">Permohonan Tidak Ditemukan</p>
                    <p className="text-[11px] text-slate-500">
                      Periksa kembali nomor registrasi surat atau NIK yang Anda masukkan, atau ajukan permohonan baru melalui tombol di atas.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Katalog Layanan E-Surat Desa */}
      <section id="layanan" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Katalog Layanan Publik
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            10 Jenis Layanan Surat Keterangan Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Pelayanan surat-menyurat resmi pemerintah desa yang dapat diproses langsung di loket balai desa maupun diajukan secara online mandiri dari rumah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {letterTypes.map((type) => (
            <div
              key={type.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-600 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    KODE: {type.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Masa Berlaku: {type.validityDays > 0 ? `${type.validityDays} Hari` : 'Permanen'}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition">
                  {type.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {type.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Syarat Dokumen Wajib:</span>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    {type.requiredDocuments.slice(0, 3).map((doc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </li>
                    ))}
                    {type.requiredDocuments.length > 3 && (
                      <li className="text-slate-400 text-[10px]">
                        + {type.requiredDocuments.length - 3} syarat dokumen lainnya...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedLetterType(type)}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  Lihat Syarat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApplyFormData(prev => ({ ...prev, letterTypeCode: type.code }));
                    setShowApplyModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
                >
                  <span>Ajukan Online</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Statistik & Transparansi Kependudukan */}
      <section id="statistik" className="py-16 bg-slate-100/70 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
              Keterbukaan Informasi Publik
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Statistik Kependudukan & Wilayah
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Statistik agregat kependudukan desa yang diperbarui langsung dari basis data SIM Desa.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Penduduk</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{residents.length} Jiwa</p>
              <span className="text-[10px] text-slate-400">
                {residents.length === 0 ? 'Menunggu pendataan warga' : 'Terdaftar di sistem desa'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Kepala Keluarga</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{familyCards.length} KK</p>
              <span className="text-[10px] text-slate-400">
                {familyCards.length === 0 ? 'Kartu keluarga aktif' : 'Kartu Keluarga terdaftar'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Wilayah Dusun</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{districts.length} Dusun</p>
              <span className="text-[10px] text-slate-400">Satuan lingkungan wilayah</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Pelayanan Surat</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{letterRequests.length} Berkas</p>
              <span className="text-[10px] text-slate-400">Total permohonan diproses</span>
            </div>
          </div>

          {/* Wilayah Dusun Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {districts.map(d => (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {d.code}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                <p className="text-xs text-slate-500">Kadus: <b>{d.headName}</b></p>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-100">
                  <span>{d.rwCount} RW</span>
                  <span>{d.rtCount} RT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Aspirasi & Pengaduan Warga Publik */}
      <section id="aspirasi" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="rounded-3xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-white p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/60 px-3 py-1 rounded-full">
                Kanal Aspirasi Publik
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sampaikan Aspirasi, Keluhan, atau Laporan Fasilitas Desa
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pemerintah {settings.villageName} membuka saluran komunikasi langsung bagi masyarakat untuk melaporkan jalan rusak, lampu penerangan padam, masalah kebersihan, keamanan, atau masukan pelayanan. Laporan Anda dipantau langsung oleh Kepala Desa dan jajaran perangkat desa.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Kirim Laporan / Aspirasi Sekarang</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Alur Penanganan Laporan Warga
              </h4>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <span>Warga mengisi formulir pengaduan secara mandiri dan menerima Nomor Tiket Laporan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <span>Operator dan Kaur Perencanaan melakukan verifikasi serta survei lapangan jika diperlukan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <span>Tindak lanjut perbaikan dilaksanakan dan progres dapat dicek langsung secara transparan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Profil & Visi Misi Desa */}
      <section id="profil" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
              Profil & Visi Pembangunan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pemerintahan {settings.villageName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {settings.villageName} merupakan wilayah desa di {settings.districtName}, {settings.regencyName}, Provinsi {settings.provinceName}. Bertekad mewujudkan pelayanan publik modern yang akuntabel melalui implementasi sistem administrasi digital desa terpadu.
            </p>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Visi Pemerintah Desa:
              </h4>
              <p className="text-xs font-medium text-slate-700 italic leading-relaxed">
                "{settings.vision || 'Terwujudnya tata kelola pemerintahan desa yang akuntabel, transparan, dan pelayanan digital prima menuju masyarakat sejahtera.'}"
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              Misi Pembangunan Desa:
            </h4>
            {(settings.mission && settings.mission.length > 0 ? settings.mission : [
              'Meningkatkan mutu pelayanan administrasi kependudukan yang cepat, tepat, dan transparan.',
              'Mendorong digitalisasi desa melalui penerapan Sistem Informasi Manajemen Desa terpadu.',
              'Mewujudkan tata kelola keuangan dan inventarisasi aset desa yang akuntabel.',
              'Meningkatkan keterlibatan aktif warga dalam pembangunan melalui keterbukaan data publik.'
            ]).map((m, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Struktur Organisasi & Aparatur Desa (SOTK) */}
      <section id="sotk" className="py-16 bg-slate-100/70 border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
              Pemerintahan Desa
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Aparatur Pemerintah {settings.villageName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Struktur Organisasi dan Tata Kerja (SOTK) penyelenggara pemerintahan dan pelayanan publik desa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {officials.map(off => (
              <div key={off.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs space-y-3">
                <div className="h-20 w-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-600/30 p-0.5 bg-slate-100 flex items-center justify-center">
                  {off.photoUrl ? (
                    <img
                      src={off.photoUrl}
                      alt={off.name}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <span className="font-black text-emerald-800 text-lg">
                      {off.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{off.name}</h4>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{off.position}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIPD: {off.nipd || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pengumuman Resmi Desa */}
      <section id="pengumuman" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Warta & Kabar Desa
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengumuman Publik Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Informasi penting terkait kegiatan kemasyarakatan, jadwal pelayanan, dan agenda pembangunan desa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {announcements.length > 0 ? (
            announcements.map(ann => (
              <div key={ann.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateIndo(ann.publishedDate)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                  Diumumkan oleh: <b>{ann.authorName}</b>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Belum ada pengumuman baru yang dipublikasikan saat ini.
            </div>
          )}
        </div>
      </section>

      {/* 10. Kontak, Jam Buka & Lokasi Kantor */}
      <section className="py-16 bg-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg bg-white p-0.5" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-black">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-white">{settings.villageName}</h3>
                  <p className="text-xs text-emerald-300">Digital Desa Pro • SIM Desa</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Kantor pelayanan terpadu masyarakat {settings.villageName}, {settings.districtName}, {settings.regencyName}, Provinsi {settings.provinceName}.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Alamat & Kontak Resmi
              </h4>
              <div className="text-xs text-emerald-100 space-y-2">
                <p><b>Alamat:</b> {settings.officeAddress}</p>
                <p><b>Telepon / WA:</b> {settings.phone}</p>
                <p><b>Email:</b> {settings.email}</p>
                <p><b>Website:</b> {settings.website}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4" /> Jam Pelayanan Balai Desa
              </h4>
              <div className="text-xs text-emerald-100 space-y-1.5">
                <div className="flex justify-between border-b border-emerald-900 pb-1">
                  <span>Senin - Kamis:</span>
                  <span className="font-bold">08:00 - 15:30 WIB</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900 pb-1">
                  <span>Jumat:</span>
                  <span className="font-bold">08:00 - 11:30 WIB</span>
                </div>
                <div className="flex justify-between pb-1 text-emerald-300">
                  <span>Sabtu - Minggu:</span>
                  <span>Libur (Pelayanan Online Mandiri)</span>
                </div>
              </div>
              <button
                onClick={onOpenLogin}
                className="mt-3 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 px-4 text-xs font-black shadow-md transition cursor-pointer"
              >
                Masuk ke Dashboard Sistem
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-emerald-900 text-center text-xs text-emerald-400">
            &copy; {new Date().getFullYear()} Pemerintah {settings.villageName}. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </section>

      {/* Modal Detail Persyaratan Surat */}
      {selectedLetterType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedLetterType.code}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {selectedLetterType.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedLetterType.category}</p>
              </div>
              <button
                onClick={() => setSelectedLetterType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedLetterType.description}
            </p>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Kelengkapan Syarat Berkas yang Harus Dibawa / Diunggah:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedLetterType.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Masa Berlaku: <b>{selectedLetterType.validityDays > 0 ? `${selectedLetterType.validityDays} Hari` : 'Tidak Terbatas'}</b></span>
              <button
                onClick={() => {
                  setApplyFormData(prev => ({ ...prev, letterTypeCode: selectedLetterType.code }));
                  setSelectedLetterType(null);
                  setShowApplyModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ajukan Surat Ini Online</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Surat Online Mandiri */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Formulir Permohonan Surat Online Warga
                </h3>
                <p className="text-xs text-slate-500">
                  Ajukan surat resmi langsung ke pemerintah {settings.villageName} tanpa antre
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setSubmittedLetterResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submittedLetterResult ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Permohonan Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Simpan nomor registrasi permohonan Anda untuk mengecek status persetujuan dari aparat desa:
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between max-w-xs mx-auto">
                  <span className="font-mono text-base font-black text-emerald-950">
                    {submittedLetterResult}
                  </span>
                  <button
                    onClick={() => handleCopy(submittedLetterResult)}
                    className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                    title="Salin Nomor Registrasi"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copiedText && (
                  <p className="text-[11px] text-emerald-700 font-bold">Nomor registrasi berhasil disalin!</p>
                )}

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setTrackQuery(submittedLetterResult);
                      setShowApplyModal(false);
                      setSubmittedLetterResult(null);
                      const el = document.getElementById('lacak');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-xl bg-emerald-700 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-800 transition"
                  >
                    Lacak Status Sekarang
                  </button>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSubmittedLetterResult(null);
                    }}
                    className="rounded-xl border border-slate-300 text-slate-700 px-4 py-2 text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyLetterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Surat yang Dibutuhkan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applyFormData.letterTypeCode}
                    onChange={e => setApplyFormData({ ...applyFormData, letterTypeCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 font-bold text-xs"
                    required
                  >
                    {letterTypes.map(t => (
                      <option key={t.code} value={t.code}>
                        {t.code} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={applyFormData.nik}
                      onChange={e => setApplyFormData({ ...applyFormData, nik: e.target.value })}
                      placeholder="16 digit NIK Anda"
                      className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pemohon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={applyFormData.fullName}
                      onChange={e => setApplyFormData({ ...applyFormData, fullName: e.target.value })}
                      placeholder="Sesuai KTP"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={applyFormData.phone}
                      onChange={e => setApplyFormData({ ...applyFormData, phone: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Alamat / Dusun Tinggal
                    </label>
                    <input
                      type="text"
                      value={applyFormData.address}
                      onChange={e => setApplyFormData({ ...applyFormData, address: e.target.value })}
                      placeholder="Contoh: Dusun Sukajaya RT 02 / RW 01"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                    />
                  </div>
                </div>

                {applyFormData.letterTypeCode === 'SKU' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Usaha & Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={applyFormData.businessName}
                      onChange={e => setApplyFormData({ ...applyFormData, businessName: e.target.value })}
                      placeholder="Contoh: Toko Berkah / Warung Sembako / Bengkel Motor"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Keperluan Pembuatan Surat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={applyFormData.purpose}
                    onChange={e => setApplyFormData({ ...applyFormData, purpose: e.target.value })}
                    placeholder="Contoh: Persyaratan pengajuan kredit usaha rakyat (KUR) di Bank BRI / pendaftaran beasiswa..."
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Kirim Permohonan Surat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Kirim Aspirasi / Pengaduan */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Kirim Aspirasi & Pengaduan Warga
                </h3>
                <p className="text-xs text-slate-500">
                  Suara warga untuk kemajuan pembangunan {settings.villageName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowComplaintModal(false);
                  setSubmittedComplaintTicket(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submittedComplaintTicket ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Aspirasi / Laporan Diterima!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Terima kasih atas kepedulian Anda. Laporan telah masuk ke antrean tindak lanjut pemerintah desa:
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between max-w-xs mx-auto">
                  <span className="font-mono text-base font-black text-emerald-950">
                    {submittedComplaintTicket}
                  </span>
                  <button
                    onClick={() => handleCopy(submittedComplaintTicket)}
                    className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                    title="Salin Nomor Tiket"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowComplaintModal(false);
                    setSubmittedComplaintTicket(null);
                  }}
                  className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold hover:bg-emerald-900 transition"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Laporan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={complaintForm.category}
                    onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 font-bold"
                  >
                    <option value="Pelayanan">Pelayanan Kantor Desa</option>
                    <option value="Infrastruktur">Infrastruktur & Jalan</option>
                    <option value="Bansos">Bantuan Sosial (Bansos/BLT)</option>
                    <option value="Keamanan">Keamanan & Ketertiban</option>
                    <option value="Kebersihan">Kebersihan & Lingkungan</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Pelapor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={complaintForm.residentName}
                      onChange={e => setComplaintForm({ ...complaintForm, residentName: e.target.value })}
                      placeholder="Nama Anda"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={complaintForm.phone}
                      onChange={e => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                      placeholder="Untuk konfirmasi hasil tindak lanjut"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Judul Pengaduan / Masalah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={complaintForm.subject}
                    onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                    placeholder="Contoh: Penerangan jalan di RT 03 Dusun 1 padam"
                    className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lokasi Kejadian / Alamat Terkait
                  </label>
                  <input
                    type="text"
                    value={complaintForm.location}
                    onChange={e => setComplaintForm({ ...complaintForm, location: e.target.value })}
                    placeholder="Contoh: Dekat Mushola Al-Ikhlas RW 02"
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Uraian Detail Laporan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={complaintForm.description}
                    onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    placeholder="Jelaskan kronologi atau masalah yang dihadapi secara rinci..."
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Kirim Laporan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
