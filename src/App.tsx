import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { StorageService } from './services/storageService';
import {
  User,
  VillageSettings,
  Resident,
  FamilyCard,
  VillageDistrict,
  NeighborhoodUnit,
  LetterRequest,
  LetterType,
  VillageOfficial,
  Announcement,
  Complaint,
  VillageAsset,
  AgendaLetter,
  AuditLog,
  LetterStatus
} from './types';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PendudukList } from './components/penduduk/PendudukList';
import { KartuKeluargaList } from './components/kartuKeluarga/KartuKeluargaList';
import { WilayahView } from './components/wilayah/WilayahView';
import { LayananSuratList } from './components/layananSurat/LayananSuratList';
import { AgendaSuratView } from './components/agendaSurat/AgendaSuratView';
import { PortalWargaView } from './components/portalWarga/PortalWargaView';
import { PerangkatDesaView } from './components/perangkatDesa/PerangkatDesaView';
import { AsetDesaView } from './components/aset/AsetDesaView';
import { PengaduanAdminView } from './components/pengaduan/PengaduanAdminView';
import { PengumumanView } from './components/pengumuman/PengumumanView';
import { LaporanView } from './components/laporan/LaporanView';
import { PenggunaView } from './components/pengguna/PenggunaView';
import { PengaturanView } from './components/pengaturan/PengaturanView';
import { LoginView } from './components/auth/LoginView';
import { PublicHomePortal } from './components/portal/PublicHomePortal';
import {
  initializeRealtimeSubscription,
  onSupabaseRealtimeEvent,
  mapSnakeToResident,
  mapSnakeToLetterRequest,
  mapSnakeToComplaint,
  mapSnakeToSettings,
  mapSnakeToAnnouncement,
  mapSnakeToOfficial,
  mapSnakeToUser,
  pushResidentChangeToSupabase,
  deleteResidentFromSupabase,
  pushLetterRequestChangeToSupabase,
  pushComplaintChangeToSupabase,
  pushSettingsChangeToSupabase,
  pushOfficialChangeToSupabase,
  deleteOfficialFromSupabase,
  pushUserChangeToSupabase
} from './services/supabaseClient';

