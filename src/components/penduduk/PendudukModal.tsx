import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Resident, VillageDistrict } from '../../types';
import { useToast } from '../common/Toast';
import { calculateAge, formatDateIndo } from '../../utils/formatters';

interface PendudukModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentToEdit?: Resident | null;
  districts: VillageDistrict[];
  onSave: (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
}

export const PendudukModal: React.FC<PendudukModalProps> = ({
  isOpen,
  onClose,
  residentToEdit,
  districts,
  onSave,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nik: '',
    cardNumber: '',
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: 'LAKI_LAKI' as Resident['gender'],
    bloodType: '-',
    religion: 'Islam' as Resident['religion'],
    maritalStatus: 'Belum Kawin' as Resident['maritalStatus'],
    familyRole: 'Kepala Keluarga' as Resident['familyRole'],
    education: 'SMA',
    occupation: 'Wiraswasta',
    citizenship: 'WNI',
    fatherName: '',
    motherName: '',
    address: '',
    rt: '01',
    rw: '01',
    districtName: districts[0]?.name || 'Dusun Krajan',
    phone: '',
    status: 'Tetap' as Resident['status'],
    notes: '',
  });

  useEffect(() => {
    if (residentToEdit) {
      setFormData({
        nik: residentToEdit.nik || '',
        cardNumber: residentToEdit.cardNumber || '',
        fullName: residentToEdit.fullName || '',
        birthPlace: residentToEdit.birthPlace || '',
        birthDate: residentToEdit.birthDate || '',
        gender: residentToEdit.gender || 'LAKI_LAKI',
        bloodType: residentToEdit.bloodType || '-',
        religion: residentToEdit.religion || 'Islam',
        maritalStatus: residentToEdit.maritalStatus || 'Belum Kawin',
        familyRole: residentToEdit.familyRole || 'Kepala Keluarga',
        education: residentToEdit.education || 'SMA',
        occupation: residentToEdit.occupation || 'Wiraswasta',
        citizenship: residentToEdit.citizenship || 'WNI',
        fatherName: residentToEdit.fatherName || '',
        motherName: residentToEdit.motherName || '',
        address: residentToEdit.address || '',
        rt: residentToEdit.rt || '01',
        rw: residentToEdit.rw || '01',
        districtName: residentToEdit.districtName || districts[0]?.name || 'Dusun Krajan',
        phone: residentToEdit.phone || '',
        status: residentToEdit.status || 'Tetap',
        notes: residentToEdit.notes || '',
      });
    } else {
      setFormData({
        nik: '',
        cardNumber: '',
        fullName: '',
        birthPlace: '',
        birthDate: '1995-01-01',
        gender: 'LAKI_LAKI',
        bloodType: '-',
        religion: 'Islam',
        maritalStatus: 'Belum Kawin',
        familyRole: 'Kepala Keluarga',
        education: 'SMA',
        occupation: 'Wiraswasta',
        citizenship: 'WNI',
        fatherName: '',
        motherName: '',
        address: 'Kp. Sukamaju',
        rt: '01',
        rw: '01',
        districtName: districts[0]?.name || 'Dusun Krajan',
        phone: '',
        status: 'Tetap',
        notes: '',
      });
    }
  }, [residentToEdit, isOpen, districts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.nik || formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      showToast('NIK harus berupa 16 digit angka valid!', 'error');
      return;
    }

    if (!formData.cardNumber || formData.cardNumber.length !== 16 || !/^\d+$/.test(formData.cardNumber)) {
      showToast('Nomor Kartu Keluarga harus berupa 16 digit angka valid!', 'error');
      return;
    }

    if (!formData.fullName.trim()) {
      showToast('Nama lengkap wajib diisi!', 'error');
      return;
    }

    if (!formData.birthPlace.trim() || !formData.birthDate) {
      showToast('Tempat dan tanggal lahir wajib diisi!', 'error');
      return;
    }

    onSave(formData, residentToEdit?.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={residentToEdit ? 'Ubah Data Penduduk' : 'Tambah Data Penduduk Baru'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* Section 1: Identitas Pokok */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-1 mb-3">
            1. Identitas Pokok Kependudukan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={e => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="16 digit NIK"
                required
              />
              <span className="text-[10px] text-slate-500">{formData.nik.length}/16 digit</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Kartu Keluarga (No KK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={formData.cardNumber}
                onChange={e => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '') })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="16 digit Nomor KK"
                required
              />
              <span className="text-[10px] text-slate-500">{formData.cardNumber.length}/16 digit</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Nama Lengkap"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Kota/Kabupaten Lahir"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as Resident['gender'] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="LAKI_LAKI">Laki-Laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Data Sosial & Keluarga */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-1 mb-3">
            2. Hubungan Keluarga & Status Sosial
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agama</label>
              <select
                value={formData.religion}
                onChange={e => setFormData({ ...formData, religion: e.target.value as Resident['religion'] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Perkawinan</label>
              <select
                value={formData.maritalStatus}
                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as Resident['maritalStatus'] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Hubungan dlm Keluarga (SHDK)</label>
              <select
                value={formData.familyRole}
                onChange={e => setFormData({ ...formData, familyRole: e.target.value as Resident['familyRole'] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Famili Lain">Famili Lain</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
              <select
                value={formData.education}
                onChange={e => setFormData({ ...formData, education: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                <option value="SD/Sederajat">SD/Sederajat</option>
                <option value="SMP/Sederajat">SMP/Sederajat</option>
                <option value="SMA/SMK/Sederajat">SMA/SMK/Sederajat</option>
                <option value="D1/D2/D3">D1/D2/D3</option>
                <option value="S1/D4">S1/D4</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pekerjaan</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Petani, PNS, Karyawan, Wiraswasta"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Golongan Darah</label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="-">- Tidak Tahu -</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Ayah</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Nama Ayah Kandung"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Ibu</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Nama Ibu Kandung"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Domisili & Wilayah Administratif */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-1 mb-3">
            3. Domisili & Wilayah Administratif Desa
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat / Kampung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                placeholder="Jl. / Kp. / Gang"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dusun</label>
              <select
                value={formData.districtName}
                onChange={e => setFormData({ ...formData, districtName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">RT</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.rt}
                  onChange={e => setFormData({ ...formData, rt: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  placeholder="01"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">RW</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.rw}
                  onChange={e => setFormData({ ...formData, rw: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  placeholder="01"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kependudukan</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Resident['status'] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Tetap">Tetap</option>
                <option value="Pindah Masuk">Pindah Masuk</option>
                <option value="Pindah Keluar">Pindah Keluar</option>
                <option value="Meninggal">Meninggal Dunia</option>
                <option value="Sementara">Sementara / Musiman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            {residentToEdit ? 'Simpan Perubahan' : 'Tambahkan Penduduk'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
