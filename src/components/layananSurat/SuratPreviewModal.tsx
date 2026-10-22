import React from 'react';
import { Modal } from '../common/Modal';
import { LetterRequest, Resident, VillageSettings, User } from '../../types';
import { formatDateIndo } from '../../utils/formatters';
import { Printer, ShieldCheck, Download, CheckCircle2, QrCode } from 'lucide-react';

interface SuratPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterRequest: LetterRequest | null;
  resident: Resident | null;
  settings: VillageSettings;
  currentUser: User | null;
}

export const SuratPreviewModal: React.FC<SuratPreviewModalProps> = ({
  isOpen,
  onClose,
  letterRequest,
  resident,
  settings,
  currentUser,
}) => {
  if (!letterRequest || !resident) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = formatDateIndo(new Date().toISOString(), true);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pratinjau Surat Resmi Desa (Siap Cetak PDF)" maxWidth="4xl">
      <div className="space-y-6">
        {/* Printable Official Village Letter Sheet */}
        <div className="surat-paper mx-auto max-w-2xl bg-white p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 font-serif leading-relaxed text-sm">
          {/* 1. KOP SURAT PEMERINTAHAN DESA */}
          {settings.letterheadType === 'CUSTOM_BANNER' && settings.letterheadBannerUrl ? (
            <div className="mb-6 pb-2 border-b-2 border-slate-900">
              <img
                src={settings.letterheadBannerUrl}
                alt="Kop Surat Resmi"
                className="w-full max-h-36 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6 text-center">
              {/* Logo Lambang Daerah */}
              <div className="w-20 flex justify-center shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo Desa"
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-slate-400 bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-700">
                    <span className="font-sans font-black text-emerald-800 text-lg">DESA</span>
                  </div>
                )}
              </div>

              {/* Nama & Instansi Kop */}
              <div className="flex-1 px-4">
                <h4 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  {settings.letterheadTitle1 || `PEMERINTAH ${settings.regencyName.toUpperCase()}`}
                </h4>
                <h4 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  {settings.letterheadTitle2 || settings.districtName.toUpperCase()}
                </h4>
                <h2 className="font-sans text-base sm:text-lg font-black uppercase tracking-widest text-emerald-950">
                  {settings.letterheadTitle3 || `KANTOR KEPALA ${settings.villageName.toUpperCase()}`}
                </h2>
                <p className="font-sans text-[11px] text-slate-700 font-normal mt-0.5">
                  {settings.letterheadSubtext || `${settings.officeAddress} • Telp: ${settings.phone}`}
                </p>
                <p className="font-sans text-[10px] text-slate-500 font-normal">
                  Email: {settings.email} • Website: {settings.website}
                </p>
              </div>

              {/* Logo Kanan Opsional */}
              <div className="w-20 flex justify-center shrink-0">
                {settings.secondLogoUrl ? (
                  <img
                    src={settings.secondLogoUrl}
                    alt="Logo Sekunder"
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="w-16" />
                )}
              </div>
            </div>
          )}

          {/* 2. JUDUL SURAT & NOMOR REGISTRASI */}
          <div className="text-center my-6">
            <h3 className="text-base font-bold underline tracking-wide uppercase font-sans">
              {letterRequest.letterTypeName.toUpperCase()}
            </h3>
            <p className="text-xs font-mono font-medium text-slate-800 mt-0.5">
              Nomor: {letterRequest.officialLetterNumber || `${letterRequest.requestNumber} [DRAFT/MENUNGGU TTD]`}
            </p>
          </div>

          {/* 3. PARAGRAF PEMBUKA */}
          <p className="text-justify mb-4 text-xs sm:text-sm">
            Yang bertanda tangan di bawah ini, Kepala {settings.villageName}, {settings.districtName}, {settings.regencyName}, Provinsi {settings.provinceName}, dengan ini menerangkan bahwa:
          </p>

          {/* 4. BIODATA PEMOHON */}
          <div className="pl-6 space-y-1.5 text-xs sm:text-sm mb-5">
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Nama Lengkap</span>
              <span className="col-span-8 font-bold uppercase">: {resident.fullName}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">NIK</span>
              <span className="col-span-8 font-mono font-bold">: {resident.nik}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">No. Kartu Keluarga</span>
              <span className="col-span-8 font-mono">: {resident.cardNumber}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Tempat / Tanggal Lahir</span>
              <span className="col-span-8">: {resident.birthPlace}, {formatDateIndo(resident.birthDate)}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Jenis Kelamin</span>
              <span className="col-span-8">: {resident.gender === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan'}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Agama</span>
              <span className="col-span-8">: {resident.religion}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Pekerjaan</span>
              <span className="col-span-8">: {resident.occupation}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 text-slate-700">Alamat Tempat Tinggal</span>
              <span className="col-span-8">: {resident.address}, RT {resident.rt} / RW {resident.rw}, {resident.districtName}, {settings.villageName}</span>
            </div>
          </div>

          {/* 5. ISI KETERANGAN SPESIFIK BERDASARKAN JENIS SURAT */}
          <div className="mb-4 text-justify text-xs sm:text-sm space-y-2">
            <p>
              Bahwa orang yang namanya tersebut di atas adalah benar-benar warga penduduk yang berdomisili menetap di wilayah {settings.villageName}, {settings.districtName}, {settings.regencyName}.
            </p>

            {letterRequest.letterTypeCode === 'SKU' && (
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1 font-sans">
                <p className="font-bold">Menerangkan bahwa yang bersangkutan benar memiliki dan mengelola usaha:</p>
                <p>• <b>Nama Usaha:</b> {letterRequest.extraFields?.namaUsaha || '-'}</p>
                <p>• <b>Bidang / Jenis Usaha:</b> {letterRequest.extraFields?.jenisUsaha || '-'}</p>
                <p>• <b>Alamat Tempat Usaha:</b> {letterRequest.extraFields?.alamatUsaha || resident.address}</p>
                <p>• <b>Tahun Mulai Berdiri:</b> {letterRequest.extraFields?.tahunBerdiri || '2022'}</p>
              </div>
            )}

            {letterRequest.letterTypeCode === 'SKTM' && (
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1 font-sans">
                <p className="font-bold">Menerangkan bahwa keluarga yang bersangkutan benar tergolong dalam keluarga kurang mampu/pra-sejahtera:</p>
                <p>• <b>Tujuan Keringanan:</b> {letterRequest.extraFields?.namaAnak ? `Untuk Anak a.n. ${letterRequest.extraFields.namaAnak}` : 'Keperluan Sosial'}</p>
                <p>• <b>Instansi / Sekolah Tujuan:</b> {letterRequest.extraFields?.sekolahTujuan || '-'}</p>
              </div>
            )}

            <p>
              Surat keterangan ini diberikan atas permohonan yang bersangkutan untuk keperluan:{' '}
              <span className="font-semibold italic font-sans text-slate-900">"{letterRequest.purpose}"</span>.
            </p>

            <p>
              Demikian surat keterangan ini kami buat dengan sebenarnya dan penuh rasa tanggung jawab agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
            </p>
          </div>

          {/* 6. KOLOM TANDA TANGAN & STEMPEL DESA */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs sm:text-sm font-sans">
            {/* TTD Pemohon */}
            <div>
              <p className="text-slate-600">Tanda Tangan Pemohon,</p>
              <div className="h-20"></div>
              <p className="font-bold uppercase underline text-slate-900">{resident.fullName}</p>
            </div>

            {/* TTD Kepala Desa & QR Validation */}
            <div className="flex flex-col items-center">
              <p className="text-slate-700">
                {settings.villageName.replace('Desa ', '')}, {formatDateIndo(letterRequest.approvedAt || new Date().toISOString())}
              </p>
              <p className="font-bold uppercase text-slate-900">
                KEPALA {settings.villageName.toUpperCase()}
              </p>

              {/* Tanda Tangan Digital / QR Code Legalitas */}
              <div className="my-2 p-1.5 border border-dashed border-emerald-400 bg-emerald-50/50 rounded flex flex-col items-center">
                <div className="h-16 w-16 bg-white border border-slate-300 p-1 flex items-center justify-center">
                  <QrCode className="h-14 w-14 text-emerald-900" />
                </div>
                <span className="font-mono text-[9px] text-emerald-800 mt-1 font-bold">
                  {letterRequest.qrCodeHash}
                </span>
                <span className="text-[8px] text-slate-500 font-sans">
                  Dokumen Resmi SIM Desa Sukamaju
                </span>
              </div>

              <p className="font-bold uppercase underline text-slate-950 tracking-wider">
                {settings.villageHeadName}
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                NIP. {settings.villageHeadNip}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4 no-print gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Format Surat Sesuai Permendagri & Perbup Tata Naskah Dinas Desa</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Unduh PDF Surat</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
