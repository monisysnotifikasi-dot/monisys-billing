import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Activity,
  MapPin,
  Building2,
  FileText,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Send,
  MessageSquare,
  Radio,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Server,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { BandwidthChart } from './BandwidthChart';
import { DashboardSettingsModal } from './DashboardSettingsModal';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    currentTenant,
    customers,
    invoices,
    odps,
    mutations,
    processMootaMutation,
    sendWhatsAppNotification,
    setPublicViewInvoice,
    setActiveRemoteModemCustomer,
    dashboardWidgets,
    mikrotikConfig,
    whatsAppConfig,
  } = useISP();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Computations
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const isolatedCustomers = customers.filter((c) => c.status === 'isolated').length;
  const pendingCustomers = customers.filter((c) => c.status === 'pending').length;

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const totalPaid = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid');
  const totalUnpaid = unpaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const totalOdpPorts = odps.reduce((acc, o) => acc + o.capacity, 0);
  const totalUsedOdpPorts = odps.reduce((acc, o) => acc + o.usedPorts, 0);
  const odpPct = totalOdpPorts > 0 ? Math.round((totalUsedOdpPorts / totalOdpPorts) * 100) : 0;

  // Sort widgets by configured order
  const activeWidgets = [...dashboardWidgets]
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dashboard Operasional {currentTenant.name}
            </h1>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              {currentTenant.domain}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring jaringan real-time, billing otomatis Moota, dan sinkronisasi MikroTik RouterOS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Kustomisasi Dashboard
          </button>

          <button
            onClick={() => onNavigateTab('customers')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            + Pelanggan Baru
          </button>
        </div>
      </div>

      {/* Dynamic Widget Rendering based on configuration */}
      <div className="space-y-6">
        {activeWidgets.map((widget) => {
          switch (widget.id) {
            case 'widget-revenue':
              return (
                <div key={widget.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Total Tagihan Periode Ini</span>
                      <DollarSign className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      Rp {totalInvoiced.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {invoices.length} Surat Tagihan Diterbitkan
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Pembayaran Terverifikasi (Lunas)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      Rp {totalPaid.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-emerald-400/80 mt-1 block">
                      {paidInvoices.length} Pelanggan ({Math.round((paidInvoices.length / (invoices.length || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Tertunggak / Belum Bayar</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                      Rp {totalUnpaid.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-amber-400/80 mt-1 block">
                      {unpaidInvoices.length} Tagihan Menunggu
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Pelanggan Terisolir</span>
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
                      {isolatedCustomers} <span className="text-xs font-normal text-slate-400">User</span>
                    </div>
                    <button
                      onClick={() => onNavigateTab('isolir')}
                      className="text-[11px] text-red-300 hover:underline mt-1 block"
                    >
                      Buka Panel Web Isolir ↗
                    </button>
                  </div>
                </div>
              );

            case 'widget-bandwidth':
              return (
                <div key={widget.id}>
                  <BandwidthChart />
                </div>
              );

            case 'widget-customers':
              return (
                <div key={widget.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        Status Berlangganan Pelanggan ({totalCustomers} Total)
                      </h3>
                      <p className="text-xs text-slate-400">Rincian status koneksi di jaringan FTTH {currentTenant.name}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('customers')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      Lihat Semua Pelanggan <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400">Aktif Normal</span>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{activeCustomers}</p>
                    </div>
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400">Terisolir MikroTik</span>
                      <p className="text-xl font-bold font-mono text-red-400 mt-1">{isolatedCustomers}</p>
                    </div>
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400">Registrasi Pending</span>
                      <p className="text-xl font-bold font-mono text-amber-400 mt-1">{pendingCustomers}</p>
                    </div>
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400">Total Pelanggan</span>
                      <p className="text-xl font-bold font-mono text-white mt-1">{totalCustomers}</p>
                    </div>
                  </div>
                </div>
              );

            case 'widget-odp':
              return (
                <div key={widget.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        Utilisasi Port ODP & Kapasitas FAT Fiber Optik
                      </h3>
                      <p className="text-xs text-slate-400">
                        {odps.length} Titik ODP terpasang · Total {totalUsedOdpPorts} dari {totalOdpPorts} Port terpakai ({odpPct}%)
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('odp')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      Kelola ODP & Peta <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {odps.slice(0, 6).map((odp) => {
                      const pct = Math.round((odp.usedPorts / odp.capacity) * 100);
                      const isFull = odp.usedPorts >= odp.capacity;

                      return (
                        <div key={odp.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-emerald-400">{odp.code}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isFull ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {isFull ? 'PENUH' : 'TERSEDIA'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 truncate">{odp.name}</div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Port: {odp.usedPorts}/{odp.capacity} ({pct}%)</span>
                            <span>{odp.wilayahName.split(' ')[0]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

            case 'widget-moota':
              return (
                <div key={widget.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        Mutasi Bank Real-Time (Moota Ingestion)
                      </h3>
                      <p className="text-xs text-slate-400">Pencocokan otomatis tagihan via robot mutasi 24 jam</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('moota')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      Buka Moota Center <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mutations.slice(0, 3).map((mut) => (
                      <div
                        key={mut.id}
                        className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">{mut.bankType}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{mut.transactionDate}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans line-clamp-1">{mut.description}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            +Rp {mut.amount.toLocaleString('id-ID')}
                          </div>
                          {mut.isMatched ? (
                            <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Cocok {mut.matchedInvoiceNumber}
                            </span>
                          ) : (
                            <button
                              onClick={() => processMootaMutation(mut.id)}
                              className="text-[10px] px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold mt-0.5 transition-colors"
                            >
                              Validasi Sekarang
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'widget-unpaid':
              return (
                <div key={widget.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        Tagihan Mendekati Jatuh Tempo & Belum Bayar
                      </h3>
                      <p className="text-xs text-slate-400">Kirimkan notifikasi WhatsApp instan dengan tautan pembayaran</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('billing')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      Semua Tagihan <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {unpaidInvoices.slice(0, 4).map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-3"
                      >
                        <div>
                          <div className="font-semibold text-white">{inv.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {inv.invoiceNumber} · Jatuh Tempo: {inv.dueDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            Rp {inv.totalAmount.toLocaleString('id-ID')}
                          </span>

                          <button
                            onClick={() => sendWhatsAppNotification(inv.customerId, 'reminder')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 transition-colors"
                            title="Kirim Pengingat WA"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPublicViewInvoice(inv)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Link Bayar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'widget-gateways':
              return (
                <div key={widget.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MikroTik Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">MikroTik RouterOS</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{mikrotikConfig.routerIdentity}</span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">CPU Load: {mikrotikConfig.cpuLoad}% · {mikrotikConfig.uptime}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('mikrotik')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                    >
                      Kelola
                    </button>
                  </div>

                  {/* WhatsApp Gateway Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">WhatsApp Gateway</span>
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded">
                            {whatsAppConfig.provider}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">Status: Connected & Ready</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">Auto H-3 & H-1 Jatuh Tempo Aktif</div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('whatsapp')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                    >
                      Setting
                    </button>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Dashboard Settings Modal */}
      {isSettingsOpen && <DashboardSettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};
