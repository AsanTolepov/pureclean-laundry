// src/pages/AdminOrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { ORDER_STATUS_FLOW } from '../constants';
import {
  fetchOrders,
  deleteOrderById,
} from '../services/ordersService';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const FILTERS: { key: string; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    ...ORDER_STATUS_FLOW.map((s) => ({
      key: s.value,
      label: s.label,
    })),
  ];

  const filteredOrders = orders
    .filter((o) => activeFilter === 'ALL' || o.status === activeFilter)
    .filter((o) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      const id = o.id.toLowerCase();
      const firstName = o.customer.firstName.toLowerCase();
      const lastName = o.customer.lastName.toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const phone = o.customer.phone.toLowerCase().replace(/\s+/g, '');
      const normalizedTerm = term.replace(/\s+/g, '');

      return (
        id.includes(term) ||
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        phone.includes(normalizedTerm)
      );
    });

  const handleDelete = async (id: string) => {
    const ok = window.confirm(
      `Rostdan ham ${id} ID li buyurtmani o‘chirmoqchimisiz?`
    );
    if (!ok) return;

    await deleteOrderById(id);

    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <Layout title="Buyurtmalar" isAdmin>
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-slate-50 -z-10" />

        <div className="px-8 pt-8 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Buyurtmalar ro‘yxati
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-widest">
                Barcha buyurtmalar
              </p>
            </div>

            <div className="relative w-64 md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID, ism yoki telefon raqami bo‘yicha qidiring"
                className="w-full pl-8 pr-4 py-2.5 text-sm rounded-full bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-slate-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex justify-end mb-6">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-3 md:px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      activeFilter === f.key
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Ma’lumotlar yuklanmoqda...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  {/* ... sizdagi jadval HEADINGlari o'zgarmagan ... */}
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
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                        Amallar
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
                        {/* ... qolgani sizdagi kod bilan bir xil ... */}
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
                        <td className="py-5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/order/${order.id}`);
                              }}
                              className="px-3 py-1 text-[11px] font-bold rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                              ✏️ Tahrirlash
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(order.id);
                              }}
                              className="px-3 py-1 text-[11px] font-bold rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              🗑 O‘chirish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-slate-400 text-sm"
                        >
                          Hozircha buyurtmalar topilmadi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrdersPage;