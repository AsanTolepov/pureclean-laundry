// pages/AdminDashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../services/ordersService';
import {
  fetchExpenses,
  ExpenseRecord,
} from '../services/expensesService';

interface DailyMetric {
  dateKey: string;      // YYYY-MM-DD
  dateLabel: string;    // 25-dek
  weekdayShort: string; // dsh, chs...
  newCount: number;
  washingCount: number;
  readyCount: number;
  deliveredCount: number;
  revenue: number;
  expense: number;
  profit: number;
}

interface MonthOption {
  key: string;   // 2025-12
  year: number;
  month: number; // 0-11
  label: string; // dekabr 2025
}

// Oxirgi 30 kun bo‘yicha kunlik metrikalar
function buildDailyMetricsLast30(
  orders: Order[],
  expenses: ExpenseRecord[]
): DailyMetric[] {
  const today = new Date();
  const result: DailyMetric[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    const ordersForDay = orders.filter(
      (o) => o.createdAt.slice(0, 10) === dateKey
    );

    const newCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.NEW
    ).length;
    const washingCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.WASHING
    ).length;
    const readyCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.READY
    ).length;
    const deliveredCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.DELIVERED
    ).length;

    const revenue = ordersForDay.reduce(
      (sum, o) => sum + o.payment.total,
      0
    );
    const expenseForDay = expenses
      .filter((e) => e.date === dateKey)
      .reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - expenseForDay;

    result.push({
      dateKey,
      dateLabel: d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
      }),
      weekdayShort: d.toLocaleDateString('uz-UZ', {
        weekday: 'short',
      }),
      newCount,
      washingCount,
      readyCount,
      deliveredCount,
      revenue,
      expense: expenseForDay,
      profit,
    });
  }

  return result;
}

// Berilgan yil-oy bo‘yicha kunlik metrikalar (jadval uchun)
function buildDailyMetricsForMonth(
  orders: Order[],
  expenses: ExpenseRecord[],
  year: number,
  month: number
): DailyMetric[] {
  const result: DailyMetric[] = [];
  const d = new Date(year, month, 1);

  while (d.getMonth() === month) {
    const dateKey = d.toISOString().slice(0, 10);

    const ordersForDay = orders.filter(
      (o) => o.createdAt.slice(0, 10) === dateKey
    );

    const newCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.NEW
    ).length;
    const washingCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.WASHING
    ).length;
    const readyCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.READY
    ).length;
    const deliveredCount = ordersForDay.filter(
      (o) => o.status === OrderStatus.DELIVERED
    ).length;

    const revenue = ordersForDay.reduce(
      (sum, o) => sum + o.payment.total,
      0
    );
    const expenseForDay = expenses
      .filter((e) => e.date === dateKey)
      .reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - expenseForDay;

    result.push({
      dateKey,
      dateLabel: d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
      }),
      weekdayShort: d.toLocaleDateString('uz-UZ', {
        weekday: 'short',
      }),
      newCount,
      washingCount,
      readyCount,
      deliveredCount,
      revenue,
      expense: expenseForDay,
      profit,
    });

    d.setDate(d.getDate() + 1);
  }

  return result;
}

