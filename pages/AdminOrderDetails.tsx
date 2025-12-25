// pages/AdminOrderDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ORDER_STATUS_FLOW } from '../constants';
import {
  fetchOrderById,
  updateOrder as updateOrderInDb,
} from '../services/ordersService';

const STATUS_STEPS = ORDER_STATUS_FLOW;

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [total, setTotal] = useState(0);
  const [advance, setAdvance] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const o = await fetchOrderById(id);
        if (o) {
          setOrder(o);
          setTotal(o.payment.total);
          setAdvance(o.payment.advance);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const applyUpdate = async (patch: Partial<Order>) => {
    if (!order) return;
    await updateOrderInDb(order.id, patch);
    setOrder((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    await applyUpdate({ status: newStatus });
  };

  const savePayment = async () => {
    if (!order) return;
    const remaining = Math.max(0, total - advance);
    await applyUpdate({
      payment: {
        total,
        advance,
        remaining,
      },
    });
    setIsEditingPayment(false);
  };

  if (loading) {
    return (
      <Layout title="Buyurtma" isAdmin showBack>
        <div className="p-6 text-sm text-slate-500">
          Ma’lumotlar yuklanmoqda...
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Not Found" isAdmin showBack>
        <div className="p-6 text-sm text-slate-500">
          Buyurtma topilmadi.
        </div>
      </Layout>
    );
  }

  const createdDate = new Date(order.details.dateIn);
  const createdLabel = createdDate.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const pickupLabel = order.details.pickupDate
    ? new Date(order.details.pickupDate).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
      })
    : null;

  const liveRemaining = Math.max(
    0,
    isEditingPayment ? total - advance : order.payment.remaining
  );

  return (
    <Layout title={order.id} isAdmin showBack>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <p className="text-[11px] font-mono text-slate-400 mb-1">
            Buyurtma ID:{' '}
            <span className="font-bold text-slate-600">{order.id}</span>
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {order.customer.firstName} {order.customer.lastName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{order.customer.phone}</p>

          <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-slate-500">
            <span className="px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
              Qabul qilingan:{' '}
              <span className="font-semibold">{createdLabel}</span>
            </span>
            {pickupLabel && (
              <span className="px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
                Olib ketish:{' '}
                <span className="font-semibold">{pickupLabel}</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest">
              Joriy holat:
            </span>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* ASOSIY MA’LUMOTLAR + TO‘LOV */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buyurtma tafsilotlari */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-3">
                Buyurtma tafsilotlari
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Xizmat turi
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.details.serviceType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Buyumlar soni
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {order.details.itemCount}
                  </p>
                </div>
              </div>

              {order.details.notes && (
                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-yellow-700 uppercase mb-1">
                    Mijozdan izoh
                  </p>
                  <p className="text-sm text-yellow-900 leading-snug">
                    {order.details.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TO‘LOV */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-slate-800">To‘lov</h3>
              <button
                onClick={() => setIsEditingPayment((v) => !v)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
              >
                {isEditingPayment ? 'Bekor qilish' : 'Tahrirlash'}
              </button>
            </div>

            {isEditingPayment ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Umumiy summa (UZS)
                    </label>
                    <input
                      type="number"
                      className="w-full border-b-2 border-slate-200 py-1 text-xl font-bold outline-none focus:border-sky-500"
                      value={total}
                      onChange={(e) => setTotal(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Oldindan to‘lov (UZS)
                    </label>
                    <input
                      type="number"
                      className="w-full border-b-2 border-slate-200 py-1 text-xl font-bold outline-none focus:border-sky-500"
                      value={advance}
                      onChange={(e) =>
                        setAdvance(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Qolgan summa (jonli hisob)
                  </span>
                  <span
                    className={`text-2xl font-black ${
                      liveRemaining > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {liveRemaining.toLocaleString()} UZS
                  </span>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={savePayment}
                    className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors"
                  >
                    Saqlash
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPayment(false);
                      setTotal(order.payment.total);
                      setAdvance(order.payment.advance);
                    }}
                    className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Umumiy</span>
                  <span className="font-bold">
                    {order.payment.total.toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">
                    Oldindan to‘lov
                  </span>
                  <span className="font-bold text-emerald-600">
                    -{order.payment.advance.toLocaleString()} UZS
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between items-end">
                  <span className="text-slate-800 font-bold uppercase text-xs">
                    Qolgan summa
                  </span>
                  <span
                    className={`text-2xl font-black ${
                      order.payment.remaining > 0
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}
                  >
                    {order.payment.remaining.toLocaleString()} UZS
                  </span>
                </div>

                {order.payment.remaining > 0 &&
                  order.status === OrderStatus.READY && (
                    <button
                      onClick={() =>
                        applyUpdate({
                          payment: {
                            ...order.payment,
                            advance: order.payment.total,
                            remaining: 0,
                          },
                        })
                      }
                      className="w-full mt-4 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                    >
                      Qolgan summani to‘liq yopildi deb belgilash
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* HOLATNI O‘ZGARTIRISH */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
            Jarayon holatini o‘zgartirish
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATUS_STEPS.map((step) => {
              const isActive = order.status === step.value;
              return (
                <button
                  key={step.value}
                  onClick={() => handleStatusChange(step.value)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{step.emoji}</span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {order.status !== OrderStatus.DELIVERED && (
            <button
              onClick={() => handleStatusChange(OrderStatus.DELIVERED)}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 transition-colors"
            >
              ✅ Buyurtmani “Yetkazilgan” holatiga o‘tkazish
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrderDetails;