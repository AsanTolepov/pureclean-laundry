// src/pages/AdminReportsPage.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Order } from '../types';
import QRCode from 'react-qr-code';

interface DailyReport {
  dateLabel: string;
  weekdayShort: string;
  revenue: number;
  chemicals: number;
  salary: number;
  other: number;
  profit: number;
}

// Realroqqa yaqin taqsimot: jami ~75% xarajat, ~25% foyda
const CHEMICAL_RATE = 0.18; // 18% kimyoviy vositalar
const SALARY_RATE = 0.25;   // 25% ishchilar oyligi
const OTHER_RATE = 0.32;    // 32% boshqa xarajatlar

const AdminReportsPage: React.FC = () => {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const reports = buildDailyReports(orders); // Oxirgi 30 kun
    setDailyReports(reports);
  }, []);

  const totalRevenue = dailyReports.reduce((acc, d) => acc + d.revenue, 0);
  const totalChemicals = dailyReports.reduce((acc, d) => acc + d.chemicals, 0);
  const totalSalary = dailyReports.reduce((acc, d) => acc + d.salary, 0);
  const totalOther = dailyReports.reduce((acc, d) => acc + d.other, 0);
  const totalExpenses = totalChemicals + totalSalary + totalOther;
  const totalProfit = dailyReports.reduce((acc, d) => acc + d.profit, 0);

  const maxRevenue = Math.max(...dailyReports.map((d) => d.revenue), 1);

  const expenseShare =
    totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;
  const profitShare =
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // QR kodi ochadigan URL — sizdagi buyurtma formasi
  const qrUrl = `${window.location.origin}/#/new-order`;

  return (
    <Layout title="Hisobotlar" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        {/* Sarlavha */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              1 oylik moliyaviy hisobot
            </h2>
            <p className="text-slate-500 text-sm">
              Oxirgi 30 kun bo‘yicha tushum, xarajatlar va sof foyda statistikasi.
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-semibold uppercase tracking-widest">
            Oxirgi 30 kun
          </div>
        </div>

        {/* Umumiy ko‘rsatkichlar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Jami tushum (30 kun)
            </p>
            <p className="text-2xl font-black text-slate-900">
              {totalRevenue.toLocaleString()} UZS
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Buyurtmalardan kelgan brutto tushum
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Jami xarajatlar
            </p>
            <p className="text-2xl font-black text-rose-600">
              {totalExpenses.toLocaleString()} UZS
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {expenseShare}% tushumdan
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Sof foyda
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {totalProfit.toLocaleString()} UZS
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {profitShare}% tushumdan
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Xarajatlar tarkibi (oylik)
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>
                Kimyoviy vositalar (ximchistka):{' '}
                <span className="font-bold">
                  {totalChemicals.toLocaleString()} UZS
                </span>{' '}
                <span className="text-slate-400">(18%)</span>
              </p>
              <p>
                Ishchilar oyligi:{' '}
                <span className="font-bold">
                  {totalSalary.toLocaleString()} UZS
                </span>{' '}
                <span className="text-slate-400">(25%)</span>
              </p>
              <p>
                Boshqa xarajatlar:{' '}
                <span className="font-bold">
                  {totalOther.toLocaleString()} UZS
                </span>{' '}
                <span className="text-slate-400">(32%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Diagrammalar bloklari */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 30 kunlik tushum / foyda diagrammasi */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Oxirgi 30 kun: tushum va foyda
                </h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                  Har bir kun bo‘yicha
                </p>
              </div>
            </div>

            {totalRevenue === 0 ? (
              <p className="text-sm text-slate-400 mt-4">
                Oxirgi 30 kun ichida hisobot tuzish uchun yetarli buyurtma yo‘q.
              </p>
            ) : (
              <div className="h-64 flex items-end gap-1">
                {dailyReports.map((d) => {
                  const revenueHeight = (d.revenue / maxRevenue) * 100;
                  const profitHeight = (d.profit / maxRevenue) * 100;

                  return (
                    <div
                      key={d.dateLabel + d.weekdayShort}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="flex-1 flex flex-col justify-end w-full gap-1">
                        {/* Tushum ustuni */}
                        <div className="w-full bg-indigo-100 rounded-t-xl overflow-hidden">
                          <div
                            className="bg-indigo-500 w-full rounded-t-xl transition-all"
                            style={{ height: `${revenueHeight || 3}%` }}
                          />
                        </div>
                        {/* Foyda ustuni */}
                        <div className="w-2/3 mx-auto bg-emerald-50 rounded-t-xl overflow-hidden -mt-5">
                          <div
                            className="bg-emerald-500 w-full rounded-t-xl transition-all"
                            style={{ height: `${profitHeight || 2}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-slate-500 leading-tight">
                          {d.dateLabel}
                        </p>
                        <p className="text-[8px] text-slate-400 uppercase">
                          {d.weekdayShort}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalRevenue > 0 && (
              <div className="mt-4 flex justify-center gap-6 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Tushum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Sof foyda</span>
                </div>
              </div>
            )}
          </div>

          {/* O‘ng ustun: Xarajatlar + QR kod */}
          <div className="space-y-6">
            {/* Xarajatlar bo‘linishi */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-1">
                  Xarajatlar bo‘linishi (oylik)
                </h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4">
                  Tushumga nisbatan
                </p>

                <div className="space-y-4">
                  <ExpenseRow
                    label="Kimyoviy vositalar (ximchistka)"
                    amount={totalChemicals}
                    color="bg-sky-500"
                    percent={18}
                  />
                  <ExpenseRow
                    label="Ishchilar oyligi"
                    amount={totalSalary}
                    color="bg-amber-500"
                    percent={25}
                  />
                  <ExpenseRow
                    label="Boshqa xarajatlar"
                    amount={totalOther}
                    color="bg-rose-500"
                    percent={32}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p>
                  Jami xarajatlar:{' '}
                  <span className="font-bold text-slate-700">
                    {totalExpenses.toLocaleString()} UZS
                  </span>
                </p>
                <p>
                  Sof foyda:{' '}
                  <span className="font-bold text-emerald-600">
                    {totalProfit.toLocaleString()} UZS
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Foizlar soddalashtirilgan model bo‘yicha hisoblanadi. Keyin
                  real xarajat ma’lumotlarini ham qo‘shishingiz mumkin.
                </p>
              </div>
            </div>

            {/* QR kod karta – yangi buyurtma uchun */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-sm font-black text-slate-800 mb-1">
                QR orqali buyurtma
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                Mijozlar telefon kamerasi yoki skaner ilovasi bilan ushbu QR
                kodni o‘qisa, yangi buyurtma formasiga o‘tadi va o‘zi ma’lumot
                to‘ldiradi.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl">
                <QRCode value={qrUrl} size={150} />
              </div>

              <p className="text-[11px] text-slate-400 mt-3">
                URL: <span className="font-mono text-slate-500">{qrUrl}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface ExpenseRowProps {
  label: string;
  amount: number;
  color: string;
  percent: number;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({
  label,
  amount,
  color,
  percent,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-[11px] text-slate-500">
          {amount.toLocaleString()} UZS ({percent}%)
        </p>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Oxirgi 30 kun bo‘yicha har kunlik hisobot
function buildDailyReports(orders: Order[]): DailyReport[] {
  const today = new Date();
  const result: DailyReport[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const revenueForDay = orders
      .filter((o) => o.createdAt.slice(0, 10) === dateKey)
      .reduce((sum, o) => sum + o.payment.total, 0);

    const chemicals = Math.round(revenueForDay * CHEMICAL_RATE);
    const salary = Math.round(revenueForDay * SALARY_RATE);
    const other = Math.round(revenueForDay * OTHER_RATE);

    const rawProfit = revenueForDay - chemicals - salary - other;
    const profit = Math.max(0, rawProfit); // manfiy bo‘lib ketmasin

    result.push({
      dateLabel: d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
      }),
      weekdayShort: d.toLocaleDateString('uz-UZ', {
        weekday: 'short',
      }),
      revenue: revenueForDay,
      chemicals,
      salary,
      other,
      profit,
    });
  }

  return result;
}

export default AdminReportsPage;