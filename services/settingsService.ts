// src/services/settingsService.ts
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface DashboardSettings {
  language: 'uz' | 'ru' | 'en';
  currency: 'UZS' | 'USD' | 'EUR';
  theme: 'light' | 'dark';
  dailyTargetRevenue: number;
  showReadyAlerts: boolean;
  autoClosePaidOrders: boolean;
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  language: 'uz',
  currency: 'UZS',
  theme: 'light',
  dailyTargetRevenue: 500_000,
  showReadyAlerts: true,
  autoClosePaidOrders: true,
};

const COLLECTION = 'config';
const DOC_ID = 'dashboardSettings';

export async function loadDashboardSettings(): Promise<DashboardSettings> {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  const ref = doc(db, COLLECTION, DOC_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  const data = snap.data() as DashboardSettings;
  return { ...DEFAULT_SETTINGS, ...data };
}

export async function saveDashboardSettings(
  settings: DashboardSettings
): Promise<void> {
  if (typeof window === 'undefined') return;
  const ref = doc(db, COLLECTION, DOC_ID);
  await setDoc(ref, settings, { merge: true });
}