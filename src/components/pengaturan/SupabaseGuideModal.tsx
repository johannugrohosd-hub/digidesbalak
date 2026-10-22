import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Send,
  ShieldCheck,
  Check,
  Download,
  Zap,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { useToast } from '../common/Toast';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncAllLocalToSupabase,
  fetchAllFromSupabase,
  initializeRealtimeSubscription,
  resetSupabaseClient,
  SupabaseConfig
} from '../../services/supabaseClient';
import { StorageService } from '../../services/storageService';
import { FULL_SUPABASE_SCHEMA_SQL } from '../../services/supabaseSqlSchema';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded?: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const { showToast } = useToast();

  const [config, setConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableCount?: number } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedSupabaseConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const cleanUrl = config.url.trim();
    const cleanKey = config.anonKey.trim();

    const result = await testSupabaseConnection(cleanUrl, cleanKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      const updated: SupabaseConfig = {
        ...config,
        url: cleanUrl,
        anonKey: cleanKey,
        isConnected: true,
        isRealtimeActive: true,
      };
      saveSupabaseConfig(updated);
      setConfig(updated);
      resetSupabaseClient();
      initializeRealtimeSubscription();
      showToast('Koneksi ke Supabase berhasil terhubung! Realtime aktif.', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);

    const settings = StorageService.getSettings();
    const residents = StorageService.getResidents();
    const letterRequests = StorageService.getLetterRequests();
    const complaints = StorageService.getComplaints();
    const assets = StorageService.getAssets();
    const announcements = StorageService.getAnnouncements();
    const agendaLetters = StorageService.getAgendaLetters();
    const familyCards = StorageService.getFamilyCards();
    const users = StorageService.getUsers();
    const officials = StorageService.getOfficials();

    const result = await syncAllLocalToSupabase({
      settings,
      residents,
      letterRequests,
      complaints,
      assets,
      announcements,
      agendaLetters,
      familyCards,
      users,
      officials,
    });

    setSyncing(false);
    if (result.success) {
      showToast(result.message, 'success');
      setConfig(getSavedSupabaseConfig());
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePullData = async () => {
    setPulling(true);
    const result = await fetchAllFromSupabase();
    setPulling(false);

    if (result.success && result.data) {
      if (result.data.settings) {
        StorageService.updateSettings(result.data.settings);
      }
      if (result.data.residents) {
        localStorage.setItem('digides_residents', JSON.stringify(result.data.residents));
      }
      if (result.data.letterRequests) {
        localStorage.setItem('digides_letter_requests', JSON.stringify(result.data.letterRequests));
      }
      if (result.data.complaints) {
        localStorage.setItem('digides_complaints', JSON.stringify(result.data.complaints));
      }
      if (result.data.announcements) {
        localStorage.setItem('digides_announcements', JSON.stringify(result.data.announcements));
      }
      if (result.data.assets) {
        localStorage.setItem('digides_assets', JSON.stringify(result.data.assets));
      }
      if (result.data.agendaLetters) {
        localStorage.setItem('digides_agenda_letters', JSON.stringify(result.data.agendaLetters));
      }
      if (result.data.familyCards) {
        localStorage.setItem('digides_family_cards', JSON.stringify(result.data.familyCards));
      }
      if (result.data.officials) {
        localStorage.setItem('digides_officials', JSON.stringify(result.data.officials));
      }

      showToast('Data terbaru dari Supabase Cloud berhasil dimuat ke aplikasi lokal!', 'success');
      if (onDataReloaded) {
        onDataReloaded();
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    showToast('Script SQL Supabase 14 Tabel & Realtime berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([FULL_SUPABASE_SCHEMA_SQL], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema_supabase_digital_desa_realtime.sql';
    link.click();
    URL.revokeObjectURL(url);
    showToast('File schema_supabase_digital_desa_realtime.sql berhasil diunduh!', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integrasi Database Menyeluruh Supabase & Realtime"
      maxWidth="xl"
    >
      <div className="space-y-6 text-slate-700">
        {/* Banner Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Supabase Realtime PostgreSQL Database
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Zap className="h-3 w-3 fill-emerald-600" />
                  REALTIME AKTIF
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                14 Tabel lengkap terhubung secara instan dan sinkron dua arah via WebSocket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                config.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  config.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {config.isConnected ? 'Terhubung (Realtime Aktif)' : 'Mode Standalone / Lokal'}
            </span>
          </div>
        </div>

        {/* Form Konfigurasi Credential */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Kredensial API Supabase Proyek Desa
          </h5>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project URL Supabase <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://abcdefghijklm.supabase.co"
                value={config.url}
                onChange={e => setConfig({ ...config, url: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dapat dilihat di Dashboard Supabase &gt; Project Settings &gt; API &gt; Project URL
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project API Anon Key (Public Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.anonKey}
                onChange={e => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dapat dilihat di Dashboard Supabase &gt; Project Settings &gt; API &gt; Project API Keys &gt; anon public
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !config.url || !config.anonKey}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              <span>{testing ? 'Menguji Jaringan...' : 'Simpan & Uji Koneksi Realtime'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline"
            >
              <span>Buka Supabase Dashboard</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-lg text-xs font-medium border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Tindakan Sinkronisasi & Migrasi */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-teal-700" />
              Sinkronisasi & Migrasi Data 15 Tabel
            </h5>
            {config.lastSyncAt && (
              <span className="text-[11px] text-slate-500">
                Sinkron terakhir: <span className="font-semibold text-slate-700">{config.lastSyncAt}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Data aplikasi dapat disinkronkan secara massal ke Supabase Cloud (Push) atau ditarik kembali dari Cloud ke perangkat lokal (Pull).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleSyncData}
              disabled={syncing || !config.isConnected}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white p-3 text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpFromLine className="h-4 w-4" />
              )}
              <span>{syncing ? 'Mengunggah Data...' : 'Unggah Data Lokal ke Supabase (Push)'}</span>
            </button>

            <button
              onClick={handlePullData}
              disabled={pulling || !config.isConnected}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-700 bg-white hover:bg-teal-50 text-teal-900 p-3 text-xs font-bold transition disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {pulling ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-4 w-4 text-teal-700" />
              )}
              <span>{pulling ? 'Menarik Data...' : 'Tarik Data Terbaru dari Cloud (Pull)'}</span>
            </button>
          </div>
        </div>

        {/* Script SQL 15 Tabel & Realtime */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-700" />
                Script SQL Database 15 Tabel + Realtime Publication & Reset Password
              </h5>
              <p className="text-xs text-slate-500">
                Eksekusi sekali di Supabase SQL Editor untuk membuat seluruh tabel, trigger updated_at, fungsi reset password super admin, dan mengaktifkan WebSocket Realtime
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
              <button
                onClick={downloadSqlFile}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh .sql</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800">Daftar 15 Tabel yang Dibuat:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px] font-mono font-medium">
              {[
                'village_settings',
                'users',
                'residents',
                'family_cards',
                'village_districts',
                'neighborhood_units',
                'letter_types',
                'letter_requests',
                'village_officials',
                'announcements',
                'complaints',
                'village_assets',
                'agenda_letters',
                'audit_logs',
                'password_reset_logs',
              ].map(table => (
                <div key={table} className="flex items-center gap-1.5 p-1.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate">{table}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowSqlPreview(!showSqlPreview)}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              {showSqlPreview ? 'Sembunyikan Pratinjau Kode SQL' : 'Lihat Pratinjau Kode SQL Lengkap...'}
            </button>

            {showSqlPreview && (
              <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-[11px] text-emerald-400">
                <pre>{FULL_SUPABASE_SCHEMA_SQL}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Panduan 3 Langkah Cepat */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
          <p className="font-bold text-slate-800">Cara Penggunaan Cepat:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
            <li>Buka <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query</strong>, lalu tempel (Paste) atau jalankan file script SQL di atas.</li>
            <li>Klik tombol <strong>Run</strong> untuk mengeksekusi pembuatan 14 tabel dan publikasi realtime.</li>
            <li>Salin <strong>Project URL</strong> dan <strong>Anon Public Key</strong> ke kolom di atas, lalu klik <strong>Simpan & Uji Koneksi Realtime</strong>. Selesai! Data Anda akan sinkron secara instan 24/7.</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};
