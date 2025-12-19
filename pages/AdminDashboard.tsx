import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { getDailyBriefing } from '../services/geminiService';

const FILTERS = [
  { key: 'ALL', label: 'Barchasi' },
  { key: OrderStatus.NEW, label: 'Yangi' },
  { key: OrderStatus.WASHING, label: 'Yuvilmoqda' },
  { key: OrderStatus.READY, label: 'Tayyor' },
  { key: OrderStatus.DELIVERED, label: 'Yetkazilgan' },
];

const UZ_WEEKDAYS = ['Y', 'D', 'S', 'Ch', 'P', 'J', 'Sh']; // Yakshanba, Dushanba, ...

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [briefing, setBriefing] = useState<string>(
    'Ishlar bo‘yicha qisqacha sharh tayyorlanmoqda...'
  );

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(data);

    if (data.length > 0) {
      getDailyBriefing(data).then(setBriefing);
    } else {
      setBriefing('Tizimda hali buyurtmalar yo‘q.');
    }
  }, []);

  const stats = {
    new: orders.filter((o) => o.status === OrderStatus.NEW).length,
    washing: orders.filter((o) => o.status === OrderStatus.WASHING).length,
    ready: orders.filter((o) => o.status === OrderStatus.READY).length,
    revenue: orders.reduce(
      (acc, o) =>
        acc +
        o.payment.advance +
        (o.status === OrderStatus.DELIVERED ? o.payment.remaining : 0),
      0
    ),
  };

  const filteredOrders = orders.filter(
    (o) => activeFilter === 'ALL' || o.status === activeFilter
  );

  return (
    <Layout title="Boshqaruv paneli" isAdmin>
      <div className="relative">
        {/* Yuqori fon (biroz och binafsha) */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-indigo-50 rounded-b-[40px] -z-10"></div>

        <div className="px-8 pt-8 space-y-8">
          {/* Sarlavha va sana */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Boshqaruv paneli
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                PureClean ish jarayoni umumiy ko‘rinishi
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 shadow-sm">
              📅{' '}
              {new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>

          {/* Statistika kartochkalari */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-900/10 border border-slate-100 transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Bugungi yangi buyurtmalar
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {stats.new}
                </span>
                <span className="text-xs font-bold text-green-500">
                  +12% kechagiga nisbatan
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-900/10 border border-slate-100 transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Hozir yuvilayotganlar
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {stats.washing}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Jarayonda
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-900/10 border border-slate-100 transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Olib ketishga tayyor
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {stats.ready}
                </span>
                <span className="text-xs font-bold text-orange-400">
                  Mijoz kutilyapti
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-900/10 border border-slate-100 transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Bugungi tushum
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-800 truncate">
                  {stats.revenue.toLocaleString()} UZS
                </span>
                <span className="text-[10px] font-bold text-green-500 block">
                  To‘liq to‘langan
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Faol buyurtmalar */}
            <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    Faol buyurtmalar
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">
                    Jarayonni onlayn kuzatish
                  </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                        activeFilter === f.key
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        Buyurtma ID
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        Mijoz
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        Xizmat / buyumlar
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        Holat
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                        Jami
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                        Qoldiq
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/order/${order.id}`)}
                        className="group hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <td className="py-5 px-4">
                          <span className="text-sm font-black text-indigo-600 group-hover:underline">
                            {order.id}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {order.customer.firstName}{' '}
                              {order.customer.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {order.customer.phone}
                            </p>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div>
                            <p className="text-sm text-slate-600">
                              {order.details.serviceType}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {order.details.itemCount} ta buyum
                            </p>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-5 px-4 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            {order.payment.total.toLocaleString()} UZS
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right">
                          {order.payment.remaining > 0 ? (
                            <span className="text-xs font-black text-red-500">
                              -{order.payment.remaining.toLocaleString()} UZS
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                              To‘langan
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-slate-400 text-sm"
                        >
                          Hozircha faol buyurtmalar yo‘q.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* O‘ng tomondagi AI sharh va grafik */}
            <div className="space-y-8">
              {/* AI qisqa sharh kartochkasi */}
              <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                  <span className="text-6xl">🤖</span>
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px] mb-4">
                  Ishlar bo‘yicha qisqa sharh
                </h4>
                <p className="text-lg font-medium leading-relaxed italic relative z-10">
                  "{briefing}"
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Gemini 3 Flash
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150"></span>
                  </div>
                </div>
              </div>

              {/* So‘nggi 7 kunlik buyurtmalar grafigi */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h4 className="text-xs font-black text-slate-800 mb-6">
                  Oxirgi 7 kunlik buyurtmalar
                </h4>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 65, 30, 85, 45, 90, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-full rounded-t-lg transition-all group-hover:bg-indigo-400 ${
                          i === 5 ? 'bg-indigo-600' : 'bg-indigo-100'
                        }`}
                        style={{ height: `${h}%` }}
                      ></div>
                      <span className="text-[9px] font-black text-slate-300 uppercase">
                        {UZ_WEEKDAYS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;