import React, { useState } from 'react';
import {
  X,
  Radio,
  Wifi,
  Power,
  RefreshCw,
  Cpu,
  Zap,
  Globe,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Terminal,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

export const RemoteModemModal: React.FC = () => {
  const { activeRemoteModemCustomer, setActiveRemoteModemCustomer, updateModemDetails, rebootModem } = useISP();

  const [activeTab, setActiveTab] = useState<'status' | 'wifi' | 'optical' | 'diagnostic'>('status');
  const [wifiSsid, setWifiSsid] = useState<string>(activeRemoteModemCustomer?.modem.wifiSsid || '');
  const [wifiPass, setWifiPass] = useState<string>(activeRemoteModemCustomer?.modem.wifiPassword || '');
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [wifiSavedSuccess, setWifiSavedSuccess] = useState(false);
  const [pingRunning, setPingRunning] = useState(false);
  const [pingOutput, setPingOutput] = useState<string[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);

  if (!activeRemoteModemCustomer) return null;

  const { modem, name, customerCode, ipAddress, pppoeUsername } = activeRemoteModemCustomer;

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWifi(true);
    setTimeout(() => {
      updateModemDetails(activeRemoteModemCustomer.id, {
        wifiSsid,
        wifiPassword: wifiPass,
      });
      setIsSavingWifi(false);
      setWifiSavedSuccess(true);
      setTimeout(() => setWifiSavedSuccess(false), 3000);
    }, 600);
  };

  const handleReboot = () => {
    setIsRebooting(true);
    rebootModem(activeRemoteModemCustomer.id);
    setTimeout(() => {
      setIsRebooting(false);
    }, 2200);
  };

  const handleRunPing = () => {
    setPingRunning(true);
    setPingOutput(['PING 8.8.8.8 (8.8.8.8): 56 data bytes...']);

    setTimeout(() => {
      setPingOutput((prev) => [...prev, '64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12.4 ms']);
    }, 400);

    setTimeout(() => {
      setPingOutput((prev) => [...prev, '64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=11.8 ms']);
    }, 900);

    setTimeout(() => {
      setPingOutput((prev) => [...prev, '64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=13.1 ms', '--- 8.8.8.8 ping statistics ---', '3 packets transmitted, 3 received, 0% packet loss, avg rtt 12.4ms']);
      setPingRunning(false);
    }, 1500);
  };

  const rxStatusColor =
    modem.rxPowerDbm >= -24 && modem.rxPowerDbm <= -14
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header with ONT brand identity */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {modem.brand} {modem.model}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  {modem.ponStatus}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Remote Akses ONT: {name} ({customerCode})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReboot}
              disabled={isRebooting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            >
              <Power className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
              {isRebooting ? 'Rebooting...' : 'Reboot ONT'}
            </button>

            <button
              onClick={() => setActiveRemoteModemCustomer(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'status'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Status Perangkat & Jaringan
          </button>
          <button
            onClick={() => setActiveTab('optical')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'optical'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostik Daya Optik (dBm)
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'wifi'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Konfigurasi WiFi
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'diagnostic'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Ping & Traceroute
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Quick hardware info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" /> WAN IP
                  </span>
                  <p className="text-sm font-mono font-semibold text-slate-100 mt-1">{modem.wanIp}</p>
                  <span className="text-[10px] text-slate-500">PPPoE: {pppoeUsername}</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" /> Suhu CPU
                  </span>
                  <p className="text-sm font-mono font-semibold text-slate-100 mt-1">{modem.temperature} °C</p>
                  <span className="text-[10px] text-emerald-400">Normal Range</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Voltase
                  </span>
                  <p className="text-sm font-mono font-semibold text-slate-100 mt-1">{modem.voltage} V</p>
                  <span className="text-[10px] text-slate-500">Regulator Stable</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Uptime
                  </span>
                  <p className="text-sm font-mono font-semibold text-slate-100 mt-1">{modem.uptime}</p>
                  <span className="text-[10px] text-slate-500">SN: {modem.serialNumber}</span>
                </div>
              </div>

              {/* Physical port link indicator */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Status Port Fisik LAN & PON
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg border bg-slate-900 border-emerald-500/30 text-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto mb-1 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-200">PON (SC/UPC)</span>
                    <p className="text-[10px] text-emerald-400 mt-0.5">O5 Connected</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-center ${modem.lan1 ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${modem.lan1 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono font-semibold text-slate-200">LAN 1 (GE)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{modem.lan1 ? '1000M Full' : 'Link Down'}</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-center ${modem.lan2 ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${modem.lan2 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono font-semibold text-slate-200">LAN 2 (FE)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{modem.lan2 ? '100M Full' : 'Link Down'}</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-center ${modem.lan3 ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${modem.lan3 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono font-semibold text-slate-200">LAN 3 (FE)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{modem.lan3 ? '100M Full' : 'Link Down'}</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-center ${modem.lan4 ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${modem.lan4 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono font-semibold text-slate-200">LAN 4 / IPTV</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{modem.lan4 ? 'Link Up' : 'Standby'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'optical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Rx Optical Power (Daya Terima)</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${rxStatusColor}`}>
                      Sangat Bagus
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-white tabular-nums">
                      {modem.rxPowerDbm}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">dBm</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Standar Telco FTTH GPON: -8 dBm s/d -27 dBm. Nilai optimal: -15 s/d -22 dBm.
                  </p>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(10, (1 - (Math.abs(modem.rxPowerDbm) - 10) / 25) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Tx Optical Power (Daya Kirim)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
                      Normal
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-white tabular-nums">
                      +{modem.txPowerDbm}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">dBm</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Standar Tx Laser DFB ONT: +0.5 s/d +5.0 dBm menuju OLT PON SFP.
                  </p>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="font-semibold text-slate-300">Catatan Teknisi Jaringan:</div>
                <div className="text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Redaman optik kabel dropcore dari ODP ke roset pelanggan sangat stabil. Tidak terdeteksi bending atau kotoran pada konektor SC/UPC.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wifi' && (
            <div className="space-y-6">
              {wifiSavedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Konfigurasi WiFi berhasil disimpan ke modem pelanggan secara remote!
                </div>
              )}

              <form onSubmit={handleSaveWifi} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama SSID WiFi (2.4 GHz / 5 GHz)
                  </label>
                  <div className="relative">
                    <Wifi className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kata Sandi WiFi (WPA2-PSK)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Minimal 8 karakter</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingWifi}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isSavingWifi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Simpan Perubahan ke Modem
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Perangkat Terhubung ({modem.connectedDevices} Perangkat)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Samsung Galaxy S23 (192.168.1.101)</span>
                    <span className="text-slate-500 text-[10px]">5 GHz</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Laptop MacBook Pro (192.168.1.102)</span>
                    <span className="text-slate-500 text-[10px]">5 GHz</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Smart TV Android (192.168.1.103)</span>
                    <span className="text-slate-500 text-[10px]">2.4 GHz</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Uji Ping Langsung dari Modem ONT</h4>
                  <p className="text-[11px] text-slate-400">Verifikasi latensi uplink WAN dan gateway dari sisi pelanggan</p>
                </div>
                <button
                  onClick={handleRunPing}
                  disabled={pingRunning}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  {pingRunning ? 'Menjalankan...' : 'Jalankan Ping Test'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 min-h-36 space-y-1">
                {pingOutput.length === 0 ? (
                  <span className="text-slate-600 italic">Klik tombol 'Jalankan Ping Test' untuk memulai diagnostik ICMP...</span>
                ) : (
                  pingOutput.map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Protokol TR-069 / OMCI / Web Remote via VLAN Management</span>
          <button
            onClick={() => setActiveRemoteModemCustomer(null)}
            className="px-4 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
