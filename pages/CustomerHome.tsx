import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import QRCode from 'react-qr-code';

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const qrUrl = `${window.location.origin}/#/new-order`;

  return (
    <Layout title="PureClean">
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🧺</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          PureClean kir yuvish xizmati
        </h2>
        <p className="text-slate-500 mb-4 max-w-xs">
          Kirlaringizni topshiring va oddiy formani to‘ldirib, buyurtma
          holatini onlayn kuzatib boring.
        </p>

        <button
          onClick={() => navigate('/new-order')}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-95 text-lg"
        >
          Yangi buyurtma yaratish
        </button>

        <div className="mt-8 w-full">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-slate-700">
              QR kod orqali ham buyurtma yarating
            </p>
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <QRCode value={qrUrl} size={160} />
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Mijozlar telefon kamerasi bilan ushbu QR kodni skaner qilsa,
              darhol buyurtma formasi ochiladi.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerHome;