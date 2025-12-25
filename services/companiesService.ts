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
  deleteDoc, // ❗ yangi
} from 'firebase/firestore';
import { cleanForFirestore } from './firestoreUtils';

const COLLECTION = 'companies';

export interface Company {
  id: string;
  name: string;
  login: string;
  password: string;
  isEnabled: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
}

export async function fetchCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Company, 'id'>),
  }));
}

export async function findCompanyByLogin(
  login: string
): Promise<Company | null> {
  const q = query(collection(db, COLLECTION), where('login', '==', login));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Company, 'id'>) };
}

export async function fetchCompanyById(
  id: string
): Promise<Company | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Company, 'id'>) };
}

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

export async function updateCompany(
  id: string,
  patch: Partial<Company>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, cleanForFirestore(patch) as any);
}

// ❗ Korxonani o'chirish (faqat companies hujjatini o'chiradi)
// Agar xohlasangiz keyin shu companyId bilan bog'liq orders/employees/expenses'larni ham o'chiradigan "deep delete" qilish mumkin.
export async function deleteCompany(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}