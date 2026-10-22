import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Users,
  CreditCard,
  FileText,
  Package,
  Building
} from 'lucide-react';
import {
  Resident,
  FamilyCard,
  LetterRequest,
  Complaint,
  VillageAsset,
  VillageDistrict,
  VillageSettings,
  User
} from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { formatDateIndo, formatRupiah, downloadCSV, downloadExcel } from '../../utils/formatters';
import { useToast } from '../common/Toast';

interface LaporanViewProps {
  residents: Resident[];
  familyCards: FamilyCard[];
  letterRequests: LetterRequest[];
  complaints: Complaint[];
  assets: VillageAsset[];
  districts: VillageDistrict[];
  settings: VillageSettings;
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  residents,
  familyCards,
  letterRequests,
  complaints,
  assets,
  districts,
  settings,
  currentUser,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState<'penduduk' | 'surat' | 'kk' | 'aset' | 'pengaduan'>('penduduk');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Filtered residents based on district
  const filteredResidents = residents.filter(
    r => selectedDistrict === 'ALL' || r.districtName === selectedDistrict
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (selectedReport === 'penduduk') {
      const headers = ['NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Dusun', 'RT', 'RW', 'Agama', 'Status Kawin', 'Pekerjaan'];
      const rows = filteredResidents.map(r => [
        r.nik,
        r.fullName,
        r.gender === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan',
        r.districtName,
        r.rt,
        r.rw,
        r.religion,
        r.maritalStatus,
        r.occupation
      ]);
      downloadCSV(`Rekap_Penduduk_${settings.villageName}`, headers, rows);
    } else if (selectedReport === 'surat') {
      const headers = ['No Registrasi', 'No Resmi', 'Jenis Surat', 'Nama Pemohon', 'NIK', 'Keperluan', 'Status', 'Tanggal'];
      const rows = letterRequests.map(r => [
        r.requestNumber,
        r.officialLetterNumber || '-',
        r.letterTypeName,
        r.residentName,
        r.nik,
        r.purpose,
        r.status,
        formatDateIndo(r.submittedAt)
      ]);
      downloadCSV(`Rekap_Pelayanan_Surat_${settings.villageName}`, headers, rows);
    } else if (selectedReport === 'aset') {
      const headers = ['Kode', 'Nama Aset', 'Kategori', 'Tahun', 'Nilai', 'Kondisi', 'Lokasi'];
      const rows = assets.map(a => [
        a.itemCode,
        a.itemName,
        a.category,
        a.acquisitionYear,
        a.purchaseCost,
        a.condition,
        a.location
      ]);
      downloadCSV(`Rekap_Aset_${settings.villageName}`, headers, rows);
    }
    showToast('Berhasil mengunduh laporan format CSV', 'success');
  };

  const handleExportExcel = () => {
    if (selectedReport === 'penduduk') {
      const headers = ['NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Dusun', 'RT', 'RW', 'Agama', 'Status Kawin', 'Pekerjaan'];
      const rows = filteredResidents.map(r => [
        r.nik,
        r.fullName,
        r.gender === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan',
        r.districtName,
        r.rt,
        r.rw,
        r.religion,
        r.maritalStatus,
        r.occupation
      ]);
      downloadExcel(`Rekapitulasi_Penduduk_${settings.villageName}`, headers, rows);
    } else if (selectedReport === 'surat') {
      const headers = ['No Registrasi', 'No Resmi', 'Jenis Surat', 'Nama Pemohon', 'NIK', 'Keperluan', 'Status', 'Tanggal'];
      const rows = letterRequests.map(r => [
        r.requestNumber,
        r.officialLetterNumber || '-',
        r.letterTypeName,
        r.residentName,
        r.nik,
        r.purpose,
        r.status,
        formatDateIndo(r.submittedAt)
      ]);
      downloadExcel(`Rekapitulasi_Pelayanan_Surat_${settings.villageName}`, headers, rows);
    } else if (selectedReport === 'aset') {
      const headers = ['Kode', 'Nama Aset', 'Kategori', 'Tahun', 'Nilai', 'Kondisi', 'Lokasi'];
      const rows = assets.map(a => [
        a.itemCode,
        a.itemName,
        a.category,
        a.acquisitionYear,
        a.purchaseCost,
        a.condition,
        a.location
      ]);
      downloadExcel(`Rekapitulasi_Aset_Desa_${settings.villageName}`, headers, rows);
    }
    showToast('Berhasil mengunduh spreadsheet Excel (.xls)', 'success');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Laporan & Sistem' }, { label: 'Rekapitulasi Laporan' }]}
        onNavigate={onNavigate}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Laporan Resmi PDF</span>
            </button>
          </div>
        }
      />

