// services/ordersService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Order } from '../types';
import { cleanForFirestore } from './firestoreUtils';

const COLLECTION = 'orders';

function getCurrentCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentCompanyId');
}

// Faqat shu korxonaga tegishli buyurtmalar
export async function fetchOrders(): Promise<Order[]> {
  const companyId = getCurrentCompanyId();
  if (!companyId) return [];

  const q = query(
    collection(db, COLLECTION),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Order);
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const order = snap.data() as Order;
  const companyId = getCurrentCompanyId();

  // Boshqa korxonaning buyurtmasi bo'lsa, ko'rsatmaymiz
  if (companyId && order.companyId && order.companyId !== companyId) {
    return null;
  }

  return order;
}

export async function createOrder(order: Order): Promise<void> {
  const companyId = getCurrentCompanyId();
  if (!companyId) {
    throw new Error('currentCompanyId topilmadi (korxona tanlanmagan).');
  }

  const ref = doc(db, COLLECTION, order.id);
  const dataToSave = cleanForFirestore({
    ...order,
    companyId,
  });

  await setDoc(ref, dataToSave as any);
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const cleaned = cleanForFirestore(patch);
  await updateDoc(ref, cleaned as any);
}

export async function deleteOrderById(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}