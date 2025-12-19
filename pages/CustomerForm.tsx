import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998',
    service: 'Yuvish va quritish',
    items: 1,
    notes: '',
    pickupDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = `PC-${Math.floor(1000 + Math.random() * 9000)}`;
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
        notes: formData.notes,
        pickupDate: formData.pickupDate,
        dateIn: new Date().toISOString(),
      },
      payment: {
        total: 0, // Admin tomonidan keyin belgilanadi
        advance: 0,
        remaining: 0,
      },
      status: OrderStatus.NEW,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([newOrder, ...existing]));

    navigate(`/confirmation/${newId}`);
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
        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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

        <button
          type="submit"
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-4"
        >
          Buyurtmani yuborish
        </button>
      </form>
    </Layout>
  );
};

export default CustomerForm;