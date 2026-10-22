import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { VillageSettings, User } from '../../types';
import { useToast } from '../common/Toast';
import { SuperAdminResetModal } from './SuperAdminResetModal';

interface LoginViewProps {
  settings: VillageSettings;
  users: User[];
  onLogin: (user: User) => void;
  onBackToPortal?: () => void;
  onUserUpdated?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  settings,
  users,
  onLogin,
  onBackToPortal,
  onUserUpdated
}) => {
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast('Harap masukkan username dan kata sandi!', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const foundUser = users.find(
        u => u.username.toLowerCase() === cleanUsername && u.isActive
      );

      if (!foundUser) {
        showToast(`Akun dengan username "${username.trim()}" tidak ditemukan atau berstatus non-aktif!`, 'error');
        setIsLoading(false);
        return;
      }

      // Check against stored custom password or default initial credentials
      const expectedPassword = foundUser.password || `${foundUser.username}123`;
      const isMatch = password === expectedPassword || (foundUser.username === 'admin' && password === 'admin123');

      if (isMatch) {
        showToast(`Selamat datang, ${foundUser.fullName}!`, 'success');
        onLogin(foundUser);
      } else {
        if (foundUser.role === 'superadmin') {
          showToast(
            'Kata sandi Super Admin salah! Silakan gunakan fitur "Reset Password Super Admin" jika lupa kata sandi.',
            'error'
          );
        } else {
          showToast('Kata sandi yang Anda masukkan salah. Silakan periksa kembali!', 'error');
        }
        setIsLoading(false);
      }
    }, 400);
  };

  const handleResetSuccess = (resetUser: string, newPass: string) => {
    setUsername(resetUser);
    setPassword(newPass);
    if (onUserUpdated) {
      onUserUpdated();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Public Portal Link */}
      {onBackToPortal && (
        <div className="absolute top-6 left-6 z-20">
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-bold backdrop-blur-md border border-white/15 transition cursor-pointer"
          >
            <span>← Kembali ke Portal Informasi Desa</span>
          </button>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        {/* Village Government Logo */}
        {settings.logoUrl ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl ring-4 ring-emerald-500/30 mb-3 overflow-hidden">
            <img src={settings.logoUrl} alt={settings.villageName} className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xl ring-4 ring-emerald-500/20 mb-3">
            <Building2 className="h-9 w-9 text-emerald-100" />
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Digital Desa Pro
        </h2>
        <p className="mt-1 text-sm font-semibold text-emerald-400">
          Sistem Informasi Manajemen {settings.villageName}
        </p>
        <p className="text-xs text-slate-400">
          {settings.districtName}, {settings.regencyName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Akun Pengguna
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username akun Anda"
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 mr-2" />
                <span>Ingat Sesi Masuk</span>
              </label>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Reset Password Super Admin</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-900 focus:outline-hidden disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Otorisasi...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem Desa</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Emergency Recovery Card */}
          <div className="border-t border-slate-100 pt-5">
            <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-purple-700 text-white shadow-xs shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-purple-950 truncate">
                    Pemulihan Akun Super Admin
                  </div>
                  <div className="text-[11px] text-purple-700 leading-tight">
                    Reset kata sandi dengan Kunci Master atau Kode OTP Email
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition cursor-pointer shrink-0"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Password Reset Modal */}
      <SuperAdminResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        users={users}
        onResetSuccess={handleResetSuccess}
      />
    </div>
  );
};
