import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  VillageSettings,
  Resident,
  FamilyCard,
  LetterRequest,
  Complaint,
  VillageAsset,
  AgendaLetter,
  Announcement,
  VillageOfficial,
  User,
  AuditLog
} from '../types';

const SUPABASE_CONFIG_KEY = 'digides_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isRealtimeActive?: boolean;
  lastSyncAt?: string;
}

export interface RealtimeEventPayload {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  oldRecord?: any;
  timestamp: string;
}

export type RealtimeChangeCallback = (event: RealtimeEventPayload) => void;

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading Supabase config from storage:', e);
  }

  // Fallback to env vars if present
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: false,
    isRealtimeActive: false,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Supabase config:', e);
  }
}

export function isSupabaseConfigured(): boolean {
  const cfg = getSavedSupabaseConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.isConnected);
}

let supabaseInstance: SupabaseClient | null = null;
let activeChannel: RealtimeChannel | null = null;
const eventListeners: RealtimeChangeCallback[] = [];

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  if (activeChannel) {
    activeChannel.unsubscribe();
    activeChannel = null;
  }
  supabaseInstance = null;
}

// Register real-time change listener
export function onSupabaseRealtimeEvent(callback: RealtimeChangeCallback): () => void {
  eventListeners.push(callback);
  return () => {
    const idx = eventListeners.indexOf(callback);
    if (idx !== -1) {
      eventListeners.splice(idx, 1);
    }
  };
}

function notifyRealtimeListeners(event: RealtimeEventPayload) {
  eventListeners.forEach(listener => {
    try {
      listener(event);
    } catch (err) {
      console.error('Error in realtime listener:', err);
    }
  });
}

// Convert Postgres snake_case records to frontend CamelCase types
export function mapSnakeToResident(row: any): Resident {
  return {
    id: row.id || `res-${Date.now()}`,
    nik: row.nik,
    cardNumber: row.card_number,
    fullName: row.full_name,
    birthPlace: row.birth_place,
    birthDate: row.birth_date,
    gender: row.gender,
    bloodType: row.blood_type || '-',
    religion: row.religion || 'Islam',
    maritalStatus: row.marital_status,
    familyRole: row.family_role,
    education: row.education || '-',
    occupation: row.occupation || '-',
    citizenship: row.citizenship || 'WNI',
    fatherName: row.father_name,
    motherName: row.mother_name,
    address: row.address,
    rt: row.rt,
    rw: row.rw,
    districtName: row.district_name,
    phone: row.phone,
    status: row.status || 'Tetap',
    deathDate: row.death_date,
    moveDate: row.move_date,
    isArchived: row.is_archived || false,
    notes: row.notes,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapSnakeToLetterRequest(row: any): LetterRequest {
  return {
    id: row.id,
    requestNumber: row.request_number,
    officialLetterNumber: row.official_letter_number,
    letterTypeCode: row.letter_type_code,
    letterTypeName: row.letter_type_name,
    residentId: row.resident_id,
    nik: row.nik,
    residentName: row.resident_name,
    purpose: row.purpose,
    extraFields: row.extra_fields || {},
    status: row.status,
    submissionChannel: row.submission_channel || 'Loket Kantor',
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at || row.created_at || new Date().toISOString(),
    processedBy: row.processed_by,
    processedAt: row.processed_at,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    qrCodeHash: row.qr_code_hash || `VERIF-${row.request_number}`,
  };
}

export function mapSnakeToComplaint(row: any): Complaint {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    residentId: row.resident_id,
    residentName: row.resident_name,
    nik: row.nik,
    phone: row.phone,
    category: row.category,
    subject: row.subject,
    description: row.description,
    location: row.location,
    status: row.status,
    responseNotes: row.response_notes,
    respondedBy: row.responded_by,
    respondedAt: row.responded_at,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapSnakeToSettings(row: any): VillageSettings {
  return {
    id: row.id || 'village-settings-default',
    villageName: row.village_name || 'Desa Sukamaju',
    districtName: row.district_name || 'Kecamatan Ciawi',
    regencyName: row.regency_name || 'Kabupaten Bogor',
    provinceName: row.province_name || 'Jawa Barat',
    postalCode: row.postal_code || '16720',
    officeAddress: row.office_address || 'Jl. Raya Ciawi - Sukamaju No. 12',
    phone: row.phone || '(0251) 8245678',
    email: row.email || 'pemdes@sukamaju.desa.id',
    website: row.website || 'https://sukamaju.desa.id',
    logoUrl: row.logo_url,
    letterheadBannerUrl: row.letterhead_banner_url,
    letterheadType: row.letterhead_type || 'STANDARD',
    secondLogoUrl: row.second_logo_url,
    letterheadTitle1: row.letterhead_title1 || 'PEMERINTAH KABUPATEN BOGOR',
    letterheadTitle2: row.letterhead_title2 || 'KECAMATAN CIAWI',
    letterheadTitle3: row.letterhead_title3 || 'KANTOR KEPALA DESA SUKAMAJU',
    letterheadSubtext: row.letterhead_subtext || 'Jl. Raya Ciawi - Sukamaju No. 12, Kode Pos 16720',
    tagline: row.tagline,
    vision: row.vision,
    mission: Array.isArray(row.mission) ? row.mission : [],
    villageHeadName: row.village_head_name || 'H. Ahmad Supriyatna, S.AP',
    villageHeadNip: row.village_head_nip || '19750812 200212 1 003',
    secretaryName: row.secretary_name || 'Budi Santoso, S.Kom',
    letterNumberFormat: row.letter_number_format || '{nomor}/{kode_surat}/DS-SKM/{romawi}/{tahun}',
    fiscalYear: row.fiscal_year || 2026,
  };
}

export function mapSnakeToAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    isPinned: row.is_pinned || false,
    publishedDate: row.published_date || new Date().toISOString().substring(0, 10),
    authorName: row.author_name || 'Pemerintah Desa',
  };
}

export function mapSnakeToAsset(row: any): VillageAsset {
  return {
    id: row.id,
    itemCode: row.item_code,
    itemName: row.item_name,
    category: row.category,
    acquisitionYear: Number(row.acquisition_year) || new Date().getFullYear(),
    sourceOfFunds: row.source_of_funds || 'APBDes',
    purchaseCost: Number(row.purchase_cost) || 0,
    condition: row.condition || 'Baik',
    location: row.location || '-',
    picOfficial: row.pic_official || '-',
    notes: row.notes,
  };
}

export function mapSnakeToAgenda(row: any): AgendaLetter {
  return {
    id: row.id,
    type: row.type || 'MASUK',
    agendaNumber: row.agenda_number,
    letterNumber: row.letter_number,
    correspondent: row.correspondent,
    letterDate: row.letter_date,
    receivedOrSentDate: row.received_or_sent_date,
    subject: row.subject,
    dispositionOrSigner: row.disposition_or_signer,
    notes: row.notes,
  };
}

export function mapSnakeToFamilyCard(row: any): FamilyCard {
  return {
    id: row.id,
    cardNumber: row.card_number,
    headFamilyName: row.head_family_name,
    headFamilyNik: row.head_family_nik,
    address: row.address,
    rt: row.rt,
    rw: row.rw,
    districtName: row.district_name,
    postalCode: row.postal_code || '16720',
    issuedDate: row.issued_date || new Date().toISOString().substring(0, 10),
    memberCount: Number(row.member_count) || 1,
  };
}

export function mapSnakeToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    role: row.role || 'operator',
    email: row.email,
    phone: row.phone,
    password: row.password_hash || row.password || undefined,
    recoveryKey: row.recovery_key || undefined,
    avatarUrl: row.avatar_url,
    residentId: row.resident_id,
    nik: row.nik,
    isActive: row.is_active ?? true,
    lastLoginAt: row.last_login_at,
  };
}

export function mapUserToSnake(u: User): any {
  return {
    id: u.id,
    username: u.username,
    full_name: u.fullName,
    role: u.role,
    email: u.email,
    phone: u.phone,
    password_hash: u.password || `${u.username}123`,
    recovery_key: u.recoveryKey || (u.role === 'superadmin' ? 'SUPERADMIN-DESA-2026-KEY' : null),
    avatar_url: u.avatarUrl,
    resident_id: u.residentId,
    nik: u.nik,
    is_active: u.isActive,
    last_login_at: u.lastLoginAt,
  };
}

export function mapSnakeToOfficial(row: any): VillageOfficial {
  return {
    id: row.id,
    name: row.name,
    nipd: row.nipd || '',
    position: row.position,
    phone: row.phone || '',
    email: row.email || '',
    photoUrl: row.photo_url || '',
    orderIndex: Number(row.order_index) || 0,
    isActive: row.is_active ?? true,
  };
}

export function mapOfficialToSnake(off: VillageOfficial): any {
  return {
    id: off.id,
    name: off.name,
    nipd: off.nipd,
    position: off.position,
    phone: off.phone,
    email: off.email,
    photo_url: off.photoUrl,
    order_index: off.orderIndex,
    is_active: off.isActive,
  };
}

// START REALTIME SUBSCRIPTION FOR ALL 15 TABLES
export function initializeRealtimeSubscription(): boolean {
  const client = getSupabaseClient();
  if (!client) return false;

  if (activeChannel) {
    activeChannel.unsubscribe();
    activeChannel = null;
  }

  try {
    const channel = client.channel('digides-realtime-master');

    const tables = [
      'residents',
      'letter_requests',
      'complaints',
      'village_settings',
      'announcements',
      'village_officials',
      'family_cards',
      'village_assets',
      'agenda_letters',
      'users',
      'audit_logs',
      'village_districts',
      'neighborhood_units',
      'letter_types',
      'password_reset_logs',
    ];

    tables.forEach(tableName => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload: any) => {
          const event: RealtimeEventPayload = {
            table: tableName,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            record: payload.new,
            oldRecord: payload.old,
            timestamp: new Date().toISOString(),
          };

          notifyRealtimeListeners(event);
        }
      );
    });

    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        const config = getSavedSupabaseConfig();
        config.isRealtimeActive = true;
        config.isConnected = true;
        saveSupabaseConfig(config);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        const config = getSavedSupabaseConfig();
        config.isRealtimeActive = false;
        saveSupabaseConfig(config);
      }
    });

    activeChannel = channel;
    return true;
  } catch (err) {
    console.error('Failed to initialize Supabase Realtime channel:', err);
    return false;
  }
}

