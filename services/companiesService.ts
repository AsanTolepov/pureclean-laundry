// services/companiesService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { cleanForFirestore } from './firestoreUtils';

const COLLECTION = 'companies';

export interface Company {
  id: string;
  name: string;        // "Zuxra Dj... kimyoviy tozalash"
  login: string;       // masalan: "zuxra"
  password: string;    // masalan: "zuxra123"
  isEnabled: boolean;  // obuna yoqilganmi
  validFrom: string;   // ISO: "2025-01-01T00:00:00.000Z"
  validTo: string;     // ISO
  createdAt: string;   // ISO
}

// Hamma korxonalar (superadmin uchun)
export async function fetchCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Company, 'id'>),
  }));
}

// Login bo‘yicha bitta korxonani topish
export async function findCompanyByLogin(
  login: string
): Promise<Company | null> {
  const q = query(collection(db, COLLECTION), where('login', '==', login));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Company, 'id'>) };
}

// ID bo‘yicha topish (Layout ichida obuna holatini tekshirish uchun)
export async function fetchCompanyById(
  id: string
): Promise<Company | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Company, 'id'>) };
}

// Yangi korxona yaratish (superadmin +)
export async function createCompany(
  data: Omit<Company, 'id' | 'createdAt'>
): Promise<Company> {
  const id = `COMP-${Math.floor(100000 + Math.random() * 900000)}`;
  const nowIso = new Date().toISOString();

  const company: Company = {
    id,
    name: data.name,
    login: data.login,
    password: data.password,
    isEnabled: data.isEnabled,
    validFrom: data.validFrom,
    validTo: data.validTo,
    createdAt: nowIso,
  };

  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, cleanForFirestore(company) as any);
  return company;
}

// Korxonani yangilash (enable/disable, muddat va hokazo)
export async function updateCompany(
  id: string,
  patch: Partial<Company>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, cleanForFirestore(patch) as any);
}