import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Printer,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Users,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { Resident, VillageDistrict, VillageSettings, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { PendudukModal } from './PendudukModal';
import { PendudukDetailModal } from './PendudukDetailModal';
import { ImportExportModal } from './ImportExportModal';
import { calculateAge, formatDateIndo } from '../../utils/formatters';
import { useToast } from '../common/Toast';

interface PendudukListProps {
  residents: Resident[];
  districts: VillageDistrict[];
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onSaveResident: (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  onDeleteResident: (id: string) => void;
  onImportResidents: (newResidents: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export const PendudukList: React.FC<PendudukListProps> = ({
  residents,
  districts,
  settings,
  currentUser,
  onNavigate,
  onSaveResident,
  onDeleteResident,
  onImportResidents,
}) => {
  const { showToast } = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'nik' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState<Resident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Resident | null>(null);

  // Filtered & Sorted residents
  const filteredResidents = useMemo(() => {
    return residents
      .filter((r) => {
        const matchesSearch =
          r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.nik.includes(searchTerm) ||
          r.cardNumber.includes(searchTerm);

        const matchesDistrict =
          selectedDistrict === 'ALL' || r.districtName === selectedDistrict;

        const matchesGender =
          selectedGender === 'ALL' || r.gender === selectedGender;

        const matchesStatus =
          selectedStatus === 'ALL' || r.status === selectedStatus;

        return matchesSearch && matchesDistrict && matchesGender && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') comp = a.fullName.localeCompare(b.fullName);
        else if (sortBy === 'nik') comp = a.nik.localeCompare(b.nik);
        else if (sortBy === 'date') comp = a.birthDate.localeCompare(b.birthDate);
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [residents, searchTerm, selectedDistrict, selectedGender, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage) || 1;
  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (res: Resident) => {
    setResidentToEdit(res);
    setIsFormOpen(true);
  };

  const handleViewDetail = (res: Resident) => {
    setSelectedResident(res);
    setIsDetailOpen(true);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      onDeleteResident(deleteCandidate.id);
      showToast(`Data penduduk ${deleteCandidate.fullName} berhasil dihapus/diarsipkan`, 'success');
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Quick Actions */}
      <Breadcrumb
        items={[{ label: 'Administrasi Kependudukan' }, { label: 'Data Penduduk' }]}
        onNavigate={onNavigate}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Impor / Ekspor Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>Cetak Tabel</span>
            </button>
            <button
              onClick={() => {
                setResidentToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Penduduk</span>
            </button>
          </div>
        }
      />

      {/* Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Terdaftar</span>
          <p className="text-xl font-black text-slate-900 mt-1">{residents.length} Jiwa</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Laki-Laki</span>
          <p className="text-xl font-black text-sky-800 mt-1">
            {residents.filter(r => r.gender === 'LAKI_LAKI').length} Jiwa
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Perempuan</span>
          <p className="text-xl font-black text-pink-800 mt-1">
            {residents.filter(r => r.gender === 'PEREMPUAN').length} Jiwa
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Wajib KTP (≥17 Thn)</span>
          <p className="text-xl font-black text-emerald-800 mt-1">
            {residents.filter(r => calculateAge(r.birthDate) >= 17).length} Orang
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Nama, NIK, No KK..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Filter Dusun */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Dusun</option>
              {districts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Jenis Kelamin</option>
              <option value="LAKI_LAKI">Laki-Laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="ALL">Semua Status Kependudukan</option>
              <option value="Tetap">Tetap</option>
              <option value="Pindah Masuk">Pindah Masuk</option>
              <option value="Pindah Keluar">Pindah Keluar</option>
              <option value="Meninggal">Meninggal Dunia</option>
              <option value="Sementara">Sementara</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => { setSortBy('nik'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>NIK & No KK</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Nama Lengkap</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">JK / Usia</th>
                <th className="py-3 px-3">Dusun / RT / RW</th>
                <th className="py-3 px-3">SHDK</th>
                <th className="py-3 px-3">Pekerjaan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedResidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data penduduk yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedResidents.map((resident, idx) => {
                  const age = calculateAge(resident.birthDate);
                  return (
                    <tr key={resident.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">{resident.nik}</div>
                        <div className="text-[11px] text-slate-500 font-mono">KK: {resident.cardNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">{resident.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {resident.birthPlace}, {formatDateIndo(resident.birthDate)}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block font-bold text-[10px] px-1.5 py-0.5 rounded mr-1.5 ${
                          resident.gender === 'LAKI_LAKI' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {resident.gender === 'LAKI_LAKI' ? 'L' : 'P'}
                        </span>
                        <span className="text-slate-700 font-medium">{age} Thn</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{resident.districtName}</div>
                        <div className="text-[11px] text-slate-500">RT {resident.rt} / RW {resident.rw}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {resident.familyRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{resident.occupation}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          resident.status === 'Tetap' ? 'bg-emerald-100 text-emerald-800' :
                          resident.status === 'Meninggal' ? 'bg-slate-200 text-slate-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {resident.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewDetail(resident)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                            title="Lihat Biodata / KTP"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(resident)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition"
                            title="Edit Data"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(resident)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
                            title="Hapus / Arsipkan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 no-print">
          <div>
            Menampilkan <span className="font-bold">{paginatedResidents.length}</span> dari{' '}
            <span className="font-bold">{filteredResidents.length}</span> data penduduk
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2.5">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Konfirmasi Penghapusan</h3>
                <p className="text-xs text-slate-500">Tindakan ini memerlukan verifikasi petugas</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus/mengarsipkan data penduduk <b>{deleteCandidate.fullName}</b> (NIK: {deleteCandidate.nik})? Data ini akan dicatat dalam audit log.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <PendudukModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setResidentToEdit(null);
        }}
        residentToEdit={residentToEdit}
        districts={districts}
        onSave={onSaveResident}
      />

      {/* Modal Detail KTP */}
      <PendudukDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedResident(null);
        }}
        resident={selectedResident}
        settings={settings}
      />

      {/* Modal Impor / Ekspor */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        residents={residents}
        onImportResidents={onImportResidents}
      />
    </div>
  );
};
