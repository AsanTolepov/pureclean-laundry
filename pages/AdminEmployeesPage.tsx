// src/pages/AdminEmployeesPage.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  shift: string;
  isActive: boolean;
  hiredAt: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    firstName: 'Ali',
    lastName: 'Karimov',
    role: 'Qabul bo‘limi operatori',
    phone: '+99890 123 45 67',
    shift: '1-smena (08:00–16:00)',
    isActive: true,
    hiredAt: '2024-10-01T08:00:00.000Z',
  },
  {
    id: 'EMP-1002',
    firstName: 'Dilnoza',
    lastName: 'Rasulova',
    role: 'Kir yuvish ustasi',
    phone: '+99891 222 33 44',
    shift: '2-smena (16:00–00:00)',
    isActive: true,
    hiredAt: '2024-09-15T08:00:00.000Z',
  },
  {
    id: 'EMP-1003',
    firstName: 'Jasur',
    lastName: 'Umarov',
    role: 'Dastlabki saralash',
    phone: '+99893 555 66 77',
    shift: '1-smena (08:00–16:00)',
    isActive: false,
    hiredAt: '2024-07-20T08:00:00.000Z',
  },
];

const AdminEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '+998',
    shift: '',
  });

  // localStorage dan o‘qish / boshlang‘ich ma’lumotlar
  useEffect(() => {
    const saved = localStorage.getItem('employees');
    if (saved) {
      setEmployees(JSON.parse(saved));
    } else {
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.setItem('employees', JSON.stringify(INITIAL_EMPLOYEES));
    }
  }, []);

  const persistEmployees = (list: Employee[]) => {
    setEmployees(list);
    localStorage.setItem('employees', JSON.stringify(list));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.role) return;

    const id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const employee: Employee = {
      id,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      role: newEmployee.role,
      phone: newEmployee.phone,
      shift: newEmployee.shift || '1-smena',
      isActive: true,
      hiredAt: new Date().toISOString(),
    };

    const updated = [employee, ...employees];
    persistEmployees(updated);

    // formani tozalash
    setNewEmployee({
      firstName: '',
      lastName: '',
      role: '',
      phone: '+998',
      shift: '',
    });
    setShowForm(false);
  };

  const toggleActive = (id: string) => {
    const updated = employees.map((e) =>
      e.id === id ? { ...e, isActive: !e.isActive } : e
    );
    persistEmployees(updated);
  };

  return (
    <Layout title="Ishchilar" isAdmin>
      <div className="px-8 pt-8 space-y-6">
        {/* Sarlavha va qo‘shish tugmasi */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Ishchilar ro‘yxati
            </h2>
            <p className="text-slate-500 text-sm">
              Bu sahifada PureClean’da ishlaydigan xodimlar ma’lumotlari saqlanadi.
            </p>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            ➕ Yangi ishchi
          </button>
        </div>

        {/* Yangi ishchi qo‘shish formasi */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Yangi ishchi ma’lumotlari
            </h3>
            <form onSubmit={handleAddEmployee} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.firstName}
                  onChange={(e) =>
                    setNewEmployee((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="Ali"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Familiya
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.lastName}
                  onChange={(e) =>
                    setNewEmployee((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Karimov"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Lavozimi
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee((p) => ({ ...p, role: e.target.value }))
                  }
                  placeholder="Kir yuvish ustasi"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Smena
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.shift}
                  onChange={(e) =>
                    setNewEmployee((p) => ({ ...p, shift: e.target.value }))
                  }
                  placeholder="1-smena (08:00–16:00)"
                />
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
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ishchilar jadvali */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    ID
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    Xodim
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    Lavozimi
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    Telefon
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    Smena
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                    Holati
                  </th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                    Ishga olingan sana
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {emp.id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-slate-800">
                        {emp.firstName} {emp.lastName}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">{emp.role}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">{emp.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs text-slate-500">{emp.shift}</p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleActive(emp.id)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                          emp.isActive
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}
                      >
                        {emp.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xs text-slate-500">
                        {new Date(emp.hiredAt).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      Hozircha ishchilar ro‘yxatiga hech kim kiritilmagan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEmployeesPage;