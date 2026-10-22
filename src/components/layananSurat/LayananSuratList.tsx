import React, { useState } from 'react';
import {
  Search,
  FilePlus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  ShieldCheck,
  Send,
  FileText
} from 'lucide-react';
import { LetterRequest, LetterType, Resident, VillageSettings, User, LetterStatus } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { BuatSuratModal } from './BuatSuratModal';
import { SuratPreviewModal } from './SuratPreviewModal';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatDateTimeIndo } from '../../utils/formatters';

interface LayananSuratListProps {
  letterRequests: LetterRequest[];
  letterTypes: LetterType[];
  residents: Resident[];
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onCreateLetterRequest: (data: {
    letterTypeCode: string;
    residentId: string;
    purpose: string;
    extraFields: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }) => void;
  onUpdateStatus: (
    requestId: string,
    newStatus: LetterStatus,
    options?: { rejectionReason?: string; currentUser?: User }
  ) => void;
}

export const LayananSuratList: React.FC<LayananSuratListProps> = ({
  letterRequests,
  letterTypes,
  residents,
  settings,
  currentUser,
  onNavigate,
  onCreateLetterRequest,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewRequest, setPreviewRequest] = useState<LetterRequest | null>(null);
  const [rejectCandidate, setRejectCandidate] = useState<LetterRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = letterRequests.filter(req => {
    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.officialLetterNumber && req.officialLetterNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.nik.includes(searchTerm) ||
      req.letterTypeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
    const matchesType = selectedTypeCode === 'ALL' || req.letterTypeCode === selectedTypeCode;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case 'Diajukan':
        return <span className="bg-sky-100 text-sky-800 border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Diajukan</span>;
      case 'Diproses':
        return <span className="bg-blue-100 text-blue-800 border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Diproses</span>;
      case 'Menunggu Persetujuan':
        return <span className="bg-amber-100 text-amber-800 border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Menunggu Kades</span>;
      case 'Disetujui':
        return <span className="bg-teal-100 text-teal-800 border-teal-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Disetujui</span>;
      case 'Selesai':
        return <span className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Selesai / Terbit</span>;
      case 'Ditolak':
        return <span className="bg-red-100 text-red-800 border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold border">Ditolak</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  const handleOpenPreview = (req: LetterRequest) => {
    setPreviewRequest(req);
  };

  const handleProcess = (req: LetterRequest) => {
    if (!currentUser) return;
    onUpdateStatus(req.id, 'Diproses', { currentUser });
    showToast(`Permohonan ${req.requestNumber} sedang diproses verifikasi`, 'info');
  };

  const handleSendToKades = (req: LetterRequest) => {
    if (!currentUser) return;
    onUpdateStatus(req.id, 'Menunggu Persetujuan', { currentUser });
    showToast(`Permohonan diajukan ke Kepala Desa untuk persetujuan`, 'info');
  };

  const handleApproveKades = (req: LetterRequest) => {
    if (!currentUser) return;
    onUpdateStatus(req.id, 'Disetujui', { currentUser });
    showToast(`Surat berhasil disetujui & nomor registrasi resmi telah diterbitkan!`, 'success');
  };

  const handleFinishLetter = (req: LetterRequest) => {
    if (!currentUser) return;
    onUpdateStatus(req.id, 'Selesai', { currentUser });
    showToast(`Status surat diubah menjadi Selesai. Dokumen siap dicetak`, 'success');
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCandidate || !currentUser) return;
    if (!rejectionReason.trim()) {
      showToast('Alasan penolakan wajib diisi!', 'error');
      return;
    }

    onUpdateStatus(rejectCandidate.id, 'Ditolak', {
      rejectionReason: rejectionReason.trim(),
      currentUser,
    });

    showToast(`Permohonan surat ${rejectCandidate.requestNumber} telah ditolak`, 'info');
    setRejectCandidate(null);
    setRejectionReason('');
  };

  // Find resident of selected preview request
  const activeResident = previewRequest
    ? residents.find(r => r.id === previewRequest.residentId) || null
    : null;

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Pelayanan Administrasi' }, { label: 'Layanan Surat (E-Surat)' }]}
        onNavigate={onNavigate}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <FilePlus className="h-4 w-4" />
            <span>Buat Surat di Loket</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari No Registrasi, Nama, NIK, Jenis Surat..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Status Permohonan</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Diproses">Diproses</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan Kades</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Selesai">Selesai / Terbit</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTypeCode}
              onChange={e => setSelectedTypeCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Jenis Layanan Surat</option>
              {letterTypes.map(lt => (
                <option key={lt.id} value={lt.code}>
                  [{lt.code}] {lt.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table of Letters */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">No Registrasi</th>
                <th className="py-3 px-3">Jenis Surat</th>
                <th className="py-3 px-3">Warga Pemohon</th>
                <th className="py-3 px-3">Keperluan</th>
                <th className="py-3 px-3">Saluran & Waktu</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi Alur Kerja (Workflow)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data permohonan surat yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">{req.requestNumber}</div>
                      {req.officialLetterNumber && (
                        <div className="font-mono text-[10px] text-emerald-800 font-bold mt-0.5">
                          {req.officialLetterNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{req.letterTypeName}</div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        Kode: {req.letterTypeCode}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{req.residentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NIK: {req.nik}</div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{req.purpose}</p>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{req.submissionChannel}</div>
                      <div className="text-[10px] text-slate-400">{formatDateTimeIndo(req.submittedAt)}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(req.status)}
                      {req.rejectionReason && (
                        <p className="text-[10px] text-red-600 mt-1 max-w-[120px] mx-auto truncate" title={req.rejectionReason}>
                          Ket: {req.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {/* Preview Surat Modal Button */}
                        <button
                          onClick={() => handleOpenPreview(req)}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200 font-semibold text-[11px] transition"
                          title="Pratinjau Surat Resmi"
                        >
                          <Eye className="h-3 w-3 text-slate-600" />
                          <span>Lihat Surat</span>
                        </button>

                        {/* Workflow Buttons based on Role & Current Status */}
                        {req.status === 'Diajukan' && (
                          <button
                            onClick={() => handleProcess(req)}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-blue-800 hover:bg-blue-100 font-bold text-[11px] transition"
                          >
                            <span>Verifikasi</span>
                          </button>
                        )}

                        {req.status === 'Diproses' && (
                          <button
                            onClick={() => handleSendToKades(req)}
                            className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-300 px-2 py-1 text-amber-800 hover:bg-amber-100 font-bold text-[11px] transition"
                          >
                            <Send className="h-3 w-3" />
                            <span>Ajukan ke Kades</span>
                          </button>
                        )}

                        {req.status === 'Menunggu Persetujuan' && (
                          <button
                            onClick={() => handleApproveKades(req)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 font-bold text-[11px] shadow-2xs transition"
                            title="Setujui & Terbitkan Nomor Surat Resmi"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Setujui (Kades)</span>
                          </button>
                        )}

                        {req.status === 'Disetujui' && (
                          <button
                            onClick={() => handleFinishLetter(req)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-700 px-2 py-1 text-white hover:bg-emerald-800 font-bold text-[11px] shadow-2xs transition"
                            title="Cetak dan serahkan ke warga"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Selesaikan</span>
                          </button>
                        )}

                        {req.status !== 'Selesai' && req.status !== 'Ditolak' && (
                          <button
                            onClick={() => setRejectCandidate(req)}
                            className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                            title="Tolak Permohonan"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <form onSubmit={handleRejectConfirm} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-red-700">Tolak Permohonan Surat</h3>
            <p className="text-xs text-slate-600">
              Permohonan <b>{rejectCandidate.requestNumber}</b> ({rejectCandidate.letterTypeName}) atas nama <b>{rejectCandidate.residentName}</b> akan ditolak.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Contoh: Berkas persyaratan belum lengkap atau ada ketidaksesuaian data domisili..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-red-600 focus:outline-hidden"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectCandidate(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                Kirim Penolakan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buat Surat Modal */}
      <BuatSuratModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        letterTypes={letterTypes}
        residents={residents}
        currentUser={currentUser}
        onSubmit={onCreateLetterRequest}
      />

      {/* Preview Surat Resmi Modal */}
      <SuratPreviewModal
        isOpen={!!previewRequest}
        onClose={() => setPreviewRequest(null)}
        letterRequest={previewRequest}
        resident={activeResident}
        settings={settings}
        currentUser={currentUser}
      />
    </div>
  );
};
