import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { StorageService } from '../../services/storageService';
import { pushUserChangeToSupabase, isSupabaseConfigured } from '../../services/supabaseClient';

interface UserPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  currentUser: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

export const UserPasswordResetModal: React.FC<UserPasswordResetModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onUserUpdated,
}) => {
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ username: string; pass: string } | null>(null);

  if (!targetUser) return null;

  const isSupabaseReady = isSupabaseConfigured();

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    superadmin: { label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    kades: { label: 'Kepala Desa', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    sekdes: { label: 'Sekretaris Desa', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    perangkat: { label: 'Perangkat Desa', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    operator: { label: 'Operator Loket', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
    warga: { label: 'Warga Mandiri', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  };

  const handleGenerateDefault = () => {
    const def = `${targetUser.username}123`;
    setNewPassword(def);
    setConfirmPassword(def);
    showToast(`Password standar "${def}" diterapkan!`, 'info');
  };

  const handleGenerateRandom = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const pass = `Desa${randomDigits}!`;
    setNewPassword(pass);
    setConfirmPassword(pass);
    showToast(`Password acak aman "${pass}" di-generate!`, 'info');
  };

  const handleCopyCredentials = () => {
    if (!successInfo) return;
    const text = `Kredensial Akun Sistem Informasi Desa:\nNama: ${targetUser.fullName}\nUsername: ${successInfo.username}\nKata Sandi Baru: ${successInfo.pass}\nRole: ${targetUser.role.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopiedInfo(true);
    showToast('Kredensial berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      showToast('Kata sandi baru minimal harus 6 karakter!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser: User = {
        ...targetUser,
        password: newPassword,
        recoveryKey: targetUser.role === 'superadmin' ? (targetUser.recoveryKey || 'SUPERADMIN-DESA-2026-KEY') : targetUser.recoveryKey,
      };

      // 1. Update in local storage with audit logging
      StorageService.updateUser(updatedUser, currentUser || undefined);

      // Record in audit log & password reset log
      StorageService.addPasswordResetLog({
        username: targetUser.username,
        email: targetUser.email || `${targetUser.username}@sukamaju.desa.id`,
        resetMethod: `SUPERADMIN_RESET (oleh ${currentUser?.fullName || 'Super Admin'})`,
        status: 'BERHASIL'
      });

      if (currentUser) {
        StorageService.addAuditLog(
          currentUser,
          'RESET_USER_PASSWORD',
          'Manajemen Pengguna',
          `Super Admin mereset kata sandi akun @${targetUser.username} (${targetUser.fullName})`
        );
      }

      // 2. Synchronize to Supabase Cloud
      await pushUserChangeToSupabase(updatedUser);

      // 3. Notify parent component
      onUserUpdated(updatedUser);

      setSuccessInfo({ username: targetUser.username, pass: newPassword });
      showToast(`Kata sandi untuk pengguna @${targetUser.username} berhasil diperbarui di lokal & Supabase!`, 'success');
    } catch (err: any) {
      console.error('Error resetting user password:', err);
      showToast('Gagal mereset kata sandi pengguna: ' + (err?.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setSuccessInfo(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Reset Kata Sandi Pengguna (Otoritas Super Admin)"
      maxWidth="lg"
    >
      <div className="space-y-5 text-slate-800">
        {/* User Card Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {targetUser.avatarUrl ? (
                <img src={targetUser.avatarUrl} alt={targetUser.fullName} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <UserIcon className="h-5 w-5 text-purple-100" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm truncate">
                  {targetUser.fullName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleLabels[targetUser.role]?.badge || 'bg-slate-100'}`}>
                  {roleLabels[targetUser.role]?.label || targetUser.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                @{targetUser.username} {targetUser.email && `• ${targetUser.email}`}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              targetUser.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {targetUser.isActive ? 'Akun Aktif' : 'Non-Aktif'}
            </span>
          </div>
        </div>

        {/* Success State with Copyable Credentials */}
        {successInfo ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Kata Sandi Berhasil Direset!
                </h4>
                <p className="text-xs text-emerald-800">
                  Data telah diperbarui di sistem lokal dan disinkronkan ke tabel <strong>users</strong> database Supabase.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-emerald-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-slate-900">@{successInfo.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kata Sandi Baru:</span>
                <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {successInfo.pass}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {copiedInfo ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedInfo ? 'Kredensial Tersalin!' : 'Salin Kredensial Baru'}</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Action Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pilihan Cepat Kata Sandi:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateDefault}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold transition cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-purple-700" />
                  <span>Format Standar: <strong className="font-mono">@{targetUser.username}123</strong></span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Generate Password Acak</span>
                </button>
              </div>
            </div>

            {/* Password Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs font-mono"
                    required
                  />
                </div>

                {confirmPassword && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Kata sandi cocok
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Kata sandi belum cocok
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Status Indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-slate-700">Database Supabase Cloud:</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                isSupabaseReady
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isSupabaseReady ? '● Otomatis Tersinkronkan (Realtime)' : '○ Tersimpan di Lokal Storage'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md focus:outline-hidden disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Menyimpan ke Sistem...</span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Reset Kata Sandi Pengguna</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
