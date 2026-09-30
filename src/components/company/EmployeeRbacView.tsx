import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Key,
  Save,
  X,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Employee } from '../../types/isp';

export const EmployeeRbacView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useISP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empToEdit, setEmpToEdit] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Employee['role']>('Teknisi Lapangan');

  const [canManageBilling, setCanManageBilling] = useState(false);
  const [canIsolirCustomer, setCanIsolirCustomer] = useState(false);
  const [canAccessRemoteModem, setCanAccessRemoteModem] = useState(true);
  const [canEditMikrotik, setCanEditMikrotik] = useState(false);
  const [canManageEmployees, setCanManageEmployees] = useState(false);

  const openAdd = () => {
    setEmpToEdit(null);
    setName('');
    setEmail('');
    setPhone('0812');
    setRole('Teknisi Lapangan');
    setCanManageBilling(false);
    setCanIsolirCustomer(false);
    setCanAccessRemoteModem(true);
    setCanEditMikrotik(false);
    setCanManageEmployees(false);
    setIsModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEmpToEdit(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone);
    setRole(emp.role);
    setCanManageBilling(emp.permissions.canManageBilling);
    setCanIsolirCustomer(emp.permissions.canIsolirCustomer);
    setCanAccessRemoteModem(emp.permissions.canAccessRemoteModem);
    setCanEditMikrotik(emp.permissions.canEditMikrotik);
    setCanManageEmployees(emp.permissions.canManageEmployees);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Employee> = {
      name,
      email,
      phone,
      role,
      permissions: {
        canManageBilling,
        canIsolirCustomer,
        canAccessRemoteModem,
        canEditMikrotik,
        canManageEmployees,
      },
    };

    if (empToEdit) {
      updateEmployee(empToEdit.id, payload);
    } else {
      addEmployee(payload);
    }

    setIsModalOpen(false);
  };

  // Pre-fill permissions based on role
  const handleRoleChange = (newRole: Employee['role']) => {
    setRole(newRole);
    if (newRole === 'Super Admin') {
      setCanManageBilling(true);
      setCanIsolirCustomer(true);
      setCanAccessRemoteModem(true);
      setCanEditMikrotik(true);
      setCanManageEmployees(true);
    } else if (newRole === 'Network Engineer (NOC)') {
      setCanManageBilling(false);
      setCanIsolirCustomer(true);
      setCanAccessRemoteModem(true);
      setCanEditMikrotik(true);
      setCanManageEmployees(false);
    } else if (newRole === 'Finance & Kasir') {
      setCanManageBilling(true);
      setCanIsolirCustomer(true);
      setCanAccessRemoteModem(false);
      setCanEditMikrotik(false);
      setCanManageEmployees(false);
    } else if (newRole === 'Teknisi Lapangan') {
      setCanManageBilling(false);
      setCanIsolirCustomer(false);
      setCanAccessRemoteModem(true);
      setCanEditMikrotik(false);
      setCanManageEmployees(false);
    } else if (newRole === 'Customer Service') {
      setCanManageBilling(false);
      setCanIsolirCustomer(false);
      setCanAccessRemoteModem(true);
      setCanEditMikrotik(false);
      setCanManageEmployees(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Data Karyawan & Kontrol Hak Akses (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan staf ISP, peran operasional NOC, teknisi lapangan, kasir, dan matriks izin akses
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan Baru
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Staf & Kontak</th>
                <th className="py-3 px-4">Peran Jabatan (Role)</th>
                <th className="py-3 px-4">Izin & Hak Akses</th>
                <th className="py-3 px-4">Status & Keaktifan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {emp.email} · {emp.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-indigo-300 text-xs px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      {emp.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {emp.permissions.canManageBilling && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Billing
                        </span>
                      )}
                      {emp.permissions.canIsolirCustomer && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          Isolir
                        </span>
                      )}
                      {emp.permissions.canAccessRemoteModem && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Remote ONT
                        </span>
                      )}
                      {emp.permissions.canEditMikrotik && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          MikroTik
                        </span>
                      )}
                      {emp.permissions.canManageEmployees && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Admin RBAC
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif
                    </div>
                    <span className="text-[10px] text-slate-500">{emp.lastActive}</span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit Izin Karyawan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus karyawan ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Hapus Karyawan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {empToEdit ? 'Edit Data & Hak Akses Karyawan' : 'Daftarkan Karyawan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama Lengkap Karyawan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Peran Jabatan (Role)</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Super Admin">Super Admin (Akses Penuh)</option>
                  <option value="Network Engineer (NOC)">Network Engineer (NOC)</option>
                  <option value="Finance & Kasir">Finance & Kasir</option>
                  <option value="Teknisi Lapangan">Teknisi Lapangan</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
              </div>

              {/* Granular permissions checkboxes */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Matriks Hak Akses Granular (Permissions):
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageBilling}
                    onChange={(e) => setCanManageBilling(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Kelola Tagihan & Akses Laporan Kasir</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canIsolirCustomer}
                    onChange={(e) => setCanIsolirCustomer(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Eksekusi Isolir / Buka Isolir Pelanggan</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canAccessRemoteModem}
                    onChange={(e) => setCanAccessRemoteModem(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Remote Akses Modem ONT Pelanggan</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canEditMikrotik}
                    onChange={(e) => setCanEditMikrotik(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Konfigurasi Router MikroTik & RADIUS</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageEmployees}
                    onChange={(e) => setCanManageEmployees(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Kelola Staf Karyawan & Hak Akses</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
