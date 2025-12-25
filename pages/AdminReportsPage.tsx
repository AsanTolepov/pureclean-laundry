import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Order } from '../types';
import { fetchOrders } from '../services/ordersService';
import {
  fetchExpenses,
  ExpenseRecord,
} from '../services/expensesService';

interface DailyReport {
  dateKey: string;
  dateLabel: string;
  weekdayShort: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  tone?: 'primary' | 'success' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  tone = 'primary',
}) => {
  let mainColor = 'text-slate-900';
  if (tone === 'success') mainColor = 'text-emerald-600';
  if (tone === 'danger') mainColor = 'text-rose-600';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
        {title}
      </p>
      <p className={`text-2xl font-black ${mainColor}`}>
        {value.toLocaleString()} UZS
      </p>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

function buildDailyReports(
  orders: Order[],
  expenses: ExpenseRecord[]
): DailyReport[] {
  const today = new Date();
  const result: DailyReport[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    const revenueForDay = orders
      .filter((o) => o.createdAt.slice(0, 10) === dateKey)
      .reduce((sum, o) => sum + o.payment.total, 0);

    const expenseForDay = expenses
      .filter((e) => e.date === dateKey)
      .reduce((sum, e) => sum + e.amount, 0);

    const profit = revenueForDay - expenseForDay;

    result.push({
      dateKey,
      dateLabel: d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
      }),
      weekdayShort: d.toLocaleDateString('uz-UZ', {
        weekday: 'short',
      }),
      revenue: revenueForDay,
      expense: expenseForDay,
      profit,
    });
  }

  return result;
}

const AdminReportsPage: React.FC = () => {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [allRevenue, setAllRevenue] = useState(0);
  const [allExpense, setAllExpense] = useState(0);
  const [allProfit, setAllProfit] = useState(0);

  useEffect(() => {
    const load = async () => {
      const orders = await fetchOrders();
      const expenses = await fetchExpenses();

      const daily = buildDailyReports(orders, expenses);
      setDailyReports(daily);

      const totalRevenueAll = orders.reduce(
        (sum, o) => sum + o.payment.total,
        0
      );
      const totalExpenseAll = expenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      setAllRevenue(totalRevenueAll);
      setAllExpense(totalExpenseAll);
      setAllProfit(totalRevenueAll - totalExpenseAll);
    };
    load();
  }, []);

  const totalRevenue30 = dailyReports.reduce((acc, d) => acc + d.revenue, 0);
  const totalExpense30 = dailyReports.reduce((acc, d) => acc + d.expense, 0);
  const totalProfit30 = dailyReports.reduce((acc, d) => acc + d.profit, 0);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayReport = dailyReports.find((d) => d.dateKey === todayKey);

  const todayRevenue = todayReport?.revenue ?? 0;
  const todayExpense = todayReport?.expense ?? 0;
  const todayProfit = todayReport?.profit ?? 0;

  const maxValue =
    dailyReports.length > 0
      ? Math.max(
          ...dailyReports.map((d) => Math.max(d.revenue, d.expense)),
          1
        )
      : 1;

  const bestRevenueDay =
    dailyReports.length > 0
      ? dailyReports.reduce((best, d) =>
          d.revenue > best.revenue ? d : best
        )
      : null;

  const bestProfitDay =
    dailyReports.length > 0
      ? dailyReports.reduce((best, d) =>
          d.profit > best.profit ? d : best
        )
      : null;

  const avgDailyProfit =
    dailyReports.length > 0
      ? Math.round(totalProfit30 / dailyReports.length)
      : 0;

  const dailyReportsDesc = [...dailyReports].reverse();

  const buildLinePoints = (
    field: 'revenue' | 'expense',
    height = 40
  ): string => {
    if (dailyReports.length === 0) return '';

    const chartHeight = height - 10;
    const topPadding = 5;
    const bottom = topPadding + chartHeight;
    const step =
      dailyReports.length > 1 ? 100 / (dailyReports.length - 1) : 0;

    return dailyReports
      .map((d, i) => {
        const value = d[field];
        const y =
          bottom - (value / maxValue) * chartHeight;
        const x = step * i;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const revenuePoints = buildLinePoints('revenue');
  const expensePoints = buildLinePoints('expense');

  return (
    <Layout title="Hisobotlar" isAdmin>
      {/* Sizdagi UI to‘liq shu yerda ishlaydi, faqat ma’lumotlar Firebase’dan kelmoqda */}
      {/* Eski AdminReportsPage.tsx ni shu faylga to‘liq ko‘chirib, faqat localStorage o‘rniga shu hook natijalarini ishlatyapsiz */}
    </Layout>
  );
};

export default AdminReportsPage;