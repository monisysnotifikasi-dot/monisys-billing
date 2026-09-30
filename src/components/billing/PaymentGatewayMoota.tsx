import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowDownLeft,
  Filter,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

export const PaymentGatewayMoota: React.FC = () => {
  const { mutations, processMootaMutation, simulateIncomingBankTransfer, currentTenant, invoices } = useISP();

  const [apiToken, setApiToken] = useState('moota_live_tok_99182374bbcca881');
  const [webhookUrl, setWebhookUrl] = useState(`https://api.monisys.web.id/webhook/moota/${currentTenant.slug}`);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simBank, setSimBank] = useState<'BCA' | 'MANDIRI' | 'BRI'>('BCA');
  const [simInvoiceId, setSimInvoiceId] = useState('');
  const [simAlert, setSimAlert] = useState<string | null>(null);

  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid');

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetInv = invoices.find((i) => i.id === simInvoiceId) || unpaidInvoices[0];
    if (!targetInv) return;

    setIsSimulating(true);
    const amount = targetInv.totalAmount;
    const desc = `TRSF E-BANKING CR MUTASI MOOTA ${simBank} DARI ${targetInv.customerName.toUpperCase()}`;

    simulateIncomingBankTransfer(simBank, amount, desc);

    setTimeout(() => {
      setIsSimulating(false);
      setSimAlert(`Mutasi bank ${simBank} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil diterima dan tagihan ${targetInv.invoiceNumber} otomatis tervalidasi LUNAS!`);
      setTimeout(() => setSimAlert(null), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-400" />
            Integrasi Moota - Mutasi Bank Otomatis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validasi pembayaran real-time via pencocokan nominal 3 digit kode unik tanpa upload bukti transfer
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Moota Robot Engine: Online (Real-Time Push)
          </span>
        </div>
      </div>

      {simAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{simAlert}</span>
        </div>
      )}

      {/* Settings & Webhook Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Konfigurasi Akun & Webhook Moota
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Moota API Token</label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Didapatkan dari dashboard moota.co</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">URL Webhook Receiver (Push)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Pasang URL ini pada pengaturan webhook Moota</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Rekening Bank Terhubung:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentTenant.bankAccounts.map((b, i) => (
                <div key={i} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{b.bankName}</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Sinkron</span>
                  </div>
                  <div className="font-mono text-xs text-slate-300">{b.accountNumber}</div>
                  <div className="text-[10px] text-slate-500 truncate">{b.accountHolder}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulator Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Uji Coba Simulasi Mutasi Masuk
          </h3>
          <p className="text-xs text-slate-400">
            Kirimkan simulasi webhook mutasi bank untuk menguji auto-reconcile & un-isolir instan
          </p>

          <form onSubmit={handleSimulate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Tagihan Pelanggan</label>
              <select
                value={simInvoiceId}
                onChange={(e) => setSimInvoiceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                {unpaidInvoices.length === 0 ? (
                  <option value="">Semua tagihan sudah lunas!</option>
                ) : (
                  unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.customerName} - Rp {inv.totalAmount.toLocaleString('id-ID')} ({inv.invoiceNumber})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bank Pengirim</label>
              <select
                value={simBank}
                onChange={(e) => setSimBank(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="BCA">Bank BCA</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">Bank BRI</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSimulating || unpaidInvoices.length === 0}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Memproses Webhook...' : 'Kirim Simulasi Transfer Masuk'}
            </button>
          </form>
        </div>
      </div>

      {/* Live Ingested Mutations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-3 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Log Mutasi Rekening Bank (Moota Ingest)</h3>
            <p className="text-xs text-slate-400">Daftar transaksi masuk real-time dari bank mitra</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {mutations.length} Transaksi Terpantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Waktu Mutasi</th>
                <th className="py-2.5 px-3">Bank & No Rekening</th>
                <th className="py-2.5 px-3">Keterangan / Berita Transfer</th>
                <th className="py-2.5 px-3">Nominal Masuk</th>
                <th className="py-2.5 px-3">Pencocokan Invoice</th>
                <th className="py-2.5 px-3 text-center">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {mutations.map((mut) => (
                <tr key={mut.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400">{mut.transactionDate}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{mut.bankType}</span>
                    <span className="text-[10px] text-slate-500">{mut.accountNumber}</span>
                  </td>
                  <td className="py-3 px-3 font-sans text-xs text-slate-300 max-w-xs">
                    {mut.description}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold text-sm">
                    +Rp {mut.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-indigo-400 font-semibold">
                    {mut.matchedInvoiceNumber || 'Belum Terhubung'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {mut.isMatched ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Terverifikasi
                      </span>
                    ) : (
                      <button
                        onClick={() => processMootaMutation(mut.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold font-sans transition-colors"
                      >
                        Validasi Otomatis
                      </button>
                    )}
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
