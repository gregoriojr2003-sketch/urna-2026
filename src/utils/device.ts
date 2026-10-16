// Persistent unique device identification and vote protection

const DEVICE_ID_KEY = 'urna_unique_device_id';
const DEVICE_VOTE_KEY = 'urna_device_vote_record';
const ADMIN_DEVICE_KEY = 'urna_master_admin_device';

function generateDeviceHash(): string {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const raw = [
      nav.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      nav.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Date.now(),
      Math.random(),
    ].join('###');

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const cleanHash = Math.abs(hash).toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    return `dev_${cleanHash}_${randomSuffix}`;
  } catch (e) {
    return `dev_${Math.random().toString(36).substring(2, 14)}`;
  }
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server_placeholder';
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = generateDeviceHash();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'fallback_device_id';
  }
}

export interface StoredDeviceVote {
  hasVoted: boolean;
  candidate: string;
  candidateName: string;
  timestamp: string;
}

export function getDeviceVoteRecord(): StoredDeviceVote | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEVICE_VOTE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveDeviceVoteRecord(candidate: string, candidateName: string, timestamp: string) {
  if (typeof window === 'undefined') return;
  try {
    const record: StoredDeviceVote = {
      hasVoted: true,
      candidate,
      candidateName,
      timestamp,
    };
    localStorage.setItem(DEVICE_VOTE_KEY, JSON.stringify(record));
  } catch (e) {
    // ignore
  }
}

export function clearDeviceVoteRecord() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEVICE_VOTE_KEY);
  } catch (e) {
    // ignore
  }
}

// Admin device determination - only the administrator's device has authority to reset votes
export function isCurrentDeviceAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(ADMIN_DEVICE_KEY);
    if (val === 'true') return true;

    // By default, the development environment and initial authorized setup is granted admin rights
    const host = window.location.hostname;
    if (host.includes('ais-dev') || host.includes('localhost') || host === '127.0.0.1') {
      localStorage.setItem(ADMIN_DEVICE_KEY, 'true');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export function setDeviceAsAdmin(status: boolean = true) {
  if (typeof window === 'undefined') return;
  try {
    if (status) {
      localStorage.setItem(ADMIN_DEVICE_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_DEVICE_KEY);
    }
  } catch (e) {
    // ignore
  }
}
