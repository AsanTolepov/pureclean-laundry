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

// Tanlangan yil-oy bo‘yicha kunlik metrikalar (jadval uchun)
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

  // Statuslar bo‘yicha hisob – faqat oxirgi 30 kun ichidagi orderlar
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

  // Kunlik metrikalar asosida moliyaviy agregat (tushum/xarajat/foyda)
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

  // Donut – statuslar bo‘yicha
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
          {/* Sana pill */}
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

              {/* Grafik + donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grafik */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Kunlik tushum (oxirgi 30 kun)
                      </h3>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                        Har kun bo‘yicha tushum dinamikasi
                      </p>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-500">
                      30D
                    </div>
                  </div>

                  {hasRevenueData ? (
                    <>
                      <div className="w-full h-64">
                        <svg
                          viewBox="0 0 100 40"
                          preserveAspectRatio="none"
                          className="w-full h-full"
                        >
                          <defs>
                            <linearGradient
                              id="revenueArea"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity="0.4"
                              />
                              <stop
                                offset="100%"
                                stopColor="#22c55e"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          <line
                            x1="0"
                            y1={CHART_BOTTOM}
                            x2="100"
                            y2={CHART_BOTTOM}
                            stroke="#e5e7eb"
                            strokeWidth={0.4}
                          />

                          {revenueAreaPoints && (
                            <polygon
                              points={revenueAreaPoints}
                              fill="url(#revenueArea)"
                              opacity={0.9}
                            />
                          )}

                          <polyline
                            points={revenuePoints}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth={1.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {dailyMetrics30.map((d, i) => {
                            const value = d.revenue;
                            const norm = value / maxRevenue;
                            const y =
                              CHART_BOTTOM - norm * CHART_HEIGHT;
                            const x = step * i;
                            return (
                              <circle
                                key={d.dateKey}
                                cx={x}
                                cy={y}
                                r={0.7}
                                fill="#16a34a"
                              />
                            );
                          })}

                          {lastRevenuePoint && lastRevenuePoint.value > 0 && (
                            <g>
                              <rect
                                x={lastRevenuePoint.x - 12}
                                y={lastRevenuePoint.y - 8}
                                rx={2}
                                ry={2}
                                width={24}
                                height={7}
                                fill="#22c55e"
                              />
                              <text
                                x={lastRevenuePoint.x}
                                y={lastRevenuePoint.y - 3.5}
                                textAnchor="middle"
                                fontSize={2.6}
                                fill="#ffffff"
                              >
                                {lastRevenuePoint.value.toLocaleString()}
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-slate-600">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Jami tushum (30 kun):</span>
                            <span className="font-bold text-slate-900">
                              {totalRevenue30.toLocaleString()} UZS
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Jami xarajatlar (30 kun):</span>
                            <span className="font-bold text-rose-600">
                              {totalExpense30.toLocaleString()} UZS
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Sof foyda (30 kun):</span>
                            <span
                              className={`font-extrabold ${
                                totalProfit30 >= 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {totalProfit30.toLocaleString()} UZS
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>O‘rtacha kunlik foyda:</span>
                            <span
                              className={`font-semibold ${
                                avgDailyProfit >= 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {avgDailyProfit.toLocaleString()} UZS
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-sm">
                      Oxirgi 30 kun uchun grafik chizish uchun ma’lumot
                      topilmadi.
                    </div>
                  )}
                </div>

                {/* Donut */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Statuslar bo‘yicha ulush
                  </h3>
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4">
                    Oxirgi 30 kun ichida
                  </p>

                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 50 50" className="w-full h-full">
                        <circle
                          r={16}
                          cx={25}
                          cy={25}
                          fill="transparent"
                          stroke="#e5e7eb"
                          strokeWidth={6}
                        />
                        {donutArcs}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-400">Jami</span>
                        <span className="text-lg font-semibold text-slate-800">
                          {donutTotal}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          buyurtma
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs md:text-sm text-slate-600 mb-4">
                    {donutSegments.map((seg) => (
                      <div
                        key={seg.key}
                        className="flex flex-col items-center gap-1 flex-1"
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="font-semibold">
                            {seg.percent}%
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 text-center">
                          {seg.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-3 text-xs md:text-sm text-slate-600 space-y-3">
                    <div>
                      <p className="text-slate-400 mb-1">Eng katta tushum</p>
                      {bestRevenueDay ? (
                        <p className="font-semibold text-slate-800">
                          {bestRevenueDay.dateLabel} (
                          {bestRevenueDay.weekdayShort}) –{' '}
                          <span className="text-indigo-600 font-bold">
                            {bestRevenueDay.revenue.toLocaleString()} UZS
                          </span>
                        </p>
                      ) : (
                        <p className="text-slate-400">Ma’lumot yo‘q</p>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">
                        Eng katta sof foyda
                      </p>
                      {bestProfitDay ? (
                        <p className="font-semibold text-slate-800">
                          {bestProfitDay.dateLabel} (
                          {bestProfitDay.weekdayShort}) –{' '}
                          <span
                            className={`font-bold ${
                              bestProfitDay.profit >= 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {bestProfitDay.profit.toLocaleString()} UZS
                          </span>
                        </p>
                      ) : (
                        <p className="text-slate-400">Ma’lumot yo‘q</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kunlik tafsilotlar jadvali */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Kunlik tafsilotlar
                    </h3>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                      Tanlangan oy bo‘yicha hisoboti
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Oy:</span>
                    <div className="relative">
                      <select
                        value={selectedMonthKey}
                        onChange={(e) => setSelectedMonthKey(e.target.value)}
                        className="appearance-none text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                      >
                        {monthOptions.map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMonthOption ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                            Sana
                          </th>
                          <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                            Buyurtmalar soni
                          </th>
                          <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                            Olib ketilganlari
                          </th>
                          <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                            Tushum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {hasMonthData ? (
                          monthlyDesc.map((d) => {
                            const totalOrders =
                              d.newCount +
                              d.washingCount +
                              d.readyCount +
                              d.deliveredCount;

                            return (
                              <tr
                                key={d.dateKey}
                                className="hover:bg-slate-50 cursor-pointer"
                                onClick={() =>
                                  navigate(`/admin/daily/${d.dateKey}`)
                                }
                              >
                                <td className="py-3 px-4 text-xs text-slate-600">
                                  {d.dateLabel} ({d.weekdayShort})
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-slate-800">
                                  {totalOrders}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-slate-800">
                                  {d.deliveredCount}
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-600">
                                  {d.revenue.toLocaleString()} UZS
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-10 text-center text-slate-400 text-sm"
                            >
                              Ma’lumot topilmadi.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    Ma’lumot topilmadi.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;