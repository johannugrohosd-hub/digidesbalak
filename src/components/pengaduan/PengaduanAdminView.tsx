import React, { useState } from 'react';
import { ShieldAlert, MessageSquare, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Complaint, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatDateTimeIndo } from '../../utils/formatters';

interface PengaduanAdminViewProps {
  complaints: Complaint[];
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onRespondComplaint: (id: string, responseNotes: string, status: Complaint['status']) => void;
}

export const PengaduanAdminView: React.FC<PengaduanAdminViewProps> = ({
  complaints,
  currentUser,
  onNavigate,
  onRespondComplaint,
}) => {
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [newStatus, setNewStatus] = useState<Complaint['status']>('Diproses');

  const filtered = complaints.filter(
    c => selectedStatus === 'ALL' || c.status === selectedStatus
  );

  const handleOpenRespond = (c: Complaint) => {
    setSelectedComplaint(c);
    setResponseNotes(c.responseNotes || '');
    setNewStatus(c.status === 'Menunggu' ? 'Diproses' : c.status);
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!responseNotes.trim()) {
      showToast('Tanggapan atau catatan tindak lanjut wajib diisi!', 'error');
      return;
    }

    onRespondComplaint(selectedComplaint.id, responseNotes.trim(), newStatus);
    showToast(`Pengaduan tiket ${selectedComplaint.ticketNumber} telah ditanggapi!`, 'success');
    setSelectedComplaint(null);
  };

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Tata Kelola Pemerintahan' }, { label: 'Pengaduan & Aspirasi Warga' }]}
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Pengelolaan Pengaduan & Aspirasi Masyarakat Desa
          </h3>
          <p className="text-xs text-slate-500">
            Kanal aspirasi warga sesuai prinsip akuntabilitas dan pelayanan publik desa prima.
          </p>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Menunggu">Menunggu Tindak Lanjut</option>
            <option value="Diproses">Sedang Diproses</option>
            <option value="Selesai">Telah Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(comp => (
          <div key={comp.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400">Tiket: {comp.ticketNumber}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{comp.subject}</h4>
                <p className="text-xs text-slate-600">
                  Oleh: <span className="font-semibold text-slate-800">{comp.residentName}</span> (NIK: {comp.nik})
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                comp.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                comp.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {comp.status}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
              <p className="font-medium">{comp.description}</p>
              {comp.location && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>Lokasi: {comp.location}</span>
                </p>
              )}
            </div>

            {comp.responseNotes && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-950 space-y-0.5">
                <span className="font-bold text-[10px] text-emerald-800 block">
                  Tanggapan ({comp.respondedBy}):
                </span>
                <p>{comp.responseNotes}</p>
                <span className="text-[10px] text-slate-500 block">
                  Waktu: {formatDateTimeIndo(comp.respondedAt)}
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-slate-400 text-[11px]">{formatDateTimeIndo(comp.createdAt)}</span>
              <button
                onClick={() => handleOpenRespond(comp)}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{comp.responseNotes ? 'Ubah Tanggapan' : 'Beri Tanggapan'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Response Modal */}
      <Modal isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title="Tanggapi Pengaduan Warga">
        <form onSubmit={handleSaveResponse} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Penanganan</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as Complaint['status'])}
              className="w-full rounded border border-slate-300 p-2 text-xs bg-white font-semibold"
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Sedang Diproses (Petugas Ditugaskan)</option>
              <option value="Selesai">Selesai (Sudah Diperbaiki / Dituntaskan)</option>
              <option value="Ditolak">Ditolak / Di luar Kewenangan Desa</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan / Tanggapan Resmi Pemerintah Desa <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={responseNotes}
              onChange={e => setResponseNotes(e.target.value)}
              placeholder="Tuliskan tindakan yang telah diambil oleh perangkat desa..."
              className="w-full rounded border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="px-4 py-2 border rounded font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 font-bold text-white rounded hover:bg-emerald-800"
            >
              Kirim Tanggapan Resmi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
