import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(data);
  }, []);

  const FILTERS = [
    { key: 'ALL', label: 'Barchasi' },
    { key: OrderStatus.NEW, label: 'Yangi' },
    { key: OrderStatus.WASHING, label: 'Yuvilmoqda' },
    { key: OrderStatus.READY, label: 'Tayyor' },
    { key: OrderStatus.DELIVERED, label: 'Yetkazilgan' },
  ];

  const filteredOrders = orders.filter(
    (o) => activeFilter === 'ALL' || o.status === activeFilter
  );

  // Buyurtmani lokal storage va state dan o‘chirish
  const handleDelete = (id: string) => {
    const ok = window.confirm(
      `Rostdan ham ${id} ID li buyurtmani o‘chirmoqchimisiz?`
    );
    if (!ok) return;

    const existing: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const updated = existing.filter((o) => o.id !== id);
    localStorage.setItem('orders', JSON.stringify(updated));
    setOrders(updated);
  };

  return (
    <Layout title="Buyurtmalar" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Buyurtmalar ro‘yxati</h2>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">
              Barcha buyurtmalar
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

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
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
                    <td className="py-5 px-4">
                      <span className="text-sm font-black text-indigo-600 group-hover:underline">
                        {order.id}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {order.customer.firstName} {order.customer.lastName}
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
                        {/* Tahrirlash – batafsil sahifaga olib boradi */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/order/${order.id}`);
                          }}
                          className="px-3 py-1 text-[11px] font-bold rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          ✏️ Tahrirlash
                        </button>

                        {/* O‘chirish */}
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
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrdersPage;