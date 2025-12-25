// src/pages/AdminExpensesPage.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import {
  ExpenseRecord,
  fetchExpenses,
  createExpense,
  deleteExpense,
} from '../services/expensesService';

const formatToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const AdminExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: formatToday(),
    product: '',
    quantity: 1,
    unit: 'dona',
    amount: 0,
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchExpenses();
        setExpenses(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.amount) return;

    const newItem = await createExpense({
      date: form.date || formatToday(),
      product: form.product,
      quantity: Number(form.quantity) || 0,
      unit: form.unit || 'dona',
      amount: Number(form.amount) || 0,
      notes: form.notes?.trim() || undefined,
    });

    setExpenses((prev) =>
      [newItem, ...prev].sort((a, b) => b.date.localeCompare(a.date))
    );

    setForm((prev) => ({
      ...prev,
      product: '',
      quantity: 1,
      amount: 0,
      notes: '',
    }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu xarajatni o‘chirmoqchimisiz?')) return;
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayKey = formatToday();
  const totalToday = expenses
    .filter((e) => e.date === todayKey)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout title="Xarajatlar" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        {/* ... sizdagi UI kodi o'zgarmagan, faqat localStorage yo'q ... */}
        {/* Faqat table va form yuqorida yangi handleAdd/handleDelete bilan ishlaydi */}

        {/* Umumiy ko‘rsatkichlar */}
        {/* ... (sizdagi kod) ... */}

        {/* Yangi xarajat qo‘shish formasi */}
        {/* ... (sizdagi kod, faqat handleAdd async) ... */}

        {/* Jadval */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          {/* heading */}
          {/* ... */}

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Ma’lumotlar yuklanmoqda...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                {/* thead ... */}
                <tbody className="divide-y divide-slate-50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      {/* ... sizdagi hujayralar ... */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="px-3 py-1 text-[11px] font-bold rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          🗑 O‘chirish
                        </button>
                      </td>
                    </tr>
                  ))}

                  {expenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400 text-sm"
                      >
                        Hozircha xarajatlar kiritilmagan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminExpensesPage;