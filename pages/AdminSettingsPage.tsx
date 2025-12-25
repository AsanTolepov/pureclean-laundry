import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import {
  DashboardSettings,
  DEFAULT_SETTINGS,
  loadDashboardSettings,
  saveDashboardSettings,
} from '../services/settingsService';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<DashboardSettings | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const s = await loadDashboardSettings();
      setSettings(s || DEFAULT_SETTINGS);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    await saveDashboardSettings(settings);
    setSaving(false);
    setMessage('Sozlamalar saqlandi.');
  };

  if (!settings) {
    return (
      <Layout title="Sozlamalar" isAdmin>
        <div className="px-8 pt-8">
          <p className="text-sm text-slate-500">
            Sozlamalar yuklanmoqda...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sozlamalar" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Tizim sozlamalari
          </h2>
          <p className="text-slate-500 text-sm">
            Asosiy dashboard ko‘rinishi va ishlash parametrlarini sozlang.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="grid lg:grid-cols-3 gap-6 items-start"
        >
          {/* Chap: umumiy ko‘rinish */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              Umumiy ko‘rinish
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Til
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            language: e.target.value as any,
                          }
                        : s
                    )
                  }
                >
                  <option value="uz">O‘zbek</option>
                  <option value="ru">Rus</option>
                  <option value="en">Ingliz</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Valyuta
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            currency: e.target.value as any,
                          }
                        : s
                    )
                  }
                >
                  <option value="UZS">UZS (so‘m)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tema
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            theme: e.target.value as any,
                          }
                        : s
                    )
                  }
                >
                  <option value="light">Yorug‘ (Light)</option>
                  <option value="dark">Tungi (Dark)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Hozircha faqat ma’lumot sifatida saqlanadi, keyinchalik real
                  temaga ulash mumkin.
                </p>
              </div>
            </div>
          </div>

          {/* O‘ng: parametrlar */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-sm font-black text-slate-800">
              Dashboard ishlash parametrlari
            </h3>

            <div className="grid md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Kunlik maqsadli tushum (UZS)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={settings.dailyTargetRevenue}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            dailyTargetRevenue:
                              Number(e.target.value) || 0,
                          }
                        : s
                    )
                  }
                />
                <p className="text-[11px] text-slate-400">
                  Dashboard`da “Maqsadga nisbatan” ko‘rsatkichlar uchun.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Bildirishnomalar
                </label>
                <div className="space-y-2 text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={settings.showReadyAlerts}
                      onChange={(e) =>
                        setSettings((s) =>
                          s
                            ? {
                                ...s,
                                showReadyAlerts: e.target.checked,
                              }
                            : s
                        )
                      }
                    />
                    <span>
                      Buyurtma “Olib ketishga tayyor” bo‘lganda signal
                      ko‘rsatish
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={settings.autoClosePaidOrders}
                      onChange={(e) =>
                        setSettings((s) =>
                          s
                            ? {
                                ...s,
                                autoClosePaidOrders: e.target.checked,
                              }
                            : s
                        )
                      }
                    />
                    <span>
                      Yetkazilgan va to‘liq to‘langan buyurtmalarni avtomatik
                      yopilgan deb belgilash
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {message && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-2 inline-block">
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

export default AdminSettingsPage;