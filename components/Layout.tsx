// components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AdminProfile,
  loadAdminProfile,
  DEFAULT_ADMIN_PROFILE,
} from '../services/adminProfile';
import {
  Company,
  fetchCompanyById,
} from '../services/companiesService';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  isAdmin?: boolean;
}

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M15 19L8 12L15 5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M9 5L16 12L9 19"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>(
    DEFAULT_ADMIN_PROFILE
  );

  const [company, setCompany] = useState<Company | null>(null);
  const [companyStatus, setCompanyStatus] = useState<
    'idle' | 'loading' | 'ok' | 'blocked'
  >('idle');

  const isSuperAdmin =
    typeof window !== 'undefined' &&
    localStorage.getItem('isSuperAdminAuthed') === 'true';

  // Profil yuklash
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const p = await loadAdminProfile();
        if (!cancelled && p) setProfile(p);
      } catch (e) {
        console.error(e);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  // Korxona obunasini tekshirish (faqat oddiy admin uchun)
  useEffect(() => {
    if (!isAdmin || isSuperAdmin) {
      setCompanyStatus('ok');
      return;
    }

    const companyId =
      typeof window !== 'undefined'
        ? localStorage.getItem('currentCompanyId')
        : null;

    if (!companyId) {
      setCompanyStatus('blocked');
      setCompany(null);
      return;
    }

    let cancelled = false;

    const loadCompany = async () => {
      try {
        setCompanyStatus('loading');
        const c = await fetchCompanyById(companyId);
        if (cancelled) return;

        if (!c) {
          setCompanyStatus('blocked');
          setCompany(null);
          return;
        }

        const now = new Date();
        const from = new Date(c.validFrom);
        const to = new Date(c.validTo);

        if (!c.isEnabled || now < from || now > to) {
          setCompanyStatus('blocked');
          setCompany(c);
        } else {
          setCompanyStatus('ok');
          setCompany(c);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setCompanyStatus('blocked');
          setCompany(null);
        }
      }
    };

    loadCompany();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isSuperAdmin]);

  // === ADMIN LAYOUT ===
  if (isAdmin) {
    // ❗ Oddiy admin va superadmin uchun nav elementlari boshqacha
    const baseNavItems = [
      { name: 'Asosiy Menu', path: '/admin', icon: '📊' },
      { name: 'Buyurtmalar', path: '/admin/orders', icon: '🧺' },
      { name: 'Ishchilar', path: '/admin/customers', icon: '👥' },
      { name: 'Xarajatlar', path: '/admin/expenses', icon: '💸' },
      { name: 'Hisobotlar', path: '/admin/reports', icon: '📈' },
    ];

    const navItems = isSuperAdmin
      ? [
          // Superadmin uchun faqat bitta element, ikonkasi yo'q
          { name: 'Asosiy Menu', path: '/superadmin', icon: '' },
        ]
      : baseNavItems;

    const avatarUrl =
      profile.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profile.firstName + ' ' + profile.lastName
      )}&background=6366f1&color=fff`;

    const handleLogout = () => {
      localStorage.removeItem('isAdminAuthed');
      localStorage.removeItem('isSuperAdminAuthed');
      localStorage.removeItem('currentCompanyId');
      localStorage.removeItem('currentCompanyName');
      navigate('/');
    };

    const companyName =
      (typeof window !== 'undefined' &&
        localStorage.getItem('currentCompanyName')) ||
      company?.name ||
      '';

    const isBlocked = !isSuperAdmin && companyStatus === 'blocked';

    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-200 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo */}
          <div className="p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  P
                </div>
                {!isSidebarCollapsed && (
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    PureClean
                  </h1>
                )}
              </div>
            </div>
          </div>

          {/* Menyu */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-3'
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {/* ❗ Superadmin uchun icon bo'lmasligi uchun shart */}
                  {item.icon && (
                    <span className="text-lg">{item.icon}</span>
                  )}
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* Pastki bo‘lim */}
          <div className="p-4 border-t border-slate-100">
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
                >
                  ?
                </button>
                {!isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/settings')}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
                  >
                    ⚙️
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600"
                >
                  ⏻
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl px-3 py-3 space-y-1 text-sm text-slate-600">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-xs">
                    ?
                  </span>
                  <span>Helps</span>
                </button>

                {!isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/settings')}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white"
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-xs">
                      ⚙️
                    </span>
                    <span>Settings</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white text-red-500"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-xs">
                    ⏻
                  </span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Kontent */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          {/* Tepagi shapka */}
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((v) => !v)}
                className="p-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </button>

              <div className="flex flex-col">
                {title && (
                  <h2 className="text-lg font-semibold text-slate-800">
                    {title}
                  </h2>
                )}
                {!isSuperAdmin && companyName && (
                  <span className="text-[11px] text-slate-400">
                    Korxona: {companyName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600 transition-all">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              <button
                type="button"
                onClick={() =>
                  isSuperAdmin
                    ? navigate('/superadmin')
                    : navigate('/admin/profile')
                }
                className="flex items-center gap-3 border-l border-slate-100 pl-6 hover:bg-slate-50 rounded-full pr-3 py-1 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                    {isSuperAdmin ? 'SUPERADMIN' : profile.role || 'Menejer'}
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={avatarUrl}
                    className="w-9 h-9 rounded-full shadow-sm object-cover"
                    alt="Avatar"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </button>
            </div>
          </header>

          <main className="flex-1">
            {isBlocked ? (
              <div className="flex items-center justify-center h-full px-6">
                <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-6 shadow-sm text-center">
                  <h3 className="text-lg font-bold text-amber-700 mb-2">
                    Obuna faol emas
                  </h3>
                  <p className="text-sm text-amber-600 mb-4">
                    Siz foydalanayotgan PureClean paneli uchun obuna muddati
                    tugagan yoki administrator tomonidan vaqtincha o‘chirib
                    qo‘yilgan.
                  </p>
                  <p className="text-xs text-slate-400">
                    Iltimos, loyiha egasi (superadmin) bilan bog‘laning va
                    obunani uzaytiring.
                  </p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    );
  }

  // === MIJOZ (CUSTOMER) LAYOUT ===
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-sm md:my-4 md:rounded-2xl overflow-hidden border border-slate-100">
      <header className="px-6 py-4 flex items-center justify-between bg-sky-500 text-white">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold bg-white/0 hover:bg-white/20 px-3 py-1 rounded-full border border-white/30"
          >
            Login
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">🧼</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
        {children}
      </main>

      <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          PureClean kir yuvish xizmati, O‘zbekiston &copy; 2024
        </p>
      </footer>
    </div>
  );
};