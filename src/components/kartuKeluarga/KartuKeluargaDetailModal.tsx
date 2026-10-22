import React from 'react';
import { Modal } from '../common/Modal';
import { FamilyCard, Resident, VillageSettings } from '../../types';
import { formatDateIndo } from '../../utils/formatters';
import { Printer, Building, CreditCard } from 'lucide-react';

interface KartuKeluargaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyCard: FamilyCard | null;
  members: Resident[];
  settings: VillageSettings;
}

export const KartuKeluargaDetailModal: React.FC<KartuKeluargaDetailModalProps> = ({
  isOpen,
  onClose,
  familyCard,
  members,
  settings,
}) => {
  if (!familyCard) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Kartu Keluarga (KK)" maxWidth="5xl">
      <div className="space-y-6">
        {/* Official Blanko Kartu Keluarga Display */}
        <div className="surat-paper rounded-xl border border-slate-300 bg-white p-6 shadow-sm space-y-4">
          {/* Header Kartu Keluarga Republik Indonesia */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h2 className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 uppercase">
              KARTU KELUARGA
            </h2>
            <p className="font-mono text-base font-extrabold text-slate-800 tracking-wider">
              No. {familyCard.cardNumber}
            </p>
          </div>

          {/* KK Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs border-b border-slate-200 pb-3">
            <div className="space-y-1">
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Nama Kepala Keluarga</span>
                <span className="col-span-2 font-bold uppercase text-slate-900">: {familyCard.headFamilyName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Alamat</span>
                <span className="col-span-2 font-medium text-slate-800">: {familyCard.address}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">RT / RW</span>
                <span className="col-span-2 font-medium text-slate-800">: {familyCard.rt} / {familyCard.rw}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Dusun / Wilayah</span>
                <span className="col-span-2 font-medium text-slate-800">: {familyCard.districtName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Desa / Kelurahan</span>
                <span className="col-span-2 font-medium text-slate-800">: {settings.villageName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Kecamatan</span>
                <span className="col-span-2 font-medium text-slate-800">: {settings.districtName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Kabupaten / Kota</span>
                <span className="col-span-2 font-medium text-slate-800">: {settings.regencyName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-medium text-slate-600">Kode Pos</span>
                <span className="col-span-2 font-medium text-slate-800">: {familyCard.postalCode || settings.postalCode}</span>
              </div>
            </div>
          </div>

          {/* Table Anggota Bagian 1 */}
          <div className="space-y-1">
            <h5 className="font-bold text-[11px] uppercase text-slate-700">I. Daftar Anggota Keluarga</h5>
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                  <tr>
                    <th className="p-1.5 border-r border-slate-300 text-center w-8">No</th>
                    <th className="p-1.5 border-r border-slate-300">Nama Lengkap</th>
                    <th className="p-1.5 border-r border-slate-300">NIK</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">JK</th>
                    <th className="p-1.5 border-r border-slate-300">Tempat Lahir</th>
                    <th className="p-1.5 border-r border-slate-300">Tgl Lahir</th>
                    <th className="p-1.5 border-r border-slate-300">Agama</th>
                    <th className="p-1.5 border-r border-slate-300">Pendidikan</th>
                    <th className="p-1.5">Pekerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-1.5 text-center border-r border-slate-300 font-medium">{idx + 1}</td>
                      <td className="p-1.5 border-r border-slate-300 font-bold uppercase">{m.fullName}</td>
                      <td className="p-1.5 border-r border-slate-300 font-mono">{m.nik}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                        {m.gender === 'LAKI_LAKI' ? 'L' : 'P'}
                      </td>
                      <td className="p-1.5 border-r border-slate-300">{m.birthPlace}</td>
                      <td className="p-1.5 border-r border-slate-300">{formatDateIndo(m.birthDate)}</td>
                      <td className="p-1.5 border-r border-slate-300">{m.religion}</td>
                      <td className="p-1.5 border-r border-slate-300">{m.education}</td>
                      <td className="p-1.5">{m.occupation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Anggota Bagian 2 (Status Kawin, SHDK, Orang Tua) */}
          <div className="space-y-1 pt-2">
            <h5 className="font-bold text-[11px] uppercase text-slate-700">II. Status Hubungan & Orang Tua</h5>
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                  <tr>
                    <th className="p-1.5 border-r border-slate-300 text-center w-8">No</th>
                    <th className="p-1.5 border-r border-slate-300">Status Perkawinan</th>
                    <th className="p-1.5 border-r border-slate-300">Status dlm Keluarga</th>
                    <th className="p-1.5 border-r border-slate-300">Kewarganegaraan</th>
                    <th className="p-1.5 border-r border-slate-300">Nama Ayah</th>
                    <th className="p-1.5">Nama Ibu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-1.5 text-center border-r border-slate-300 font-medium">{idx + 1}</td>
                      <td className="p-1.5 border-r border-slate-300">{m.maritalStatus}</td>
                      <td className="p-1.5 border-r border-slate-300 font-bold text-emerald-800">{m.familyRole}</td>
                      <td className="p-1.5 border-r border-slate-300">{m.citizenship}</td>
                      <td className="p-1.5 border-r border-slate-300 uppercase">{m.fatherName || '-'}</td>
                      <td className="p-1.5 uppercase">{m.motherName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tanda Tangan Kartu Keluarga */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs">
            <div>
              <p className="font-medium text-slate-600">KEPALA KELUARGA</p>
              <div className="h-16"></div>
              <p className="font-bold uppercase text-slate-900 border-b border-slate-900 inline-block px-4">
                {familyCard.headFamilyName}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-600">
                {settings.villageName}, {formatDateIndo(familyCard.issuedDate || new Date().toISOString())}
              </p>
              <p className="font-semibold text-slate-700">KEPALA DESA {settings.villageName.toUpperCase()}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-mono text-[10px] text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded">
                  [TERVERIFIKASI SISTEM DIGITAL DESA]
                </span>
              </div>
              <p className="font-bold uppercase text-slate-900 border-b border-slate-900 inline-block px-4">
                {settings.villageHeadName}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIP: {settings.villageHeadNip}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Printer className="h-4 w-4 text-emerald-700" />
            <span>Cetak Kartu Keluarga Resmi</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-800 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
