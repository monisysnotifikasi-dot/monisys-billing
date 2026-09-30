import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, ArrowLeft, WifiOff, CheckCircle2, PhoneCall } from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Customer } from '../../types/isp';

interface Props {
  customer: Customer;
  onPayNow: () => void;
  onBackToAdmin?: () => void;
}

export const IsolirCustomerLanding: React.FC<Props> = ({ customer, onPayNow, onBackToAdmin }) => {
  const { currentTenant, invoices } = useISP();

  // Find invoice for this customer
  const unpaidInvoice = invoices.find(
    (i) => i.customerId === customer.id && (i.status === 'unpaid' || i.status === 'isolated')
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-2xl mx-auto w-full my-auto">
        {onBackToAdmin && (
          <div className="mb-4">
            <button
              onClick={onBackToAdmin}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Panel Admin ISP
            </button>
          </div>
        )}

        <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <WifiOff className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Pemberitahuan Isolir Sementara
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Layanan Internet Ditangguhkan
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Koneksi internet Anda dialihkan ke halaman ini karena masa tenggang pembayaran tagihan bulanan telah berakhir.
            </p>
          </div>

          {/* Customer & Invoice details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Nama Pelanggan:</span>
              <span className="text-white font-semibold">{customer.name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-sans">ID Layanan / PPPoE:</span>
              <span className="text-indigo-400">{customer.customerCode} ({customer.pppoeUsername})</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Paket Kecepatan:</span>
              <span className="text-slate-200">{customer.packageName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-sans">Waktu Auto-Isolir:</span>
              <span className="text-red-400">{customer.isolatedAt || 'Otomatis oleh MikroTik Firewall'}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-300 font-sans font-semibold">Total Tagihan Tertunda:</span>
              <span className="text-lg font-bold text-amber-400">
                Rp {(unpaidInvoice?.totalAmount || customer.monthlyPrice).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left text-xs text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Pembukaan Isolir Otomatis Detik Ini Juga!</strong>
              <span>
                Begitu Anda menyelesaikan pembayaran melalui QRIS atau transfer rekening resmi, sistem robot kami langsung menghapus IP Anda dari daftar isolir dan internet kembali menyala normal dalam hitungan detik.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onPayNow}
              className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Bayar Tagihan Sekarang (Buka Isolir)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-2">
            <PhoneCall className="w-4 h-4 text-indigo-400" />
            <span>Butuh bantuan? Hubungi WhatsApp Helpdesk {currentTenant.name}: <strong className="text-slate-200">{currentTenant.phone}</strong></span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 pt-6">
        {currentTenant.name} · Sistem Pengalihan Web Isolir (HTTP/HTTPS Redirect MikroTik RouterOS)
      </div>
    </div>
  );
};
