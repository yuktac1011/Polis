import { create } from 'zustand';
import api from '../api';

export type UserRole = 'ROLE_CITIZEN' | 'ROLE_MLA';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  citizenHash: string;
  mla_id?: string;
  mla_info?: {
    id: string;
    name: string;
    constituency: string;
    party: string;
    ward: string;
    zone: string;
  };
}

export interface Issue {
  id: number;
  category: string;
  title: string;
  description: string;
  status: 'New' | 'In Progress' | 'Resolved';
  x_coord: number;
  y_coord: number;
  constituency_id: string;
  upvotes: number;
  reporter_hash: string;
  resolution_summary?: string;
  created_at: string;
}

export interface MLA {
  id: string;
  name: string;
  constituency: string;
  party: string;
  ward: string;
  zone: string;
}

interface StoreState {
  currentUser: User | null;
  issues: Issue[];
  selectedConstituency: string | null;
  leaderboard: any[];
  geoData: any | null;
  mlas: MLA[];
  isLiveMode: boolean;
  authError: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, mlaCode?: string, mlaWardId?: string) => Promise<boolean>;
  logout: () => void;
  setAuthError: (err: string | null) => void;
  fetchIssues: () => Promise<void>;
  createIssue: (data: Partial<Issue>) => Promise<boolean>;
  updateIssueStatus: (id: number, status: string, summary?: string) => Promise<boolean>;
  upvoteIssue: (id: number) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchGeoData: () => Promise<void>;
  fetchMlas: () => Promise<void>;
  reopenIssue: (id: number) => Promise<boolean>;
  groupIssues: (primaryId: number, otherIds: number[]) => Promise<boolean>;
  batchUpdateIssues: (ids: number[], status: string, summary?: string) => Promise<boolean>;
  setSelectedConstituency: (id: string | null) => void;
  toggleLiveMode: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: JSON.parse(sessionStorage.getItem('polis_session') || 'null'),
  issues: [],
  selectedConstituency: null,
  leaderboard: [],
  geoData: null,
  mlas: [],
  isLiveMode: false,
  authError: null,

  setAuthError: (err) => set({ authError: err }),

  login: async (email, password) => {
    set({ authError: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        sessionStorage.setItem('polis_session', JSON.stringify(res.data.user));
        set({ currentUser: res.data.user });
        return true;
      }
      return false;
    } catch (e: any) {
      set({ authError: e.message || 'Login failed' });
      return false;
    }
  },

  register: async (email, password, username, mlaCode, mlaWardId) => {
    set({ authError: null });
    try {
      const res = await api.post('/auth/register', { email, password, username, mlaCode, mlaWardId });
      if (res.data.success) {
        sessionStorage.setItem('polis_session', JSON.stringify(res.data.user));
        set({ currentUser: res.data.user });
        return true;
      }
      return false;
    } catch (e: any) {
      set({ authError: e.message || 'Registration failed' });
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('polis_session');
    set({ currentUser: null, issues: [], leaderboard: [] });
  },

  fetchIssues: async () => {
    try {
      const res = await api.get('/issues');
      set({ issues: res.data });
    } catch (e) {
      console.error('[fetchIssues]', e);
    }
  },

  createIssue: async (data) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    try {
      await api.post('/issues', { ...data, reporter_hash: currentUser.citizenHash });
      await get().fetchIssues();
      return true;
    } catch (e) {
      console.error('[createIssue]', e);
      return false;
    }
  },

  updateIssueStatus: async (id, status, summary) => {
    try {
      await api.patch(`/issues/${id}`, { status, resolution_summary: summary });
      await get().fetchIssues();
      return true;
    } catch (e) {
      console.error('[updateIssueStatus]', e);
      return false;
    }
  },

  upvoteIssue: async (id) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      await api.post(`/issues/${id}/upvote`, { citizen_hash: currentUser.citizenHash });
      await get().fetchIssues();
    } catch (e) {
      console.error('[upvoteIssue]', e);
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await api.get('/leaderboard');
      set({ leaderboard: res.data });
    } catch (e) {
      console.error('[fetchLeaderboard]', e);
    }
  },

  fetchGeoData: async () => {
    if (get().geoData) return;
    try {
      const res = await fetch('/MUMBAI.geojson');
      if (!res.ok) throw new Error('GeoJSON not found');
      const data = await res.json();
      set({ geoData: data });
    } catch (e) {
      console.error('[fetchGeoData]', e);
    }
  },

  fetchMlas: async () => {
    if (get().mlas.length > 0) return;
    try {
      const res = await api.get('/mlas');
      set({ mlas: res.data });
    } catch (e) {
      console.error('[fetchMlas]', e);
    }
  },
  
  reopenIssue: async (id) => {
    try {
      await api.patch(`/issues/${id}/reopen`);
      await get().fetchIssues();
      return true;
    } catch (e) {
      console.error('[reopenIssue]', e);
      return false;
    }
  },

  groupIssues: async (primaryId, otherIds) => {
    try {
      await api.post('/issues/group', { primaryId, otherIds });
      await get().fetchIssues();
      return true;
    } catch (e) {
      console.error('[groupIssues]', e);
      return false;
    }
  },

  batchUpdateIssues: async (ids, status, summary) => {
    try {
      await api.post('/issues/batch', { ids, status, resolution_summary: summary });
      await get().fetchIssues();
      return true;
    } catch (e) {
      console.error('[batchUpdateIssues]', e);
      return false;
    }
  },

  setSelectedConstituency: (id) => set({ selectedConstituency: id }),
  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),
}));
