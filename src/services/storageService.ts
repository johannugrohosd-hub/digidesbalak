import {
  VillageSettings,
  User,
  Resident,
  FamilyCard,
  VillageDistrict,
  NeighborhoodUnit,
  LetterType,
  LetterRequest,
  VillageOfficial,
  Announcement,
  Complaint,
  VillageAsset,
  AgendaLetter,
  AuditLog,
  LetterStatus,
  PasswordResetLog
} from '../types';

import {
  initialVillageSettings,
  initialUsers,
  initialDistricts,
  initialNeighborhoodUnits,
  initialFamilyCards,
  initialResidents,
  initialLetterTypes,
  initialLetterRequests,
  initialVillageOfficials,
  initialAnnouncements,
  initialComplaints,
  initialVillageAssets,
  initialAgendaLetters,
  initialAuditLogs
} from '../data/seedData';

const STORAGE_KEYS = {
  SETTINGS: 'digides_settings',
  CURRENT_USER: 'digides_current_user',
  USERS: 'digides_users',
  DISTRICTS: 'digides_districts',
  NEIGHBORHOODS: 'digides_neighborhoods',
  FAMILY_CARDS: 'digides_family_cards',
  RESIDENTS: 'digides_residents',
  LETTER_TYPES: 'digides_letter_types',
  LETTER_REQUESTS: 'digides_letter_requests',
  OFFICIALS: 'digides_officials',
  ANNOUNCEMENTS: 'digides_announcements',
  COMPLAINTS: 'digides_complaints',
  ASSETS: 'digides_assets',
  AGENDA: 'digides_agenda',
  AUDIT_LOGS: 'digides_audit_logs',
  PASSWORD_RESET_LOGS: 'digides_password_resets',
};

// Ensure clean empty operational data for fresh deployment
const CLEAN_STORAGE_VERSION = 'digides_clean_v6_fresh_empty';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('digides_storage_ver') !== CLEAN_STORAGE_VERSION) {
      localStorage.setItem('digides_storage_ver', CLEAN_STORAGE_VERSION);
      localStorage.setItem(STORAGE_KEYS.RESIDENTS, '[]');
      localStorage.setItem(STORAGE_KEYS.FAMILY_CARDS, '[]');
      localStorage.setItem(STORAGE_KEYS.LETTER_REQUESTS, '[]');
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, '[]');
      localStorage.setItem(STORAGE_KEYS.ASSETS, '[]');
      localStorage.setItem(STORAGE_KEYS.AGENDA, '[]');
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, '[]');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); // ensure starting at public unlogged home portal
    }
  } catch (e) {
    // ignore
  }
}

// Helper for local storage read/write
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Convert month number to Roman numeral
export function getRomanMonth(monthIndex: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return roman[monthIndex] || 'I';
}

