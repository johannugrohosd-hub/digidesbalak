import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Resident } from '../../types';
import { useToast } from '../common/Toast';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, Check } from 'lucide-react';
import { downloadCSV, downloadExcel } from '../../utils/formatters';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  onImportResidents: (newResidents: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  residents,
  onImportResidents,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  // Prepare standard export data
  const headers = [
    'NIK',
    'No KK',
    'Nama Lengkap',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Agama',
    'Status Kawin',
    'SHDK',
    'Pendidikan',
    'Pekerjaan',
    'Alamat',
    'RT',
    'RW',
    'Dusun',
    'Status'
  ];

  const rows = residents.map(r => [
    r.nik,
    r.cardNumber,
    r.fullName,
    r.birthPlace,
    r.birthDate,
    r.gender === 'LAKI_LAKI' ? 'L' : 'P',
    r.religion,
    r.maritalStatus,
    r.familyRole,
    r.education,
    r.occupation,
    r.address,
    r.rt,
    r.rw,
    r.districtName,
    r.status
  ]);

  const handleExportCSV = () => {
    downloadCSV(`Data_Penduduk_Desa_${new Date().toISOString().substring(0, 10)}`, headers, rows);
    showToast('Berhasil mengunduh data penduduk format CSV', 'success');
    onClose();
  };

  const handleExportExcel = () => {
    downloadExcel(`Data_Penduduk_Desa_${new Date().toISOString().substring(0, 10)}`, headers, rows);
    showToast('Berhasil mengunduh spreadsheet Excel (.xls)', 'success');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);

      // Parse lines
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast('File CSV tidak memiliki baris data!', 'error');
        return;
      }

      const parsed: any[] = [];
      // Assume line 0 is header
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 6) {
          parsed.push({
            nik: cols[0] || `320112${Date.now().toString().slice(-10)}`,
            cardNumber: cols[1] || '3201122005080001',
            fullName: cols[2] || 'Warga Baru',
            birthPlace: cols[3] || 'Bogor',
            birthDate: cols[4] || '1995-05-10',
            gender: cols[5]?.toUpperCase().startsWith('P') ? 'PEREMPUAN' : 'LAKI_LAKI',
            religion: (cols[6] || 'Islam') as Resident['religion'],
            maritalStatus: (cols[7] || 'Belum Kawin') as Resident['maritalStatus'],
            familyRole: (cols[8] || 'Anak') as Resident['familyRole'],
            education: cols[9] || 'SMA',
            occupation: cols[10] || 'Wiraswasta',
            citizenship: 'WNI',
            address: cols[11] || 'Kp. Sukamaju',
            rt: cols[12] || '01',
            rw: cols[13] || '01',
            districtName: cols[14] || 'Dusun Krajan',
            status: 'Tetap',
            bloodType: '-',
          });
        }
      }
      setParsedRows(parsed);
      showToast(`Terdeteksi ${parsed.length} baris data penduduk dari CSV`, 'info');
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (parsedRows.length === 0) {
      showToast('Tidak ada data valid untuk diimpor!', 'error');
      return;
    }

    try {
      onImportResidents(parsedRows);
      showToast(`Berhasil mengimpor ${parsedRows.length} data penduduk!`, 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Gagal memproses impor', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Impor & Ekspor Data Kependudukan" maxWidth="2xl">
      <div className="space-y-5">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Data ({residents.length} Penduduk)</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Impor Data dari CSV / Excel</span>
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Ekspor seluruh data kependudukan desa saat ini ke dalam format spreadsheet yang kompatibel dengan Microsoft Excel, Google Sheets, dan aplikasi pelaporan pemerintah daerah.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-xs"
              >
                <FileSpreadsheet className="h-6 w-6 text-emerald-700" />
                <div className="text-left">
                  <span className="block text-sm">Unduh File Excel (.xls)</span>
                  <span className="block text-[10px] text-emerald-700 font-normal">Tabel berformat rapi dengan kop</span>
                </div>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 font-bold text-slate-800 hover:bg-slate-100 transition shadow-xs"
              >
                <Download className="h-6 w-6 text-slate-600" />
                <div className="text-left">
                  <span className="block text-sm">Unduh File CSV (.csv)</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Format standar migrasi database</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-emerald-500 transition">
              <UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-800">Pilih file CSV data penduduk</p>
              <p className="text-[11px] text-slate-500 mt-1">Format kolom: NIK, No KK, Nama, Tempat Lahir, Tgl Lahir, JK, Agama, Kawin, SHDK, Pendidikan, Pekerjaan, Alamat, RT, RW, Dusun</p>
              <label className="mt-3 inline-block cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs">
                Jelajahi File
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Pratinjau Impor: {parsedRows.length} Data Siap Masuk</span>
                  <span className="text-emerald-700">Valid</span>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 font-semibold text-slate-600 border-b">
                      <tr>
                        <th className="p-2">NIK</th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">JK</th>
                        <th className="p-2">Dusun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono text-[11px]">{row.nik}</td>
                          <td className="p-2 font-medium">{row.fullName}</td>
                          <td className="p-2">{row.gender === 'LAKI_LAKI' ? 'L' : 'P'}</td>
                          <td className="p-2">{row.districtName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleProcessImport}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                  >
                    <Check className="h-4 w-4" />
                    <span>Konfirmasi & Simpan ke Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
