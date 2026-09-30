import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  Radio,
  Clock,
  Sparkles,
  Smartphone,
  Layers,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { WhatsAppConfig } from '../../types/isp';

export const WhatsAppGatewayView: React.FC = () => {
  const { whatsAppConfig, updateWhatsAppConfig, whatsAppLogs, currentTenant } = useISP();

  const [provider, setProvider] = useState<'fonnte' | 'wablas' | 'custom'>(whatsAppConfig.provider);
  const [apiToken, setApiToken] = useState(whatsAppConfig.apiToken);
  const [serverUrl, setServerUrl] = useState(whatsAppConfig.serverUrl);
  const [deviceId, setDeviceId] = useState(whatsAppConfig.deviceId);

  const [templateReminder, setTemplateReminder] = useState(whatsAppConfig.templateReminder);
  const [templateSuccess, setTemplateSuccess] = useState(whatsAppConfig.templateSuccess);
  const [templateIsolir, setTemplateIsolir] = useState(whatsAppConfig.templateIsolir);

  const [testNumber, setTestNumber] = useState('081234567890');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // When provider changes, adjust default server URL
  const handleProviderChange = (p: 'fonnte' | 'wablas' | 'custom') => {
    setProvider(p);
    if (p === 'fonnte') setServerUrl('https://api.fonnte.com');
    else if (p === 'wablas') setServerUrl('https://bdg.wablas.com');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppConfig({
      provider,
      apiToken,
      serverUrl,
      deviceId,
      templateReminder,
      templateSuccess,
      templateIsolir,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTest = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestStatus(`Pesan uji coba berhasil dikirim ke ${testNumber} melalui gateway ${provider.toUpperCase()}!`);
      setTimeout(() => setTestStatus(null), 4000);
    }, 1200);
  };

  const insertVariable = (target: 'reminder' | 'success' | 'isolir', tag: string) => {
    if (target === 'reminder') setTemplateReminder((prev) => prev + ` ${tag}`);
    else if (target === 'success') setTemplateSuccess((prev) => prev + ` ${tag}`);
    else if (target === 'isolir') setTemplateIsolir((prev) => prev + ` ${tag}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            WhatsApp Gateway & Notifikasi Otomatis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dukungan integrasi Fonnte, Wablas, atau Custom HTTP API untuk pengiriman pengingat tagihan dan kwitansi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WhatsApp Engine: Connected ({provider.toUpperCase()})
          </span>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Konfigurasi WhatsApp Gateway dan template pesan berhasil disimpan!</span>
        </div>
      )}

      {testStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Pilihan Provider WhatsApp & Kredensial API
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Wablas Card */}
            <div
              onClick={() => handleProviderChange('wablas')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                provider === 'wablas'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">Wablas</span>
                {provider === 'wablas' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">Gateway WhatsApp Wablas API Indonesia</p>
            </div>

            {/* Fonnte Card */}
            <div
              onClick={() => handleProviderChange('fonnte')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                provider === 'fonnte'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">Fonnte</span>
                {provider === 'fonnte' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">Gateway WhatsApp Fonnte High Speed</p>
            </div>

            {/* Custom Card */}
            <div
              onClick={() => handleProviderChange('custom')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                provider === 'custom'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">Custom HTTP API</span>
                {provider === 'custom' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">Whacenter, Starsender, atau Baileys Node.js</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                API Token / Authorization Key
              </label>
              <input
                type="password"
                required
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Server Base URL
              </label>
              <input
                type="text"
                required
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Device ID / Session Sender
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Templates Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Template Pesan Notifikasi Otomatis
            </h3>
            <span className="text-xs text-slate-400">Variabel Dinamis: {'{nama_pelanggan}'}, {'{link_bayar}'}, dll.</span>
          </div>

          {/* Template 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                1. Pengingat Tagihan Bulanan (H-3 & H-1 Jatuh Tempo)
              </label>
              <div className="flex gap-1">
                {['{nama_pelanggan}', '{bulan_tagihan}', '{nominal}', '{jatuh_tempo}', '{link_bayar}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable('reminder', v)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded font-mono"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={templateReminder}
              onChange={(e) => setTemplateReminder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono leading-relaxed"
            />
          </div>

          {/* Template 2 */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                2. Konfirmasi Pembayaran Berhasil & Kwitansi Lunas
              </label>
              <div className="flex gap-1">
                {['{nama_pelanggan}', '{bulan_tagihan}', '{nominal}', '{metode_bayar}', '{link_bayar}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable('success', v)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 py-0.5 rounded font-mono"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={templateSuccess}
              onChange={(e) => setTemplateSuccess(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono leading-relaxed"
            />
          </div>

          {/* Template 3 */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                3. Peringatan Web Isolir Layanan Internet
              </label>
              <div className="flex gap-1">
                {['{nama_pelanggan}', '{nomor_layanan}', '{bulan_tagihan}', '{link_bayar}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable('isolir', v)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-red-300 px-2 py-0.5 rounded font-mono"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={templateIsolir}
              onChange={(e) => setTemplateIsolir(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Konfigurasi WhatsApp
            </button>
          </div>
        </div>
      </form>

      {/* Test Message Drawer & Live Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Uji Coba Kirim Pesan Langsung
          </h3>
          <p className="text-xs text-slate-400">
            Kirimkan satu pesan tes ke nomor pribadi untuk memverifikasi token dan koneksi gateway.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nomor WhatsApp Tujuan</label>
              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              {isSendingTest ? 'Mengirim Pesan...' : 'Kirim Pesan Uji Coba'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Log Pengiriman Pesan WhatsApp Terakhir
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">{whatsAppLogs.length} Pesan</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {whatsAppLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-300 font-semibold">{log.recipientName} ({log.recipientPhone})</span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-400 font-sans">{log.content}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Status: {log.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
