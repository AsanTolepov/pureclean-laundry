// pages/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { DEFAULT_ADMIN_PROFILE } from '../services/adminProfile';
import {
  findCompanyByLogin,
  Company,
} from '../services/companiesService';

const AdminLogin: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1) SUPER ADMIN
    if (login === 'superadmin' && password === 'superadmin') {
      localStorage.setItem('isSuperAdminAuthed', 'true');
      localStorage.removeItem('isAdminAuthed');
      localStorage.removeItem('currentCompanyId');
      navigate('/superadmin');
      return;
    }

    // 2) Korxona ADMINI (companies kolleksiyasi bo'yicha)
    try {
      const company: Company | null = await findCompanyByLogin(login);

      if (!company || company.password !== password) {
        setError("Login yoki parol noto‘g‘ri.");
        return;
      }

      const now = new Date();
      const from = new Date(company.validFrom);
      const to = new Date(company.validTo);

      if (!company.isEnabled || now < from || now > to) {
        setError(
          'Sizning obunangiz faol emas. Iltimos, loyiha egasi (superadmin) bilan bog‘laning.'
        );
        return;
      }

      // Hammasi joyida – currentCompanyId ni saqlaymiz
      localStorage.setItem('isAdminAuthed', 'true');
      localStorage.removeItem('isSuperAdminAuthed');
      localStorage.setItem('currentCompanyId', company.id);
      localStorage.setItem('currentCompanyName', company.name);

      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        "Server bilan ulanishda xatolik. Iltimos, keyinroq yana urinib ko‘ring."
      );
    }
  };

  return (
    <Layout title="Admin kirish" showBack>
      <div className="max-w-sm mx-auto">
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Admin panelga kirish
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Har bir kir yuvish korxonasi uchun alohida login va parol.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Login
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              placeholder="masalan: zuxra, anvar, ..."
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Parol
            </label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-sm transition-all active:scale-95 mt-2 text-sm"
          >
            Kirish
          </button>

          <div className="mt-4 space-y-1 text-[11px] text-slate-400">
            <p>
              Super admin uchun login <b>superadmin</b>, parol{' '}
              <b>superadmin</b>.
            </p>
            <p>
              Default admin profil ma’lumotlari (faqat profil sahifasi uchun):
              login <b>{DEFAULT_ADMIN_PROFILE.login}</b>, parol{' '}
              <b>{DEFAULT_ADMIN_PROFILE.password}</b>.
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminLogin;