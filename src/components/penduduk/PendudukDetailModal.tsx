import React from 'react';
import { Modal } from '../common/Modal';
import { Resident, VillageSettings } from '../../types';
import { calculateAge, formatDateIndo } from '../../utils/formatters';
import { Printer, UserCheck, Shield, MapPin, Building, CreditCard } from 'lucide-react';

interface PendudukDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  settings: VillageSettings;
}

export const PendudukDetailModal: React.FC<PendudukDetailModalProps> = ({
  isOpen,
  onClose,
  resident,
  settings
}) => {
  if (!resident) return null;

  const age = calculateAge(resident.birthDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biodata Penduduk & Identitas Kependudukan" maxWidth="2xl">
      <div className="space-y-6">
        {/* Indonesian Electronic KTP Card Mockup */}
        <div className="rounded-xl border-2 border-sky-300 bg-linear-to-br from-sky-100 via-sky-50 to-blue-100 p-5 shadow-md text-slate-900 relative overflow-hidden">
          {/* Watermark Garuda / Republic */}
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <Building className="h-32 w-32 text-sky-900" />
          </div>

          <div className="text-center border-b border-sky-300/80 pb-2 mb-3">
            <h3 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-sky-900">
              PROVINSI {settings.provinceName}
            </h3>
            <h4 className="font-bold text-xs tracking-wider uppercase text-sky-800">
              {settings.regencyName}
            </h4>
          </div>

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-slate-950 bg-sky-200/60 px-2 py-0.5 rounded border border-sky-300">
                NIK: {resident.nik}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              resident.status === 'Tetap' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {resident.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div className="sm:col-span-2 space-y-1.5 leading-relaxed">
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Nama</span>
                <span className="col-span-2 font-bold uppercase text-slate-950">: {resident.fullName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Tempat/Tgl Lahir</span>
                <span className="col-span-2 font-semibold">: {resident.birthPlace}, {formatDateIndo(resident.birthDate)} ({age} Thn)</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Jenis Kelamin</span>
                <span className="col-span-2">: {resident.gender === 'LAKI_LAKI' ? 'LAKI-LAKI' : 'PEREMPUAN'} &nbsp;&nbsp; Gol. Darah: <b>{resident.bloodType}</b></span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Alamat</span>
                <span className="col-span-2">: {resident.address}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 pl-2">RT / RW</span>
                <span className="col-span-2">: {resident.rt} / {resident.rw}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 pl-2">Kel/Desa</span>
                <span className="col-span-2">: {settings.villageName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 pl-2">Kecamatan</span>
                <span className="col-span-2">: {settings.districtName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Agama</span>
                <span className="col-span-2">: {resident.religion}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Status Perkawinan</span>
                <span className="col-span-2">: {resident.maritalStatus}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Pekerjaan</span>
                <span className="col-span-2 font-semibold">: {resident.occupation}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Kewarganegaraan</span>
                <span className="col-span-2">: {resident.citizenship}</span>
              </div>
            </div>

            {/* Photo Avatar / Stamp */}
            <div className="flex flex-col items-center justify-between border-l border-sky-300/80 pl-4">
              <div className="w-24 h-32 bg-slate-200 border-2 border-white shadow-inner rounded flex items-center justify-center text-slate-400">
                <UserCheck className="w-12 h-12 text-sky-800" />
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-600 font-mono block">BERLAKU HINGGA</span>
                <span className="text-xs font-bold text-slate-900 font-mono">SEUMUR HIDUP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Administrative Information */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-emerald-700" />
            Informasi Kartu Keluarga & Orang Tua
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">Nomor Kartu Keluarga (KK):</span>
              <span className="font-mono font-bold text-slate-900">{resident.cardNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Kedudukan dlm Keluarga (SHDK):</span>
              <span className="font-bold text-emerald-800">{resident.familyRole}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pendidikan Terakhir:</span>
              <span className="font-semibold text-slate-800">{resident.education}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Wilayah Dusun:</span>
              <span className="font-semibold text-slate-800">{resident.districtName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nama Ayah Kandung:</span>
              <span className="text-slate-800">{resident.fatherName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nama Ibu Kandung:</span>
              <span className="text-slate-800">{resident.motherName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">No. Telepon / WhatsApp:</span>
              <span className="text-slate-800">{resident.phone || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tgl Terdaftar di Sistem:</span>
              <span className="text-slate-600">{resident.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>Cetak Kartu Biodata</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-800 px-5 py-2 font-bold text-white hover:bg-emerald-900 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
