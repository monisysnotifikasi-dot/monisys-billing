import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Printer,
  ArrowLeft,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Invoice } from '../../types/isp';

interface Props {
  invoice: Invoice;
  onClose?: () => void;
}

export const PublicPaymentPortal: React.FC<Props> = ({ invoice, onClose }) => {
  const { currentTenant, payInvoice, simulateIncomingBankTransfer } = useISP();
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bca' | 'mandiri' | 'bri'>('qris');
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [qrisProcessing, setQrisProcessing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(899); // 15 mins

  // Countdown timer for QRIS
  useEffect(() => {
    if (invoice.status === 'paid') return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [invoice.status]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(invoice.totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard?.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSimulateQrisPay = () => {
    setQrisProcessing(true);
    setTimeout(() => {
      payInvoice(invoice.id, 'QRIS');
      setQrisProcessing(false);
    }, 1200);
  };

  const handleSimulateMootaTransfer = (bank: 'BCA' | 'MANDIRI' | 'BRI') => {
    setQrisProcessing(true);
    setTimeout(() => {
      simulateIncomingBankTransfer(
        bank,
        invoice.totalAmount,
        `TRANSFER MUTASI MOOTA ${bank} DARI ${invoice.customerName.toUpperCase()}`
      );
      setQrisProcessing(false);
    }, 1000);
  };

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top bar with back to admin if inside dashboard */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">{currentTenant.name}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                  Official Billing Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentTenant.slogan}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">No. Tagihan:</span>
            <span className="font-mono font-semibold text-xs text-slate-200">{invoice.invoiceNumber}</span>
          </div>
        </div>

        {/* Paid Banner Receipt Mode */}
        {isPaid ? (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Pembayaran Telah Diterima!</h2>
              <p className="text-sm text-emerald-400 mt-1">
                Lunas via {invoice.paymentMethod || 'QRIS Otomatis'} · {invoice.paidAt || 'Baru Saja'}
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                Koneksi internet untuk ID Pelanggan <strong className="text-slate-200">{invoice.customerCode}</strong> ({invoice.customerName}) telah aktif dengan kecepatan penuh.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Nama Pelanggan</span>
                <span className="text-slate-200 font-semibold">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Paket Berlangganan</span>
                <span className="text-slate-200">{invoice.packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Periode Tagihan</span>
                <span className="text-slate-200">{invoice.period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Nominal Lunas</span>
                <span className="text-emerald-400 font-bold text-sm">
                  Rp {invoice.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" /> Cetak Kwitansi Resmi
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Selesai & Kembali
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active Payment Checkout */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left: Invoice summary */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Rincian Tagihan
                </span>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 block">Pelanggan:</span>
                    <span className="font-semibold text-white text-sm">{invoice.customerName}</span>
                    <span className="text-slate-400 block font-mono text-[11px]">{invoice.customerCode}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Paket Internet:</span>
                    <span className="text-slate-200 font-medium">{invoice.packageName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Periode & Jatuh Tempo:</span>
                    <span className="text-slate-200">
                      {invoice.period} · Jatuh Tempo {invoice.dueDate}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Tarif Bulanan:</span>
                    <span>Rp {invoice.baseAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>Kode Unik Moota:</span>
                    <span>+{invoice.uniqueCode}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-white">
                    <span className="font-sans font-semibold text-xs">Total Pembayaran:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      Rp {invoice.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">Salin Nominal Pas:</span>
                  <button
                    onClick={handleCopyAmount}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedAmount ? 'Tersalin!' : `Rp ${invoice.totalAmount}`}
                  </button>
                </div>
              </div>

              {/* Safety badge */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Sistem pembayaran resmi MoniSys ISP. Didukung integrasi QRIS & sinkronisasi mutasi bank otomatis via Moota.
                </span>
              </div>
            </div>

            {/* Right: Payment Method Selector */}
            <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Pilih Metode Pembayaran</h3>
                <p className="text-xs text-slate-400">
                  Pembayaran akan diverifikasi secara real-time dan koneksi internet langsung aktif
                </p>
              </div>

              {/* Method tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'qris'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                  <span className="text-xs font-semibold block">QRIS</span>
                  <span className="text-[10px] text-emerald-400">Auto Verif</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('bca')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'bca'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <span className="text-xs font-semibold block">Bank BCA</span>
                  <span className="text-[10px] text-slate-400">Moota Sync</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('mandiri')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'mandiri'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                  <span className="text-xs font-semibold block">Mandiri</span>
                  <span className="text-[10px] text-slate-400">Moota Sync</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('bri')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'bri'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span className="text-xs font-semibold block">Bank BRI</span>
                  <span className="text-[10px] text-slate-400">Moota Sync</span>
                </button>
              </div>

              {/* QRIS Tab Content */}
              {selectedMethod === 'qris' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-white rounded-2xl w-56 mx-auto shadow-md">
                    {/* Simulated standard QRIS Code */}
                    <div className="text-[10px] font-bold text-red-600 tracking-wider mb-1">
                      QRIS STANDAR PEMBAYARAN
                    </div>
                    <div className="w-48 h-48 bg-slate-100 rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden">
                      <QrCode className="w-40 h-40 text-slate-900" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-2 py-0.5 rounded shadow text-[9px] font-bold text-slate-900">
                          {currentTenant.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1 font-mono">
                      NMID: ID1020268899120
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Kadaluarsa dalam: {formatCountdown(secondsLeft)}</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Buka aplikasi BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, atau ShopeePay, lalu scan kode QR di atas.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleSimulateQrisPay}
                      disabled={qrisProcessing}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {qrisProcessing ? 'Memverifikasi Pembayaran...' : 'Simulasikan Pembayaran QRIS Berhasil'}
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Transfer (Moota automated validation) */}
              {(selectedMethod === 'bca' || selectedMethod === 'mandiri' || selectedMethod === 'bri') && (
                <div className="space-y-4">
                  {(() => {
                    const bankData = currentTenant.bankAccounts.find(
                      (b) => b.bankName.toLowerCase() === selectedMethod
                    ) || {
                      bankName: selectedMethod.toUpperCase() as any,
                      accountNumber: '8420198821',
                      accountHolder: `PT ${currentTenant.name.toUpperCase()}`,
                    };

                    return (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-semibold text-slate-200">
                            Bank {bankData.bankName} (Sinkronisasi Moota)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Robot Otomatis 24/7
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400">Nomor Rekening:</span>
                          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <span className="font-mono text-base font-bold text-white tracking-wider">
                              {bankData.accountNumber}
                            </span>
                            <button
                              onClick={() => handleCopyAccount(bankData.accountNumber)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedAccount ? 'Tersalin' : 'Salin'}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Atas Nama: <strong className="text-slate-200">{bankData.accountHolder}</strong>
                          </span>
                        </div>

                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 space-y-1">
                          <div className="font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            PENTING: Transfer Tepat Nominal!
                          </div>
                          <p className="text-amber-200/80">
                            Mohon transfer tepat sebesar <strong className="text-white font-mono">Rp {invoice.totalAmount.toLocaleString('id-ID')}</strong> (termasuk 3 digit kode unik). Robot Moota akan langsung mencocokkan mutasi bank Anda tanpa perlu unggah struk manual.
                          </p>
                        </div>

                        <button
                          onClick={() => handleSimulateMootaTransfer(bankData.bankName as any)}
                          disabled={qrisProcessing}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          {qrisProcessing
                            ? 'Sinkronisasi Mutasi Moota...'
                            : `Simulasikan Transfer Bank ${bankData.bankName} Masuk`}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 pt-8 border-t border-slate-900 mt-8">
        © {new Date().getFullYear()} {currentTenant.name} · Powered by MoniSys ISP Billing Multi-Tenant Platform
      </div>
    </div>
  );
};