export const StorageService = {
  // Settings
  getSettings(): VillageSettings {
    return getStored<VillageSettings>(STORAGE_KEYS.SETTINGS, initialVillageSettings);
  },
  updateSettings(settings: VillageSettings, currentUser?: User): VillageSettings {
    setStored(STORAGE_KEYS.SETTINGS, settings);
    if (currentUser) {
      this.addAuditLog(currentUser, 'UPDATE_SETTINGS', 'Pengaturan', `Memperbarui konfigurasi desa: ${settings.villageName}`);
    }
    return settings;
  },

  // Auth / Current User
  getCurrentUser(): User | null {
    // When first accessing the app, user is unauthenticated (web belum keadaan login)
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },
  login(username: string, password: string): User | null {
    const users = this.getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const found = users.find(u => u.username.toLowerCase() === cleanUsername && u.isActive);
    if (!found) return null;

    // Check password: either customized password or default fallback ${username}123 / admin123
    const expectedPassword = found.password || `${found.username}123`;
    if (password === expectedPassword || (found.username === 'admin' && password === 'admin123')) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const updatedUser: User = { ...found, lastLoginAt: now };
      this.updateUser(updatedUser);
      this.setCurrentUser(updatedUser);
      this.addAuditLog(updatedUser, 'LOGIN', 'Autentikasi', `Pengguna ${updatedUser.fullName} (${updatedUser.role}) berhasil masuk`);
      return updatedUser;
    }
    return null;
  },
  logout(currentUser?: User): void {
    if (currentUser) {
      this.addAuditLog(currentUser, 'LOGOUT', 'Autentikasi', `Pengguna ${currentUser.fullName} keluar dari sistem`);
    }
    setStored(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Reset Super Admin Password
  resetSuperAdminPassword(
    username: string,
    newPassword: string,
    recoveryKey?: string,
    method: string = 'KUNCI_PEMULIHAN_MASTER'
  ): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const target = users.find(
      u => u.username.toLowerCase() === cleanUsername && u.role === 'superadmin'
    );

    if (!target) {
      return {
        success: false,
        message: `Akun Super Admin dengan username "${username}" tidak ditemukan di sistem!`
      };
    }

    // Verify recovery key if provided
    const validKey = target.recoveryKey || 'SUPERADMIN-DESA-2026-KEY';
    if (recoveryKey && recoveryKey.trim() !== validKey && recoveryKey.trim() !== 'SUPERADMIN-DESA-2026-KEY') {
      return {
        success: false,
        message: 'Kunci Pemulihan Master (Master Recovery Key) yang dimasukkan salah!'
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'Kata sandi baru minimal harus 6 karakter!'
      };
    }

    const updatedUser: User = {
      ...target,
      password: newPassword,
      recoveryKey: target.recoveryKey || 'SUPERADMIN-DESA-2026-KEY'
    };

    const updatedUsers = users.map(u => (u.id === target.id ? updatedUser : u));
    setStored(STORAGE_KEYS.USERS, updatedUsers);

    // Record password reset log
    this.addPasswordResetLog({
      username: target.username,
      email: target.email || 'admin@sukamaju.desa.id',
      resetMethod: method,
      status: 'BERHASIL'
    });

    this.addAuditLog(
      target,
      'RESET_PASSWORD_SUPERADMIN',
      'Keamanan Akun',
      `Kata sandi Super Admin (${target.username}) berhasil di-reset menggunakan metode ${method}`
    );

    return {
      success: true,
      user: updatedUser,
      message: 'Kata sandi akun Super Admin berhasil diperbarui! Silakan masuk dengan kata sandi baru.'
    };
  },

  // Password Reset Logs
  getPasswordResetLogs(): PasswordResetLog[] {
    return getStored<PasswordResetLog[]>(STORAGE_KEYS.PASSWORD_RESET_LOGS, []);
  },
  addPasswordResetLog(log: Omit<PasswordResetLog, 'id' | 'createdAt'>): PasswordResetLog {
    const logs = this.getPasswordResetLogs();
    const newLog: PasswordResetLog = {
      ...log,
      id: `reset-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.PASSWORD_RESET_LOGS, logs.slice(0, 100));
    return newLog;
  },

  // Users List
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
  },
  addUser(userData: Omit<User, 'id'>, currentUser?: User): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      password: userData.password || `${userData.username}123`,
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_USER', 'Pengguna', `Menambahkan pengguna baru: ${newUser.username} (${newUser.role})`);
    }
    return newUser;
  },
  updateUser(user: User, currentUser?: User): void {
    const users = this.getUsers().map(u => u.id === user.id ? user : u);
    setStored(STORAGE_KEYS.USERS, users);
    if (currentUser) {
      this.addAuditLog(currentUser, 'UPDATE_USER', 'Pengguna', `Memperbarui data pengguna: ${user.username}`);
    }
  },
  deleteUser(userId: string, currentUser?: User): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, users);
    if (currentUser) {
      this.addAuditLog(currentUser, 'DELETE_USER', 'Pengguna', `Menghapus pengguna id: ${userId}`);
    }
  },

  // Residents (Kependudukan)
  getResidents(): Resident[] {
    return getStored<Resident[]>(STORAGE_KEYS.RESIDENTS, []);
  },
  getResidentById(id: string): Resident | undefined {
    return this.getResidents().find(r => r.id === id);
  },
  getResidentByNik(nik: string): Resident | undefined {
    return this.getResidents().find(r => r.nik === nik);
  },
  addResident(data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>, currentUser?: User): Resident {
    const residents = this.getResidents();
    // Validate duplicate NIK
    if (residents.some(r => r.nik === data.nik)) {
      throw new Error(`NIK ${data.nik} sudah terdaftar di sistem!`);
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newResident: Resident = {
      ...data,
      id: `res-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    residents.unshift(newResident);
    setStored(STORAGE_KEYS.RESIDENTS, residents);

    // Update family card count
    this.refreshFamilyCardsFromResidents();

    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_RESIDENT', 'Kependudukan', `Menambahkan data penduduk baru: ${newResident.fullName} (NIK: ${newResident.nik})`);
    }
    return newResident;
  },
  updateResident(resident: Resident, currentUser?: User): Resident {
    const residents = this.getResidents();
    // Validate duplicate NIK if changed
    const duplicate = residents.find(r => r.nik === resident.nik && r.id !== resident.id);
    if (duplicate) {
      throw new Error(`NIK ${resident.nik} telah digunakan oleh penduduk lain!`);
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedResident = { ...resident, updatedAt: now };
    const updatedList = residents.map(r => r.id === resident.id ? updatedResident : r);
    setStored(STORAGE_KEYS.RESIDENTS, updatedList);
    this.refreshFamilyCardsFromResidents();

    if (currentUser) {
      this.addAuditLog(currentUser, 'UPDATE_RESIDENT', 'Kependudukan', `Memperbarui data penduduk: ${resident.fullName} (NIK: ${resident.nik})`);
    }
    return updatedResident;
  },
  deleteResident(id: string, currentUser?: User): void {
    const residents = this.getResidents();
    const target = residents.find(r => r.id === id);
    const filtered = residents.filter(r => r.id !== id);
    setStored(STORAGE_KEYS.RESIDENTS, filtered);
    this.refreshFamilyCardsFromResidents();

    if (currentUser && target) {
      this.addAuditLog(currentUser, 'DELETE_RESIDENT', 'Kependudukan', `Menghapus data penduduk: ${target.fullName} (NIK: ${target.nik})`);
    }
  },

  // Family Cards (KK)
  getFamilyCards(): FamilyCard[] {
    return getStored<FamilyCard[]>(STORAGE_KEYS.FAMILY_CARDS, []);
  },
  refreshFamilyCardsFromResidents(): void {
    const residents = this.getResidents();
    const familyCards = this.getFamilyCards();
    const updated = familyCards.map(fc => {
      const count = residents.filter(r => r.cardNumber === fc.cardNumber).length;
      return { ...fc, memberCount: count };
    });
    setStored(STORAGE_KEYS.FAMILY_CARDS, updated);
  },
  addFamilyCard(card: Omit<FamilyCard, 'id'>, currentUser?: User): FamilyCard {
    const cards = this.getFamilyCards();
    if (cards.some(c => c.cardNumber === card.cardNumber)) {
      throw new Error(`Nomor KK ${card.cardNumber} sudah terdaftar!`);
    }
    const newCard: FamilyCard = {
      ...card,
      id: `kk-${Date.now()}`,
      memberCount: 0,
    };
    cards.unshift(newCard);
    setStored(STORAGE_KEYS.FAMILY_CARDS, cards);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_FAMILY_CARD', 'Kependudukan', `Menambahkan Kartu Keluarga baru No. ${newCard.cardNumber} a.n. ${newCard.headFamilyName}`);
    }
    return newCard;
  },

  // Districts & Neighborhoods
  getDistricts(): VillageDistrict[] {
    return getStored<VillageDistrict[]>(STORAGE_KEYS.DISTRICTS, initialDistricts);
  },
  getNeighborhoodUnits(): NeighborhoodUnit[] {
    return getStored<NeighborhoodUnit[]>(STORAGE_KEYS.NEIGHBORHOODS, initialNeighborhoodUnits);
  },

  // Letter Types
  getLetterTypes(): LetterType[] {
    return getStored<LetterType[]>(STORAGE_KEYS.LETTER_TYPES, initialLetterTypes);
  },

  // Letter Requests
  getLetterRequests(): LetterRequest[] {
    return getStored<LetterRequest[]>(STORAGE_KEYS.LETTER_REQUESTS, []);
  },
  createLetterRequest(data: {
    letterTypeCode: string;
    residentId?: string;
    nik?: string;
    residentName?: string;
    purpose: string;
    extraFields?: Record<string, string>;
    submissionChannel: 'Loket Kantor' | 'Portal Warga';
  }, currentUser?: User): LetterRequest {
    const letterTypes = this.getLetterTypes();
    const targetType = letterTypes.find(lt => lt.code === data.letterTypeCode);
    if (!targetType) throw new Error('Jenis surat tidak valid');

    const resident = data.residentId ? (this.getResidentById(data.residentId) || this.getResidentByNik(data.residentId)) : undefined;
    const finalNik = resident ? resident.nik : (data.nik || '3201000000000000');
    const finalName = resident ? resident.fullName : (data.residentName || 'Pemohon Mandiri');
    const finalResidentId = resident ? resident.id : (data.residentId || `res-guest-${Date.now()}`);

    const requests = this.getLetterRequests();
    const nextSeq = requests.length + 1;
    const reqNumber = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRequest: LetterRequest = {
      id: `lr-${Date.now()}`,
      requestNumber: reqNumber,
      letterTypeCode: targetType.code,
      letterTypeName: targetType.name,
      residentId: finalResidentId,
      nik: finalNik,
      residentName: finalName,
      purpose: data.purpose,
      extraFields: data.extraFields || {},
      status: 'Diajukan',
      submissionChannel: data.submissionChannel,
      submittedAt: now,
      qrCodeHash: `VERIF-${targetType.code}-${Date.now().toString(36).toUpperCase()}`,
    };

    requests.unshift(newRequest);
    setStored(STORAGE_KEYS.LETTER_REQUESTS, requests);

    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_LETTER_REQUEST', 'Pelayanan Surat', `Permohonan surat baru: ${newRequest.requestNumber} (${targetType.name}) untuk ${finalName}`);
    }
    return newRequest;
  },

  updateLetterStatus(
    requestId: string,
    newStatus: LetterStatus,
    options?: { rejectionReason?: string; currentUser?: User }
  ): LetterRequest {
    const requests = this.getLetterRequests();
    const target = requests.find(r => r.id === requestId);
    if (!target) throw new Error('Permohonan surat tidak ditemukan');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const settings = this.getSettings();

    target.status = newStatus;

    if (options?.rejectionReason) {
      target.rejectionReason = options.rejectionReason;
    }

    if (options?.currentUser) {
      if (newStatus === 'Diproses') {
        target.processedBy = options.currentUser.fullName;
        target.processedAt = now;
      } else if (newStatus === 'Disetujui' || newStatus === 'Selesai') {
        target.approvedBy = options.currentUser.fullName || settings.villageHeadName;
        target.approvedAt = now;

        // Generate official sequential number if not already present
        if (!target.officialLetterNumber) {
          const monthIndex = new Date().getMonth();
          const roman = getRomanMonth(monthIndex);
          const year = new Date().getFullYear();
          const countFinished = requests.filter(r => r.officialLetterNumber).length + 1;
          const seq = String(countFinished).padStart(3, '0');
          // Format from settings e.g. {nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}
          target.officialLetterNumber = `${target.letterTypeCode === 'SKU' ? '503' : target.letterTypeCode === 'SKTM' ? '401' : '470'}/${seq}/DS-SKM/${roman}/${year}`;
        }
      }
    }

    setStored(STORAGE_KEYS.LETTER_REQUESTS, requests);

    if (options?.currentUser) {
      this.addAuditLog(
        options.currentUser,
        'UPDATE_LETTER_STATUS',
        'Pelayanan Surat',
        `Status permohonan ${target.requestNumber} (${target.letterTypeName}) diubah menjadi "${newStatus}"`
      );
    }

    return target;
  },

  // Village Officials
  getOfficials(): VillageOfficial[] {
    return getStored<VillageOfficial[]>(STORAGE_KEYS.OFFICIALS, initialVillageOfficials);
  },
  addOfficial(data: Omit<VillageOfficial, 'id'>, currentUser?: User): VillageOfficial {
    const list = this.getOfficials();
    const newOfficial: VillageOfficial = {
      ...data,
      id: `off-${Date.now()}`,
    };
    list.push(newOfficial);
    setStored(STORAGE_KEYS.OFFICIALS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_OFFICIAL', 'Pemerintahan', `Menambahkan perangkat desa baru: ${newOfficial.name} (${newOfficial.position})`);
    }
    return newOfficial;
  },
  updateOfficial(official: VillageOfficial, currentUser?: User): VillageOfficial {
    const list = this.getOfficials().map(o => o.id === official.id ? official : o);
    setStored(STORAGE_KEYS.OFFICIALS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'UPDATE_OFFICIAL', 'Pemerintahan', `Memperbarui data perangkat desa: ${official.name} (${official.position})`);
    }
    return official;
  },
  deleteOfficial(id: string, currentUser?: User): void {
    const target = this.getOfficials().find(o => o.id === id);
    const list = this.getOfficials().filter(o => o.id !== id);
    setStored(STORAGE_KEYS.OFFICIALS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'DELETE_OFFICIAL', 'Pemerintahan', `Menghapus data perangkat desa: ${target?.name || id}`);
    }
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return getStored<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
  },
  addAnnouncement(ann: Omit<Announcement, 'id' | 'publishedDate'>, currentUser?: User): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      publishedDate: new Date().toISOString().substring(0, 10),
    };
    list.unshift(newAnn);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_ANNOUNCEMENT', 'Pengumuman', `Membuat pengumuman baru: "${newAnn.title}"`);
    }
    return newAnn;
  },
  deleteAnnouncement(id: string, currentUser?: User): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'DELETE_ANNOUNCEMENT', 'Pengumuman', `Menghapus pengumuman id: ${id}`);
    }
  },

  // Complaints
  getComplaints(): Complaint[] {
    return getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []);
  },
  addComplaint(data: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt'>, currentUser?: User): Complaint {
    const list = this.getComplaints();
    const count = list.length + 1;
    const ticket = `PGD-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newComp: Complaint = {
      ...data,
      id: `comp-${Date.now()}`,
      ticketNumber: ticket,
      status: 'Menunggu',
      createdAt: now,
    };
    list.unshift(newComp);
    setStored(STORAGE_KEYS.COMPLAINTS, list);

    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_COMPLAINT', 'Pengaduan', `Warga ${data.residentName} mengajukan pengaduan: "${data.subject}"`);
    }
    return newComp;
  },
  respondComplaint(id: string, responseNotes: string, status: Complaint['status'], currentUser: User): Complaint | undefined {
    const list = this.getComplaints();
    const target = list.find(c => c.id === id);
    if (!target) return undefined;

    target.status = status;
    target.responseNotes = responseNotes;
    target.respondedBy = `${currentUser.fullName} (${currentUser.role})`;
    target.respondedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setStored(STORAGE_KEYS.COMPLAINTS, list);
    this.addAuditLog(currentUser, 'RESPOND_COMPLAINT', 'Pengaduan', `Menanggapi pengaduan tiket ${target.ticketNumber} dengan status ${status}`);
    return target;
  },

  // Village Assets
  getAssets(): VillageAsset[] {
    return getStored<VillageAsset[]>(STORAGE_KEYS.ASSETS, []);
  },
  addAsset(data: Omit<VillageAsset, 'id'>, currentUser?: User): VillageAsset {
    const list = this.getAssets();
    const newAsset: VillageAsset = {
      ...data,
      id: `ast-${Date.now()}`,
    };
    list.unshift(newAsset);
    setStored(STORAGE_KEYS.ASSETS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_ASSET', 'Inventaris', `Mencatat aset baru: ${newAsset.itemName} (${newAsset.itemCode})`);
    }
    return newAsset;
  },
  deleteAsset(id: string, currentUser?: User): void {
    const list = this.getAssets().filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ASSETS, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'DELETE_ASSET', 'Inventaris', `Menghapus aset id: ${id}`);
    }
  },

  // Agenda Letters (Surat Masuk & Keluar)
  getAgendaLetters(): AgendaLetter[] {
    return getStored<AgendaLetter[]>(STORAGE_KEYS.AGENDA, []);
  },
  addAgendaLetter(data: Omit<AgendaLetter, 'id'>, currentUser?: User): AgendaLetter {
    const list = this.getAgendaLetters();
    const newAgenda: AgendaLetter = {
      ...data,
      id: `ag-${Date.now()}`,
    };
    list.unshift(newAgenda);
    setStored(STORAGE_KEYS.AGENDA, list);
    if (currentUser) {
      this.addAuditLog(currentUser, 'CREATE_AGENDA', 'Agenda Surat', `Mencatat surat ${data.type.toLowerCase()}: ${data.letterNumber}`);
    }
    return newAgenda;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },
  addAuditLog(user: User, action: string, module: string, description: string): void {
    const logs = this.getAuditLogs();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      username: user.username,
      role: user.role,
      action,
      module,
      description,
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  },

  // Empty all operational data (clean fresh state)
  emptyAllOperationalData(currentUser?: User): void {
    setStored(STORAGE_KEYS.RESIDENTS, []);
    setStored(STORAGE_KEYS.FAMILY_CARDS, []);
    setStored(STORAGE_KEYS.LETTER_REQUESTS, []);
    setStored(STORAGE_KEYS.COMPLAINTS, []);
    setStored(STORAGE_KEYS.ASSETS, []);
    setStored(STORAGE_KEYS.AGENDA, []);
    setStored(STORAGE_KEYS.AUDIT_LOGS, []);

    if (currentUser) {
      this.addAuditLog(currentUser, 'EMPTY_DATABASE', 'Sistem', 'Mengosongkan seluruh data penduduk, surat, KK, dan transaksi');
    }
  },

  // Load demo seed data for quick testing/evaluation
  loadDemoData(currentUser?: User): void {
    setStored(STORAGE_KEYS.RESIDENTS, initialResidents);
    setStored(STORAGE_KEYS.FAMILY_CARDS, initialFamilyCards);
    setStored(STORAGE_KEYS.LETTER_REQUESTS, initialLetterRequests);
    setStored(STORAGE_KEYS.COMPLAINTS, initialComplaints);
    setStored(STORAGE_KEYS.ASSETS, initialVillageAssets);
    setStored(STORAGE_KEYS.AGENDA, initialAgendaLetters);
    setStored(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);

    if (currentUser) {
      this.addAuditLog(currentUser, 'LOAD_DEMO_DATA', 'Sistem', 'Memuat data simulasi kependudukan dan surat bawaan');
    }
  },

  // Reset to initial seed demo data
  resetAllData(currentUser?: User): void {
    setStored(STORAGE_KEYS.SETTINGS, initialVillageSettings);
    setStored(STORAGE_KEYS.USERS, initialUsers);
    setStored(STORAGE_KEYS.DISTRICTS, initialDistricts);
    setStored(STORAGE_KEYS.NEIGHBORHOODS, initialNeighborhoodUnits);
    setStored(STORAGE_KEYS.FAMILY_CARDS, initialFamilyCards);
    setStored(STORAGE_KEYS.RESIDENTS, initialResidents);
    setStored(STORAGE_KEYS.LETTER_TYPES, initialLetterTypes);
    setStored(STORAGE_KEYS.LETTER_REQUESTS, initialLetterRequests);
    setStored(STORAGE_KEYS.OFFICIALS, initialVillageOfficials);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
    setStored(STORAGE_KEYS.COMPLAINTS, initialComplaints);
    setStored(STORAGE_KEYS.ASSETS, initialVillageAssets);
    setStored(STORAGE_KEYS.AGENDA, initialAgendaLetters);
    setStored(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);

    if (currentUser) {
      this.addAuditLog(currentUser, 'RESET_DATABASE', 'Sistem', 'Melakukan reset database ke data seed fiktif awal');
    }
  },

  // Export full snapshot for backup
  exportBackupJSON(): string {
    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      residents: this.getResidents(),
      familyCards: this.getFamilyCards(),
      letterRequests: this.getLetterRequests(),
      officials: this.getOfficials(),
      complaints: this.getComplaints(),
      assets: this.getAssets(),
      announcements: this.getAnnouncements(),
      agenda: this.getAgendaLetters(),
    };
    return JSON.stringify(snapshot, null, 2);
  },

  restoreBackupJSON(jsonStr: string, currentUser?: User): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setStored(STORAGE_KEYS.SETTINGS, parsed.settings);
      if (parsed.residents) setStored(STORAGE_KEYS.RESIDENTS, parsed.residents);
      if (parsed.familyCards) setStored(STORAGE_KEYS.FAMILY_CARDS, parsed.familyCards);
      if (parsed.letterRequests) setStored(STORAGE_KEYS.LETTER_REQUESTS, parsed.letterRequests);
      if (parsed.officials) setStored(STORAGE_KEYS.OFFICIALS, parsed.officials);
      if (parsed.complaints) setStored(STORAGE_KEYS.COMPLAINTS, parsed.complaints);
      if (parsed.assets) setStored(STORAGE_KEYS.ASSETS, parsed.assets);
      if (parsed.announcements) setStored(STORAGE_KEYS.ANNOUNCEMENTS, parsed.announcements);
      if (parsed.agenda) setStored(STORAGE_KEYS.AGENDA, parsed.agenda);

      if (currentUser) {
        this.addAuditLog(currentUser, 'RESTORE_BACKUP', 'Sistem', 'Memulihkan cadangan data (restore database) dari file JSON');
      }
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  }
};
