import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import {
  AdminProfile,
  loadAdminProfile,
  saveAdminProfile,
  DEFAULT_ADMIN_PROFILE,
} from '../services/adminProfile';

const ROLE_OPTIONS = ['Menejer', 'Admin', 'Operator', 'Buxgalter', 'Boshliq'];

const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await loadAdminProfile();
      setProfile(p || DEFAULT_ADMIN_PROFILE);
    };
    load();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) =>
        prev ? { ...prev, avatar: reader.result as string } : prev
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.login.trim() || !profile.password.trim()) {
      setError('Login va parol bo‘sh bo‘lishi mumkin emas.');
      setMessage('');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    await saveAdminProfile(profile);

    setSaving(false);
    setMessage('Profil ma’lumotlari saqlandi.');
  };

  if (!profile) {
    return (
      <Layout title="Profil" isAdmin>
        <div className="px-8 pt-8">
          <p className="text-sm text-slate-500">Profil yuklanmoqda...</p>
        </div>
      </Layout>
    );
  }

  const avatarSrc =
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.firstName + ' ' + profile.lastName
    )}&background=6366f1&color=fff`;

  return (
    <Layout title="Profil" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Admin profili
          </h2>
          <p className="text-slate-500 text-sm">
            Ism-familiya, rol, rasm va login/parol sozlamalari.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
          {/* Chap blok */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              Shaxsiy ma’lumotlar
            </h3>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover group-hover:opacity-80 transition"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition">
                  Rasmini almashtirish
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-[11px] text-slate-400 text-center max-w-[220px]">
                JPG yoki PNG rasm yuklang. Firestore’da dataURL sifatida
                saqlanadi.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ism
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, firstName: e.target.value } : p
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Familiya
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, lastName: e.target.value } : p
                    )
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Rol
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={profile.role}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, role: e.target.value } : p
                    )
                  }
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  {!ROLE_OPTIONS.includes(profile.role) && (
                    <option value={profile.role}>{profile.role}</option>
                  )}
                </select>
                <p className="text-[11px] text-slate-400">
                  Bu rol dashboard yuqori qismida ism ostida ko‘rinadi.
                </p>
              </div>
            </div>
          </div>

          {/* O‘ng blok */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              Kirish ma’lumotlari
            </h3>
            <p className="text-xs text-slate-500">
              Bu yerda admin panelga kirish uchun login va parolni
              o‘zgartirishingiz mumkin.
            </p>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Login
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.login}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, login: e.target.value } : p
                    )
                  }
                  placeholder="Masalan: pureclean"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Parol
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={profile.password}
                  onChange={(e) =>
                    setProfile((p) =>
                      p ? { ...p, password: e.target.value } : p
                    )
                  }
                  placeholder="Yangi parol"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Standart login ma’lumotlari: login{' '}
              <b>{DEFAULT_ADMIN_PROFILE.login}</b>, parol{' '}
              <b>{DEFAULT_ADMIN_PROFILE.password}</b>. Bu yerda
              o‘zgartirsangiz, keyingi kirishda yangi login/parol ishlaydi.
            </p>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminProfilePage;