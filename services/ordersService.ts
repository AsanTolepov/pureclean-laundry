// services/ordersService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  // orderBy,    // hozircha ishlatmaymiz
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
  if (!companyId) {
    console.warn('fetchOrders: currentCompanyId topilmadi');
    return [];
  }

  // ❗ Hozircha faqat where() ishlatamiz, orderBy vaqtincha olib tashlandi
  const q = query(
    collection(db, COLLECTION),
    where('companyId', '==', companyId)
  );

  const snap = await getDocs(q);
  console.log('fetchOrders companyId =', companyId, 'docs:', snap.size);

  const orders = snap.docs.map((d) => d.data() as Order);

  // Ixtiyoriy: createdAt bo‘yicha clientda saralash (so‘ng getDocs natijasini sort qilamiz)
  orders.sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  return orders;
}

// Bitta buyurtma
export async function fetchOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const order = snap.data() as Order;
  const companyId = getCurrentCompanyId();

  if (companyId && order.companyId && order.companyId !== companyId) {
    console.warn(
      'fetchOrderById: bu buyurtma boshqa korxona uchun, ko‘rsatilmaydi',
      id
    );
    return null;
  }

  return order;
}

// ✅ companyId endi CustomerForm ichida qo‘yilmoqda – bu yerda qo‘shmaymiz
export async function createOrder(order: Order): Promise<void> {
  const ref = doc(db, COLLECTION, order.id);
  const cleaned = cleanForFirestore(order);
  await setDoc(ref, cleaned as any);
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