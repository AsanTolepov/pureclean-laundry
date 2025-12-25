// src/constants.ts
import { OrderStatus, ServiceItem, Order } from './types';

export const COLORS = {
  primary: '#6366f1', // Vibrant Blue-Purple (Indigo)
  secondary: '#14b8a6', // Teal
  accent: '#f59e0b', // Amber
  background: '#f1f5f9',
  text: '#1e293b',
  sidebar: '#ffffff',
  header: '#4f46e5', // Deep Purple
};

const now = new Date();
const formatDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(now.getDate() - daysAgo);
  return d.toISOString();
};

/**
 * Statuslar uchun umumiy ketma-ketlik + label + emoji
 * Hamma joyda shuni ishlatamiz:
 *  NEW -> WASHING -> READY -> DELIVERED
 */
export const ORDER_STATUS_FLOW: {
  value: OrderStatus;
  label: string;
  emoji: string;
}[] = [
  { value: OrderStatus.NEW,       label: 'Yangi',                emoji: '📄' },
  { value: OrderStatus.WASHING,   label: 'Yuvilmoqda',           emoji: '💧' },
  { value: OrderStatus.READY,     label: 'Olib ketishga tayyor', emoji: '📦' },
  { value: OrderStatus.DELIVERED, label: 'Yetkazilgan',          emoji: '✅' },
];

/**
 * Badjlar uchun konfiguratsiya – ranglar + label + icon
 * Emoji ORDER_STATUS_FLOW dagi bilan mos.
 */
export const STATUS_CONFIG = {
  [OrderStatus.NEW]: {
    label: 'Yangi',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: '📄',
  },
  [OrderStatus.WASHING]: {
    label: 'Yuvilmoqda',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: '💧',
  },
  // ❗ Bu endi YASHIL EMAS – sariq / amber
  [OrderStatus.READY]: {
    label: 'Olib ketishga tayyor',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: '📦',
  },
  // ❗ Yashil rang faqat "Yetkazilgan" uchun
  [OrderStatus.DELIVERED]: {
    label: 'Yetkazilgan',
    color: 'bg-green-50 text-green-600 border-green-100',
    icon: '✅',
  },
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'PC-6435',
    customer: { firstName: 'Aziz', lastName: 'Rahimov', phone: '+998901234567' },
    details: {
      itemCount: 5,
      serviceType: 'Washing & Drying',
      dateIn: formatDate(1),
      pickupDate: formatDate(-1),
    },
    payment: { total: 80000, advance: 20000, remaining: 60000 },
    status: OrderStatus.WASHING,
    createdAt: formatDate(1),
  },
  {
    id: 'PC-8421',
    customer: { firstName: 'Dilnoza', lastName: 'Karimova', phone: '+998935554433' },
    details: {
      itemCount: 2,
      serviceType: 'Dry Cleaning',
      dateIn: formatDate(0),
      pickupDate: formatDate(-2),
    },
    payment: { total: 50000, advance: 50000, remaining: 0 },
    status: OrderStatus.READY,
    createdAt: formatDate(0),
  },
  {
    id: 'PC-1042',
    customer: { firstName: 'Jasur', lastName: 'Umarov', phone: '+998941112233' },
    details: {
      itemCount: 8,
      serviceType: 'Washing & Drying',
      dateIn: formatDate(2),
      pickupDate: formatDate(0),
    },
    payment: { total: 120000, advance: 120000, remaining: 0 },
    status: OrderStatus.DELIVERED,
    createdAt: formatDate(2),
  },
  {
    id: 'PC-3392',
    customer: { firstName: 'Malika', lastName: 'Toshmatova', phone: '+998974445566' },
    details: {
      itemCount: 1,
      serviceType: 'Premium Care',
      dateIn: formatDate(0),
      pickupDate: formatDate(-3),
    },
    payment: { total: 40000, advance: 10000, remaining: 30000 },
    status: OrderStatus.NEW,
    createdAt: formatDate(0),
  },
  {
    id: 'PC-5521',
    customer: { firstName: 'Sherzod', lastName: 'Aliev', phone: '+998909998877' },
    details: {
      itemCount: 4,
      serviceType: 'Ironing Only',
      dateIn: formatDate(1),
      pickupDate: formatDate(-1),
    },
    payment: { total: 32000, advance: 0, remaining: 32000 },
    status: OrderStatus.WASHING,
    createdAt: formatDate(1),
  },
  {
    id: 'PC-9011',
    customer: { firstName: 'Umida', lastName: 'Zokirova', phone: '+998937778899' },
    details: {
      itemCount: 3,
      serviceType: 'Dry Cleaning',
      dateIn: formatDate(0),
      pickupDate: formatDate(-2),
    },
    payment: { total: 75000, advance: 75000, remaining: 0 },
    status: OrderStatus.READY,
    createdAt: formatDate(0),
  },
];