import React from 'react';
import {
  Users,
  CreditCard,
  UserCheck,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  Resident,
  FamilyCard,
  LetterRequest,
  Complaint,
  Announcement,
  AuditLog,
  VillageDistrict,
  VillageSettings,
  User
} from '../../types';
import { calculateAge, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface DashboardViewProps {
  settings: VillageSettings;
  currentUser: User | null;
  residents: Resident[];
  familyCards: FamilyCard[];
  districts: VillageDistrict[];
  letterRequests: LetterRequest[];
  complaints: Complaint[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  onNavigate: (page: string) => void;
}

const COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#8b5cf6', '#10b981'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  currentUser,
  residents,
  familyCards,
  districts,
  letterRequests,
  complaints,
  announcements,
  auditLogs,
  onNavigate
}) => {
  // 1. Calculate live demographic stats
  const totalResidents = residents.length;
  const totalFamilyCards = familyCards.length;
  const maleCount = residents.filter(r => r.gender === 'LAKI_LAKI').length;
  const femaleCount = residents.filter(r => r.gender === 'PEREMPUAN').length;

  // 2. Letters stats
  const pendingRequests = letterRequests.filter(r =>
    r.status === 'Menunggu Persetujuan' || r.status === 'Diajukan' || r.status === 'Diproses'
  );
  const finishedRequests = letterRequests.filter(r =>
    r.status === 'Selesai' || r.status === 'Disetujui'
  );

  // 3. Complaints
  const pendingComplaints = complaints.filter(c => c.status === 'Menunggu');

  // 4. Age groups distribution
  const ageDistribution = [
    { name: 'Balita (0-4)', count: 0 },
    { name: 'Anak (5-11)', count: 0 },
    { name: 'Remaja (12-25)', count: 0 },
    { name: 'Dewasa (26-59)', count: 0 },
    { name: 'Lansia (60+)', count: 0 },
  ];

  residents.forEach(r => {
    const age = calculateAge(r.birthDate);
    if (age <= 4) ageDistribution[0].count++;
    else if (age <= 11) ageDistribution[1].count++;
    else if (age <= 25) ageDistribution[2].count++;
    else if (age <= 59) ageDistribution[3].count++;
    else ageDistribution[4].count++;
  });

  // 5. Population by Dusun
  const districtDistribution = districts.map(d => {
    const countInDusun = residents.filter(r => r.districtName.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(r.districtName.toLowerCase())).length;
    return {
      name: d.name.replace('Dusun ', ''),
      penduduk: countInDusun || d.populationCount || 0,
      kk: familyCards.filter(fc => fc.districtName.toLowerCase().includes(d.name.toLowerCase())).length || Math.round((d.populationCount || 100) / 3.5),
    };
  });

  // 6. Monthly progression data
  const monthlyTrends = [
    { bulan: 'Mei', permohonanSurat: 18, mutasi: 2 },
    { bulan: 'Jun', permohonanSurat: 24, mutasi: 3 },
    { bulan: 'Jul', permohonanSurat: 31, mutasi: 4 },
    { bulan: 'Agt', permohonanSurat: 29, mutasi: 1 },
    { bulan: 'Sep', permohonanSurat: 38, mutasi: 5 },
    { bulan: 'Okt', permohonanSurat: letterRequests.length, mutasi: 2 },
  ];

  // Gender Chart data
  const genderData = [
    { name: 'Laki-laki', value: maleCount, color: '#0284c7' },
    { name: 'Perempuan', value: femaleCount, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sistem Informasi Digital Desa (SIM Desa) v2.5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Portal {settings.villageName}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Pusat administrasi kependudukan terpadu, pelayanan surat elektronik (E-Surat), inventarisasi aset desa, dan transparansi laporan pemerintahan desa {settings.districtName}, {settings.regencyName}.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => onNavigate('layanan-surat')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 font-bold text-white shadow hover:bg-emerald-400 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Proses Pelayanan Surat</span>
            </button>
            <button
              onClick={() => onNavigate('penduduk')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 font-bold text-white hover:bg-white/20 transition backdrop-blur-xs"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Kelola Data Penduduk</span>
            </button>
            {currentUser?.role === 'warga' && (
              <button
                onClick={() => onNavigate('portal-warga')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 font-bold text-slate-900 shadow hover:bg-amber-400 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Buka Portal Mandiri Warga</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Building className="h-72 w-72 text-white" />
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Penduduk */}
        <div
          onClick={() => onNavigate('penduduk')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penduduk</span>
            <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalResidents}</span>
            <span className="text-xs text-slate-500 ml-1">Jiwa</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>L: <b className="text-slate-800">{maleCount}</b></span>
            <span>P: <b className="text-slate-800">{femaleCount}</b></span>
            <span className="text-emerald-600 font-semibold flex items-center">
              Lihat <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Kepala Keluarga */}
        <div
          onClick={() => onNavigate('kartu-keluarga')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kepala Keluarga</span>
            <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalFamilyCards}</span>
            <span className="text-xs text-slate-500 ml-1">KK Terdaftar</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Dusun: <b className="text-slate-800">{districts.length}</b></span>
            <span className="text-blue-600 font-semibold flex items-center">
              Detail KK <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Permohonan Surat Menunggu */}
        <div
          onClick={() => onNavigate('layanan-surat')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-500 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surat Menunggu</span>
            <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{pendingRequests.length}</span>
            <span className="text-xs text-amber-600 font-semibold ml-1">Perlu Tindakan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Selesai: <b className="text-slate-800">{finishedRequests.length}</b></span>
            <span className="text-amber-600 font-semibold flex items-center">
              Verifikasi <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Pengaduan Warga */}
        <div
          onClick={() => onNavigate('pengaduan')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-red-500 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengaduan Warga</span>
            <div className="rounded-lg bg-red-100 p-2.5 text-red-700 group-hover:bg-red-600 group-hover:text-white transition">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{pendingComplaints.length}</span>
            <span className="text-xs text-red-600 font-semibold ml-1">Belum Selesai</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Total Aduan: <b className="text-slate-800">{complaints.length}</b></span>
            <span className="text-red-600 font-semibold flex items-center">
              Tanggapi <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Penduduk Berdasarkan Dusun */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Statistik Penduduk per Dusun</h3>
              <p className="text-xs text-slate-500">Distribusi jumlah penduduk dan kepala keluarga menurut wilayah dusun</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Live DB
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [val, name === 'penduduk' ? 'Jiwa' : 'Kepala Keluarga']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="penduduk" fill="#059669" radius={[4, 4, 0, 0]} name="Jiwa Penduduk" />
                <Bar dataKey="kk" fill="#0284c7" radius={[4, 4, 0, 0]} name="Kepala Keluarga" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Komposisi Jenis Kelamin */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Komposisi Gender</h3>
              <p className="text-xs text-slate-500">Perbandingan jenis kelamin warga</p>
            </div>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-sky-50 p-2.5 border border-sky-100">
              <span className="block text-[11px] text-sky-700 font-semibold">Laki-Laki</span>
              <span className="text-lg font-extrabold text-sky-900">{maleCount}</span>
              <span className="block text-[10px] text-slate-500">
                {totalResidents > 0 ? Math.round((maleCount / totalResidents) * 100) : 0}%
              </span>
            </div>
            <div className="rounded-lg bg-pink-50 p-2.5 border border-pink-100">
              <span className="block text-[11px] text-pink-700 font-semibold">Perempuan</span>
              <span className="text-lg font-extrabold text-pink-900">{femaleCount}</span>
              <span className="block text-[10px] text-slate-500">
                {totalResidents > 0 ? Math.round((femaleCount / totalResidents) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Charts & Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kelompok Umur Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Kelompok Umur</h3>
            <p className="text-xs text-slate-500">Piramida demografi usia penduduk desa</p>
          </div>
          <div className="space-y-3">
            {ageDistribution.map((item, idx) => {
              const pct = totalResidents > 0 ? Math.round((item.count / totalResidents) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900 font-bold">{item.count} orang ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pelayanan Surat Real-time Monitor */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Permohonan Surat Terbaru</h3>
              <p className="text-xs text-slate-500">Status antrean E-Surat</p>
            </div>
            <button
              onClick={() => onNavigate('layanan-surat')}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Semua Surat
            </button>
          </div>
          <div className="space-y-3">
            {letterRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-xs font-bold text-slate-900">{req.letterTypeName}</p>
                  <p className="truncate text-[11px] text-slate-500">{req.residentName} • {req.submissionChannel}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  req.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                  req.status === 'Disetujui' ? 'bg-teal-100 text-teal-800' :
                  req.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' :
                  req.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda & Pengumuman Desa */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Agenda & Pengumuman</h3>
              <p className="text-xs text-slate-500">Informasi publik resmi desa</p>
            </div>
            <button
              onClick={() => onNavigate('pengumuman')}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Kelola
            </button>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDateIndo(ann.publishedDate)}</span>
                </div>
                <h4 className="mt-1 text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log / Aktivitas Terbaru */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Audit Trail & Log Aktivitas Petugas</h3>
            <p className="text-xs text-slate-500">Pencatatan riwayat aksi sistem sesuai standar keamanan tata kelola desa</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Terekam Aman
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pengguna</th>
                <th className="py-2.5 px-3">Modul</th>
                <th className="py-2.5 px-3">Aksi</th>
                <th className="py-2.5 px-3">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{formatDateTimeIndo(log.timestamp)}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-800">
                    {log.username} <span className="text-[10px] font-normal text-slate-500">({log.role})</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-emerald-800">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
