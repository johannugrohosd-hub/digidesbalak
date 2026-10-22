import React, { useState } from 'react';
import {
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  FileText,
  AlertTriangle,
  RefreshCw,
  Building2,
  Menu,
  Download,
  ExternalLink,
  Database,
  Zap
} from 'lucide-react';
import { User, VillageSettings, LetterRequest, Complaint } from '../../types';
import { DeployDownloadModal } from '../common/DeployDownloadModal';
import { getSavedSupabaseConfig } from '../../services/supabaseClient';

interface HeaderProps {
  currentUser: User | null;
  settings: VillageSettings;
  pendingLetters: LetterRequest[];
  pendingComplaints: Complaint[];
  onLogout: () => void;
  onSwitchRole: (user: User) => void;
  allUsers: User[];
  onNavigate: (page: string) => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  pendingLetters,
  pendingComplaints,
  onLogout,
  onSwitchRole,
  allUsers,
  onNavigate,
  onToggleSidebarMobile
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const totalNotifs = pendingLetters.length + pendingComplaints.length;

  const roleLabels: Record<string, { label: string; color: string; desc: string }> = {
    superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200', desc: 'Hak Akses Penuh Sistem' },
    kades: { label: 'Kepala Desa', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Persetujuan Surat & Eksekutif' },
    sekdes: { label: 'Sekretaris Desa', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Verifikasi & Administrasi' },
    perangkat: { label: 'Perangkat Desa', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Layanan Unit & Aset' },
    operator: { label: 'Operator Loket', color: 'bg-teal-100 text-teal-800 border-teal-200', desc: 'Entri Data & Pelayanan' },
    warga: { label: 'Warga Mandiri', color: 'bg-sky-100 text-sky-800 border-sky-200', desc: 'Portal Layanan Warga' },
  };

  const currentRoleMeta = currentUser ? roleLabels[currentUser.role] || { label: currentUser.role, color: 'bg-slate-100 text-slate-800', desc: '' } : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 no-print">
      {/* Left: Mobile hamburger & Village Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          title="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.villageName}
              className="h-10 w-10 object-contain rounded-lg border border-slate-200 p-0.5 bg-white shadow-xs"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-800 text-white font-black shadow-xs ring-2 ring-emerald-600/20">
              <Building2 className="h-5 w-5 text-emerald-100" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight sm:text-base text-sm">
                {settings.villageName}
              </span>
              <span className="hidden text-xs rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200 md:inline-block">
                SIM DESA
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {settings.districtName}, {settings.regencyName}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Realtime Database Status Badge */}
        {(() => {
          const cfg = getSavedSupabaseConfig();
          return (
            <button
              onClick={() => onNavigate('pengaturan')}
              className={`hidden lg:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                cfg.isConnected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              title="Status Database Supabase - Klik untuk konfigurasi & sinkronisasi"
            >
              <span className={`h-2 w-2 rounded-full ${cfg.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <Database className="h-3.5 w-3.5 text-emerald-700" />
              <span>{cfg.isConnected ? 'Supabase Realtime' : 'Mode Lokal'}</span>
            </button>
          );
        })()}

        {/* Tombol Lihat Portal Informasi Publik */}
        <button
          onClick={() => onNavigate('portal-publik')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition shadow-2xs cursor-pointer"
          title="Buka Halaman Portal Informasi Publik Desa"
        >
          <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
          <span className="hidden md:inline">Portal Publik</span>
        </button>

        {/* Tombol Unduh dist.zip & Cara Akses HP */}
        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
          title="Unduh Berkas dist.zip & Cara Akses di HP (Bebas Error 403)"
        >
          <Download className="h-3.5 w-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Unduh dist (.zip)</span>
          <span className="sm:hidden font-mono text-[11px]">dist.zip</span>
        </button>

        {/* Quick Role Switcher (For Demo & Testing RBAC easily) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            title="Ganti Akun Demo / Hak Akses (RBAC)"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Role:</span>
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${currentRoleMeta?.color}`}>
              {currentRoleMeta?.label}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Simulasi Hak Akses (RBAC)</p>
                <p className="text-[11px] text-slate-500">Pilih peran untuk menguji otorisasi sistem desa:</p>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {allUsers.map((u) => {
                  const meta = roleLabels[u.role];
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchRole(u);
                        setShowRoleMenu(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
                        isCurrent ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta?.color}`}>
                          {meta?.label}
                        </span>
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium text-slate-900 truncate">{u.fullName}</p>
                        <p className="text-[10px] text-slate-500">{meta?.desc}</p>
                      </div>
                      {isCurrent && <span className="text-emerald-700 font-bold text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Notifikasi & Tindakan Menunggu"
          >
            <Bell className="h-5 w-5" />
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                {totalNotifs}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Perlu Tindakan ({totalNotifs})</p>
                <span className="text-[11px] text-emerald-700 font-medium">Digital Desa Pro</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {pendingLetters.length === 0 && pendingComplaints.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Tidak ada permohonan atau pengaduan tertunda.
                  </div>
                ) : (
                  <>
                    {pendingLetters.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => {
                          setShowNotifMenu(false);
                          onNavigate('layanan-surat');
                        }}
                        className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-xs hover:bg-emerald-50 transition border-b border-slate-50"
                      >
                        <FileText className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{req.letterTypeName}</p>
                          <p className="text-[11px] text-slate-600">Pemohon: {req.residentName}</p>
                          <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Status: {req.status}
                          </span>
                        </div>
                      </button>
                    ))}

                    {pendingComplaints.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setShowNotifMenu(false);
                          onNavigate('pengaduan');
                        }}
                        className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-xs hover:bg-red-50 transition"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 truncate">{c.subject}</p>
                          <p className="text-[11px] text-slate-600">Oleh: {c.residentName}</p>
                          <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium">
                            Pengaduan: Menunggu
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.fullName}</p>
            <p className="text-[11px] text-slate-500">@{currentUser?.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
            title="Keluar dari Akun"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Modal Unduh dist.zip & Solusi Akses HP */}
      <DeployDownloadModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
    </header>
  );
};
