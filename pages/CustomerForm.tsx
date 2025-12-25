// pages/CustomerForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { createOrder } from '../services/ordersService';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId?: string }>();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998',
    service: 'Yuvish va quritish',
    items: 1,
    notes: '',
    pickupDate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ❗ URL orqali companyId kelgan bo'lsa – localStorage.ga yozib qo'yamiz
  useEffect(() => {
    if (companyId) {
      localStorage.setItem('currentCompanyId', companyId);
    }
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const newId = `PC-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const newOrder: Order = {
        id: newId,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        details: {
          itemCount: formData.items,
          serviceType: formData.service,
          notes: formData.notes || undefined,
          pickupDate: formData.pickupDate || undefined,
          dateIn: nowIso,
        },
        payment: {
          total: 0,
          advance: 0,
          remaining: 0,
        },
        status: OrderStatus.NEW,
        createdAt: nowIso,
        // companyId bu yerda qo'yilmaydi, ordersService ichida localStorage'dan olinadi
      };

      await createOrder(newOrder);

      navigate(`/confirmation/${newId}`);
    } catch (err) {
      console.error('Create order error:', err);
      setError(
        "Buyurtmani yaratishda xatolik yuz berdi. Iltimos, keyinroq yana urinib ko‘ring."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Yangi buyurtma">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Mijoz ma’lumotlari
        </h2>
        <p className="text-xs text-slate-500">
          Quyidagi maydonlarni to‘ldiring. Buyurtma ID sizga avtomatik yaratiladi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ism / Familiya */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ism
            </label>
            <input
              required
              type="text"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Ali"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Familiya
            </label>
            <input
              required
              type="text"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Karimov"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
        </div>

        {/* Telefon */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Telefon raqami
          </label>
          <input
            required
            type="tel"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="+998 90 123 45 67"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* Xizmat turi */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Xizmat turi
          </label>
          <select
            className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
            value={formData.service}
            onChange={(e) =>
              setFormData({ ...formData, service: e.target.value })
            }
          >
            <option>Yuvish va quritish</option>
            <option>Kimyoviy tozalash</option>
            <option>Faqat dazmollash</option>
            <option>Premium parvarish</option>
          </select>
        </div>

        {/* Buyumlar soni + olib ketish sanasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Buyumlar soni
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.items}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  items: parseInt(e.target.value || '1', 10),
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxminiy olib ketish sanasi
            </label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
              value={formData.pickupDate}
              onChange={(e) =>
                setFormData({ ...formData, pickupDate: e.target.value })
              }
            />
          </div>
        </div>

        {/* Izoh */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Qo‘shimcha izoh (ixtiyoriy)
          </label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none min-h-[80px]"
            placeholder="Masalan: juda nozik mato, oq ko‘ylakda qahva dog‘i bor va hokazo..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4"
        >
          {submitting ? 'Yuborilmoqda...' : 'Buyurtmani yuborish'}
        </button>
      </form>
    </Layout>
  );
};

export default CustomerForm;