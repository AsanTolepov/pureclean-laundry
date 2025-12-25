import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { fetchOrders } from '../services/ordersService';
import {
  fetchExpenses,
  ExpenseRecord,
} from '../services/expensesService';

const AdminDailyReportPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const dateKey = date || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const o = await fetchOrders();
      const e = await fetchExpenses();
      setOrders(o);
      setExpenses(e);
      setLoading(false);
    };
    load();
  }, []);

  const ordersForDay = orders.filter(
    (o) => o.createdAt.slice(0, 10) === dateKey
  );
  const expensesForDay = expenses.filter((e) => e.date === dateKey);

  const totalOrders = ordersForDay.length;
  const deliveredCount = ordersForDay.filter(
    (o) => o.status === OrderStatus.DELIVERED
  ).length;
  const revenue = ordersForDay.reduce(
    (sum, o) => sum + o.payment.total,
    0
  );
  const expenseTotal = expensesForDay.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const profit = revenue - expenseTotal;

  const noData = totalOrders === 0 && expenseTotal === 0;

  let dateLabel = dateKey;
  try {
    const d = new Date(dateKey);
    if (!isNaN(d.getTime())) {
      dateLabel = d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'long',
        weekday: 'long',
      });
    }
  } catch {
    // ignore
  }

  return (
    <Layout title="Kunlik hisoboti" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Kunlik hisoboti
            </h2>
            <p className="text-sm text-slate-500 mt-1">Sana: {dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
          >
            Orqaga
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-16 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-semibold">
              Ma’lumotlar yuklanmoqda...
            </p>
          </div>
        ) : noData ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <p className="text-sm font-semibold">
              Hozircha ma’lumotlar topilmadi
            </p>
          </div>
        ) : (
          <>
            {/* Statistika kartalari – sizdagi UI'dan olingan */}
            {/* ... butun UI qismini eski faylingizdan shu yerga qo‘ying, faqat ma’lumotlar endi state’dan kelmoqda ... */}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDailyReportPage;