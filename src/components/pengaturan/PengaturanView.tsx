import React, { useState } from 'react';
import {
  Settings,
  Save,
  Building2,
  FileText,
  Database,
  RefreshCcw,
  Download,
  Upload,
  AlertTriangle,
  Check,
  Cloud,
  ExternalLink,
  Printer,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Zap
} from 'lucide-react';
import { VillageSettings, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { useToast } from '../common/Toast';
import { StorageService } from '../../services/storageService';
import { SupabaseGuideModal } from './SupabaseGuideModal';
import { getSavedSupabaseConfig } from '../../services/supabaseClient';
import { downloadDistZipFile } from '../../utils/downloadZip';
import { FULL_SUPABASE_SCHEMA_SQL } from '../../services/supabaseSqlSchema';

// Preset government logos (high-resolution SVG Data URIs)
const PRESET_LOGOS = [
  {
    name: 'Garuda Pancasila Emas',
    description: 'Lambang Negara Republik Indonesia',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23fef3c7' stroke='%23d97706' stroke-width='3'/><path d='M50 15 L58 35 L80 35 L62 48 L69 70 L50 56 L31 70 L38 48 L20 35 L42 35 Z' fill='%23b45309'/><circle cx='50' cy='46' r='10' fill='%23dc2626'/><rect x='44' y='40' width='12' height='12' fill='%23ffffff' rx='2'/><path d='M47 43 L53 43 M50 40 L50 46' stroke='%23dc2626' stroke-width='2'/></svg>"
  },
  {
    name: 'Lambang Desa Hijau Makmur',
    description: 'Padi, Kapas, & Bintang Desa',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,6 92,26 92,72 50,94 8,72 8,26' fill='%23064e3b' stroke='%23f59e0b' stroke-width='4'/><circle cx='50' cy='50' r='30' fill='%23ffffff'/><path d='M50 26 L54 36 L65 37 L57 44 L59 55 L50 49 L41 55 L43 44 L35 37 L46 36 Z' fill='%23f59e0b'/><path d='M30 65 Q50 80 70 65' fill='none' stroke='%23047857' stroke-width='6' stroke-linecap='round'/><text x='50' y='72' font-size='8' font-weight='bold' text-anchor='middle' fill='%23ffffff' font-family='sans-serif'>DESA MAJU</text></svg>"
  },
  {
    name: 'Lambang Daerah Tradisional',
    description: 'Perisai Bhinneka & Pita Daerah',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M15 15 L85 15 Q85 65 50 90 Q15 65 15 15 Z' fill='%230f766e' stroke='%23fbbf24' stroke-width='3'/><circle cx='50' cy='45' r='20' fill='%23f0fdf4'/><path d='M50 28 L53 38 L63 38 L55 44 L58 54 L50 48 L42 54 L45 44 L37 38 L47 38 Z' fill='%23d97706'/><rect x='25' y='68' width='50' height='10' fill='%23ffffff' rx='2' stroke='%230f766e'/><text x='50' y='76' font-size='7' font-weight='bold' text-anchor='middle' fill='%230f766e' font-family='sans-serif'>SUKAMAJU</text></svg>"
  }
];

interface PengaturanViewProps {
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onUpdateSettings: (newSettings: VillageSettings) => void;
  onResetData: () => void;
  onEmptyData?: () => void;
  onLoadDemoData?: () => void;
  onReloadData?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  currentUser,
  onNavigate,
  onUpdateSettings,
  onResetData,
  onEmptyData,
  onLoadDemoData,
  onReloadData,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState<VillageSettings>({
    ...settings,
    letterheadTitle1: settings.letterheadTitle1 || `PEMERINTAH ${settings.regencyName.toUpperCase()}`,
    letterheadTitle2: settings.letterheadTitle2 || settings.districtName.toUpperCase(),
    letterheadTitle3: settings.letterheadTitle3 || `KANTOR KEPALA ${settings.villageName.toUpperCase()}`,
    letterheadSubtext: settings.letterheadSubtext || `${settings.officeAddress} • Telp: ${settings.phone} • Kodepos ${settings.postalCode}`,
  });

  const [restoreJson, setRestoreJson] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [secondLogoUrlInput, setSecondLogoUrlInput] = useState('');

  const supabaseConfig = getSavedSupabaseConfig();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    showToast('Konfigurasi identitas desa, logo, dan kop surat berhasil disimpan!', 'success');
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'letterheadBannerUrl' | 'secondLogoUrl',
    maxSizeMB = 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`Ukuran file maksimal ${maxSizeMB}MB!`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      setFormData(prev => ({ ...prev, [field]: res }));
      showToast(`Berkas ${field === 'logoUrl' ? 'Logo' : field === 'secondLogoUrl' ? 'Logo Sekunder' : 'Banner Kop'} berhasil dimuat!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_${formData.villageName.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File cadangan database JSON berhasil diunduh!', 'success');
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJson.trim()) {
      showToast('Masukkan isi teks JSON backup!', 'error');
      return;
    }

    const success = StorageService.restoreBackupJSON(restoreJson, currentUser || undefined);
    if (success) {
      showToast('Database berhasil dipulihkan dari cadangan!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showToast('Format JSON tidak valid atau rusak!', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Laporan & Sistem' }, { label: 'Pengaturan Sistem Desa' }]}
        onNavigate={onNavigate}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* TOP BAR ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              Konfigurasi & Identitas Desa
            </h2>
            <p className="text-xs text-slate-500">
              Kelola nama desa, logo, kop naskah dinas resmi, dan basis data sistem
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white transition shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>

        {/* 1. LOGO DESA & KOP SURAT RESMI (FITUR LENGKAP) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-700" />
                Logo Desa & Tata Kop Surat Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Unggah logo resmi, pilih preset, dan sesuaikan kop surat dinas yang akan dicetak pada seluruh surat keterangan
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Peraturan Kemendagri RI
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Bagian 1: Upload Logo Utama Desa */}
            <div className="rounded-xl border border-slate-200 p-5 space-y-4 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-emerald-700" />
                  1. Lambang / Logo Utama Desa
                </h4>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus Logo</span>
                  </button>
                )}
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                Logo ini akan ditampilkan pada header portal publik, aplikasi admin, serta di sebelah kiri kop surat resmi dinas.
              </p>

              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-1">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Desa" className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Building2 className="h-8 w-8 mx-auto mb-1 text-slate-300" />
                      <span className="text-[9px] font-bold block">Tanpa Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs">
                    <Upload className="h-4 w-4" />
                    <span>Unggah Berkas Logo</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'logoUrl', 2)}
                    />
                  </label>

                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar logo..."
                      value={logoUrlInput}
                      onChange={e => setLogoUrlInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (logoUrlInput.trim()) {
                          setFormData({ ...formData, logoUrl: logoUrlInput.trim() });
                          setLogoUrlInput('');
                          showToast('URL Logo berhasil diterapkan!', 'success');
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold text-[11px] hover:bg-slate-900 transition"
                    >
                      Terapkan
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Format: PNG, JPG, WebP, SVG (Maks. 2MB). Disarankan berlatar transparan.
                  </p>
                </div>
              </div>

              {/* Logo Presets (Garuda, Padi Kapas, dsb) */}
              <div className="pt-2 border-t border-slate-200">
                <span className="block font-bold text-slate-700 text-[11px] mb-2">
                  Atau Pilih Contoh Lambang Resmi Indonesia:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logoUrl: preset.url });
                        showToast(`Logo ${preset.name} dipilih!`, 'success');
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-center hover:border-emerald-600 hover:shadow-xs transition group cursor-pointer"
                    >
                      <img src={preset.url} alt={preset.name} className="h-10 w-10 mx-auto object-contain mb-1" />
                      <span className="font-bold text-[10px] text-slate-800 block line-clamp-1 group-hover:text-emerald-700">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Right/Secondary Logo */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Logo Kanan Tambahan (Opsional)
                  </span>
                  {formData.secondLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, secondLogoUrl: '' })}
                      className="text-[10px] text-red-600 font-semibold hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {formData.secondLogoUrl ? (
                    <img src={formData.secondLogoUrl} alt="Logo Kanan" className="h-10 w-10 object-contain rounded border p-0.5 bg-white" />
                  ) : null}
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload Logo Kanan (misal: Lambang Pemda)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'secondLogoUrl', 2)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Bagian 2: Pengaturan Format Kop Surat */}
            <div className="rounded-xl border border-slate-200 p-5 space-y-4 bg-slate-50/60">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-700" />
                2. Format Kop Surat Dinas
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pilih format kop yang akan dicetak di bagian paling atas seluruh surat dinas resmi (SKU, SKD, SKTM, dll).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, letterheadType: 'STANDARD' })}
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                    formData.letterheadType !== 'CUSTOM_BANNER'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-bold">Kop Standar Otomatis</span>
                  <span className="text-[10px] text-slate-500 font-normal">Logo di kiri + teks instansi resmi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, letterheadType: 'CUSTOM_BANNER' })}
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                    formData.letterheadType === 'CUSTOM_BANNER'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-bold">Banner Kop Desain Sendiri</span>
                  <span className="text-[10px] text-slate-500 font-normal">Upload gambar header banner siap cetak</span>
                </button>
              </div>

              {formData.letterheadType === 'CUSTOM_BANNER' ? (
                <div className="pt-2 space-y-3 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold transition">
                      <Upload className="h-4 w-4" />
                      <span>Unggah Gambar Banner Kop Surat</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={e => handleFileUpload(e, 'letterheadBannerUrl', 3)}
                      />
                    </label>

                    {formData.letterheadBannerUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, letterheadBannerUrl: '' })}
                        className="text-[11px] text-red-600 font-semibold hover:underline"
                      >
                        Hapus Banner
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar banner kop surat..."
                      value={bannerUrlInput}
                      onChange={e => setBannerUrlInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (bannerUrlInput.trim()) {
                          setFormData({ ...formData, letterheadBannerUrl: bannerUrlInput.trim() });
                          setBannerUrlInput('');
                          showToast('Banner kop berhasil diterapkan!', 'success');
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold text-[11px] hover:bg-slate-900 transition"
                    >
                      Terapkan
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Rekomendasi rasio: lebar 800-1200px, tinggi 150-250px (proporsi A4 landscape header).
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-2.5 border-t border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Baris 1 Kop: Tingkat Kabupaten/Kota
                    </label>
                    <input
                      type="text"
                      value={formData.letterheadTitle1 || ''}
                      onChange={e => setFormData({ ...formData, letterheadTitle1: e.target.value })}
                      placeholder="Contoh: PEMERINTAH KABUPATEN BOGOR"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Baris 2 Kop: Tingkat Kecamatan
                    </label>
                    <input
                      type="text"
                      value={formData.letterheadTitle2 || ''}
                      onChange={e => setFormData({ ...formData, letterheadTitle2: e.target.value })}
                      placeholder="Contoh: KECAMATAN CIAWI"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Baris 3 Kop: Kantor Kepala Desa / Kelurahan
                    </label>
                    <input
                      type="text"
                      value={formData.letterheadTitle3 || ''}
                      onChange={e => setFormData({ ...formData, letterheadTitle3: e.target.value })}
                      placeholder="Contoh: KANTOR KEPALA DESA SUKAMAJU"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold uppercase text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Baris 4 Kop: Alamat, Telepon & Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.letterheadSubtext || ''}
                      onChange={e => setFormData({ ...formData, letterheadSubtext: e.target.value })}
                      placeholder="Contoh: Jalan Raya Sukamaju No. 12 • Telp: 0251-8241234 • Kode Pos 16720"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pratinjau Kertas A4 Kop Surat Live */}
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pratinjau Kertas Surat Resmi A4 (Sesuai Konfigurasi Saat Ini):
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Uji Cetak Kop</span>
              </button>
            </div>

            {/* Simulated Sheet */}
            <div className="surat-paper mx-auto max-w-2xl bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs font-serif text-slate-900 leading-relaxed text-xs">
              {formData.letterheadType === 'CUSTOM_BANNER' && formData.letterheadBannerUrl ? (
                <div className="mb-4 pb-2 border-b-2 border-slate-900">
                  <img
                    src={formData.letterheadBannerUrl}
                    alt="Kop Surat Banner"
                    className="w-full max-h-36 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="border-b-4 border-double border-slate-900 pb-3 mb-4 text-center flex items-center justify-between">
                  <div className="w-16 flex justify-center shrink-0">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                    ) : (
                      <div className="h-14 w-14 rounded-full border border-slate-400 bg-slate-50 flex items-center justify-center font-bold text-[10px] text-slate-700">
                        LOGO
                      </div>
                    )}
                  </div>

                  <div className="flex-1 px-3">
                    <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      {formData.letterheadTitle1 || `PEMERINTAH ${formData.regencyName.toUpperCase()}`}
                    </h4>
                    <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      {formData.letterheadTitle2 || formData.districtName.toUpperCase()}
                    </h4>
                    <h2 className="font-sans text-sm sm:text-base font-black uppercase tracking-widest text-emerald-950">
                      {formData.letterheadTitle3 || `KANTOR KEPALA ${formData.villageName.toUpperCase()}`}
                    </h2>
                    <p className="font-sans text-[10px] text-slate-700 mt-0.5">
                      {formData.letterheadSubtext || `${formData.officeAddress} • Telp: ${formData.phone}`}
                    </p>
                    <p className="font-sans text-[9px] text-slate-500">
                      Email: {formData.email} • Website: {formData.website}
                    </p>
                  </div>

                  <div className="w-16 flex justify-center shrink-0">
                    {formData.secondLogoUrl ? (
                      <img src={formData.secondLogoUrl} alt="Logo Kanan" className="h-16 w-16 object-contain" />
                    ) : (
                      <div className="w-16" />
                    )}
                  </div>
                </div>
              )}

              {/* Sample Letter Body for Preview */}
              <div className="text-center my-3">
                <h3 className="text-xs font-bold underline uppercase font-sans">
                  SURAT KETERANGAN USAHA (SKU)
                </h3>
                <p className="text-[10px] font-mono font-medium text-slate-600">
                  Nomor: 503/001/DS-SKM/X/2026
                </p>
              </div>

              <p className="text-justify text-[11px] text-slate-600 mb-3">
                Yang bertanda tangan di bawah ini Kepala {formData.villageName}, {formData.districtName}, {formData.regencyName}, menerangkan bahwa pemohon adalah warga berdomisili sah yang memiliki usaha mandiri...
              </p>

              <div className="flex justify-end pt-3">
                <div className="text-center text-[10px] font-sans">
                  <p>{formData.villageName}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">Kepala {formData.villageName}</p>
                  <div className="h-10 flex items-center justify-center font-mono text-[9px] text-emerald-700 italic">
                    [Tanda Tangan & QR Code]
                  </div>
                  <p className="font-bold underline">{formData.villageHeadName}</p>
                  <p className="font-mono text-slate-500">NIP: {formData.villageHeadNip || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. IDENTITAS PEMERINTAHAN DESA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-700" />
                Data Wilayah & Kontak Administrasi
              </h3>
              <p className="text-xs text-slate-500">
                Nama desa, kecamatan, kabupaten, alamat kantor desa, serta pejabat penandatangan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Desa <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.villageName}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    villageName: val,
                    letterheadTitle3: `KANTOR KEPALA ${val.toUpperCase()}`
                  });
                }}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kecamatan <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.districtName}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    districtName: val,
                    letterheadTitle2: val.toUpperCase()
                  });
                }}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.regencyName}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    regencyName: val,
                    letterheadTitle1: `PEMERINTAH ${val.toUpperCase()}`
                  });
                }}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Provinsi <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.provinceName}
                onChange={e => setFormData({ ...formData, provinceName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Anggaran Aktif</label>
              <input
                type="number"
                value={formData.fiscalYear}
                onChange={e => setFormData({ ...formData, fiscalYear: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Kantor Desa Lengkap</label>
              <input
                type="text"
                value={formData.officeAddress}
                onChange={e => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon Kantor / WA</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Desa</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Desa</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Desa (Beserta Gelar)</label>
              <input
                type="text"
                value={formData.villageHeadName}
                onChange={e => setFormData({ ...formData, villageHeadName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP / NIAP Kepala Desa</label>
              <input
                type="text"
                value={formData.villageHeadNip}
                onChange={e => setFormData({ ...formData, villageHeadNip: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Sekretaris Desa</label>
              <input
                type="text"
                value={formData.secretaryName}
                onChange={e => setFormData({ ...formData, secretaryName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold"
                required
              />
            </div>
          </div>
        </div>
      </form>

      {/* 3. MANAJEMEN BASIS DATA & PENGOSONGAN DATA (KOSONGKAN DATA) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-700" />
              Manajemen Basis Data (Status Bersih / Demo / Cadangan)
            </h3>
            <p className="text-xs text-slate-500">
              Kosongkan seluruh data untuk operasional desa riil, atau muat data simulasi contoh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Kosongkan Data (Data Bersih) */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Trash2 className="h-4 w-4" />
                <span>Kosongkan Seluruh Data</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Mode Produksi Bersih (0 Data)</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Menghapus semua data penduduk, kartu keluarga, permohonan surat, pengaduan, dan aset sehingga sistem siap digunakan secara nyata dengan data nol.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmptyConfirm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Kosongkan Semua Data</span>
            </button>
          </div>

          {/* Card 2: Muat Data Demo Simulasi */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Data Contoh / Demo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Muat Data Simulasi Bawaan</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mengisi sistem dengan data contoh penduduk, kartu keluarga, surat, dan grafik untuk keperluan presentasi, pelatihan perangkat, atau pengujian.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onLoadDemoData) {
                  onLoadDemoData();
                } else {
                  StorageService.loadDemoData(currentUser || undefined);
                  window.location.reload();
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Muat Data Contoh Bawaan</span>
            </button>
          </div>

          {/* Card 3: Unduh Backup JSON & Dist.zip */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Download className="h-4 w-4" />
                <span>Ekspor & Cadangan</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Unduh File Cadangan & Dist</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Simpan cadangan data JSON atau unduh paket file produksi build (dist.zip) yang siap diunggah ke server hosting desa.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    showToast('Menyiapkan berkas dist.zip...', 'info');
                    await downloadDistZipFile();
                    showToast('dist-digital-desa-pro.zip berhasil diunduh!', 'success');
                  } catch (e: any) {
                    showToast(e.message || 'Gagal mengunduh', 'error');
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-800 px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span>Unduh dist.zip (Siap Deploy)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SUPABASE CLOUD DATABASE INTEGRATION */}
      <div className="rounded-2xl border border-emerald-300 bg-linear-to-r from-emerald-50 via-teal-50/70 to-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-700 p-2.5 text-white shadow-xs">
              <Cloud className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Database Menyeluruh Supabase (14 Tabel + Realtime)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Zap className="h-3 w-3 fill-emerald-600" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Penyimpanan cloud PostgreSQL dengan publikasi WebSocket realtime untuk sinkronisasi otomatis multi-perangkat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              supabaseConfig.isConnected
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
              {supabaseConfig.isConnected ? 'Terhubung (Realtime Aktif)' : 'Mode Standalone (Lokal Storage)'}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-slate-700 font-medium">
              URL Proyek Supabase: <code className="font-bold font-mono text-emerald-900">{supabaseConfig.url || 'Belum diatur (Klik tombol untuk konfigurasi)'}</code>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 14 Tabel (Penduduk, Surat, Perangkat Desa & Foto Profil, Aset, Pengaduan, dll)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Auto updated_at Triggers
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Realtime WebSocket Sync
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(FULL_SUPABASE_SCHEMA_SQL);
                showToast('Script schema.sql 14 tabel berhasil disalin!', 'success');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Salin SQL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([FULL_SUPABASE_SCHEMA_SQL], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'schema_supabase_digital_desa_realtime.sql';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Berkas schema.sql berhasil diunduh!', 'success');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh .sql</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm cursor-pointer"
            >
              <Cloud className="h-4 w-4" />
              <span>Kelola & Sinkronkan Realtime</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Guide Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataReloaded={onReloadData}
      />

      {/* Empty Data Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Kosongkan Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengosongkan seluruh data penduduk, kartu keluarga, permohonan surat, aset, pengaduan, dan agenda surat menjadi 0. Akun pengguna dan konfigurasi desa tetap tersimpan. Lanjutkan?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onEmptyData) {
                    onEmptyData();
                  } else {
                    StorageService.emptyAllOperationalData(currentUser || undefined);
                    window.location.reload();
                  }
                  setShowEmptyConfirm(false);
                  showToast('Seluruh data transaksi dan kependudukan telah dikosongkan!', 'info');
                }}
                className="px-4 py-2 bg-red-600 font-bold text-white text-xs rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Ya, Kosongkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Reset Database</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengembalikan data penduduk, kartu keluarga, surat, dan inventaris desa ke data contoh bawaan sistem. Apakah Anda yakin?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                  showToast('Database berhasil di-reset ke data bawaan!', 'success');
                }}
                className="px-4 py-2 bg-red-600 font-bold text-white text-xs rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Ya, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