// Grafik uchun doimiylar
const CHART_TOP = 5;
const CHART_HEIGHT = 28;
const CHART_BOTTOM = CHART_TOP + CHART_HEIGHT;

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [dailyMetrics30, setDailyMetrics30] = useState<DailyMetric[]>([]);

  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [o, e] = await Promise.all([
          fetchOrders(),
          fetchExpenses(),
        ]);

        setOrders(o);
        setExpenses(e);
        setDailyMetrics30(buildDailyMetricsLast30(o, e));

        const now = new Date();
        const opts: MonthOption[] = [];
        for (let i = 0; i < 12; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const year = d.getFullYear();
          const month = d.getMonth();
          const key = `${year}-${String(month + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('uz-UZ', {
            month: 'long',
            year: 'numeric',
          });
          opts.push({ key, year, month, label });
        }
        setMonthOptions(opts);
        if (!selectedMonthKey && opts.length > 0) {
          setSelectedMonthKey(opts[0].key);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📌 Oxirgi 30 kun ichida hozirgi statuslar bo‘yicha sonlar (to'g'ridan-to'g'ri orders dan)
  const statusAgg = useMemo(() => {
    const today = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    return orders.reduce(
      (acc, o) => {
        const created = new Date(o.createdAt);
        const diffMs = today.getTime() - created.getTime();
        if (diffMs < 0 || diffMs > THIRTY_DAYS_MS) return acc;

        if (o.status === OrderStatus.NEW) acc.new += 1;
        if (o.status === OrderStatus.WASHING) acc.washing += 1;
        if (o.status === OrderStatus.READY) acc.ready += 1;
        if (o.status === OrderStatus.DELIVERED) acc.delivered += 1;

        return acc;
      },
      { new: 0, washing: 0, ready: 0, delivered: 0 }
    );
  }, [orders]);

  // 30 kunlik moliyaviy agregat (grafik va tushum kartasi uchun)
  const monthlyAgg = dailyMetrics30.reduce(
    (acc, d) => {
      acc.new += d.newCount;
      acc.washing += d.washingCount;
      acc.ready += d.readyCount;
      acc.delivered += d.deliveredCount;
      acc.revenue += d.revenue;
      acc.expense += d.expense;
      acc.profit += d.profit;
      return acc;
    },
    {
      new: 0,
      washing: 0,
      ready: 0,
      delivered: 0,
      revenue: 0,
      expense: 0,
      profit: 0,
    }
  );

  const totalRevenue30 = monthlyAgg.revenue;
  const totalExpense30 = monthlyAgg.expense;
  const totalProfit30 = monthlyAgg.profit;
  const avgDailyProfit =
    dailyMetrics30.length > 0
      ? Math.round(totalProfit30 / dailyMetrics30.length)
      : 0;

  const hasRevenueData = dailyMetrics30.some((d) => d.revenue > 0);
  const maxRevenue =
    dailyMetrics30.length > 0
      ? Math.max(...dailyMetrics30.map((d) => d.revenue), 1)
      : 1;

  const step =
    dailyMetrics30.length > 1 ? 100 / (dailyMetrics30.length - 1) : 0;

  const revenuePoints = hasRevenueData
    ? dailyMetrics30
        .map((d, i) => {
          const value = d.revenue;
          const norm = value / maxRevenue;
          const y = CHART_BOTTOM - norm * CHART_HEIGHT;
          const x = step * i;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ')
    : '';

  const revenueAreaPoints = revenuePoints
    ? `0,${CHART_BOTTOM} ${revenuePoints} 100,${CHART_BOTTOM}`
    : '';

  let lastRevenuePoint:
    | { x: number; y: number; value: number }
    | null = null;

  if (hasRevenueData && dailyMetrics30.length > 0) {
    const lastIndex = dailyMetrics30.length - 1;
    const lastMetric = dailyMetrics30[lastIndex];
    const value = lastMetric.revenue;
    const norm = value / maxRevenue;
    const y = CHART_BOTTOM - norm * CHART_HEIGHT;
    const x = step * lastIndex;
    lastRevenuePoint = { x, y, value };
  }

  // Donut uchun statuslar – statusAgg asosida
  const statusTotals = {
    new: statusAgg.new,
    washing: statusAgg.washing,
    readyLike: statusAgg.ready + statusAgg.delivered,
  };

  const donutSegmentsBase = [
    {
      key: 'new',
      label: 'Yangi',
      color: '#4f46e5',
      value: statusTotals.new,
    },
    {
      key: 'washing',
      label: 'Yuvilmoqda',
      color: '#f97316',
      value: statusTotals.washing,
    },
    {
      key: 'readyLike',
      label: 'Tayyor / Yetkazilgan',
      color: '#22c55e',
      value: statusTotals.readyLike,
    },
  ];

  const donutTotal = donutSegmentsBase.reduce(
    (sum, s) => sum + s.value,
    0
  );

  const donutSegments = donutSegmentsBase.map((s) => ({
    ...s,
    percent: donutTotal ? Math.round((s.value / donutTotal) * 100) : 0,
  }));

  const circumference = 2 * Math.PI * 16;
  let cumulativeOffset = 0;
  const donutArcs =
    donutTotal > 0
      ? donutSegments.map((seg) => {
          const fraction = seg.value / donutTotal;
          const dash = fraction * circumference;
          const arc = (
            <circle
              key={seg.key}
              r={16}
              cx={25}
              cy={25}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={6}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-cumulativeOffset}
              transform="rotate(-90 25 25)"
              strokeLinecap="round"
            />
          );
          cumulativeOffset += dash;
          return arc;
        })
      : null;

  const bestRevenueDay =
    dailyMetrics30.length > 0
      ? dailyMetrics30.reduce((best, d) =>
          d.revenue > best.revenue ? d : best
        )
      : null;

  const bestProfitDay =
    dailyMetrics30.length > 0
      ? dailyMetrics30.reduce((best, d) =>
          d.profit > best.profit ? d : best
        )
      : null;

  const selectedMonthOption = monthOptions.find(
    (m) => m.key === selectedMonthKey
  );

  const monthlyMetrics =
    selectedMonthOption && (orders.length > 0 || expenses.length > 0)
      ? buildDailyMetricsForMonth(
          orders,
          expenses,
          selectedMonthOption.year,
          selectedMonthOption.month
        )
      : [];

  const monthlyDesc = [...monthlyMetrics].reverse();

  const hasMonthData = monthlyMetrics.some(
    (d) =>
      d.newCount ||
      d.washingCount ||
      d.readyCount ||
      d.deliveredCount ||
      d.revenue ||
      d.expense
  );

  return (
    <Layout title="Asosiy Menu" isAdmin>
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-40 bg-slate-50 -z-10" />

        <div className="px-8 pt-6 space-y-8">
          <div className="flex justify-end">
            <div className="bg-white px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 shadow-sm">
              {new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>

          {loading && dailyMetrics30.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Ma’lumotlar yuklanmoqda...
            </div>
          ) : (
            <>
              {/* Status kartalar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <p className="text-xs opacity-80 mb-1">Yangi buyurtmalar</p>
                  <span className="text-2xl font-semibold">
                    {statusAgg.new}
                  </span>
                  <p className="text-[11px] opacity-70 mt-1">
                    Hozirgi holati "Yangi" bo‘lgan buyurtmalar (oxirgi 30 kun)
                  </p>
                </div>

                <div className="bg-amber-400 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <p className="text-xs opacity-80 mb-1">Yuvilayotganlar</p>
                  <span className="text-2xl font-semibold">
                    {statusAgg.washing}
                  </span>
                  <p className="text-[11px] opacity-70 mt-1">
                    Hozirgi holati "Yuvilmoqda" bo‘lgan buyurtmalar (oxirgi 30 kun)
                  </p>
                </div>

                <div className="bg-sky-500 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <p className="text-xs opacity-80 mb-1">Tayyor buyurtmalar</p>
                  <span className="text-2xl font-semibold">
                    {statusAgg.ready}
                  </span>
                  <p className="text-[11px] opacity-70 mt-1">
                    Hozirgi holati "Olib ketishga tayyor" bo‘lganlar (oxirgi 30 kun)
                  </p>
                </div>

                <div className="bg-violet-500 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <p className="text-xs opacity-80 mb-1">Tushum</p>
                  <span className="text-lg font-semibold">
                    {totalRevenue30.toLocaleString()} UZS
                  </span>
                  <p className="text-[11px] opacity-70 mt-1">
                    Oxirgi 30 kun ichida kelib tushgan jami tushum
                  </p>
                </div>
              </div>

              {/* Grafik + donut + jadval – oldingi kodlaringiz kabi */}
              {/* (bu qismni yuqorida to‘liq yozib chiqdim, o‘zgartirish talab qilmaydi) */}

              {/* Grafik + donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grafik */}
                {/* ... yuqorida yozilgan grafik bo‘limi ... */}
                {/* (kodingizni aynan shu joyga qo‘ying – men uni yuqorida to‘liq yozdim) */}

                {/* Donut */}
                {/* ... yuqorida yozilgan donut bo‘limi ... */}
              </div>

              {/* Kunlik tafsilotlar jadvali */}
              {/* ... yuqorida yozilgan jadval bo‘limi ... */}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;