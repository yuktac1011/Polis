import { create } from 'zustand';
import api from '../api';

export type UserRole = 'ROLE_CITIZEN' | 'ROLE_MLA';

export interface User {
  aadhar: string;
  username: string;
  role: UserRole;
  citizenHash: string;
  mla_id?: string;
  mla_info?: any;
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

interface StoreState {
  currentUser: User | null;
  issues: Issue[];
  selectedConstituency: string | null;
  leaderboard: any[];
  geoData: any | null;
  
  login: (aadhar: string, username: string) => Promise<boolean>;
  logout: () => void;
  fetchIssues: () => Promise<void>;
  createIssue: (data: Partial<Issue>) => Promise<boolean>;
  updateIssueStatus: (id: number, status: string, summary?: string) => Promise<boolean>;
  upvoteIssue: (id: number) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchGeoData: () => Promise<void>;
  setSelectedConstituency: (id: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: JSON.parse(sessionStorage.getItem('polis_session') || 'null'),
  issues: [],
  selectedConstituency: null,
  leaderboard: [],
  geoData: null,

  login: async (aadhar: string, username: string) => {
    try {
      const res = await api.post('/auth', { aadhar, username });
      if (res.data.success) {
        const user = res.data.user;
        sessionStorage.setItem('polis_session', JSON.stringify(user));
        set({ currentUser: user });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('polis_session');
    set({ currentUser: null });
  },

  fetchIssues: async () => {
    try {
      const res = await api.get('/issues');
      set({ issues: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  createIssue: async (data: Partial<Issue>) => {
    const { currentUser } = get();
    if (!currentUser) return false;

    try {
      await api.post('/issues', {
        ...data,
        reporter_hash: currentUser.citizenHash
      });
      await get().fetchIssues();
      return true;
    } catch (e) {
      return false;
    }
  },

  updateIssueStatus: async (id: number, status: string, summary?: string) => {
    try {
      await api.patch(`/issues/${id}`, { status, resolution_summary: summary });
      await get().fetchIssues();
      return true;
    } catch (e) {
      return false;
    }
  },

  upvoteIssue: async (id: number) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await api.post(`/issues/${id}/upvote`, { citizen_hash: currentUser.citizenHash });
      await get().fetchIssues();
    } catch (e) {
      console.error(e);
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await api.get('/leaderboard');
      set({ leaderboard: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchGeoData: async () => {
    if (get().geoData) return;
    try {
      const res = await fetch('/MUMBAI.geojson');
      const data = await res.json();
      set({ geoData: data });
    } catch (e) {
      console.error('Failed to fetch GeoJSON', e);
    }
  },

  setSelectedConstituency: (id: string | null) => set({ selectedConstituency: id })
}));
