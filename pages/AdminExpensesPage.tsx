// pages/AdminExpensesPage.tsx
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

  const [saving, setSaving] = useState(false);

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
    if (!form.product.trim() || !form.amount) return;

    setSaving(true);
    try {
      const newItem = await createExpense({
        date: form.date || formatToday(),
        product: form.product.trim(),
        quantity: Number(form.quantity) || 0,
        unit: form.unit.trim() || 'dona',
        amount: Number(form.amount) || 0,
        notes: form.notes.trim() || undefined,
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
    } catch (err) {
      console.error('Create expense error:', err);
      alert(
        "Xarajat kiritishda xatolik yuz berdi. Iltimos, keyinroq yana urinib ko‘ring."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Bu xarajatni o‘chirmoqchimisiz?');
    if (!ok) return;

    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete expense error:', err);
      alert(
        "Xarajatni o‘chirishda xatolik yuz berdi. Iltimos, keyinroq yana urinib ko‘ring."
      );
    }
  };

  // Hisob-kitoblar
  const todayKey = formatToday();
  const totalToday = expenses
    .filter((e) => e.date === todayKey)
    .reduce((sum, e) => sum + e.amount, 0);

  const today = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const total30 = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const diff = today.getTime() - d.getTime();
      return diff >= 0 && diff <= THIRTY_DAYS_MS;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout title="Xarajatlar" isAdmin>
      <div className="px-8 pt-8 pb-10 space-y-6">
        {/* Sarlavha */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Xarajatlar
            </h2>
            <p className="text-slate-500 text-sm">
              Kimyoviy vositalar, upalar, paketlar va boshqa sarf materiallari
              bo‘yicha kiritilgan xarajatlar.
            </p>
          </div>
        </div>

        {/* Kartalar – bugun / 30 kun / jami */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
              Bugungi xarajatlar
            </p>
            <p className="text-2xl font-black text-rose-600">
              {totalToday.toLocaleString()} UZS
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {new Date(todayKey).toLocaleDateString('uz-UZ', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
              Oxirgi 30 kun
            </p>
            <p className="text-2xl font-black text-amber-600">
              {total30.toLocaleString()} UZS
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Oxirgi 30 kun ichida kiritilgan xarajatlar
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-900 p-5 shadow-sm flex flex-col justify-between text-white">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-1">
              Jami kiritilgan xarajatlar
            </p>
            <p className="text-2xl font-black">
              {totalAll.toLocaleString()} UZS
            </p>
            <p className="text-[11px] text-slate-300 mt-2">
              Mavjud ma’lumotlar bo‘yicha umumiy xarajatlar summasi
            </p>
          </div>
        </div>

        {/* Yangi xarajat qo‘shish – yonma-yon forma */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-black text-slate-800 mb-4">
              Yangi xarajat yozuvi
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              {/* Sana */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Sana
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>

              {/* Mahsulot turi */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Mahsulot yoki xizmat turi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Persil poroshok, qop-qog‘oz, paket..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.product}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, product: e.target.value }))
                  }
                />
              </div>

              {/* Miqdor + birlik */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Miqdor
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="text"
                    className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="dona, kg, litr..."
                    value={form.unit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Summasi */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Summasi (UZS)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* Izoh */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[70px]"
                  placeholder="Masalan: Ximchistka uchun omborga olindi"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saqlanmoqda...' : '➕ Xarajat qo‘shish'}
                </button>
              </div>
            </form>
          </div>

          {/* Xarajatlar ro‘yxati + grafik ko‘rinish */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Kiritilgan xarajatlar
                </h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                  Sana bo‘yicha so‘nggi yozuvlar
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Ma’lumotlar yuklanmoqda...
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Hozircha xarajatlar kiritilmagan.
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {/* Jadval */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                          Sana
                        </th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                          Mahsulot
                        </th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                          Miqdor
                        </th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                          Summasi
                        </th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                          Izoh
                        </th>
                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                          Amallar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {new Date(exp.date).toLocaleDateString('uz-UZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {exp.product}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {exp.quantity} {exp.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-slate-800">
                            {exp.amount.toLocaleString()} UZS
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-xs">
                            {exp.notes}
                          </td>
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
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminExpensesPage;