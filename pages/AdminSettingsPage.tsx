import React from 'react';
import { Layout } from '../components/Layout';

const AdminSettingsPage: React.FC = () => {
  return (
    <Layout title="Sozlamalar" isAdmin>
      <div className="px-8 pt-8 space-y-4">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Sozlamalar</h2>
        <p className="text-slate-500 text-sm">
          Bu bo‘limda tizim sozlamalari, til, valyuta va boshqa parametrlarni o‘zgartirishingiz mumkin.
        </p>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-slate-400 text-sm">
            Hozircha faqat demo matn. Keyinchalik real sozlamalar formasini qo‘shing.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;