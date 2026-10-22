import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MapPin,
  FileText,
  Archive,
  BookOpen,
  UserCheck,
  ShieldAlert,
  Package,
  Megaphone,
  BarChart3,
  UserCog,
  Settings,
  Sparkles,
  Globe,
  X
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: User | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  roles?: string[]; // If specified, only users with these roles see it
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    roles?: string[];
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  currentUser,
  isOpenMobile,
  onCloseMobile,
}) => {
  const userRole = currentUser?.role || 'superadmin';

  // Navigation structure adhering to Indonesian SIM Desa guidelines
  const navSections: NavSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Desa', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ADMINISTRASI KEPENDUDUKAN',
      roles: ['superadmin', 'kades', 'sekdes', 'perangkat', 'operator'],
      items: [
        { id: 'penduduk', label: 'Data Penduduk', icon: Users },
        { id: 'kartu-keluarga', label: 'Kartu Keluarga (KK)', icon: CreditCard },
        { id: 'wilayah', label: 'Dusun, RW & RT', icon: MapPin },
      ],
    },
    {
      title: 'PELAYANAN SURAT (E-SURAT)',
      roles: ['superadmin', 'kades', 'sekdes', 'perangkat', 'operator'],
      items: [
        { id: 'layanan-surat', label: 'Daftar Layanan Surat', icon: FileText },
        { id: 'agenda-surat', label: 'Agenda Surat Masuk/Keluar', icon: BookOpen },
        { id: 'arsip-surat', label: 'Buku Arsip Surat', icon: Archive },
      ],
    },
    {
      title: 'PELAYANAN MANDIRI WARGA',
      items: [
        { id: 'portal-warga', label: 'Portal Mandiri Warga', icon: Sparkles, badge: 'Online' },
        { id: 'portal-publik', label: 'Portal Informasi Publik', icon: Globe, badge: 'Desa' },
      ],
    },
    {
      title: 'TATA KELOLA PEMERINTAHAN',
      roles: ['superadmin', 'kades', 'sekdes', 'perangkat'],
      items: [
        { id: 'perangkat-desa', label: 'Perangkat Desa & SOTK', icon: UserCheck },
        { id: 'aset', label: 'Inventaris Aset Desa', icon: Package },
        { id: 'pengaduan', label: 'Pengaduan & Aspirasi', icon: ShieldAlert },
        { id: 'pengumuman', label: 'Pengumuman Resmi', icon: Megaphone },
      ],
    },
    {
      title: 'LAPORAN & SISTEM',
      roles: ['superadmin', 'kades', 'sekdes'],
      items: [
        { id: 'laporan', label: 'Rekapitulasi Laporan', icon: BarChart3 },
        { id: 'pengguna', label: 'Manajemen Pengguna (RBAC)', icon: UserCog, roles: ['superadmin'] },
        { id: 'pengaturan', label: 'Pengaturan Sistem Desa', icon: Settings, roles: ['superadmin', 'kades'] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col bg-emerald-950 text-white shadow-2xl transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Sidebar Brand Top */}
        <div className="flex h-16 items-center justify-between border-b border-emerald-900/80 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-sm">
              DP
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white">Digital Desa Pro</h1>
              <p className="text-[10px] text-emerald-300 font-medium tracking-wider uppercase">SIM Desa Terpadu</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-900 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => {
            // Check section role permissions
            if (section.roles && !section.roles.includes(userRole)) {
              return null;
            }

            const visibleItems = section.items.filter(
              item => !item.roles || item.roles.includes(userRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  {section.title}
                </p>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-300 group-hover:text-white'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-400/40">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Identity pill */}
        <div className="border-t border-emerald-900/80 p-3.5 bg-emerald-950/60">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-900/40 p-2.5 border border-emerald-800/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-xs uppercase">
              {currentUser?.username.substring(0, 2) || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{currentUser?.fullName}</p>
              <p className="truncate text-[10px] text-emerald-300 capitalize">
                Peran: {currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
