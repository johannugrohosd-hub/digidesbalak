import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  Download,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Globe,
  CheckCircle2,
  Server,
  CloudUpload,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { downloadDistZipFile } from '../../utils/downloadZip';
import { useToast } from './Toast';

interface DeployDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployDownloadModal: React.FC<DeployDownloadModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      showToast('Sedang menyiapkan paket dist.zip...', 'info');
      await downloadDistZipFile();
      showToast('Berkas dist-digital-desa-pro.zip berhasil diunduh ke komputer Anda!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunduh berkas zip', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(label);
    showToast(`Disalin: ${label}`, 'success');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unduh Folder dist & Solusi Akses Online di HP (Bebas Error 403)"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-slate-700">
        {/* Tombol Utama Download Dist */}
        <div className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-2xs">
                Build Produksi Siap Pakai
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                dist-digital-desa-pro.zip (1.1 MB)
              </h3>
              <p className="text-xs text-slate-600">
                Berisi seluruh berkas web statis lengkap (HTML, CSS, JS, Ikon) hasil kompilasi <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">npm run build</code>.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-md shrink-0 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Mengunduh...' : 'Unduh File dist.zip Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Kotak Penjelasan Error 403 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 text-xs">
          <div className="flex items-start gap-2.5 text-amber-900">
            <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Mengapa Muncul "403. That's an error" saat Dibuka di HP?
              </h4>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                Link preview <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-amber-200">ais-pre-*.run.app</code> dilindungi sistem keamanan <strong>Google Cloud IAP (Identity-Aware Proxy)</strong>. Link tersebut hanya mengizinkan akun Google pengembang (<strong>johan.nugroho.sd@gmail.com</strong>). Ketika dibuka di HP lain atau browser yang belum login akun tersebut, Google langsung menampilkan error 403.
              </p>
            </div>
          </div>
        </div>

        {/* 2 Cara Mengatasi Error 403 & Akses dari HP */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-700" />
            2 Cara Membuka Aplikasi dari Handphone (HP)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Opsi 1: Login Akun Google di HP */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">1</span>
                <h5 className="font-bold text-slate-900">Login Google di Browser HP</h5>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Jika ingin tetap menggunakan link Google Cloud Run preview:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Buka browser Google Chrome atau Safari di HP Anda.</li>
                <li>Login dengan akun Google: <strong className="text-slate-800">johan.nugroho.sd@gmail.com</strong></li>
                <li>Buka kembali link preview Cloud Run. Halaman akan terbuka lancar tanpa pesan 403.</li>
              </ul>
            </div>

            {/* Opsi 2: Deploy Gratis ke Netlify / Vercel (Rekomendasi Publik) */}
            <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-50/30 p-4 space-y-2 relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Paling Direkomendasikan
              </span>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">2</span>
                <h5 className="font-bold text-emerald-950">Deploy Gratis ke Netlify Drop (1 Menit)</h5>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Menghasilkan website desa publik resmi yang <strong>bisa diakses oleh siapa saja di seluruh dunia tanpa login Google</strong>:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Unduh <code className="font-semibold text-emerald-900">dist.zip</code> lalu ekstrak folder <code className="font-semibold text-emerald-900">dist</code> di komputer Anda.</li>
                <li>Buka <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">Netlify Drop <ExternalLink className="h-3 w-3" /></a> (gratis tanpa registrasi).</li>
                <li>Tarik (Drag & Drop) folder <code className="font-bold">dist</code> ke halaman web tersebut.</li>
                <li>Selesai! Anda mendapatkan link publik seperti <code className="font-bold text-emerald-900">https://desa-sukamaju.netlify.app</code>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Panduan Integrasi Supabase */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-700" />
            <h5 className="font-bold text-slate-900 text-sm">Penyimpanan Database Cloud (Supabase PostgreSQL)</h5>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Web yang di-deploy ke Netlify, Vercel, ataupun cPanel desa dapat langsung tersambung ke database Supabase Cloud 24/7. Seluruh data kependudukan, pengajuan surat warga, dan aset tersimpan di server cloud.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                const settingsBtn = document.querySelector('[data-nav="pengaturan"]') as HTMLElement;
                if (settingsBtn) settingsBtn.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
            >
              <span>Buka Menu Pengaturan Supabase</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
