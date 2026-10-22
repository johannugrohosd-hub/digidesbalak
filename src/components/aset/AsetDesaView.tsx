import React, { useState } from 'react';
import { Package, Plus, Trash2, FileSpreadsheet, Search } from 'lucide-react';
import { VillageAsset, VillageSettings, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatRupiah, downloadExcel } from '../../utils/formatters';

interface AsetDesaViewProps {
  assets: VillageAsset[];
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onAddAsset: (asset: Omit<VillageAsset, 'id'>) => void;
  onDeleteAsset: (id: string) => void;
}

export const AsetDesaView: React.FC<AsetDesaViewProps> = ({
  assets,
  settings,
  currentUser,
  onNavigate,
  onAddAsset,
  onDeleteAsset,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<VillageAsset['category']>('Peralatan & Mesin');
  const [acquisitionYear, setAcquisitionYear] = useState(2025);
  const [sourceOfFunds, setSourceOfFunds] = useState('APBDes (Dana Desa)');
  const [purchaseCost, setPurchaseCost] = useState(15000000);
  const [condition, setCondition] = useState<VillageAsset['condition']>('Baik');
  const [location, setLocation] = useState('Balai Desa');
  const [picOfficial, setPicOfficial] = useState(settings.secretaryName || 'Kaur Umum');
  const [notes, setNotes] = useState('');

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalAssetValue = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) {
      showToast('Kode barang dan nama inventaris wajib diisi!', 'error');
      return;
    }

    onAddAsset({
      itemCode: itemCode.trim().toUpperCase(),
      itemName: itemName.trim(),
      category,
      acquisitionYear: Number(acquisitionYear),
      sourceOfFunds,
      purchaseCost: Number(purchaseCost),
      condition,
      location,
      picOfficial,
      notes,
    });

    showToast(`Inventaris ${itemName} berhasil dicatat dalam Buku Inventaris Aset Desa!`, 'success');
    setIsAddOpen(false);
    setItemCode('');
    setItemName('');
  };

  const handleExportExcel = () => {
    const headers = ['Kode Barang', 'Nama Barang', 'Kategori', 'Tahun', 'Sumber Dana', 'Nilai Perolehan', 'Kondisi', 'Lokasi', 'Penanggung Jawab'];
    const rows = assets.map(a => [
      a.itemCode,
      a.itemName,
      a.category,
      a.acquisitionYear,
      a.sourceOfFunds,
      a.purchaseCost,
      a.condition,
      a.location,
      a.picOfficial
    ]);
    downloadExcel(`Inventaris_Aset_Desa_${new Date().toISOString().substring(0, 10)}`, headers, rows);
    showToast('Berhasil mengunduh buku inventaris aset (.xls)', 'success');
  };

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Tata Kelola Pemerintahan' }, { label: 'Inventaris Aset Desa' }]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Ekspor Inventaris Excel</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Aset Desa</span>
            </button>
          </div>
        }
      />

      {/* Summary KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Nilai Perolehan Aset</span>
          <p className="text-xl font-black text-emerald-800 mt-1">{formatRupiah(totalAssetValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Jumlah Item Inventaris</span>
          <p className="text-xl font-black text-slate-900 mt-1">{assets.length} Unit / Bidang</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Kondisi Prima (Baik)</span>
          <p className="text-xl font-black text-blue-800 mt-1">
            {assets.filter(a => a.condition === 'Baik').length} Item
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari Kode Aset, Nama Barang, Lokasi..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Kategori Aset</option>
              <option value="Tanah">Tanah Kas Desa</option>
              <option value="Gedung/Bangunan">Gedung / Bangunan</option>
              <option value="Kendaraan">Kendaraan Dinas</option>
              <option value="Peralatan & Mesin">Peralatan & Mesin</option>
              <option value="Aset Tetap Lainnya">Aset Tetap Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Kode Aset</th>
                <th className="py-3 px-3">Nama Inventaris Barang</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Tahun & Sumber Dana</th>
                <th className="py-3 px-3">Nilai Perolehan</th>
                <th className="py-3 px-3">Kondisi</th>
                <th className="py-3 px-3">Lokasi / PIC</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data aset yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{a.itemCode}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div>{a.itemName}</div>
                      {a.notes && <p className="text-[10px] text-slate-500 font-normal">{a.notes}</p>}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{a.category}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{a.acquisitionYear}</div>
                      <div className="text-[10px] text-slate-500">{a.sourceOfFunds}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-800">
                      {formatRupiah(a.purchaseCost)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.condition === 'Baik' ? 'bg-emerald-100 text-emerald-800' :
                        a.condition === 'Rusak Ringan' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {a.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{a.location}</div>
                      <div className="text-[10px] text-slate-500">PIC: {a.picOfficial}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteAsset(a.id)}
                        className="rounded p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50"
                        title="Hapus / Hapus Buku Aset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Pencatatan Aset Desa Baru">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Barang / Registrasi</label>
              <input
                type="text"
                value={itemCode}
                onChange={e => setItemCode(e.target.value)}
                placeholder="AST-..."
                className="w-full rounded border border-slate-300 p-2 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Aset</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as VillageAsset['category'])}
                className="w-full rounded border border-slate-300 p-2 bg-white"
              >
                <option value="Tanah">Tanah Kas Desa</option>
                <option value="Gedung/Bangunan">Gedung / Bangunan</option>
                <option value="Kendaraan">Kendaraan Dinas</option>
                <option value="Peralatan & Mesin">Peralatan & Mesin</option>
                <option value="Aset Tetap Lainnya">Aset Tetap Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Inventaris Barang</label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="Contoh: Mobil Siaga Desa, Laptop Pelayanan Loket"
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Perolehan</label>
              <input
                type="number"
                value={acquisitionYear}
                onChange={e => setAcquisitionYear(Number(e.target.value))}
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nilai Perolehan (Rp)</label>
              <input
                type="number"
                value={purchaseCost}
                onChange={e => setPurchaseCost(Number(e.target.value))}
                className="w-full rounded border border-slate-300 p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
              <input
                type="text"
                value={sourceOfFunds}
                onChange={e => setSourceOfFunds(e.target.value)}
                placeholder="Dana Desa / APBDes"
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Fisik</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as VillageAsset['condition'])}
                className="w-full rounded border border-slate-300 p-2 bg-white"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lokasi Keberadaan</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Gudang Balai Desa"
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pejabat Pengelola (PIC)</label>
              <input
                type="text"
                value={picOfficial}
                onChange={e => setPicOfficial(e.target.value)}
                placeholder="Nama Pengurus Aset"
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
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
              Simpan Aset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
