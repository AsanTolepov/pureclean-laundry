// services/expensesService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { cleanForFirestore } from './firestoreUtils';

const COLLECTION = 'expenses';

export interface ExpenseRecord {
  id: string;
  date: string;      // YYYY-MM-DD
  product: string;
  quantity: number;
  unit: string;
  amount: number;
  notes?: string;
  companyId?: string;
}

function getCurrentCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentCompanyId');
}

export async function fetchExpenses(): Promise<ExpenseRecord[]> {
  const companyId = getCurrentCompanyId();
  if (!companyId) return [];

  const q = query(
    collection(db, COLLECTION),
    where('companyId', '==', companyId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ExpenseRecord);
}

export async function createExpense(
  data: Omit<ExpenseRecord, 'id' | 'companyId'>
): Promise<ExpenseRecord> {
  const companyId = getCurrentCompanyId();
  if (!companyId) throw new Error('currentCompanyId topilmadi');

  const id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
  const item: ExpenseRecord = { ...data, id, companyId };

  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, cleanForFirestore(item) as any);
  return item;
}

export async function deleteExpense(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}