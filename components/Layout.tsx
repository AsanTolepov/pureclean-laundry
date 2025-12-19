import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // === ADMIN LAYOUT ===
  if (isAdmin) {
    const navItems = [
      { name: 'Boshqaruv paneli', path: '/admin', icon: '📊' },
      { name: 'Buyurtmalar', path: '/admin/orders', icon: '🧺' },
      { name: 'Ishchilar', path: '/admin/customers', icon: '👥' },
      { name: 'Hisobotlar', path: '/admin/reports', icon: '📈' },
      { name: 'Sozlamalar', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                P
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                PureClean
              </h1>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith(item.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => {
                localStorage.removeItem('isAdminAuthed');
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <span>🚪</span>
              Chiqish
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="ID, ism yoki telefon raqami bo‘yicha qidiring..."
                className="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">
                🔍
              </span>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600 transition-all">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    Admin foydalanuvchi
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                    Menejer
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
                    className="w-9 h-9 rounded-full shadow-sm"
                    alt="Avatar"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
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

        {/* O‘ng yuqori burchak: Login + ikonka */}
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