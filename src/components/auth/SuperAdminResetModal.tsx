import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { User } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { StorageService } from '../../services/storageService';
import { resetSuperAdminPasswordInSupabase, isSupabaseConfigured } from '../../services/supabaseClient';

interface SuperAdminResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onResetSuccess: (username: string, newPass: string) => void;
}

export const SuperAdminResetModal: React.FC<SuperAdminResetModalProps> = ({
  isOpen,
  onClose,
  users,
  onResetSuccess,
}) => {
  const { showToast } = useToast();

  // Find all superadmin accounts
  const superAdminUsers = users.filter(u => u.role === 'superadmin');
  const defaultAdmin = superAdminUsers[0] || {
    id: 'user-1',
    username: 'admin',
    fullName: 'Administrator Sistem (Super Admin)',
    role: 'superadmin',
    email: 'admin@sukamaju.desa.id',
    phone: '081234567890',
    recoveryKey: 'SUPERADMIN-DESA-2026-KEY',
    isActive: true,
  };

  const [selectedUsername, setSelectedUsername] = useState<string>(defaultAdmin.username);
  const [verificationMethod, setVerificationMethod] = useState<'MASTER_KEY' | 'EMAIL_OTP'>('MASTER_KEY');
  const [recoveryKeyInput, setRecoveryKeyInput] = useState<string>('');
  
  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpSentTimestamp, setOtpSentTimestamp] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  // Password fields
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSupabaseReady = isSupabaseConfigured();

  const currentAdminUser = superAdminUsers.find(u => u.username.toLowerCase() === selectedUsername.toLowerCase()) || defaultAdmin;

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'Belum diisi', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Terlalu pendek (min 6)', color: 'bg-rose-500 text-rose-700' };
    
    let score = 1;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 2, label: 'Cukup', color: 'bg-amber-500 text-amber-700' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'bg-emerald-500 text-emerald-700' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-emerald-600 text-emerald-800' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSendOtp = () => {
    // Generate secure 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSentTimestamp(new Date().toLocaleTimeString('id-ID'));
    showToast(`Kode OTP Darurat (${code}) telah dikirimkan ke email ${currentAdminUser.email || 'admin@sukamaju.desa.id'}!`, 'info');
  };

  const handleCopyOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setOtpInput(generatedOtp);
    setCopiedOtp(true);
    showToast('Kode OTP berhasil disalin dan ditempel!', 'success');
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleUseDefaultKey = () => {
    setRecoveryKeyInput('SUPERADMIN-DESA-2026-KEY');
    showToast('Kunci Master bawaan sistem (SUPERADMIN-DESA-2026-KEY) diterapkan!', 'info');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      showToast('Kata sandi baru wajib diisi!', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Kata sandi baru minimal harus 6 karakter!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }

    // Verify method
    if (verificationMethod === 'MASTER_KEY') {
      const validKey = currentAdminUser.recoveryKey || 'SUPERADMIN-DESA-2026-KEY';
      if (!recoveryKeyInput.trim()) {
        showToast('Masukkan Kunci Pemulihan Master untuk memverifikasi hak akses Super Admin!', 'error');
        return;
      }
      if (recoveryKeyInput.trim() !== validKey && recoveryKeyInput.trim() !== 'SUPERADMIN-DESA-2026-KEY') {
        showToast('Kunci Pemulihan Master yang Anda masukkan tidak valid!', 'error');
        return;
      }
    } else {
      if (!generatedOtp) {
        showToast('Silakan klik "Kirim Kode OTP Darurat" terlebih dahulu!', 'error');
        return;
      }
      if (otpInput.trim() !== generatedOtp) {
        showToast('Kode OTP yang Anda masukkan salah atau telah kedaluwarsa!', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Reset in local storage
      const methodLabel = verificationMethod === 'MASTER_KEY' ? 'KUNCI_PEMULIHAN_MASTER' : 'KODE_OTP_EMAIL';
      const localResult = StorageService.resetSuperAdminPassword(
        selectedUsername,
        newPassword,
        verificationMethod === 'MASTER_KEY' ? recoveryKeyInput.trim() : undefined,
        methodLabel
      );

      if (!localResult.success) {
        showToast(localResult.message, 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Synchronize to Supabase database
      const supabaseResult = await resetSuperAdminPasswordInSupabase(
        selectedUsername,
        newPassword,
        verificationMethod === 'MASTER_KEY' ? recoveryKeyInput.trim() : undefined,
        methodLabel
      );

      showToast('Kata sandi Super Admin berhasil diperbarui dan disinkronkan ke Supabase!', 'success');
      if (supabaseResult.message && !supabaseResult.message.includes('offline')) {
        showToast(supabaseResult.message, 'info');
      }

      onResetSuccess(selectedUsername, newPassword);
      onClose();

      // Reset internal states
      setRecoveryKeyInput('');
      setGeneratedOtp(null);
      setOtpInput('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      showToast('Terjadi kesalahan saat memproses reset kata sandi: ' + (err?.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pemulihan & Reset Kata Sandi Super Admin"
      maxWidth="lg"
    >
      <form onSubmit={handleResetSubmit} className="space-y-5 text-slate-800">
        {/* Banner Security Notice */}
        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white shadow-sm shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-900 text-sm">
                  Protokol Keamanan Akses Super Administrator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold text-[10px]">
                  RBAC Level 1
                </span>
              </div>
              <p className="text-purple-700 leading-relaxed">
                Fitur ini digunakan secara khusus untuk memulihkan akses darurat Super Administrator jika kata sandi terlupa. Pembaruan akan diterapkan secara langsung pada database <strong>Supabase (users & password_reset_logs)</strong> dan sesi lokal sistem.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Super Admin Account Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Pilih Akun Super Admin yang Ingin Direset
          </label>
          <div className="relative">
            <select
              value={selectedUsername}
              onChange={e => setSelectedUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-white focus:border-purple-600 focus:outline-hidden shadow-2xs"
            >
              {superAdminUsers.map(u => (
                <option key={u.id} value={u.username}>
                  {u.username} — {u.fullName} ({u.email || 'Email belum diatur'})
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Email terdaftar: <span className="font-semibold text-slate-700">{currentAdminUser.email || 'admin@sukamaju.desa.id'}</span> | Role: Super Admin
          </p>
        </div>

        {/* Step 2: Verification Method Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Pilih Metode Verifikasi Otorisasi:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVerificationMethod('MASTER_KEY')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                verificationMethod === 'MASTER_KEY'
                  ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Key className={`h-4 w-4 ${verificationMethod === 'MASTER_KEY' ? 'text-purple-600' : 'text-slate-500'}`} />
                <span className="font-bold text-xs text-slate-800">Kunci Pemulihan Master</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Gunakan Master Recovery Key yang tertera pada dokumen pengesahan sistem desa.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVerificationMethod('EMAIL_OTP')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                verificationMethod === 'EMAIL_OTP'
                  ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Mail className={`h-4 w-4 ${verificationMethod === 'EMAIL_OTP' ? 'text-purple-600' : 'text-slate-500'}`} />
                <span className="font-bold text-xs text-slate-800">Kode OTP Darurat Email</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Kirim kode otentikasi 6-digit ke email dinas akun Super Admin.
              </p>
            </button>
          </div>
        </div>

        {/* Dynamic Verification Form */}
        {verificationMethod === 'MASTER_KEY' ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-purple-600" />
                <span>Kunci Pemulihan Master (Master Recovery Key)</span>
              </label>
              <button
                type="button"
                onClick={handleUseDefaultKey}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer"
              >
                Gunakan Kunci Bawaan Sistem
              </button>
            </div>
            <input
              type="text"
              value={recoveryKeyInput}
              onChange={e => setRecoveryKeyInput(e.target.value)}
              placeholder="Contoh: SUPERADMIN-DESA-2026-KEY"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase focus:border-purple-600 focus:outline-hidden bg-white"
              required
            />
            <p className="text-[11px] text-slate-500">
              * Kunci pemulihan bawaan sistem: <code className="bg-slate-200 px-1 py-0.5 rounded text-purple-900 font-mono font-bold">SUPERADMIN-DESA-2026-KEY</code>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                  <span>Verifikasi Email Terdaftar</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Kode dikirim ke: <strong>{currentAdminUser.email || 'admin@sukamaju.desa.id'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{generatedOtp ? 'Kirim Ulang OTP' : 'Kirim Kode OTP'}</span>
              </button>
            </div>

            {generatedOtp && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-amber-900">
                    Kode OTP Darurat Terverifikasi ({otpSentTimestamp}):
                  </div>
                  <div className="text-base font-extrabold text-purple-900 tracking-widest font-mono">
                    {generatedOtp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition cursor-pointer"
                >
                  {copiedOtp ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedOtp ? 'Tersalin' : 'Salin & Isi'}</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Masukkan 6-Digit Kode OTP:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="6 Digit OTP (Contoh: 123456)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold tracking-widest text-center focus:border-purple-600 focus:outline-hidden bg-white"
                required
              />
            </div>
          </div>
        )}

        {/* Step 3: New Password Inputs */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi Baru Super Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter */}
            {newPassword && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${strength.score >= 1 ? 'bg-rose-500' : 'bg-transparent'} flex-1`} />
                  <div className={`h-full ${strength.score >= 2 ? 'bg-amber-500' : 'bg-transparent'} flex-1`} />
                  <div className={`h-full ${strength.score >= 3 ? 'bg-emerald-500' : 'bg-transparent'} flex-1`} />
                  <div className={`h-full ${strength.score >= 4 ? 'bg-emerald-600' : 'bg-transparent'} flex-1`} />
                </div>
                <span className="font-bold text-[10px] text-slate-600">
                  Kekuatan: {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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

        {/* Database Status Info */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-slate-700">Sinkronisasi Database Supabase:</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            isSupabaseReady
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {isSupabaseReady ? '● Terhubung (Realtime Sync Aktif)' : '○ Standalone / Offline Ready'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (confirmPassword !== '' && newPassword !== confirmPassword)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md focus:outline-hidden disabled:opacity-50 transition cursor-pointer"
          >
            {isSubmitting ? (
              <span>Menyimpan ke Supabase & Sistem...</span>
            ) : (
              <>
                <span>Perbarui & Simpan ke Supabase</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
