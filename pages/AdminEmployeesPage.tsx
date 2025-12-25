// src/pages/AdminEmployeesPage.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import {
  Employee,
  fetchEmployees,
  createEmployee,
  updateEmployee,
} from '../services/employeesService';

// Firestore bo'sh bo'lsa, birinchi marta yaratib qo'yiladigan ishchilar
const INITIAL_EMPLOYEES: Omit<Employee, 'id'>[] = [
  {
    firstName: 'Ali',
    lastName: 'Karimov',
    role: 'Qabul bo‘limi operatori',
    phone: '+99890 123 45 67',
    shift: '1-smena (08:00–16:00)',
    isActive: true,
    hiredAt: '2024-10-01T08:00:00.000Z',
    dailyRate: 150_000,
    attendance: [],
  },
  {
    firstName: 'Dilnoza',
    lastName: 'Rasulova',
    role: 'Kir yuvish ustasi',
    phone: '+99891 222 33 44',
    shift: '2-smena (16:00–00:00)',
    isActive: true,
    hiredAt: '2024-09-15T08:00:00.000Z',
    dailyRate: 180_000,
    attendance: [],
  },
  {
    firstName: 'Jasur',
    lastName: 'Umarov',
    role: 'Dastlabki saralash',
    phone: '+99893 555 66 77',
    shift: '1-smena (08:00–16:00)',
    isActive: false,
    hiredAt: '2024-07-20T08:00:00.000Z',
    dailyRate: 140_000,
    attendance: [],
  },
];

const AdminEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '+998',
    shift: '',
    dailyRate: 150_000,
  });

  // Firestore'dan o'qish
  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchEmployees();

        if (list.length === 0) {
          // Agar hali employees kolleksiyasi bo'sh bo'lsa, boshlang'ichlarini yaratamiz
          const created: Employee[] = [];
          for (const base of INITIAL_EMPLOYEES) {
            const emp = await createEmployee(base);
            created.push(emp);
          }
          setEmployees(created);
          setSelectedEmployeeId(created[0]?.id ?? null);
        } else {
          setEmployees(list);
          setSelectedEmployeeId(list[0]?.id ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.role)
      return;

    const employee = await createEmployee({
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      role: newEmployee.role,
      phone: newEmployee.phone,
      shift: newEmployee.shift || '1-smena',
      isActive: true,
      hiredAt: new Date().toISOString(),
      dailyRate: Number(newEmployee.dailyRate) || 0,
      attendance: [],
    });

    setEmployees((prev) => [employee, ...prev]);
    setSelectedEmployeeId(employee.id);

    setNewEmployee({
      firstName: '',
      lastName: '',
      role: '',
      phone: '+998',
      shift: '',
      dailyRate: 150_000,
    });
    setShowForm(false);
  };

  const toggleActive = async (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const next = !emp.isActive;

    await updateEmployee(id, { isActive: next });

    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: next } : e))
    );
  };

  const toggleAttendance = async (empId: string, dateKey: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const prev = emp.attendance ?? [];
    const exists = prev.includes(dateKey);
    const next = exists
      ? prev.filter((d) => d !== dateKey)
      : [...prev, dateKey];

    await updateEmployee(empId, { attendance: next });

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === empId ? { ...e, attendance: next } : e
      )
    );
  };

  // Davomat uchun yordamchi ma'lumotlar (joriy oy)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0–11
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = today.toLocaleDateString('uz-UZ', {
    month: 'long',
    year: 'numeric',
  });

  const selectedEmployee =
    employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  const attendanceSet = new Set(selectedEmployee?.attendance ?? []);
  const presentDaysThisMonth = (selectedEmployee?.attendance ?? []).filter(
    (d) => d.startsWith(monthKey)
  ).length;
  const monthlySalary =
    (selectedEmployee?.dailyRate ?? 0) * presentDaysThisMonth;

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
              Bu sahifada PureClean’da ishlaydigan xodimlar ma’lumotlari
              saqlanadi.
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
            <form
              onSubmit={handleAddEmployee}
              className="grid md:grid-cols-2 gap-4"
            >
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
                    setNewEmployee((p) => ({
                      ...p,
                      firstName: e.target.value,
                    }))
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
                    setNewEmployee((p) => ({
                      ...p,
                      lastName: e.target.value,
                    }))
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
              <div className="space-y-1">
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
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Kunlik stavka (UZS)
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployee.dailyRate}
                  onChange={(e) =>
                    setNewEmployee((p) => ({
                      ...p,
                      dailyRate: Number(e.target.value),
                    }))
                  }
                  placeholder="150000"
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

        {/* Yuklanish holati yoki asosiy kontent */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center text-slate-400 text-sm">
            Ma’lumotlar yuklanmoqda...
          </div>
        ) : (
          <>
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
                      <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">
                        Kunlik stavka
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedEmployeeId === emp.id ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                      >
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
                          <p className="text-sm text-slate-600">
                            {emp.role}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-slate-600">
                            {emp.phone}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-xs text-slate-500">
                            {emp.shift}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActive(emp.id);
                            }}
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
                            {new Date(emp.hiredAt).toLocaleDateString(
                              'uz-UZ',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-xs font-bold text-slate-700">
                            {emp.dailyRate.toLocaleString()} UZS
                          </span>
                        </td>
                      </tr>
                    ))}

                    {employees.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
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

            {/* Davomat va oylik bo‘limi */}
            {selectedEmployee && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      Davomat va oylik – joriy oy
                    </h3>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                      {monthLabel}
                    </p>
                  </div>

                  <select
                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
                    value={selectedEmployee.id}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-6 text-xs">
                  <div>
                    <p className="text-slate-400">Xodim</p>
                    <p className="font-bold text-slate-800">
                      {selectedEmployee.firstName}{' '}
                      {selectedEmployee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Kunlik stavka</p>
                    <p className="font-bold text-slate-800">
                      {selectedEmployee.dailyRate.toLocaleString()} UZS
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">
                      Kelgan kunlar (oylik)
                    </p>
                    <p className="font-bold text-slate-800">
                      {presentDaysThisMonth} kun
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Hisoblangan oylik</p>
                    <p className="font-bold text-emerald-600">
                      {monthlySalary.toLocaleString()} UZS
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Butun oy bo‘yicha har bir kunga bosib, kelgan (✓) yoki
                    kelmagan (X) deb belgilang.
                  </p>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from({ length: daysInMonth }, (_, idx) => {
                      const day = idx + 1;
                      const dateKey = `${monthKey}-${String(day).padStart(
                        2,
                        '0'
                      )}`;
                      const isPresent = attendanceSet.has(dateKey);

                      let cellClass =
                        'flex flex-col items-center justify-center rounded-lg border text-[11px] h-9 sm:h-10 cursor-pointer';
                      let mark = '';

                      if (isPresent) {
                        cellClass +=
                          ' bg-emerald-50 border-emerald-200 text-emerald-700';
                        mark = '✓';
                      } else {
                        cellClass +=
                          ' bg-rose-50 border-rose-200 text-rose-600';
                        mark = 'X';
                      }

                      return (
                        <button
                          type="button"
                          key={dateKey}
                          onClick={() =>
                            toggleAttendance(selectedEmployee.id, dateKey)
                          }
                          className={cellClass}
                        >
                          <span className="text-[10px] font-semibold">
                            {day}
                          </span>
                          <span className="text-xs font-bold">{mark}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminEmployeesPage;