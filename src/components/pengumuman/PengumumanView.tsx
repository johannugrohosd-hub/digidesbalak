import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Pin, Calendar } from 'lucide-react';
import { Announcement, User } from '../../types';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { formatDateIndo } from '../../utils/formatters';

interface PengumumanViewProps {
  announcements: Announcement[];
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onAddAnnouncement: (data: Omit<Announcement, 'id' | 'publishedDate'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const PengumumanView: React.FC<PengumumanViewProps> = ({
  announcements,
  currentUser,
  onNavigate,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Umum');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [authorName, setAuthorName] = useState(currentUser?.fullName || 'Sekretariat Desa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi!', 'error');
      return;
    }

    onAddAnnouncement({
      title: title.trim(),
      category,
      content: content.trim(),
      isPinned,
      authorName,
    });

    showToast('Pengumuman resmi desa berhasil dipublikasikan!', 'success');
    setIsAddOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[{ label: 'Tata Kelola Pemerintahan' }, { label: 'Pengumuman Resmi Desa' }]}
        onNavigate={onNavigate}
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Pengumuman Baru</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map(ann => (
          <div
            key={ann.id}
            className={`rounded-xl border p-5 shadow-xs transition space-y-3 ${
              ann.isPinned ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {ann.category}
                </span>
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    <Pin className="h-3 w-3" /> Dipin
                  </span>
                )}
              </div>
              <button
                onClick={() => onDeleteAnnouncement(ann.id)}
                className="text-slate-400 hover:text-red-600 p-1 rounded"
                title="Hapus Pengumuman"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{ann.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDateIndo(ann.publishedDate)}</span>
              </span>
              <span>Penulis: <b>{ann.authorName}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Buat Pengumuman Publik Desa">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Penyaluran BLT Dana Desa Tahap IV..."
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Announcement['category'])}
                className="w-full rounded border border-slate-300 p-2 bg-white"
              >
                <option value="Pelayanan">Pelayanan</option>
                <option value="Kegiatan">Kegiatan Desa</option>
                <option value="Bantuan Sosial">Bantuan Sosial</option>
                <option value="Pembangunan">Pembangunan</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Penulis / Unit</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full rounded border border-slate-300 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Isi Berita / Pengumuman</label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tuliskan detail pengumuman untuk seluruh warga..."
              className="w-full rounded border border-slate-300 p-2"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={isPinned}
              onChange={e => setIsPinned(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <label htmlFor="pinned" className="font-semibold text-slate-700">
              Pin pengumuman ini di posisi teratas
            </label>
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
              Publikasikan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
