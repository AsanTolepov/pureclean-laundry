// services/adminProfile.ts
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cleanForFirestore } from './firestoreUtils';

export interface AdminProfile {
  firstName: string;
  lastName: string;
  role: string;      // Masalan: "Menejer", "Admin"
  login: string;
  password: string;
  avatar?: string;   // data URL ko‘rinishidagi rasm (ixtiyoriy)
}

// ❗ avatar ni bu obyektga umuman qo‘shmaymiz (undefined bo'lmaydi)
export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  firstName: 'Admin',
  lastName: 'foydalanuvchi',
  role: 'Menejer',
  login: 'admin',
  password: 'admin123',
};

const COLLECTION = 'adminProfiles';
const DOC_ID = 'main';

export async function loadAdminProfile(): Promise<AdminProfile> {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PROFILE;

  try {
    const ref = doc(db, COLLECTION, DOC_ID);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, cleanForFirestore(DEFAULT_ADMIN_PROFILE));
      return DEFAULT_ADMIN_PROFILE;
    }

    const data = snap.data() as AdminProfile;
    return { ...DEFAULT_ADMIN_PROFILE, ...data };
  } catch (err) {
    console.error('loadAdminProfile error:', err);
    return DEFAULT_ADMIN_PROFILE;
  }
}

export async function saveAdminProfile(
  profile: AdminProfile
): Promise<void> {
  if (typeof window === 'undefined') return;
  const ref = doc(db, COLLECTION, DOC_ID);
  const cleaned = cleanForFirestore(profile);
  await setDoc(ref, cleaned, { merge: true });
}