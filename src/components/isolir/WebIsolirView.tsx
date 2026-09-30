import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Settings,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Save,
  Radio,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

export const WebIsolirView: React.FC = () => {
  const {
    customers,
    autoIsolirSettings,
    updateAutoIsolirSettings,
    unIsolateCustomer,
    sendWhatsAppNotification,
    setPublicIsolirCustomer,
  } = useISP();

  const [settings, setSettings] = useState(autoIsolirSettings);
  const [savedAlert, setSavedAlert] = useState(false);

  const isolatedCustomers = customers.filter((c) => c.status === 'isolated');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAutoIsolirSettings(settings);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Konfigurasi Web Isolir & Sistem Auto-Suspend
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen suspensi otomatis pelanggan menunggak via MikroTik Firewall Address-List dan halaman isolir terintegrasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              settings.isEnabled
                ? 'text-red-400 bg-red-500/10 border-red-500/20'
                : 'text-slate-400 bg-slate-800 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.isEnabled ? 'bg-red-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {settings.isEnabled ? 'Auto-Suspend: AKTIF' : 'Auto-Suspend: NONAKTIF'}
          </span>
        </div>
      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan auto-suspend dan web isolir berhasil diperbarui ke MikroTik RouterOS!</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          Parameter Eksekusi Auto-Isolir MikroTik
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status Sistem Auto-Suspend
              </label>
              <select
                value={settings.isEnabled ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, isEnabled: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="true">Aktifkan Auto-Suspend Otomatis</option>
                <option value="false">Nonaktifkan (Manual Only)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Jika aktif, cron router berjalan setiap hari mengecek jatuh tempo
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Masa Tenggang (Grace Period)
              </label>
              <select
                value={settings.gracePeriodDays}
                onChange={(e) => setSettings({ ...settings, gracePeriodDays: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              >
                <option value={0}>0 Hari (Langsung di hari jatuh tempo)</option>
                <option value={1}>1 Hari setelah jatuh tempo</option>
                <option value={2}>2 Hari setelah jatuh tempo (Disarankan)</option>
                <option value={3}>3 Hari setelah jatuh tempo</option>
                <option value={5}>5 Hari setelah jatuh tempo</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Memberikan toleransi keterlambatan sebelum dialihkan
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Jam Eksekusi Otomatis
              </label>
              <input
                type="text"
                value={settings.autoActionHour}
                onChange={(e) => setSettings({ ...settings, autoActionHour: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Format 24 jam (e.g. 00:01 WIB saat trafik rendah)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nama Firewall Address-List MikroTik
              </label>
              <input
                type="text"
                value={settings.firewallAddressList}
                onChange={(e) => setSettings({ ...settings, firewallAddressList: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Target IP pelanggan yang belum bayar akan dimasukkan ke list ini
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                URL Pengalihan Web Isolir
              </label>
              <input
                type="text"
                value={settings.redirectWebIsolirUrl}
                onChange={(e) => setSettings({ ...settings, redirectWebIsolirUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Trafik port 80/443 dialihkan oleh NAT MikroTik ke URL ini
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoRestoreOnPaid}
                onChange={(e) => setSettings({ ...settings, autoRestoreOnPaid: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Pulihkan Internet Otomatis Saat Lunas
                </span>
                <span className="text-[11px] text-slate-400">
                  Hapus dari address-list detik itu juga saat mutasi Moota/QRIS berhasil
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sendWhatsAppOnIsolir}
                onChange={(e) => setSettings({ ...settings, sendWhatsAppOnIsolir: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Kirim Notifikasi WhatsApp Saat Terisolir
                </span>
                <span className="text-[11px] text-slate-400">
                  Otomatis kirim pesan darurat isolir beserta tautan pembayaran instan
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Konfigurasi Auto-Isolir
            </button>
          </div>
        </form>
      </div>

      {/* Currently Isolated Customers List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              Pelanggan Sedang Terisolir ({isolatedCustomers.length})
            </h3>
            <p className="text-xs text-slate-400">
              Pelanggan di bawah ini sedang dialihkan ke web isolir dan tidak dapat mengakses internet umum
            </p>
          </div>
        </div>

        {isolatedCustomers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Tidak ada pelanggan yang sedang terisolir saat ini. Semua pelanggan dalam status aktif/lunas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">IP Address (MikroTik)</th>
                  <th className="py-2.5 px-3">Waktu Eksekusi Isolir</th>
                  <th className="py-2.5 px-3">Paket</th>
                  <th className="py-2.5 px-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {isolatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{cust.name}</span>
                      <span className="text-[11px] text-indigo-400 font-mono">{cust.customerCode}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div>{cust.ipAddress}</div>
                      <span className="text-[10px] text-red-400">List: {settings.firewallAddressList}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-red-300">
                      {cust.isolatedAt || 'Baru Saja'}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {cust.packageName}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Preview Isolir Page */}
                        <button
                          onClick={() => setPublicIsolirCustomer(cust)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Lihat Web Isolir
                        </button>

                        {/* Send WA warning */}
                        <button
                          onClick={() => sendWhatsAppNotification(cust.id, 'isolir')}
                          className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg transition-colors"
                          title="Kirim Peringatan WA Isolir"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Manual Restore */}
                        <button
                          onClick={() => unIsolateCustomer(cust.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Buka Isolir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
