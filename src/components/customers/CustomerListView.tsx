import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  MessageSquare,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Filter,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Customer } from '../../types/isp';
import { CustomerModal } from './CustomerModal';
import { BulkImportModal } from './BulkImportModal';

export const CustomerListView: React.FC = () => {
  const {
    customers,
    packages,
    invoices,
    isolateCustomer,
    unIsolateCustomer,
    deleteCustomer,
    setActiveRemoteModemCustomer,
    sendWhatsAppNotification,
    broadcastWhatsAppReminder,
    setPublicIsolirCustomer,
    setPublicViewInvoice,
  } = useISP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'isolated' | 'pending'>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.pppoeUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ipAddress.includes(searchTerm) ||
      c.odpName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || c.packageId === packageFilter || c.packageName === packageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleBroadcast = () => {
    const count = broadcastWhatsAppReminder();
    setBroadcastAlert(`Pesan pengingat tagihan berhasil dikirimkan via WhatsApp ke ${count} pelanggan tertunggak!`);
    setTimeout(() => setBroadcastAlert(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Manajemen Pelanggan FTTH & Internet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total {customers.length} Pelanggan terdaftar · Integrasi Remote Modem ONT & Auto-Isolir MikroTik
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleBroadcast}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Broadcast WA Tagihan
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Import Massal (CSV)
          </button>

          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Pelanggan Baru
          </button>
        </div>
      </div>

      {broadcastAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastAlert}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, kode, no WA, IP, PPPoE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Paket Internet</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.speedDownloadMbps} Mbps)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aktif ({customers.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('isolated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'isolated'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terisolir ({customers.filter((c) => c.status === 'isolated').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({customers.filter((c) => c.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Paket & Tarif</th>
                <th className="py-3 px-4">PPPoE & IP Address</th>
                <th className="py-3 px-4">ODP & Wilayah</th>
                <th className="py-3 px-4">Status Layanan</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada data pelanggan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const customerInvoice = invoices.find((i) => i.customerId === cust.id);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 text-sm">{cust.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                            {cust.customerCode}
                          </span>
                          <span className="text-slate-600">·</span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono text-[11px]"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            {cust.phone}
                          </a>
                        </div>
                      </td>

                      {/* Package & Price */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{cust.packageName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Rp {cust.monthlyPrice.toLocaleString('id-ID')} / bln
                        </div>
                      </td>

                      {/* PPPoE & IP */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-200 text-xs font-semibold">{cust.pppoeUsername}</div>
                        <div className="text-[11px] text-slate-400">{cust.ipAddress}</div>
                      </td>

                      {/* ODP & Wilayah with coordinates */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{cust.odpName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {cust.wilayahName} · [{cust.lat?.toFixed(4)}, {cust.lng?.toFixed(4)}]
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {cust.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Aktif
                          </span>
                        )}
                        {cust.status === 'isolated' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Terisolir
                            </span>
                            <button
                              onClick={() => setPublicIsolirCustomer(cust)}
                              className="text-[10px] text-red-300 hover:underline block flex items-center gap-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              Cek Web Isolir
                            </button>
                          </div>
                        )}
                        {cust.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Remote Modem ONT Button */}
                          <button
                            onClick={() => setActiveRemoteModemCustomer(cust)}
                            className="p-1.5 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 transition-colors"
                            title="Remote Akses Modem ONT"
                          >
                            <Radio className="w-4 h-4" />
                          </button>

                          {/* Send WA Notification */}
                          <button
                            onClick={() => sendWhatsAppNotification(cust.id, 'reminder')}
                            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition-colors"
                            title="Kirim Notifikasi Tagihan WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Toggle Isolir / Aktifkan */}
                          {cust.status === 'isolated' ? (
                            <button
                              onClick={() => unIsolateCustomer(cust.id)}
                              className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition-colors"
                              title="Buka Isolir (Aktifkan)"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => isolateCustomer(cust.id)}
                              className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg border border-red-500/20 transition-colors"
                              title="Isolir Manual (Auto-Suspend)"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setCustomerToEdit(cust);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit Data Pelanggan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pelanggan ${cust.name}?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Add/Edit Modal */}
      {isAddModalOpen && (
        <CustomerModal
          customerToEdit={customerToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setCustomerToEdit(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && <BulkImportModal onClose={() => setIsBulkModalOpen(false)} />}
    </div>
  );
};