function MainApp() {
  const { showToast } = useToast();

  // Primary state loaded from StorageService
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [settings, setSettings] = useState<VillageSettings>(() => StorageService.getSettings());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [residents, setResidents] = useState<Resident[]>(() => StorageService.getResidents());
  const [familyCards, setFamilyCards] = useState<FamilyCard[]>(() => StorageService.getFamilyCards());
  const [districts, setDistricts] = useState<VillageDistrict[]>(() => StorageService.getDistricts());
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodUnit[]>(() => StorageService.getNeighborhoodUnits());
  const [letterRequests, setLetterRequests] = useState<LetterRequest[]>(() => StorageService.getLetterRequests());
  const [letterTypes, setLetterTypes] = useState<LetterType[]>(() => StorageService.getLetterTypes());
  const [officials, setOfficials] = useState<VillageOfficial[]>(() => StorageService.getOfficials());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [complaints, setComplaints] = useState<Complaint[]>(() => StorageService.getComplaints());
  const [assets, setAssets] = useState<VillageAsset[]>(() => StorageService.getAssets());
  const [agendaLetters, setAgendaLetters] = useState<AgendaLetter[]>(() => StorageService.getAgendaLetters());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Navigation state
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  // Sync state helper
  const reloadData = () => {
    setSettings(StorageService.getSettings());
    setUsers(StorageService.getUsers());
    setResidents(StorageService.getResidents());
    setFamilyCards(StorageService.getFamilyCards());
    setLetterRequests(StorageService.getLetterRequests());
    setOfficials(StorageService.getOfficials());
    setAnnouncements(StorageService.getAnnouncements());
    setComplaints(StorageService.getComplaints());
    setAssets(StorageService.getAssets());
    setAgendaLetters(StorageService.getAgendaLetters());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Initialize Supabase Realtime Listener across all 14 tables
  useEffect(() => {
    initializeRealtimeSubscription();

    const unsubscribe = onSupabaseRealtimeEvent(event => {
      if (event.table === 'residents') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToResident(event.record);
          setResidents(prev => {
            const exists = prev.some(r => r.id === mapped.id || r.nik === mapped.nik);
            if (exists) {
              return prev.map(r => (r.id === mapped.id || r.nik === mapped.nik ? mapped : r));
            }
            return [mapped, ...prev];
          });
          showToast(`Data penduduk (${mapped.fullName}) disinkronkan via Supabase Realtime`, 'info');
        } else if (event.eventType === 'DELETE') {
          const id = event.oldRecord?.id;
          if (id) {
            setResidents(prev => prev.filter(r => r.id !== id));
          }
        }
      } else if (event.table === 'letter_requests') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToLetterRequest(event.record);
          setLetterRequests(prev => {
            const exists = prev.some(lr => lr.id === mapped.id || lr.requestNumber === mapped.requestNumber);
            if (exists) {
              return prev.map(lr => (lr.id === mapped.id || lr.requestNumber === mapped.requestNumber ? mapped : lr));
            }
            return [mapped, ...prev];
          });
          showToast(`Surat #${mapped.requestNumber} disinkronkan via Supabase Realtime`, 'info');
        }
      } else if (event.table === 'complaints') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToComplaint(event.record);
          setComplaints(prev => {
            const exists = prev.some(c => c.id === mapped.id || c.ticketNumber === mapped.ticketNumber);
            if (exists) {
              return prev.map(c => (c.id === mapped.id || c.ticketNumber === mapped.ticketNumber ? mapped : c));
            }
            return [mapped, ...prev];
          });
          showToast(`Pengaduan #${mapped.ticketNumber} disinkronkan via Supabase Realtime`, 'info');
        }
      } else if (event.table === 'village_settings') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToSettings(event.record);
          setSettings(mapped);
          showToast('Pengaturan desa diperbarui via Supabase Realtime', 'info');
        }
      } else if (event.table === 'announcements') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToAnnouncement(event.record);
          setAnnouncements(prev => {
            const exists = prev.some(a => a.id === mapped.id);
            if (exists) {
              return prev.map(a => (a.id === mapped.id ? mapped : a));
            }
            return [mapped, ...prev];
          });
        }
      } else if (event.table === 'village_officials') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToOfficial(event.record);
          setOfficials(prev => {
            const exists = prev.some(o => o.id === mapped.id);
            if (exists) {
              return prev.map(o => (o.id === mapped.id ? mapped : o));
            }
            return [...prev, mapped].sort((a, b) => a.orderIndex - b.orderIndex);
          });
          showToast(`Data & foto profil pejabat (${mapped.name}) disinkronkan via Supabase Realtime`, 'info');
        } else if (event.eventType === 'DELETE') {
          const id = event.oldRecord?.id;
          if (id) {
            setOfficials(prev => prev.filter(o => o.id !== id));
          }
        }
      } else if (event.table === 'users') {
        if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
          const mapped = mapSnakeToUser(event.record);
          setUsers(prev => {
            const exists = prev.some(u => u.id === mapped.id || u.username === mapped.username);
            if (exists) {
              return prev.map(u => (u.id === mapped.id || u.username === mapped.username ? mapped : u));
            }
            return [...prev, mapped];
          });
          showToast(`Akun & kata sandi (${mapped.username}) disinkronkan via Supabase Realtime`, 'info');
        } else if (event.eventType === 'DELETE') {
          const id = event.oldRecord?.id;
          if (id) {
            setUsers(prev => prev.filter(u => u.id !== id));
          }
        }
      } else {
        reloadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auth handlers
  const handleLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setShowLoginScreen(false);
    if (user.role === 'warga') {
      setActivePage('portal-warga');
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogout = () => {
    StorageService.logout(currentUser || undefined);
    setCurrentUser(null);
    setShowLoginScreen(false);
    showToast('Anda telah keluar dari sistem dan kembali ke Portal Publik Desa', 'info');
  };

  const handleSwitchRole = (newUser: User) => {
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    if (newUser.role === 'warga') {
      setActivePage('portal-warga');
    }
    showToast(`Beralih simulasi peran ke: ${newUser.fullName} (${newUser.role})`, 'info');
  };

  // CRUD Handlers
  const handleSaveResident = (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    try {
      if (id) {
        const target = residents.find(r => r.id === id);
        if (!target) return;
        const updated = StorageService.updateResident({ ...target, ...data }, currentUser || undefined);
        pushResidentChangeToSupabase(updated);
        showToast('Data penduduk berhasil diperbarui', 'success');
      } else {
        const added = StorageService.addResident(data, currentUser || undefined);
        pushResidentChangeToSupabase(added);
        showToast('Penduduk baru berhasil didaftarkan ke sistem', 'success');
      }
      reloadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal menyimpan data penduduk', 'error');
    }
  };

  const handleDeleteResident = (id: string) => {
    StorageService.deleteResident(id, currentUser || undefined);
    deleteResidentFromSupabase(id);
    reloadData();
  };

  const handleImportResidents = (newResidents: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    newResidents.forEach(nr => {
      try {
        const added = StorageService.addResident(nr, currentUser || undefined);
        pushResidentChangeToSupabase(added);
      } catch (e) {
        // Continue on existing
      }
    });
    reloadData();
  };

  const handleAddFamilyCard = (card: Omit<FamilyCard, 'id'>) => {
    StorageService.addFamilyCard(card, currentUser || undefined);
    reloadData();
  };

  const handleCreateLetterRequest = (data: {
    letterTypeCode: string;
    residentId?: string;
    nik?: string;
    residentName?: string;
    purpose: string;
    extraFields?: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }) => {
    const created = StorageService.createLetterRequest(data, currentUser || undefined);
    pushLetterRequestChangeToSupabase(created);
    reloadData();
  };

  const handleUpdateLetterStatus = (
    requestId: string,
    newStatus: LetterStatus,
    options?: { rejectionReason?: string; currentUser?: User }
  ) => {
    const updated = StorageService.updateLetterStatus(requestId, newStatus, options);
    if (updated) {
      pushLetterRequestChangeToSupabase(updated);
    }
    reloadData();
  };

  const handleAddAnnouncement = (data: Omit<Announcement, 'id' | 'publishedDate'>) => {
    StorageService.addAnnouncement(data, currentUser || undefined);
    reloadData();
  };

  const handleDeleteAnnouncement = (id: string) => {
    StorageService.deleteAnnouncement(id, currentUser || undefined);
    reloadData();
    showToast('Pengumuman berhasil dihapus', 'info');
  };

  const handleSubmitComplaint = (data: {
    residentName: string;
    nik: string;
    phone: string;
    category: Complaint['category'];
    subject: string;
    description: string;
    location?: string;
  }) => {
    const added = StorageService.addComplaint(data, currentUser || undefined);
    pushComplaintChangeToSupabase(added);
    reloadData();
  };

  const handleRespondComplaint = (id: string, responseNotes: string, status: Complaint['status']) => {
    if (!currentUser) return;
    const updated = StorageService.respondComplaint(id, responseNotes, status, currentUser);
    if (updated) {
      pushComplaintChangeToSupabase(updated);
    }
    reloadData();
  };

  const handleAddAsset = (asset: Omit<VillageAsset, 'id'>) => {
    StorageService.addAsset(asset, currentUser || undefined);
    reloadData();
  };

  const handleDeleteAsset = (id: string) => {
    StorageService.deleteAsset(id, currentUser || undefined);
    reloadData();
    showToast('Aset telah dihapus dari buku inventaris', 'info');
  };

  const handleAddAgenda = (data: Omit<AgendaLetter, 'id'>) => {
    StorageService.addAgendaLetter(data, currentUser || undefined);
    reloadData();
  };

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const created = StorageService.addUser(userData, currentUser || undefined);
    pushUserChangeToSupabase(created);
    reloadData();
  };

  const handleUpdateUser = (user: User) => {
    StorageService.updateUser(user, currentUser || undefined);
    pushUserChangeToSupabase(user);
    reloadData();
  };

  const handleDeleteUser = (userId: string) => {
    StorageService.deleteUser(userId, currentUser || undefined);
    reloadData();
  };

  const handleUpdateOfficial = (official: VillageOfficial) => {
    const updated = StorageService.updateOfficial(official, currentUser || undefined);
    pushOfficialChangeToSupabase(updated);
    reloadData();
    showToast(`Data perangkat desa ${official.name} dan foto profil berhasil disimpan!`, 'success');
  };

  const handleAddOfficial = (data: Omit<VillageOfficial, 'id'>) => {
    const added = StorageService.addOfficial(data, currentUser || undefined);
    pushOfficialChangeToSupabase(added);
    reloadData();
    showToast(`Perangkat desa baru ${added.name} berhasil ditambahkan ke database!`, 'success');
  };

  const handleDeleteOfficial = (id: string) => {
    StorageService.deleteOfficial(id, currentUser || undefined);
    deleteOfficialFromSupabase(id);
    reloadData();
    showToast('Data perangkat desa telah dihapus!', 'info');
  };

  const handleUpdateSettings = (newSettings: VillageSettings) => {
    StorageService.updateSettings(newSettings, currentUser || undefined);
    pushSettingsChangeToSupabase(newSettings);
    setSettings(newSettings);
    reloadData();
  };

  const handleEmptyData = () => {
    StorageService.emptyAllOperationalData(currentUser || undefined);
    reloadData();
    showToast('Seluruh data operasional penduduk, surat, dan transaksi telah dikosongkan!', 'info');
  };

  const handleLoadDemoData = () => {
    StorageService.loadDemoData(currentUser || undefined);
    reloadData();
    showToast('Data simulasi kependudukan dan surat berhasil dimuat!', 'success');
  };

  const handleResetData = () => {
    StorageService.resetAllData(currentUser || undefined);
    reloadData();
    showToast('Database berhasil di-reset ke data bawaan!', 'info');
  };

  // If unauthenticated: default to Public Home Portal, or Login View if user clicked login
  if (!currentUser) {
    if (showLoginScreen) {
      return (
        <LoginView
          settings={settings}
          users={users}
          onLogin={handleLogin}
          onBackToPortal={() => setShowLoginScreen(false)}
          onUserUpdated={reloadData}
        />
      );
    }

    return (
      <PublicHomePortal
        settings={settings}
        letterTypes={letterTypes}
        letterRequests={letterRequests}
        officials={officials}
        announcements={announcements}
        districts={districts}
        residents={residents}
        familyCards={familyCards}
        complaints={complaints}
        onOpenLogin={() => setShowLoginScreen(true)}
        onSubmitComplaint={(data) => {
          handleSubmitComplaint(data);
          showToast('Aspirasi/pengaduan Anda telah dikirim ke kantor desa!', 'success');
        }}
        onSubmitLetterRequest={(data) => {
          handleCreateLetterRequest({
            letterTypeCode: data.letterTypeCode,
            residentId: data.residentId || '',
            nik: data.nik,
            residentName: data.residentName,
            purpose: data.purpose,
            extraFields: data.extraFields || {},
            submissionChannel: 'Portal Warga'
          });
          showToast('Permohonan surat mandiri Anda telah dikirim ke kantor desa!', 'success');
        }}
      />
    );
  }

  // Pending items for header alerts
  const pendingLetters = letterRequests.filter(
    r => r.status === 'Menunggu Persetujuan' || r.status === 'Diajukan'
  );
  const pendingComplaints = complaints.filter(c => c.status === 'Menunggu');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        currentUser={currentUser}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Body Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          settings={settings}
          pendingLetters={pendingLetters}
          pendingComplaints={pendingComplaints}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          allUsers={users}
          onNavigate={setActivePage}
          onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activePage === 'dashboard' && (
              <DashboardView
                settings={settings}
                currentUser={currentUser}
                residents={residents}
                familyCards={familyCards}
                districts={districts}
                letterRequests={letterRequests}
                complaints={complaints}
                announcements={announcements}
                auditLogs={auditLogs}
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'penduduk' && (
              <PendudukList
                residents={residents}
                districts={districts}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onSaveResident={handleSaveResident}
                onDeleteResident={handleDeleteResident}
                onImportResidents={handleImportResidents}
              />
            )}

            {activePage === 'kartu-keluarga' && (
              <KartuKeluargaList
                familyCards={familyCards}
                residents={residents}
                districts={districts}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onAddFamilyCard={handleAddFamilyCard}
              />
            )}

            {activePage === 'wilayah' && (
              <WilayahView
                districts={districts}
                neighborhoods={neighborhoods}
                residents={residents}
                familyCards={familyCards}
                onNavigate={setActivePage}
              />
            )}

            {(activePage === 'layanan-surat' || activePage === 'arsip-surat') && (
              <LayananSuratList
                letterRequests={letterRequests}
                letterTypes={letterTypes}
                residents={residents}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onCreateLetterRequest={handleCreateLetterRequest}
                onUpdateStatus={handleUpdateLetterStatus}
              />
            )}

            {activePage === 'agenda-surat' && (
              <AgendaSuratView
                agendaLetters={agendaLetters}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onAddAgenda={handleAddAgenda}
              />
            )}

            {activePage === 'portal-warga' && (
              <PortalWargaView
                currentUser={currentUser}
                residents={residents}
                letterRequests={letterRequests}
                letterTypes={letterTypes}
                complaints={complaints}
                announcements={announcements}
                settings={settings}
                onNavigate={setActivePage}
                onSubmitLetterRequest={handleCreateLetterRequest}
                onSubmitComplaint={handleSubmitComplaint}
              />
            )}

            {activePage === 'perangkat-desa' && (
              <PerangkatDesaView
                officials={officials}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onUpdateOfficial={handleUpdateOfficial}
                onAddOfficial={handleAddOfficial}
                onDeleteOfficial={handleDeleteOfficial}
              />
            )}

            {activePage === 'aset' && (
              <AsetDesaView
                assets={assets}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onAddAsset={handleAddAsset}
                onDeleteAsset={handleDeleteAsset}
              />
            )}

            {activePage === 'pengaduan' && (
              <PengaduanAdminView
                complaints={complaints}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onRespondComplaint={handleRespondComplaint}
              />
            )}

            {activePage === 'pengumuman' && (
              <PengumumanView
                announcements={announcements}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}

            {activePage === 'laporan' && (
              <LaporanView
                residents={residents}
                familyCards={familyCards}
                letterRequests={letterRequests}
                complaints={complaints}
                assets={assets}
                districts={districts}
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'pengguna' && (
              <PenggunaView
                users={users}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activePage === 'portal-publik' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">Mode Pratinjau Portal Publik:</span>
                    <span>Halaman ini diakses oleh warga umum tanpa harus masuk ke sistem</span>
                  </div>
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                  >
                    <span>Kembali ke Dashboard Admin</span>
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
                  <PublicHomePortal
                    settings={settings}
                    letterTypes={letterTypes}
                    letterRequests={letterRequests}
                    officials={officials}
                    announcements={announcements}
                    districts={districts}
                    residents={residents}
                    familyCards={familyCards}
                    complaints={complaints}
                    onOpenLogin={() => {}}
                    isLoggedIn={true}
                    onBackToAdmin={() => setActivePage('dashboard')}
                    onSubmitComplaint={(data) => {
                      handleSubmitComplaint(data);
                      showToast('Aspirasi berhasil dikirim!', 'success');
                    }}
                    onSubmitLetterRequest={(data) => {
                      handleCreateLetterRequest({
                        letterTypeCode: data.letterTypeCode,
                        residentId: data.residentId || '',
                        nik: data.nik,
                        residentName: data.residentName,
                        purpose: data.purpose,
                        extraFields: data.extraFields || {},
                        submissionChannel: 'Portal Warga'
                      });
                      showToast('Permohonan surat berhasil dikirim!', 'success');
                    }}
                  />
                </div>
              </div>
            )}

            {activePage === 'pengaturan' && (
              <PengaturanView
                settings={settings}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onUpdateSettings={handleUpdateSettings}
                onResetData={handleResetData}
                onEmptyData={handleEmptyData}
                onLoadDemoData={handleLoadDemoData}
                onReloadData={reloadData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
