import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  Plus,
  Eye,
  Printer,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { FamilyCard, Resident, VillageDistrict, VillageSettings, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { KartuKeluargaDetailModal } from './KartuKeluargaDetailModal';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatDateIndo, downloadExcel } from '../../utils/formatters';

interface KartuKeluargaListProps {
  familyCards: FamilyCard[];
  residents: Resident[];
  districts: VillageDistrict[];
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onAddFamilyCard: (card: Omit<FamilyCard, 'id'>) => void;
}

export const KartuKeluargaList: React.FC<KartuKeluargaListProps> = ({
  familyCards,
  residents,
  districts,
  settings,
  currentUser,
  onNavigate,
  onAddFamilyCard,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedKK, setSelectedKK] = useState<FamilyCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form for new KK
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newHeadName, setNewHeadName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRt, setNewRt] = useState('01');
  const [newRw, setNewRw] = useState('01');
  const [newDistrict, setNewDistrict] = useState(districts[0]?.name || 'Dusun Krajan');

  const filteredCards = familyCards.filter(fc => {
    const matchesSearch =
      fc.cardNumber.includes(searchTerm) ||
      fc.headFamilyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fc.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict = selectedDistrict === 'ALL' || fc.districtName === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  const handleOpenDetail = (fc: FamilyCard) => {
    setSelectedKK(fc);
    setIsDetailOpen(true);
  };

  const handleCreateKK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || newCardNumber.length !== 16 || !/^\d+$/.test(newCardNumber)) {
      showToast('Nomor KK harus 16 digit angka valid!', 'error');
      return;
    }
    if (!newHeadName.trim()) {
      showToast('Nama Kepala Keluarga wajib diisi!', 'error');
      return;
    }

    try {
      onAddFamilyCard({
        cardNumber: newCardNumber,
        headFamilyName: newHeadName.trim(),
        address: newAddress.trim() || 'Kp. Sukamaju',
        rt: newRt,
        rw: newRw,
        districtName: newDistrict,
        postalCode: settings.postalCode || '16720',
        issuedDate: new Date().toISOString().substring(0, 10),
      });
      showToast(`Kartu Keluarga No. ${newCardNumber} berhasil dibuat!`, 'success');
      setIsAddOpen(false);
      setNewCardNumber('');
      setNewHeadName('');
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan KK', 'error');
    }
  };

  const handleExportExcel = () => {
    const headers = ['Nomor KK', 'Nama Kepala Keluarga', 'Alamat', 'RT', 'RW', 'Dusun', 'Jumlah Anggota', 'Tgl Terbit'];
    const rows = familyCards.map(fc => [
      fc.cardNumber,
      fc.headFamilyName,
      fc.address,
      fc.rt,
      fc.rw,
      fc.districtName,
      residents.filter(r => r.cardNumber === fc.cardNumber).length,
      formatDateIndo(fc.issuedDate)
    ]);
    downloadExcel(`Data_Kartu_Keluarga_Desa_${new Date().toISOString().substring(0, 10)}`, headers, rows);
    showToast('Berhasil mengunduh rekapitulasi Kartu Keluarga (.xls)', 'success');
  };

  // Get members of the currently inspected KK
  const activeMembers = selectedKK
    ? residents.filter(r => r.cardNumber === selectedKK.cardNumber)
    : [];

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Administrasi Kependudukan' }, { label: 'Kartu Keluarga (KK)' }]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Ekspor KK Excel</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kartu Keluarga</span>
            </button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari Nomor KK, Nama Kepala Keluarga, Alamat..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
          <div>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Dusun</option>
              {districts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nomor KK</th>
                <th className="py-3 px-4">Kepala Keluarga</th>
                <th className="py-3 px-4">Alamat Domisili</th>
                <th className="py-3 px-4">Dusun</th>
                <th className="py-3 px-4 text-center">Anggota Keluarga</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data Kartu Keluarga yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card, idx) => {
                  const memberCount = residents.filter(r => r.cardNumber === card.cardNumber).length;
                  return (
                    <tr key={card.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{card.cardNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 uppercase">{card.headFamilyName}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {card.address} (RT {card.rt} / RW {card.rw})
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-800">{card.districtName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <Users className="h-3 w-3" />
                          <span>{memberCount} Jiwa</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(card)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Lihat Blanko KK</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add KK Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Kartu Keluarga Baru">
        <form onSubmit={handleCreateKK} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Kartu Keluarga (16 digit) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={16}
              value={newCardNumber}
              onChange={e => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="320112..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Kepala Keluarga <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newHeadName}
              onChange={e => setNewHeadName(e.target.value)}
              placeholder="Nama Kepala Keluarga"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili</label>
            <input
              type="text"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="Kp. Sukamaju No. ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RT</label>
              <input
                type="text"
                value={newRt}
                onChange={e => setNewRt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RW</label>
              <input
                type="text"
                value={newRw}
                onChange={e => setNewRw(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dusun</label>
              <select
                value={newDistrict}
                onChange={e => setNewDistrict(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800"
            >
              Simpan KK
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail KK Blanko */}
      <KartuKeluargaDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedKK(null);
        }}
        familyCard={selectedKK}
        members={activeMembers}
        settings={settings}
      />
    </div>
  );
};