      {/* Report Types Tabs */}
      <div className="flex border-b border-slate-200 no-print overflow-x-auto">
        <button
          onClick={() => setSelectedReport('penduduk')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold whitespace-nowrap transition ${
            selectedReport === 'penduduk'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Rekapitulasi Kependudukan</span>
        </button>

        <button
          onClick={() => setSelectedReport('surat')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold whitespace-nowrap transition ${
            selectedReport === 'surat'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Rekap Pelayanan E-Surat</span>
        </button>

        <button
          onClick={() => setSelectedReport('aset')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold whitespace-nowrap transition ${
            selectedReport === 'aset'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Rekap Inventaris Aset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Wilayah Dusun:</span>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-800 font-semibold"
          >
            <option value="ALL">Semua Dusun</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-500 font-mono">Tahun Anggaran: {settings.fiscalYear}</span>
      </div>

      {/* Printable Official Report Paper */}
      <div className="surat-paper rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-slate-900 space-y-6">
        {/* Kop Surat Laporan */}
        <div className="text-center border-b-2 border-slate-900 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            PEMERINTAH {settings.regencyName.toUpperCase()} • {settings.districtName.toUpperCase()}
          </h4>
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-950 mt-0.5">
            KANTOR KEPALA {settings.villageName.toUpperCase()}
          </h2>
          <p className="text-[11px] text-slate-600">
            {settings.officeAddress} • Telp: {settings.phone} • Email: {settings.email}
          </p>
        </div>

        {/* Judul Laporan */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold uppercase underline">
            {selectedReport === 'penduduk' && 'LAPORAN REKAPITULASI DATA KEPENDUDUKAN DESA'}
            {selectedReport === 'surat' && 'LAPORAN REKAPITULASI PELAYANAN SURAT ADMINISTRASI DESA'}
            {selectedReport === 'aset' && 'LAPORAN BUKU INVENTARISASI BARANG MILIK DESA (ASET)'}
          </h3>
          <p className="text-xs text-slate-600">
            Periode Tahun {settings.fiscalYear} • Tanggal Cetak: {formatDateIndo(new Date().toISOString())}
          </p>
        </div>

        {/* Tabel Data Rekap */}
        {selectedReport === 'penduduk' && (
          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border-r border-slate-300">NIK</th>
                  <th className="p-2 border-r border-slate-300">Nama Lengkap</th>
                  <th className="p-2 border-r border-slate-300 text-center">JK</th>
                  <th className="p-2 border-r border-slate-300">Dusun / RT / RW</th>
                  <th className="p-2 border-r border-slate-300">Status Kawin</th>
                  <th className="p-2">Pekerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResidents.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="p-2 text-center border-r border-slate-300">{idx + 1}</td>
                    <td className="p-2 font-mono border-r border-slate-300">{r.nik}</td>
                    <td className="p-2 font-bold uppercase border-r border-slate-300">{r.fullName}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-bold">
                      {r.gender === 'LAKI_LAKI' ? 'L' : 'P'}
                    </td>
                    <td className="p-2 border-r border-slate-300">{r.districtName} (RT {r.rt}/RW {r.rw})</td>
                    <td className="p-2 border-r border-slate-300">{r.maritalStatus}</td>
                    <td className="p-2">{r.occupation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'surat' && (
          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border-r border-slate-300">No. Registrasi / Surat</th>
                  <th className="p-2 border-r border-slate-300">Jenis Layanan</th>
                  <th className="p-2 border-r border-slate-300">Nama Pemohon (NIK)</th>
                  <th className="p-2 border-r border-slate-300">Keperluan</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {letterRequests.map((req, idx) => (
                  <tr key={req.id}>
                    <td className="p-2 text-center border-r border-slate-300">{idx + 1}</td>
                    <td className="p-2 font-mono font-bold border-r border-slate-300">
                      {req.officialLetterNumber || req.requestNumber}
                    </td>
                    <td className="p-2 font-bold border-r border-slate-300">{req.letterTypeName}</td>
                    <td className="p-2 border-r border-slate-300">
                      {req.residentName} <span className="font-mono text-[10px] text-slate-500">({req.nik})</span>
                    </td>
                    <td className="p-2 border-r border-slate-300">{req.purpose}</td>
                    <td className="p-2 text-center font-bold">{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'aset' && (
          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border-r border-slate-300">Kode Barang</th>
                  <th className="p-2 border-r border-slate-300">Nama Inventaris</th>
                  <th className="p-2 border-r border-slate-300">Kategori</th>
                  <th className="p-2 border-r border-slate-300">Tahun & Sumber</th>
                  <th className="p-2 border-r border-slate-300">Nilai (Rp)</th>
                  <th className="p-2 text-center">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="p-2 text-center border-r border-slate-300">{idx + 1}</td>
                    <td className="p-2 font-mono font-bold border-r border-slate-300">{a.itemCode}</td>
                    <td className="p-2 font-bold border-r border-slate-300">{a.itemName}</td>
                    <td className="p-2 border-r border-slate-300">{a.category}</td>
                    <td className="p-2 border-r border-slate-300">{a.acquisitionYear} ({a.sourceOfFunds})</td>
                    <td className="p-2 font-bold border-r border-slate-300">{formatRupiah(a.purchaseCost)}</td>
                    <td className="p-2 text-center font-bold">{a.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tanda Tangan Pengesahan Laporan */}
        <div className="grid grid-cols-2 pt-8 text-center text-xs">
          <div>
            <p className="font-semibold text-slate-700">Mengetahui,</p>
            <p className="font-bold uppercase text-slate-900">SEKRETARIS DESA</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase text-slate-900">{settings.secretaryName}</p>
          </div>
          <div>
            <p className="text-slate-600">
              {settings.villageName.replace('Desa ', '')}, {formatDateIndo(new Date().toISOString())}
            </p>
            <p className="font-bold uppercase text-slate-900">
              KEPALA {settings.villageName.toUpperCase()}
            </p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase text-slate-900">{settings.villageHeadName}</p>
            <p className="font-mono text-[10px] text-slate-600">NIP: {settings.villageHeadNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
