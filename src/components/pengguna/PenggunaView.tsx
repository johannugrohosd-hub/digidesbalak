import React, { useState } from 'react';
import { UserCog, UserPlus, Shield, CheckCircle, XCircle, Trash2, Edit, KeyRound } from 'lucide-react';
import { User, UserRole } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { UserPasswordResetModal } from './UserPasswordResetModal';

interface PenggunaViewProps {
  users: User[];
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onAddUser: (data: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const PenggunaView: React.FC<PenggunaViewProps> = ({
  users,
  currentUser,
  onNavigate,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nik, setNik] = useState('');
  const [initialPassword, setInitialPassword] = useState('');

  const roleDescriptions: Record<UserRole, { label: string; badge: string; desc: string }> = {
    superadmin: {
      label: 'Super Admin',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Konfigurasi sistem, audit trail, hak akses penuh, backup/restore database',
    },
    kades: {
      label: 'Kepala Desa',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Dashboard eksekutif, persetujuan & TTD digital surat, tindak lanjut aspirasi',
    },
    sekdes: {
      label: 'Sekretaris Desa',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Buku agenda surat masuk/keluar, verifikasi draf surat, rekapitulasi data',
    },
    perangkat: {
      label: 'Perangkat Desa (Kasi/Kaur)',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Pengelolaan aset inventaris, pelayanan teknis, kegiatan posyandu/bansos',
    },
    operator: {
      label: 'Operator Loket',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Pendaftaran penduduk, entri KK, permohonan surat loket, cetak blanko',
    },
    warga: {
      label: 'Warga Mandiri',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      desc: 'Portal mandiri: ajukan surat online, unduh surat digital, kirim aspirasi',
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      showToast('Username dan nama lengkap wajib diisi!', 'error');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      showToast('Username tersebut sudah digunakan!', 'error');
      return;
    }

    onAddUser({
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      nik: role === 'warga' ? nik.trim() : undefined,
      password: initialPassword.trim() || undefined,
      isActive: true,
      lastLoginAt: undefined,
    });

    showToast(`Pengguna baru ${username} (${role}) berhasil ditambahkan!`, 'success');
    setIsAddOpen(false);
    setUsername('');
    setFullName('');
    setEmail('');
    setPhone('');
    setNik('');
    setInitialPassword('');
  };

  const toggleUserStatus = (u: User) => {
    onUpdateUser({
      ...u,
      isActive: !u.isActive,
    });
    showToast(`Status pengguna ${u.username} diubah menjadi ${!u.isActive ? 'Aktif' : 'Non-Aktif'}`, 'info');
  };

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Laporan & Sistem' }, { label: 'Manajemen Pengguna (RBAC)' }]}
        onNavigate={onNavigate}
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Pengguna</span>
          </button>
        }
      />

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(roleDescriptions) as UserRole[]).map(rKey => {
          const item = roleDescriptions[rKey];
          const count = users.filter(u => u.role === rKey).length;
          return (
            <div key={rKey} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badge}`}>
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-800">{count} Akun</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Terakhir Masuk</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="font-mono text-xs text-slate-500">@{u.username}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleDescriptions[u.role]?.badge}`}>
                      {roleDescriptions[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{u.email || '-'}</div>
                    <div className="text-[10px] text-slate-400">{u.phone || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLoginAt || 'Belum pernah'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {currentUser?.role === 'superadmin' && (
                        <button
                          type="button"
                          onClick={() => setResetTargetUser(u)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer"
                          title={`Reset Kata Sandi Akun @${u.username}`}
                        >
                          <KeyRound className="h-3.5 w-3.5 text-purple-700" />
                          <span>Reset Password</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`text-xs font-bold px-2 py-1 rounded transition cursor-pointer ${
                          u.isActive
                            ? 'text-amber-700 hover:bg-amber-50 border border-amber-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            onDeleteUser(u.id);
                            showToast(`Pengguna ${u.username} berhasil dihapus`, 'info');
                          }}
                          className="text-slate-400 hover:text-red-700 p-1 cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Pengguna Baru & Tetapkan Role">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username Login <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="huruf kecil, contoh: kades_baru"
                className="w-full rounded border border-slate-300 p-2 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hak Akses (Role RBAC) <span className="text-red-500">*</span></label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full rounded border border-slate-300 p-2 bg-white font-bold"
              >
                <option value="superadmin">Super Admin</option>
                <option value="kades">Kepala Desa</option>
                <option value="sekdes">Sekretaris Desa</option>
                <option value="perangkat">Perangkat Desa (Kasi/Kaur)</option>
                <option value="operator">Operator Pelayanan Loket</option>
                <option value="warga">Warga Mandiri</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nama Lengkap Petugas / Pejabat"
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          {role === 'warga' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK 16 digit)</label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={e => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="320112..."
                className="w-full rounded border border-slate-300 p-2 font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@sukamaju.desa.id"
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
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
              Simpan Pengguna
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