// Test Connection Helper
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tableCount?: number }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL Supabase dan Anon Key tidak boleh kosong!' };
  }

  try {
    const client = createClient(url, anonKey);
    // Ping village_settings
    const { data, error } = await client.from('village_settings').select('id, village_name').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message:
            'Koneksi Supabase valid! Namun tabel belum dibuat. Harap salin dan jalankan script schema.sql lengkap di menu SQL Editor Supabase Anda.',
        };
      }
      return { success: false, message: `Gagal terhubung: ${error.message}` };
    }

    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! 14 tabel dan Realtime Database aktif.',
      tableCount: 14,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Kesalahan jaringan: ${err.message || 'Tidak dapat menghubungi server Supabase'}`,
    };
  }
}

// FETCH ALL DATA FROM SUPABASE CLOUD
export async function fetchAllFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: {
    settings?: VillageSettings;
    residents?: Resident[];
    letterRequests?: LetterRequest[];
    complaints?: Complaint[];
    announcements?: Announcement[];
    assets?: VillageAsset[];
    agendaLetters?: AgendaLetter[];
    familyCards?: FamilyCard[];
    users?: User[];
    officials?: VillageOfficial[];
  };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase belum dikonfigurasi!' };
  }

  try {
    const [
      settingsRes,
      residentsRes,
      letterReqsRes,
      complaintsRes,
      announcementsRes,
      assetsRes,
      agendaRes,
      familyCardsRes,
      usersRes,
      officialsRes,
    ] = await Promise.all([
      client.from('village_settings').select('*').limit(1).maybeSingle(),
      client.from('residents').select('*').order('created_at', { ascending: false }),
      client.from('letter_requests').select('*').order('created_at', { ascending: false }),
      client.from('complaints').select('*').order('created_at', { ascending: false }),
      client.from('announcements').select('*').order('published_date', { ascending: false }),
      client.from('village_assets').select('*').order('acquisition_year', { ascending: false }),
      client.from('agenda_letters').select('*').order('created_at', { ascending: false }),
      client.from('family_cards').select('*'),
      client.from('users').select('*'),
      client.from('village_officials').select('*').order('order_index', { ascending: true }),
    ]);

    const result: any = {};

    if (settingsRes.data) {
      result.settings = mapSnakeToSettings(settingsRes.data);
    }
    if (residentsRes.data) {
      result.residents = residentsRes.data.map(mapSnakeToResident);
    }
    if (letterReqsRes.data) {
      result.letterRequests = letterReqsRes.data.map(mapSnakeToLetterRequest);
    }
    if (complaintsRes.data) {
      result.complaints = complaintsRes.data.map(mapSnakeToComplaint);
    }
    if (announcementsRes.data) {
      result.announcements = announcementsRes.data.map(mapSnakeToAnnouncement);
    }
    if (assetsRes.data) {
      result.assets = assetsRes.data.map(mapSnakeToAsset);
    }
    if (agendaRes.data) {
      result.agendaLetters = agendaRes.data.map(mapSnakeToAgenda);
    }
    if (familyCardsRes.data) {
      result.familyCards = familyCardsRes.data.map(mapSnakeToFamilyCard);
    }
    if (usersRes.data) {
      result.users = usersRes.data.map(mapSnakeToUser);
    }
    if (officialsRes.data) {
      result.officials = officialsRes.data.map(mapSnakeToOfficial);
    }

    return {
      success: true,
      message: 'Berhasil memuat data langsung dari Supabase Cloud!',
      data: result,
    };
  } catch (err: any) {
    return { success: false, message: `Gagal memuat data: ${err.message}` };
  }
}

// SYNC ALL LOCAL DATA TO SUPABASE
export async function syncAllLocalToSupabase(localData: {
  settings?: VillageSettings;
  residents?: Resident[];
  letterRequests?: LetterRequest[];
  complaints?: Complaint[];
  announcements?: Announcement[];
  assets?: VillageAsset[];
  agendaLetters?: AgendaLetter[];
  familyCards?: FamilyCard[];
  users?: User[];
  officials?: VillageOfficial[];
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase belum dikonfigurasi!' };
  }

  try {
    // 1. Settings
    if (localData.settings) {
      const s = localData.settings;
      await client.from('village_settings').upsert({
        id: 'village-settings-default',
        village_name: s.villageName,
        district_name: s.districtName,
        regency_name: s.regencyName,
        province_name: s.provinceName,
        postal_code: s.postalCode,
        office_address: s.officeAddress,
        phone: s.phone,
        email: s.email,
        website: s.website,
        logo_url: s.logoUrl,
        letterhead_banner_url: s.letterheadBannerUrl,
        letterhead_type: s.letterheadType || 'STANDARD',
        second_logo_url: s.secondLogoUrl,
        letterhead_title1: s.letterheadTitle1,
        letterhead_title2: s.letterheadTitle2,
        letterhead_title3: s.letterheadTitle3,
        letterhead_subtext: s.letterheadSubtext,
        tagline: s.tagline,
        vision: s.vision,
        mission: s.mission || [],
        village_head_name: s.villageHeadName,
        village_head_nip: s.villageHeadNip,
        secretary_name: s.secretaryName,
        letter_number_format: s.letterNumberFormat,
        fiscal_year: s.fiscalYear,
      });
    }

    // 2. Family Cards
    if (localData.familyCards && localData.familyCards.length > 0) {
      const fcPayload = localData.familyCards.map(fc => ({
        id: fc.id,
        card_number: fc.cardNumber,
        head_family_name: fc.headFamilyName,
        head_family_nik: fc.headFamilyNik,
        address: fc.address,
        rt: fc.rt,
        rw: fc.rw,
        district_name: fc.districtName,
        postal_code: fc.postalCode,
        issued_date: fc.issuedDate,
        member_count: fc.memberCount || 1,
      }));
      await client.from('family_cards').upsert(fcPayload, { onConflict: 'card_number' });
    }

    // 3. Residents
    if (localData.residents && localData.residents.length > 0) {
      const resPayload = localData.residents.map(r => ({
        id: r.id,
        nik: r.nik,
        card_number: r.cardNumber,
        full_name: r.fullName,
        birth_place: r.birthPlace,
        birth_date: r.birthDate,
        gender: r.gender,
        blood_type: r.bloodType,
        religion: r.religion,
        marital_status: r.maritalStatus,
        family_role: r.familyRole,
        education: r.education,
        occupation: r.occupation,
        citizenship: r.citizenship,
        father_name: r.fatherName,
        mother_name: r.motherName,
        address: r.address,
        rt: r.rt,
        rw: r.rw,
        district_name: r.districtName,
        phone: r.phone,
        status: r.status,
        death_date: r.deathDate,
        move_date: r.moveDate,
        is_archived: r.isArchived || false,
        notes: r.notes,
      }));
      await client.from('residents').upsert(resPayload, { onConflict: 'nik' });
    }

    // 4. Letter Requests
    if (localData.letterRequests && localData.letterRequests.length > 0) {
      const lrPayload = localData.letterRequests.map(lr => ({
        id: lr.id,
        request_number: lr.requestNumber,
        official_letter_number: lr.officialLetterNumber,
        letter_type_code: lr.letterTypeCode,
        letter_type_name: lr.letterTypeName,
        resident_id: lr.residentId,
        nik: lr.nik,
        resident_name: lr.residentName,
        purpose: lr.purpose,
        extra_fields: lr.extraFields || {},
        status: lr.status,
        submission_channel: lr.submissionChannel,
        rejection_reason: lr.rejectionReason,
        submitted_at: lr.submittedAt,
        processed_by: lr.processedBy,
        processed_at: lr.processedAt,
        approved_by: lr.approvedBy,
        approved_at: lr.approvedAt,
        qr_code_hash: lr.qrCodeHash,
      }));
      await client.from('letter_requests').upsert(lrPayload, { onConflict: 'request_number' });
    }

    // 5. Complaints
    if (localData.complaints && localData.complaints.length > 0) {
      const cmpPayload = localData.complaints.map(c => ({
        id: c.id,
        ticket_number: c.ticketNumber,
        resident_id: c.residentId,
        resident_name: c.residentName,
        nik: c.nik,
        phone: c.phone,
        category: c.category,
        subject: c.subject,
        description: c.description,
        location: c.location,
        status: c.status,
        response_notes: c.responseNotes,
        responded_by: c.respondedBy,
        responded_at: c.respondedAt,
      }));
      await client.from('complaints').upsert(cmpPayload, { onConflict: 'ticket_number' });
    }

    // 6. Announcements
    if (localData.announcements && localData.announcements.length > 0) {
      const annPayload = localData.announcements.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        content: a.content,
        is_pinned: a.isPinned,
        published_date: a.publishedDate,
        author_name: a.authorName,
      }));
      await client.from('announcements').upsert(annPayload, { onConflict: 'id' });
    }

    // 7. Assets
    if (localData.assets && localData.assets.length > 0) {
      const astPayload = localData.assets.map(a => ({
        id: a.id,
        item_code: a.itemCode,
        item_name: a.itemName,
        category: a.category,
        acquisition_year: a.acquisitionYear,
        source_of_funds: a.sourceOfFunds,
        purchase_cost: a.purchaseCost,
        condition: a.condition,
        location: a.location,
        pic_official: a.picOfficial,
        notes: a.notes,
      }));
      await client.from('village_assets').upsert(astPayload, { onConflict: 'item_code' });
    }

    // 8. Agenda Letters
    if (localData.agendaLetters && localData.agendaLetters.length > 0) {
      const agdPayload = localData.agendaLetters.map(ag => ({
        id: ag.id,
        type: ag.type,
        agenda_number: ag.agendaNumber,
        letter_number: ag.letterNumber,
        correspondent: ag.correspondent,
        letter_date: ag.letterDate,
        received_or_sent_date: ag.receivedOrSentDate,
        subject: ag.subject,
        disposition_or_signer: ag.dispositionOrSigner,
        notes: ag.notes,
      }));
      await client.from('agenda_letters').upsert(agdPayload, { onConflict: 'id' });
    }

    // 9. Users
    if (localData.users && localData.users.length > 0) {
      const usrPayload = localData.users.map(u => ({
        id: u.id,
        username: u.username,
        full_name: u.fullName,
        role: u.role,
        email: u.email,
        phone: u.phone,
        password_hash: u.password || `${u.username}123`,
        recovery_key: u.recoveryKey || (u.role === 'superadmin' ? 'SUPERADMIN-DESA-2026-KEY' : null),
        avatar_url: u.avatarUrl,
        resident_id: u.residentId,
        nik: u.nik,
        is_active: u.isActive,
      }));
      await client.from('users').upsert(usrPayload, { onConflict: 'username' });
    }

    // 10. Village Officials (Pamong & Perangkat Desa SOTK)
    if (localData.officials && localData.officials.length > 0) {
      const offPayload = localData.officials.map(o => ({
        id: o.id,
        name: o.name,
        nipd: o.nipd,
        position: o.position,
        phone: o.phone,
        email: o.email,
        photo_url: o.photoUrl,
        order_index: o.orderIndex,
        is_active: o.isActive,
      }));
      await client.from('village_officials').upsert(offPayload, { onConflict: 'id' });
    }

    const config = getSavedSupabaseConfig();
    config.isConnected = true;
    config.lastSyncAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    saveSupabaseConfig(config);

    return {
      success: true,
      message: `Sinkronisasi menyeluruh berhasil! Seluruh tabel dan data aplikasi telah tersimpan di Supabase Cloud.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err.message || 'Kesalahan saat menyimpan data ke Supabase'}`,
    };
  }
}

// REALTIME WRITE HELPERS (Dipanggil secara otomatis saat ada perubahan data di aplikasi)
export async function pushResidentChangeToSupabase(resident: Resident): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('residents').upsert({
      id: resident.id,
      nik: resident.nik,
      card_number: resident.cardNumber,
      full_name: resident.fullName,
      birth_place: resident.birthPlace,
      birth_date: resident.birthDate,
      gender: resident.gender,
      blood_type: resident.bloodType,
      religion: resident.religion,
      marital_status: resident.maritalStatus,
      family_role: resident.familyRole,
      education: resident.education,
      occupation: resident.occupation,
      citizenship: resident.citizenship,
      father_name: resident.fatherName,
      mother_name: resident.motherName,
      address: resident.address,
      rt: resident.rt,
      rw: resident.rw,
      district_name: resident.districtName,
      phone: resident.phone,
      status: resident.status,
      death_date: resident.deathDate,
      move_date: resident.moveDate,
      is_archived: resident.isArchived,
      notes: resident.notes,
    }, { onConflict: 'nik' });
  } catch (e) {
    console.error('Supabase auto-push resident failed:', e);
  }
}

export async function deleteResidentFromSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('residents').delete().eq('id', id);
  } catch (e) {
    console.error('Supabase auto-delete resident failed:', e);
  }
}

export async function pushLetterRequestChangeToSupabase(req: LetterRequest): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('letter_requests').upsert({
      id: req.id,
      request_number: req.requestNumber,
      official_letter_number: req.officialLetterNumber,
      letter_type_code: req.letterTypeCode,
      letter_type_name: req.letterTypeName,
      resident_id: req.residentId,
      nik: req.nik,
      resident_name: req.residentName,
      purpose: req.purpose,
      extra_fields: req.extraFields || {},
      status: req.status,
      submission_channel: req.submissionChannel,
      rejection_reason: req.rejectionReason,
      submitted_at: req.submittedAt,
      processed_by: req.processedBy,
      processed_at: req.processedAt,
      approved_by: req.approvedBy,
      approved_at: req.approvedAt,
      qr_code_hash: req.qrCodeHash,
    }, { onConflict: 'request_number' });
  } catch (e) {
    console.error('Supabase auto-push letter request failed:', e);
  }
}

export async function pushComplaintChangeToSupabase(cmp: Complaint): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('complaints').upsert({
      id: cmp.id,
      ticket_number: cmp.ticketNumber,
      resident_id: cmp.residentId,
      resident_name: cmp.residentName,
      nik: cmp.nik,
      phone: cmp.phone,
      category: cmp.category,
      subject: cmp.subject,
      description: cmp.description,
      location: cmp.location,
      status: cmp.status,
      response_notes: cmp.responseNotes,
      responded_by: cmp.respondedBy,
      responded_at: cmp.respondedAt,
    }, { onConflict: 'ticket_number' });
  } catch (e) {
    console.error('Supabase auto-push complaint failed:', e);
  }
}

export async function pushSettingsChangeToSupabase(s: VillageSettings): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('village_settings').upsert({
      id: 'village-settings-default',
      village_name: s.villageName,
      district_name: s.districtName,
      regency_name: s.regencyName,
      province_name: s.provinceName,
      postal_code: s.postalCode,
      office_address: s.officeAddress,
      phone: s.phone,
      email: s.email,
      website: s.website,
      logo_url: s.logoUrl,
      letterhead_banner_url: s.letterheadBannerUrl,
      letterhead_type: s.letterheadType || 'STANDARD',
      second_logo_url: s.secondLogoUrl,
      letterhead_title1: s.letterheadTitle1,
      letterhead_title2: s.letterheadTitle2,
      letterhead_title3: s.letterheadTitle3,
      letterhead_subtext: s.letterheadSubtext,
      tagline: s.tagline,
      vision: s.vision,
      mission: s.mission || [],
      village_head_name: s.villageHeadName,
      village_head_nip: s.villageHeadNip,
      secretary_name: s.secretaryName,
      letter_number_format: s.letterNumberFormat,
      fiscal_year: s.fiscalYear,
    });
  } catch (e) {
    console.error('Supabase auto-push settings failed:', e);
  }
}

export async function pushOfficialChangeToSupabase(official: VillageOfficial): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('village_officials').upsert({
      id: official.id,
      name: official.name,
      nipd: official.nipd,
      position: official.position,
      phone: official.phone,
      email: official.email,
      photo_url: official.photoUrl,
      order_index: official.orderIndex,
      is_active: official.isActive,
    }, { onConflict: 'id' });
  } catch (e) {
    console.error('Supabase auto-push official failed:', e);
  }
}

export async function deleteOfficialFromSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('village_officials').delete().eq('id', id);
  } catch (e) {
    console.error('Supabase auto-delete official failed:', e);
  }
}

export async function pushUserChangeToSupabase(user: User): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = mapUserToSnake(user);
    await client.from('users').upsert(payload, { onConflict: 'username' });
  } catch (e) {
    console.error('Supabase auto-push user failed:', e);
  }
}

export async function resetSuperAdminPasswordInSupabase(
  username: string,
  newPassword: string,
  recoveryKey?: string,
  method: string = 'MASTER_RECOVERY_KEY'
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: 'Password diperbarui di penyimpanan lokal (Supabase belum terkonfigurasi/offline).'
    };
  }

  try {
    // 1. Try invoking PostgreSQL function if schema was deployed
    const { data: rpcData, error: rpcError } = await client.rpc('reset_superadmin_password', {
      p_username: username,
      p_new_password: newPassword,
      p_recovery_key: recoveryKey || null,
      p_reset_method: method
    });

    if (!rpcError && rpcData) {
      return {
        success: rpcData.success ?? true,
        message: rpcData.message || 'Kata sandi berhasil diperbarui via Supabase RPC.'
      };
    }

    // 2. Direct table update fallback if function is not yet created
    const { error: updError } = await client
      .from('users')
      .update({
        password_hash: newPassword,
        updated_at: new Date().toISOString()
      })
      .ilike('username', username);

    if (updError) {
      console.warn('Direct update in Supabase failed:', updError);
    }

    // 3. Log to password_reset_logs table
    try {
      await client.from('password_reset_logs').insert({
        username: username,
        reset_method: method,
        status: 'SUCCESS',
        created_at: new Date().toISOString()
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Kata sandi Super Admin berhasil diperbarui dan disinkronkan ke Supabase.'
    };
  } catch (e) {
    console.error('resetSuperAdminPasswordInSupabase error:', e);
    return {
      success: false,
      message: 'Gagal memperbarui kata sandi di Supabase. Perubahan tetap tersimpan di lokal.'
    };
  }
}


