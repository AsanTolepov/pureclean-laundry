// pages/SuperAdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import QRCode from 'react-qr-code';
import {
  Company,
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../services/companiesService';

interface NewCompanyForm {
  name: string;
  login: string;
  password: string;
  isEnabled: boolean;
  validFrom: string; // YYYY-MM-DD
  validTo: string;   // YYYY-MM-DD
}

const todayDate = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const plus30Date = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

const SuperAdminDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NewCompanyForm>({
    name: '',
    login: '',
    password: '',
    isEnabled: true,
    validFrom: todayDate(),
    validTo: plus30Date(),
  });

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchCompanies();
        setCompanies(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.login.trim() || !form.password.trim()) {
      return;
    }
    setSaving(true);
    try {
      const validFromIso = new Date(form.validFrom + 'T00:00:00').toISOString();
      const validToIso = new Date(form.validTo + 'T23:59:59').toISOString();

      const c = await createCompany({
        name: form.name.trim(),
        login: form.login.trim(),
        password: form.password.trim(),
        isEnabled: form.isEnabled,
        validFrom: validFromIso,
        validTo: validToIso,
      });

      setCompanies((prev) => [...prev, c]);
      setForm({
        name: '',
        login: '',
        password: '',
        isEnabled: true,
        validFrom: todayDate(),
        validTo: plus30Date(),
      });
      setShowForm(false);
    } catch (err) {
      console.error('Create company error:', err);
      alert("Korxona yaratishda xatolik. Console'ni tekshiring.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (company: Company) => {
    const next = !company.isEnabled;
    await updateCompany(company.id, { isEnabled: next });
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, isEnabled: next } : c))
    );
  };

  const handleDeleteCompany = async (company: Company) => {
    const ok = window.confirm(
      `"${company.name}" korxonasini o‘chirmoqchimisiz?`
    );
    if (!ok) return;

    try {
      await deleteCompany(company.id);
      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
    } catch (err) {
      console.error('Delete company error:', err);
      alert("Korxonani o‘chirishda xatolik yuz berdi. Console'ni tekshiring.");
    }
  };

  const formatDateShort = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const isCompanyActive = (c: Company): boolean => {
    const now = new Date();
    const from = new Date(c.validFrom);
    const to = new Date(c.validTo);
    return c.isEnabled && now >= from && now <= to;
  };

  return (
    <Layout title="Superadmin – korxonalar" isAdmin>
      <div className="px-8 pt-8 pb-10 space-y-6">
        {/* Sarlavha */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Super admin boshqaruvi
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kir yuvish korxonalari ro‘yxati, login/parol, obuna va QR kodlar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
          >
            ➕ Yangi korxona
          </button>
        </div>

        {/* Yangi korxona formasi */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Yangi korxona ma’lumotlari
            </h3>
            <form
              onSubmit={handleCreateCompany}
              className="grid md:grid-cols-2 gap-4"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Korxona nomi
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Masalan: Zuxra Dj. kimyoviy tozalash"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Login
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="masalan: zuxra"
                  value={form.login}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, login: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Parol
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="masalan: zuxra123"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Obuna davri
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, validFrom: e.target.value }))
                    }
                  />
                  <input
                    type="date"
                    className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.validTo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, validTo: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isEnabled: e.target.checked }))
                    }
                  />
                  <span>Korxona hozirda faol (enable)</span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Korxonalar kartochkalari */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Korxonalar ro‘yxati
          </h3>

          {loading ? (
            <p className="text-sm text-slate-400">Yuklanmoqda...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((c) => {
                const active = isCompanyActive(c);
                const orderUrl =
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/#/c/${c.id}/new-order`
                    : '';

                return (
                  <div
                    key={c.id}
                    className="bg-sky-50 text-slate-800 rounded-2xl shadow-sm border border-sky-200 flex flex-col p-4 text-xs gap-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-[13px] leading-snug mb-1">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Login: <b>{c.login}</b> | Parol: <b>{c.password}</b>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatDateShort(c.validFrom)} —{' '}
                          {formatDateShort(c.validTo)}
                        </p>
                        <p
                          className={
                            active
                              ? 'text-emerald-600 font-semibold'
                              : 'text-rose-600 font-semibold'
                          }
                        >
                          {active ? 'Faol' : 'Faol emas'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCompany(c)}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        🗑 Delete
                      </button>
                    </div>

                    {orderUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="bg-white p-1 rounded-xl border border-slate-200">
                          <QRCode value={orderUrl} size={72} />
                        </div>
                        <div className="flex-1 text-[9px] text-slate-500 break-all">
                          <p className="font-semibold mb-1">
                            Mijozlar uchun QR:
                          </p>
                          <p>{orderUrl}</p>
                          <p className="mt-1 italic">
                            Bu QR kodni chiqarib, korxona devoriga osib
                            qo‘ying. Mijozlar telefon kamerasi bilan skaner
                            qilsa, to‘g‘ridan-to‘g‘ri buyurtma formasi
                            ochiladi.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-end gap-2 text-[10px]">
                      <span>Enable</span>
                      <input
                        type="checkbox"
                        checked={c.isEnabled}
                        onChange={() => toggleEnabled(c)}
                      />
                    </div>
                  </div>
                );
              })}

              {companies.length === 0 && (
                <p className="text-sm text-slate-400 col-span-full">
                  Hozircha birorta ham korxona qo‘shilmagan. Yangi korxona
                  qo‘shish uchun “Yangi korxona” tugmasini bosing.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;