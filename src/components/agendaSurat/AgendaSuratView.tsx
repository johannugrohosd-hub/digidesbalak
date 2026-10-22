import React, { useState } from 'react';
import { BookOpen, Plus, Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { AgendaLetter, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatDateIndo } from '../../utils/formatters';

interface AgendaSuratViewProps {
  agendaLetters: AgendaLetter[];
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onAddAgenda: (data: Omit<AgendaLetter, 'id'>) => void;
}

export const AgendaSuratView: React.FC<AgendaSuratViewProps> = ({
  agendaLetters,
  currentUser,
  onNavigate,
  onAddAgenda,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [letterNumber, setLetterNumber] = useState('');
  const [correspondent, setCorrespondent] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().substring(0, 10));
  const [subject, setSubject] = useState('');
  const [dispositionOrSigner, setDispositionOrSigner] = useState('');
  const [notes, setNotes] = useState('');

  const filteredLetters = agendaLetters
    .filter(a => a.type === activeTab)
    .filter(a =>
      a.letterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.correspondent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterNumber.trim() || !correspondent.trim() || !subject.trim()) {
      showToast('Nomor surat, pengirim/tujuan, dan perihal wajib diisi!', 'error');
      return;
    }

    const count = agendaLetters.filter(a => a.type === activeTab).length + 1;
    const agendaNumber = `${activeTab === 'MASUK' ? 'SM' : 'SK'}-2026-${String(count).padStart(4, '0')}`;

    onAddAgenda({
      type: activeTab,
      agendaNumber,
      letterNumber: letterNumber.trim(),
      correspondent: correspondent.trim(),
      letterDate,
      receivedOrSentDate: new Date().toISOString().substring(0, 10),
      subject: subject.trim(),
      dispositionOrSigner: dispositionOrSigner.trim(),
      notes: notes.trim(),
    });

    showToast(`Surat ${activeTab.toLowerCase()} No. ${letterNumber} berhasil diagendakan!`, 'success');
    setIsAddOpen(false);
    setLetterNumber('');
    setCorrespondent('');
    setSubject('');
  };

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Pelayanan Administrasi' }, { label: 'Buku Agenda Surat Masuk & Keluar' }]}
        onNavigate={onNavigate}
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Surat {activeTab === 'MASUK' ? 'Masuk' : 'Keluar'}</span>
          </button>
        }
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('MASUK')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition ${
            activeTab === 'MASUK'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          <span>Buku Agenda Surat Masuk</span>
        </button>
        <button
          onClick={() => setActiveTab('KELUAR')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition ${
            activeTab === 'KELUAR'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight className="h-4 w-4 text-blue-600" />
          <span>Buku Agenda Surat Keluar</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Cari nomor surat, ${activeTab === 'MASUK' ? 'instansi pengirim' : 'tujuan surat'}, perihal...`}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">No. Agenda</th>
                <th className="py-3 px-3">Nomor Surat</th>
                <th className="py-3 px-3">{activeTab === 'MASUK' ? 'Pengirim Surat' : 'Tujuan Surat'}</th>
                <th className="py-3 px-3">Tanggal Surat</th>
                <th className="py-3 px-3">Perihal / Isi Ringkas</th>
                <th className="py-3 px-3">{activeTab === 'MASUK' ? 'Disposisi Kepala Desa' : 'Pejabat Penandatangan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada catatan surat {activeTab.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                filteredLetters.map(letter => (
                  <tr key={letter.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">{letter.agendaNumber}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{letter.letterNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{letter.correspondent}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">{formatDateIndo(letter.letterDate)}</td>
                    <td className="py-3 px-3 text-slate-700 max-w-sm">{letter.subject}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{letter.dispositionOrSigner || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agenda Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={`Catat Surat ${activeTab === 'MASUK' ? 'Masuk' : 'Keluar'} Baru`}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Surat Resmi</label>
            <input
              type="text"
              value={letterNumber}
              onChange={e => setLetterNumber(e.target.value)}
              placeholder="Contoh: 100.3/452/Kec.Cwi/X/2026"
              className="w-full rounded border border-slate-300 p-2 font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {activeTab === 'MASUK' ? 'Instansi / Pejabat Pengirim' : 'Penerima / Instansi Tujuan'}
            </label>
            <input
              type="text"
              value={correspondent}
              onChange={e => setCorrespondent(e.target.value)}
              placeholder="Nama instansi atau pejabat..."
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Surat</label>
              <input
                type="date"
                value={letterDate}
                onChange={e => setLetterDate(e.target.value)}
                className="w-full rounded border border-slate-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {activeTab === 'MASUK' ? 'Disposisi Kades/Sekdes' : 'Pejabat Penandatangan'}
              </label>
              <input
                type="text"
                value={dispositionOrSigner}
                onChange={e => setDispositionOrSigner(e.target.value)}
                placeholder="Disposisi tindak lanjut..."
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Perihal / Isi Ringkas Surat</label>
            <textarea
              rows={2}
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Uraian perihal surat..."
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border rounded font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 font-bold text-white rounded hover:bg-emerald-800"
            >
              Simpan ke Buku Agenda
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
