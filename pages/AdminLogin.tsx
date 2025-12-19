import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

const AdminLogin: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (login === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdminAuthed', 'true');
      setError('');
      navigate('/admin');
    } else {
      setError("Login yoki parol noto‘g‘ri. Iltimos, qaytadan urinib ko‘ring.");
    }
  };

  return (
    <Layout title="Admin kirish" showBack>
      <div className="max-w-sm mx-auto">
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Admin panelga kirish
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Faqat mas’ul xodimlar uchun. Login va parolni kiriting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Login
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              placeholder="admin"
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

          <p className="text-[11px] text-slate-400 mt-3">
            Demo login ma’lumotlari: Login <b>admin</b>, Parol <b>admin123</b>.
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default AdminLogin;