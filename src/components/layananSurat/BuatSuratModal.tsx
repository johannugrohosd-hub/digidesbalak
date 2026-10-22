import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LetterType, Resident, User } from '../../types';
import { useToast } from '../common/Toast';
import { Search, UserCheck, FileText } from 'lucide-react';

interface BuatSuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterTypes: LetterType[];
  residents: Resident[];
  currentUser: User | null;
  onSubmit: (data: {
    letterTypeCode: string;
    residentId: string;
    purpose: string;
    extraFields: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }) => void;
}

export const BuatSuratModal: React.FC<BuatSuratModalProps> = ({
  isOpen,
  onClose,
  letterTypes,
  residents,
  currentUser,
  onSubmit,
}) => {
  const { showToast } = useToast();

  const [selectedTypeCode, setSelectedTypeCode] = useState(letterTypes[0]?.code || 'SKD');
  const [residentSearch, setResidentSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [purpose, setPurpose] = useState('');

  // Extra fields
  const [namaUsaha, setNamaUsaha] = useState('');
  const [jenisUsaha, setJenisUsaha] = useState('');
  const [alamatUsaha, setAlamatUsaha] = useState('');
  const [tahunBerdiri, setTahunBerdiri] = useState('2022');
  const [namaAnak, setNamaAnak] = useState('');
  const [sekolahTujuan, setSekolahTujuan] = useState('');
  const [instansiTujuan, setInstansiTujuan] = useState('');

  // Filter residents matching search
  const filteredResidents = residentSearch.trim()
    ? residents.filter(
        r =>
          r.fullName.toLowerCase().includes(residentSearch.toLowerCase()) ||
          r.nik.includes(residentSearch)
      ).slice(0, 5)
    : [];

  const handleSelectResident = (res: Resident) => {
    setSelectedResident(res);
    setResidentSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResident) {
      showToast('Harap pilih data penduduk pemohon surat!', 'error');
      return;
    }

    if (!purpose.trim()) {
      showToast('Keperluan surat wajib diisi!', 'error');
      return;
    }

    const extraFields: Record<string, string> = {};
    if (selectedTypeCode === 'SKU') {
      extraFields.namaUsaha = namaUsaha;
      extraFields.jenisUsaha = jenisUsaha;
      extraFields.alamatUsaha = alamatUsaha;
      extraFields.tahunBerdiri = tahunBerdiri;
    } else if (selectedTypeCode === 'SKTM') {
      extraFields.namaAnak = namaAnak;
      extraFields.sekolahTujuan = sekolahTujuan;
    } else {
      extraFields.instansiTujuan = instansiTujuan;
    }

    onSubmit({
      letterTypeCode: selectedTypeCode,
      residentId: selectedResident.id,
      purpose: purpose.trim(),
      extraFields,
      submissionChannel: 'Loket Kantor',
    });

    showToast('Permohonan surat berhasil dibuat di loket pelayanan!', 'success');
    onClose();
    // Reset
    setSelectedResident(null);
    setPurpose('');
  };

  const currentType = letterTypes.find(lt => lt.code === selectedTypeCode);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Permohonan Surat Baru (Loket Pelayanan)" maxWidth="4xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
        {/* Pilih Jenis Surat */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            Pilih Jenis Surat Layanan <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTypeCode}
            onChange={e => setSelectedTypeCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs sm:text-sm font-semibold focus:border-emerald-600 focus:outline-hidden bg-white text-slate-800"
          >
            {letterTypes.map(lt => (
              <option key={lt.id} value={lt.code}>
                [{lt.code}] - {lt.name} ({lt.category})
              </option>
            ))}
          </select>
          {currentType && (
            <p className="mt-1 text-[11px] text-slate-500 italic">
              {currentType.description} • Syarat berkas: {currentType.requiredDocuments.join(', ')}
            </p>
          )}
        </div>

        {/* Pencarian Penduduk Pemohon */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            Pilih Warga Pemohon (Kependudukan) <span className="text-red-500">*</span>
          </label>

          {selectedResident ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/70 p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-600 p-2 text-white">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedResident.fullName}</p>
                  <p className="text-xs text-slate-600">
                    NIK: <span className="font-mono">{selectedResident.nik}</span> • KK: {selectedResident.cardNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedResident.address}, RT {selectedResident.rt}/RW {selectedResident.rw}, {selectedResident.districtName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 bg-white px-2.5 py-1 rounded shadow-2xs"
              >
                Ganti Warga
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={residentSearch}
                  onChange={e => setResidentSearch(e.target.value)}
                  placeholder="Ketik Nama Lengkap atau NIK warga..."
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {filteredResidents.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-md divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {filteredResidents.map(res => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectResident(res)}
                      className="w-full p-2.5 text-left hover:bg-emerald-50 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{res.fullName}</span>
                        <span className="text-slate-500 ml-2 font-mono">({res.nik})</span>
                        <p className="text-[11px] text-slate-400">{res.districtName} - RT {res.rt}/RW {res.rw}</p>
                      </div>
                      <span className="text-emerald-700 font-bold">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keperluan Surat */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            Keperluan Permohonan Surat <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="Contoh: Pengajuan Kredit Usaha Rakyat (KUR) BRI / Persyaratan Beasiswa Kuliah..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
            required
          />
        </div>

        {/* Form Spesifik Jenis Surat */}
        {selectedTypeCode === 'SKU' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
              Data Usaha (Surat Keterangan Usaha)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Nama Usaha / Toko</label>
                <input
                  type="text"
                  value={namaUsaha}
                  onChange={e => setNamaUsaha(e.target.value)}
                  placeholder="Contoh: Toko Berkah Mandiri"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Jenis / Bidang Usaha</label>
                <input
                  type="text"
                  value={jenisUsaha}
                  onChange={e => setJenisUsaha(e.target.value)}
                  placeholder="Contoh: Perdagangan Sembako"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 text-xs mb-1">Alamat Tempat Usaha</label>
                <input
                  type="text"
                  value={alamatUsaha}
                  onChange={e => setAlamatUsaha(e.target.value)}
                  placeholder="Contoh: Jl. Raya Sukamaju No. 15"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {selectedTypeCode === 'SKTM' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <h5 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
              Data Keringanan (SKTM)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Nama Anak / Pasien</label>
                <input
                  type="text"
                  value={namaAnak}
                  onChange={e => setNamaAnak(e.target.value)}
                  placeholder="Nama penerima manfaat SKTM"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Sekolah / Kampus / Rumah Sakit</label>
                <input
                  type="text"
                  value={sekolahTujuan}
                  onChange={e => setSekolahTujuan(e.target.value)}
                  placeholder="Nama instansi tujuan"
                  className="w-full rounded border border-slate-300 p-2 text-xs bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tombol Simpan */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            Ajukan Permohonan Surat
          </button>
        </div>
      </form>
    </Modal>
  );
};
