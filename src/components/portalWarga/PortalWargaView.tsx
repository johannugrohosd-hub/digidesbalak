import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  FileCheck2,
  Clock,
  Printer,
  ShieldAlert,
  Megaphone,
  User,
  CreditCard,
  Building,
  Upload,
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  User as UserType,
  Resident,
  LetterRequest,
  LetterType,
  Complaint,
  Announcement,
  VillageSettings
} from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { SuratPreviewModal } from '../layananSurat/SuratPreviewModal';
import { useToast } from '../common/Toast';
import { formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface PortalWargaViewProps {
  currentUser: UserType | null;
  residents: Resident[];
  letterRequests: LetterRequest[];
  letterTypes: LetterType[];
  complaints: Complaint[];
  announcements: Announcement[];
  settings: VillageSettings;
  onNavigate: (page: string) => void;
  onSubmitLetterRequest: (data: {
    letterTypeCode: string;
    residentId: string;
    purpose: string;
    extraFields: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }) => void;
  onSubmitComplaint: (data: {
    residentName: string;
    nik: string;
    phone: string;
    category: Complaint['category'];
    subject: string;
    description: string;
    location?: string;
  }) => void;
}

export const PortalWargaView: React.FC<PortalWargaViewProps> = ({
  currentUser,
  residents,
  letterRequests,
  letterTypes,
  complaints,
  announcements,
  settings,
  onNavigate,
  onSubmitLetterRequest,
  onSubmitComplaint,
}) => {
  const { showToast } = useToast();

  // Find linked resident for current logged-in citizen
  const citizenResident = residents.find(
    r => r.id === currentUser?.residentId || r.nik === currentUser?.nik
  ) || residents[0]; // fallback to first resident if admin previews portal

  // Filter ONLY this citizen's letters and complaints (Privacy Rule)
  const myLetters = letterRequests.filter(
    lr => lr.residentId === citizenResident?.id || lr.nik === citizenResident?.nik
  );
  const myComplaints = complaints.filter(
    c => c.nik === citizenResident?.nik || c.residentName.toLowerCase() === citizenResident?.fullName.toLowerCase()
  );

  // Modals
  const [isApplySuratOpen, setIsApplySuratOpen] = useState(false);
  const [isAduanOpen, setIsAduanOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<LetterRequest | null>(null);

  // Form Apply Surat
  const [selectedTypeCode, setSelectedTypeCode] = useState(letterTypes[0]?.code || 'SKD');
  const [purpose, setPurpose] = useState('');
  const [extraNamaUsaha, setExtraNamaUsaha] = useState('');
  const [extraJenisUsaha, setExtraJenisUsaha] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Form Pengaduan
  const [aduanCategory, setAduanCategory] = useState<Complaint['category']>('Infrastruktur');
  const [aduanSubject, setAduanSubject] = useState('');
  const [aduanDescription, setAduanDescription] = useState('');
  const [aduanLocation, setAduanLocation] = useState('');

  const handleApplySuratSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenResident) return;
    if (!purpose.trim()) {
      showToast('Keperluan surat wajib diisi!', 'error');
      return;
    }

    const extraFields: Record<string, string> = {};
    if (selectedTypeCode === 'SKU') {
      extraFields.namaUsaha = extraNamaUsaha || 'Usaha Mandiri';
      extraFields.jenisUsaha = extraJenisUsaha || 'Perdagangan';
    }

    onSubmitLetterRequest({
      letterTypeCode: selectedTypeCode,
      residentId: citizenResident.id,
      purpose: purpose.trim(),
      extraFields,
      submissionChannel: 'Portal Warga',
    });

    showToast('Permohonan surat berhasil dikirim secara online!', 'success');
    setIsApplySuratOpen(false);
    setPurpose('');
    setUploadedFileName(null);
  };

  const handleAduanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenResident) return;
    if (!aduanSubject.trim() || !aduanDescription.trim()) {
      showToast('Judul dan penjelasan pengaduan wajib diisi!', 'error');
      return;
    }

    onSubmitComplaint({
      residentName: citizenResident.fullName,
      nik: citizenResident.nik,
      phone: citizenResident.phone || '08123456789',
      category: aduanCategory,
      subject: aduanSubject.trim(),
      description: aduanDescription.trim(),
      location: aduanLocation.trim() || citizenResident.address,
    });

    showToast('Pengaduan Anda telah terkirim dan segera ditindaklanjuti!', 'success');
    setIsAduanOpen(false);
    setAduanSubject('');
    setAduanDescription('');
    setAduanLocation('');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Pelayanan Mandiri' }, { label: 'Portal Mandiri Warga' }]}
        onNavigate={onNavigate}
      />

      {/* Citizen Identity Hero Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <User className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{citizenResident?.fullName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="h-3 w-3" /> Warga Terverifikasi
                </span>
              </div>
              <p className="font-mono text-xs text-emerald-200">
                NIK: {citizenResident?.nik} • No KK: {citizenResident?.cardNumber}
              </p>
              <p className="text-xs text-slate-300">
                {citizenResident?.address}, RT {citizenResident?.rt} / RW {citizenResident?.rw}, {citizenResident?.districtName}, {settings.villageName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsApplySuratOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-400 transition"
            >
              <Send className="h-4 w-4" />
              <span>Ajukan Surat Online</span>
            </button>
            <button
              onClick={() => setIsAduanOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-400 transition"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Kirim Pengaduan / Aspirasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Pelayanan & Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Letters & Progress Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Letters Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Riwayat & Lacak Status Surat Saya ({myLetters.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau permohonan surat elektronik Anda secara transparan
                </p>
              </div>
              <button
                onClick={() => setIsApplySuratOpen(true)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                + Buat Baru
              </button>
            </div>

            {myLetters.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                <FileCheck2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Belum ada pengajuan surat</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik tombol "Ajukan Surat Online" untuk membuat surat secara mandiri tanpa antre di balai desa.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myLetters.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-emerald-500 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{req.letterTypeName}</h4>
                          <span className="font-mono text-[10px] text-slate-500">[{req.requestNumber}]</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">Keperluan: {req.purpose}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          req.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Disetujui' ? 'bg-teal-100 text-teal-800' :
                          req.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {req.status}
                        </span>

                        {(req.status === 'Disetujui' || req.status === 'Selesai') && (
                          <button
                            onClick={() => setPreviewLetter(req)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-2xs"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Unduh Surat Resmi</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Step Bar */}
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold pt-1">
                      <div className={`p-1.5 rounded ${req.status !== 'Ditolak' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        1. Diajukan
                      </div>
                      <div className={`p-1.5 rounded ${['Diproses', 'Menunggu Persetujuan', 'Disetujui', 'Selesai'].includes(req.status) ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        2. Verifikasi
                      </div>
                      <div className={`p-1.5 rounded ${['Menunggu Persetujuan', 'Disetujui', 'Selesai'].includes(req.status) ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        3. TTD Kades
                      </div>
                      <div className={`p-1.5 rounded ${['Disetujui', 'Selesai'].includes(req.status) ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        4. Siap Ambil / Cetak
                      </div>
                    </div>

                    {req.rejectionReason && (
                      <div className="rounded bg-red-50 p-2 text-xs text-red-800 border border-red-200">
                        <b>Alasan Penolakan:</b> {req.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Citizen Complaints History */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Pengaduan & Aspirasi Saya ({myComplaints.length})
                </h3>
                <p className="text-xs text-slate-500">Tanggapan resmi dari aparatur pemerintah desa</p>
              </div>
              <button
                onClick={() => setIsAduanOpen(true)}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                + Tulis Pengaduan
              </button>
            </div>

            {myComplaints.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Belum ada pengaduan yang Anda ajukan.
              </p>
            ) : (
              <div className="space-y-3">
                {myComplaints.map(comp => (
                  <div key={comp.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400">Tiket: {comp.ticketNumber}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{comp.subject}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                        comp.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{comp.description}</p>
                    {comp.responseNotes && (
                      <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200 mt-2">
                        <p className="font-bold text-[11px] text-emerald-800">
                          Respon Pemerintah Desa ({comp.respondedBy}):
                        </p>
                        <p className="mt-0.5">{comp.responseNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Village Announcements & Desk Schedule */}
        <div className="space-y-6">
          {/* Desk Hours */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-700" />
              Jadwal Pelayanan Balai Desa
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Senin - Kamis</span>
                <span className="font-bold text-slate-900">08:00 - 15:30 WIB</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Jumat</span>
                <span className="font-bold text-slate-900">08:00 - 11:30 WIB</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-600">Sabtu - Minggu</span>
                <span className="font-bold text-red-600">Libur / Pelayanan Online</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Pengajuan melalui Portal Mandiri Warga ini diproses dalam waktu 1x24 jam kerja.
            </p>
          </div>

          {/* Announcements */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-emerald-700" />
              Pengumuman & Info Desa
            </h4>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateIndo(ann.publishedDate)}</span>
                  </div>
                  <h5 className="font-bold text-slate-900">{ann.title}</h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajukan Surat Online */}
      <Modal isOpen={isApplySuratOpen} onClose={() => setIsApplySuratOpen(false)} title="Permohonan Surat Mandiri Online" maxWidth="2xl">
        <form onSubmit={handleApplySuratSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Jenis Layanan Surat</label>
            <select
              value={selectedTypeCode}
              onChange={e => setSelectedTypeCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white"
            >
              {letterTypes.map(lt => (
                <option key={lt.id} value={lt.code}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Keperluan Pengajuan Surat</label>
            <textarea
              rows={2}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="Contoh: Pengajuan KPR Rumah, Beasiswa Pendidikan, Urusan Perbankan..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          {selectedTypeCode === 'SKU' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded border border-amber-200">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Nama Usaha</label>
                <input
                  type="text"
                  value={extraNamaUsaha}
                  onChange={e => setExtraNamaUsaha(e.target.value)}
                  placeholder="Nama Toko / Warung"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Jenis Usaha</label>
                <input
                  type="text"
                  value={extraJenisUsaha}
                  onChange={e => setExtraJenisUsaha(e.target.value)}
                  placeholder="Kuliner / Sembako"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white"
                />
              </div>
            </div>
          )}

          {/* Upload Persyaratan */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Unggah Foto Dokumen Persyaratan (KTP / KK / Pengantar RT)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="h-4 w-4 text-emerald-700" />
                <span>Pilih Foto Dokumen</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => setUploadedFileName(e.target.files?.[0]?.name || 'dokumen_syarat.jpg')}
                />
              </label>
              <span className="text-xs text-slate-500">
                {uploadedFileName ? `File terpilih: ${uploadedFileName}` : 'Format: JPG, PNG, atau PDF (Max 2MB)'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsApplySuratOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm"
            >
              Kirim Permohonan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kirim Pengaduan */}
      <Modal isOpen={isAduanOpen} onClose={() => setIsAduanOpen(false)} title="Formulir Pengaduan & Aspirasi Warga" maxWidth="2xl">
        <form onSubmit={handleAduanSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Kategori Masalah</label>
            <select
              value={aduanCategory}
              onChange={e => setAduanCategory(e.target.value as Complaint['category'])}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm bg-white"
            >
              <option value="Infrastruktur">Infrastruktur (Jalan, Jembatan, Drainase, PJU)</option>
              <option value="Pelayanan">Pelayanan Administrasi Kantor Desa</option>
              <option value="Bansos">Bantuan Sosial & Kesejahteraan</option>
              <option value="Keamanan">Keamanan & Ketertiban Lingkungan</option>
              <option value="Kebersihan">Kebersihan & Sampah</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Judul Ringkas Pengaduan</label>
            <input
              type="text"
              value={aduanSubject}
              onChange={e => setAduanSubject(e.target.value)}
              placeholder="Contoh: Lampu penerangan jalan mati di RT 02"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Lokasi Kejadian / Titik Terkait</label>
            <input
              type="text"
              value={aduanLocation}
              onChange={e => setAduanLocation(e.target.value)}
              placeholder="Contoh: Depan Pos Ronda Dusun Sukasari"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Uraian / Penjelasan Lengkap</label>
            <textarea
              rows={3}
              value={aduanDescription}
              onChange={e => setAduanDescription(e.target.value)}
              placeholder="Jelaskan secara detail permasalahan yang dihadapi..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAduanOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
            >
              Kirim Aspirasi / Pengaduan
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview modal for citizen's approved letter */}
      <SuratPreviewModal
        isOpen={!!previewLetter}
        onClose={() => setPreviewLetter(null)}
        letterRequest={previewLetter}
        resident={citizenResident}
        settings={settings}
        currentUser={currentUser}
      />
    </div>
  );
};
