import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Copy,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Printer,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Invoice } from '../../types/isp';

export const InvoiceListView: React.FC = () => {
  const {
    invoices,
    currentTenant,
    setPublicViewInvoice,
    sendWhatsAppNotification,
    payInvoice,
  } = useISP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'isolated'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (token: string) => {
    const fullUrl = `https://${currentTenant.domain}/pay/${token}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // KPIs
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const totalPaid = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid');
  const totalUnpaid = unpaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Manajemen Tagihan & Sistem Link Bayar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tagihan otomatis by link dengan kode unik Moota dan integrasi QRIS real-time
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Nilai Tagihan Bulan Ini</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            Rp {totalInvoiced.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {invoices.length} Total Invoice Terbit
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Pembayaran Terverifikasi (Lunas)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            Rp {totalPaid.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            {paidInvoices.length} Pelanggan Sudah Lunas
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Tertunggak / Belum Bayar</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            Rp {totalUnpaid.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            {unpaidInvoices.length} Pelanggan Menunggu Pembayaran
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nomor tagihan, nama pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Belum Bayar ({invoices.filter((i) => i.status === 'unpaid').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lunas ({invoices.filter((i) => i.status === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('isolated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'isolated'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terisolir ({invoices.filter((i) => i.status === 'isolated').length})
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Tagihan & Periode</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Nominal & Kode Unik</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status & Metode</th>
                <th className="py-3 px-4 text-center">Tautan Bayar & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-white block">{inv.invoiceNumber}</span>
                    <span className="text-slate-400 text-[11px]">{inv.period}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-100 block">{inv.customerName}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {inv.customerCode} · {inv.packageName}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Tarif Rp {inv.baseAmount.toLocaleString('id-ID')} + Unik {inv.uniqueCode}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-300 block">{inv.dueDate}</span>
                    <span className="text-[10px] text-slate-500">Terbit: {inv.issueDate}</span>
                  </td>

                  <td className="py-3 px-4">
                    {inv.status === 'paid' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Lunas ({inv.paymentMethod || 'Otomatis'})
                      </span>
                    )}
                    {inv.status === 'unpaid' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        Belum Bayar
                      </span>
                    )}
                    {inv.status === 'isolated' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Terisolir
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Open public portal view */}
                      <button
                        onClick={() => setPublicViewInvoice(inv)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Buka Tampilan Halaman Bayar Pelanggan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Portal Bayar
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(inv.paymentToken)}
                        className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Salin Tautan Tagihan (Link Bayar)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Send WA Notification */}
                      <button
                        onClick={() => sendWhatsAppNotification(inv.customerId, 'reminder')}
                        className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg transition-colors"
                        title="Kirim Notifikasi Tagihan WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Manual Pay */}
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => payInvoice(inv.id, 'MANUAL_KASIR')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                          title="Tandai Lunas Manual Kasir"
                        >
                          Lunas Kasir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
