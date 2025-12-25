// services/employeesService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { cleanForFirestore } from './firestoreUtils';

const COLLECTION = 'employees';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  shift: string;
  isActive: boolean;
  hiredAt: string;
  dailyRate: number;
  attendance?: string[];
  companyId?: string;
}

function getCurrentCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentCompanyId');
}

export async function fetchEmployees(): Promise<Employee[]> {
  const companyId = getCurrentCompanyId();
  if (!companyId) return [];

  const q = query(
    collection(db, COLLECTION),
    where('companyId', '==', companyId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Employee);
}

export async function fetchEmployeeById(
  id: string
): Promise<Employee | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Employee;
}

export async function createEmployee(
  data: Omit<Employee, 'id' | 'companyId'>
): Promise<Employee> {
  const companyId = getCurrentCompanyId();
  if (!companyId) throw new Error('currentCompanyId topilmadi');

  const id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const employee: Employee = { ...data, id, companyId };
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, cleanForFirestore(employee) as any);
  return employee;
}

export async function updateEmployee(
  id: string,
  patch: Partial<Employee>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, cleanForFirestore(patch) as any);
}

export async function deleteEmployee(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}