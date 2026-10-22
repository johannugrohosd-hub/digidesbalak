import React, { useState, useRef } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Award,
  Edit,
  Building2,
  Camera,
  Upload,
  Trash2,
  Plus,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  ShieldCheck,
  User as UserIcon,
  Check
} from 'lucide-react';
import { VillageOfficial, VillageSettings, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface PerangkatDesaViewProps {
  officials: VillageOfficial[];
  settings: VillageSettings;
  currentUser?: User | null;
  onNavigate: (page: string) => void;
  onUpdateOfficial: (official: VillageOfficial) => void;
  onAddOfficial?: (official: Omit<VillageOfficial, 'id'>) => void;
  onDeleteOfficial?: (id: string) => void;
}

// Preset photo options for village government officials (ASN / Pemdes)
const OFFICIAL_PHOTO_PRESETS = [
  {
    label: 'Kepala Desa (PDU Resmi)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sekretaris Desa (Batik)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kaur / Kasi Wanita (Kerudung)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Bendahara / Staf Wanita',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kaur Perencanaan / Kesra',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kepala Dusun (Kadus)',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  },
];

const STANDARD_POSITIONS = [
  'Kepala Desa',
  'Sekretaris Desa',
  'Kepala Urusan Tata Usaha & Umum',
  'Kepala Urusan Keuangan (Bendahara)',
  'Kepala Urusan Perencanaan',
  'Kepala Seksi Pemerintahan',
  'Kepala Seksi Kesejahteraan',
  'Kepala Seksi Pelayanan',
  'Kepala Dusun (Kadus) I',
  'Kepala Dusun (Kadus) II',
  'Kepala Dusun (Kadus) III',
  'Staf Administrasi Desa',
];

// Client-side image compressor: keeps image high quality while reducing payload size for fast Supabase syncing
function compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export const PerangkatDesaView: React.FC<PerangkatDesaViewProps> = ({
  officials,
  settings,
  currentUser,
  onNavigate,
  onUpdateOfficial,
  onAddOfficial,
  onDeleteOfficial,
}) => {
  const { showToast } = useToast();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Photo Upload Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoOfficial, setPhotoOfficial] = useState<VillageOfficial | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Direct Card Avatar Quick Upload
  const [directUploadTargetId, setDirectUploadTargetId] = useState<string | null>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Full Add/Edit Official Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nipd, setNipd] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Delete Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingOfficial, setDeletingOfficial] = useState<VillageOfficial | null>(null);

  // Filtered officials list
  const filteredOfficials = officials.filter((off) => {
    const q = searchTerm.toLowerCase();
    return (
      off.name.toLowerCase().includes(q) ||
      off.position.toLowerCase().includes(q) ||
      (off.nipd && off.nipd.toLowerCase().includes(q))
    );
  });

  // Open dedicated photo upload modal
  const handleOpenPhotoModal = (off: VillageOfficial) => {
    setPhotoOfficial(off);
    setPreviewPhotoUrl(off.photoUrl || '');
    setCustomPhotoUrlInput(off.photoUrl || '');
    setIsPhotoModalOpen(true);
  };

  // Process photo file upload (compresses and creates Data URL)
  const handlePhotoFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih berkas gambar valid (JPG, PNG, atau WEBP)!', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 3MB!', 'error');
      return;
    }

    setIsProcessingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.88);
      setPreviewPhotoUrl(compressedDataUrl);
      showToast('Foto profil berhasil dimuat! Klik "Simpan Foto Profil" untuk menyimpan ke Supabase.', 'info');
    } catch (err) {
      showToast('Gagal memproses gambar foto!', 'error');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Save updated photo from dedicated photo modal
  const handleSavePhotoModal = () => {
    if (!photoOfficial) return;

    const updatedOfficial: VillageOfficial = {
      ...photoOfficial,
      photoUrl: previewPhotoUrl,
    };

    onUpdateOfficial(updatedOfficial);
    showToast(`Foto profil ${photoOfficial.name} berhasil diperbarui dan disinkronkan ke Supabase!`, 'success');
    setIsPhotoModalOpen(false);
    setPhotoOfficial(null);
  };

  // Direct avatar file change from card hover camera button
  const handleDirectAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !directUploadTargetId) return;

    const target = officials.find(o => o.id === directUploadTargetId);
    if (!target) return;

    try {
      showToast('Mengompres dan mengunggah foto profil...', 'info');
      const compressed = await compressImage(file, 400, 400, 0.88);
      const updated: VillageOfficial = {
        ...target,
        photoUrl: compressed,
      };
      onUpdateOfficial(updated);
      showToast(`Foto profil ${target.name} berhasil diunggah langsung ke database!`, 'success');
    } catch (err) {
      showToast('Gagal mengunggah foto profil!', 'error');
    } finally {
      setDirectUploadTargetId(null);
      if (e.target) e.target.value = '';
    }
  };

  // Open Full Edit Modal
  const handleOpenEditModal = (off: VillageOfficial) => {
    setIsEditMode(true);
    setEditingId(off.id);
    setName(off.name);
    setNipd(off.nipd || '');
    setPosition(off.position);
    setPhone(off.phone || '');
    setEmail(off.email || '');
    setPhotoUrl(off.photoUrl || '');
    setOrderIndex(off.orderIndex || 1);
    setIsActive(off.isActive ?? true);
    setIsFormModalOpen(true);
  };

  // Open Add Official Modal
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setName('');
    setNipd('');
    setPosition(STANDARD_POSITIONS[0]);
    setPhone('');
    setEmail('');
    setPhotoUrl(OFFICIAL_PHOTO_PRESETS[0].url);
    setOrderIndex(officials.length + 1);
    setIsActive(true);
    setIsFormModalOpen(true);
  };

  // Save Full Official Form
  const handleSaveOfficialForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) {
      showToast('Nama dan Jabatan wajib diisi!', 'error');
      return;
    }

    if (isEditMode && editingId) {
      const existing = officials.find(o => o.id === editingId);
      if (!existing) return;

      const updated: VillageOfficial = {
        ...existing,
        name: name.trim(),
        nipd: nipd.trim(),
        position: position.trim(),
        phone: phone.trim(),
        email: email.trim(),
        photoUrl: photoUrl.trim(),
        orderIndex: Number(orderIndex) || 1,
        isActive,
      };

      onUpdateOfficial(updated);
      showToast(`Data perangkat desa ${name} berhasil disimpan ke Supabase!`, 'success');
    } else if (onAddOfficial) {
      onAddOfficial({
        name: name.trim(),
        nipd: nipd.trim(),
        position: position.trim(),
        phone: phone.trim(),
        email: email.trim(),
        photoUrl: photoUrl.trim() || OFFICIAL_PHOTO_PRESETS[0].url,
        orderIndex: Number(orderIndex) || officials.length + 1,
        isActive,
      });
      showToast(`Perangkat desa baru ${name} berhasil ditambahkan!`, 'success');
    }

    setIsFormModalOpen(false);
  };

  // Delete Official
  const handleConfirmDelete = () => {
    if (!deletingOfficial || !onDeleteOfficial) return;
    onDeleteOfficial(deletingOfficial.id);
    showToast(`Data perangkat desa ${deletingOfficial.name} berhasil dihapus dari sistem!`, 'info');
    setIsDeleteModalOpen(false);
    setDeletingOfficial(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Direct Avatar Camera Clicks */}
      <input
        ref={directFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleDirectAvatarFileChange}
      />

      <Breadcrumb
        items={[{ label: 'Tata Kelola Pemerintahan' }, { label: 'Perangkat Desa & SOTK' }]}
        onNavigate={onNavigate}
      />

      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-lg">
              Struktur Organisasi & Tata Kerja (SOTK) {settings.villageName}
            </h3>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 border border-emerald-300">
              {officials.length} Aparatur
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Penyelenggara pemerintahan dan pelayanan publik desa sesuai UU No. 6 Tahun 2014 & Permendagri No. 84/2015.
            Foto profil terhubung langsung dan disinkronkan secara realtime ke database Supabase Cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onAddOfficial && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Perangkat Desa</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, jabatan, atau NIPD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Realtime Supabase Sync Aktif</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-600">Menampilkan {filteredOfficials.length} dari {officials.length} pejabat</span>
        </div>
      </div>

      {/* Grid of Officials */}
      {filteredOfficials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <UserIcon className="h-12 w-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">Tidak ada data perangkat desa yang sesuai</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba kata kunci pencarian lain atau klik tombol "Tambah Perangkat Desa" untuk mendaftarkan aparatur desa baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOfficials.map((off) => (
            <div
              key={off.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Avatar with Camera Trigger Overlay */}
                <div className="flex items-start justify-between">
                  <div className="relative group/avatar">
                    <div className="h-20 w-20 rounded-2xl border-2 border-emerald-600/40 p-0.5 overflow-hidden bg-slate-100 shrink-0 shadow-inner">
                      {off.photoUrl ? (
                        <img
                          src={off.photoUrl}
                          alt={off.name}
                          className="h-full w-full object-cover rounded-xl"
                          onError={(e) => {
                            // Fallback to default avatar placeholder if URL fails
                            (e.target as HTMLImageElement).src = OFFICIAL_PHOTO_PRESETS[0].url;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-lg">
                          {off.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Quick Camera hover button */}
                    <button
                      type="button"
                      title="Klik untuk langsung ganti foto profil"
                      onClick={() => {
                        setDirectUploadTargetId(off.id);
                        directFileInputRef.current?.click();
                      }}
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md border-2 border-white transition transform group-hover/avatar:scale-110 cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      off.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {off.isActive ? 'Aktif Menjabat' : 'Non-aktif'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      No. Urut: {off.orderIndex || 1}
                    </span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="mt-4 space-y-1">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">{off.name}</h4>
                  <p className="text-xs font-bold text-emerald-700">{off.position}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    NIPD: {off.nipd ? off.nipd : <span className="italic text-slate-400">Belum diisi</span>}
                  </p>
                </div>

                {/* Contact list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{off.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{off.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: dedicated Upload Foto Profil and Ubah Data */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Dedicated Menu Upload Foto Profil */}
                <button
                  type="button"
                  onClick={() => handleOpenPhotoModal(off)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                  title="Buka menu upload dan ganti foto profil resmi"
                >
                  <Camera className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Upload Foto</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(off)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition"
                    title="Ubah identitas dan jabatan"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </button>

                  {onDeleteOfficial && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingOfficial(off);
                        setIsDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                      title="Hapus data perangkat desa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED MODAL: MENU UPLOAD FOTO PROFIL PERANGKAT DESA              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Menu Upload Foto Profil Perangkat Desa"
        maxWidth="lg"
      >
        {photoOfficial && (
          <div className="space-y-5 text-xs">
            {/* Header target official info */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="h-12 w-12 rounded-xl border border-emerald-300 bg-white overflow-hidden p-0.5 shrink-0 shadow-xs">
                {previewPhotoUrl ? (
                  <img src={previewPhotoUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-full w-full rounded-lg bg-emerald-100 flex items-center justify-center font-black text-emerald-800">
                    {photoOfficial.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                  Target Pejabat
                </span>
                <h4 className="font-black text-slate-900 text-sm truncate mt-0.5">{photoOfficial.name}</h4>
                <p className="text-slate-600 text-xs font-semibold">{photoOfficial.position}</p>
              </div>
            </div>

            {/* Live Comparison / Big Preview */}
            <div className="text-center py-2 space-y-2">
              <label className="block font-bold text-slate-700 text-xs">
                Pratinjau Foto Profil Resmi (Tampilan Publik & Kop)
              </label>
              <div className="inline-block relative">
                <div className="h-32 w-32 mx-auto rounded-3xl border-4 border-emerald-600/30 p-1 bg-white shadow-lg overflow-hidden ring-4 ring-emerald-50">
                  {previewPhotoUrl ? (
                    <img src={previewPhotoUrl} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                      <span className="text-[10px] font-bold">Tanpa Foto</span>
                    </div>
                  )}
                </div>
                {previewPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewPhotoUrl('')}
                    className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition"
                    title="Hapus / Kosongkan foto profil"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Method 1: File Upload Box */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Metode 1: Unggah Berkas Foto dari Komputer / HP
              </label>
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 p-5 rounded-2xl text-center cursor-pointer transition space-y-2"
              >
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoFileChange(f);
                  }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mx-auto shadow-2xs">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-800 block text-xs">
                    Klik untuk memilih berkas foto atau tarik ke sini
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Format didukung: JPG, PNG, WEBP (Maksimal 3MB). Otomatis dioptimalkan untuk penyimpanan cepat Supabase.
                  </span>
                </div>
              </div>
            </div>

            {/* Method 2: Paste Direct Image URL */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Metode 2: Atau Tempel Tautan / URL Gambar Foto
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau https://domain.com/foto.jpg"
                  value={customPhotoUrlInput}
                  onChange={(e) => setCustomPhotoUrlInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoUrlInput.trim()) {
                      setPreviewPhotoUrl(customPhotoUrlInput.trim());
                      showToast('URL foto diterapkan ke pratinjau!', 'info');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition shrink-0"
                >
                  Terapkan URL
                </button>
              </div>
            </div>

            {/* Method 3: Preset Official Avatars */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pilihan Foto Avatar Resmi (ASN & Pamong Desa)</span>
                </label>
                <span className="text-[10px] text-slate-400">Klik untuk memilih</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {OFFICIAL_PHOTO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPreviewPhotoUrl(preset.url);
                      setCustomPhotoUrlInput(preset.url);
                      showToast(`Memilih preset: ${preset.label}`, 'info');
                    }}
                    className={`group/preset p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      previewPhotoUrl === preset.url
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200">
                      <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 line-clamp-1">
                      {preset.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isProcessingPhoto}
                onClick={handleSavePhotoModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isProcessingPhoto ? 'Memproses...' : 'Simpan Foto Profil ke Supabase'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 2. FULL MODAL: TAMBAH / UBAH IDENTITAS PERANGKAT DESA                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditMode ? 'Ubah Data & Foto Perangkat Desa' : 'Tambah Perangkat Desa Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveOfficialForm} className="space-y-4 text-xs">
          {/* Photo Section inside Form */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <label className="block font-bold text-slate-800 text-xs">Foto Profil Aparatur Desa</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl border-2 border-emerald-600/30 overflow-hidden bg-white shrink-0 p-0.5 shadow-xs">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                    Tanpa Foto
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Pilih Berkas Foto</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file, 400, 400, 0.88);
                          setPhotoUrl(compressed);
                          showToast('Foto profil berhasil dimuat!', 'info');
                        }
                      }}
                    />
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Atau tempel URL gambar foto langsung..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] bg-white focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                placeholder="cth: H. Ahmad Supriyatna, S.AP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIPD / NIP</label>
              <input
                type="text"
                placeholder="cth: 19750812 200212 1 003"
                value={nipd}
                onChange={(e) => setNipd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Jabatan SOTK *</label>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Pilih dari daftar atau ketik jabatan..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <div className="flex flex-wrap gap-1">
                {STANDARD_POSITIONS.slice(0, 6).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                placeholder="cth: 081234567891"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Kedinasan</label>
              <input
                type="email"
                placeholder="cth: kades@sukamaju.desa.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Urut Tampilan SOTK</label>
              <input
                type="number"
                min="1"
                max="50"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Keaktifan Jabatan</label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="true">Aktif Menjabat</option>
                <option value="false">Nonaktif / Purna Tugas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 font-bold text-white rounded-xl shadow-xs transition"
            >
              {isEditMode ? 'Simpan Perubahan ke Supabase' : 'Tambahkan Aparatur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. CONFIRM DELETE MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Data Perangkat Desa"
      >
        {deletingOfficial && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Apakah Anda yakin ingin menghapus data aparatur ini?</h5>
                <p className="text-[11px] text-red-700 mt-1">
                  Perangkat desa <strong>{deletingOfficial.name}</strong> ({deletingOfficial.position}) akan dihapus dari daftar SOTK desa dan database Supabase Cloud.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 font-bold text-white rounded-xl shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
