import React, { useState } from 'react';
import {
  Server,
  Radio,
  Zap,
  Power,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  Shield,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

export const RadiusServerView: React.FC = () => {
  const { radiusSessions, radiusConfig, updateRadiusConfig, disconnectRadiusSession } = useISP();

  const [host, setHost] = useState(radiusConfig.host);
  const [authPort, setAuthPort] = useState(radiusConfig.authPort);
  const [acctPort, setAcctPort] = useState(radiusConfig.acctPort);
  const [secret, setSecret] = useState(radiusConfig.secret);
  const [nasIdentifier, setNasIdentifier] = useState(radiusConfig.nasIdentifier);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRadiusConfig({ host, authPort, acctPort, secret, nasIdentifier });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours} Jam ${minutes} Mnt`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-6 h-6 text-purple-400" />
            Integrasi RADIUS Server (FreeRADIUS / DaloRADIUS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autentikasi terpusat AAA (Authentication, Authorization, Accounting) & CoA Disconnect Packet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border text-purple-400 bg-purple-500/10 border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            RADIUS Service: Listening (Port 1812/1813)
          </span>
        </div>
      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Konfigurasi RADIUS Server NAS berhasil diperbarui!</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          Parameter Koneksi RADIUS Client & Secret
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">RADIUS Server IP / Host</label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Auth Port</label>
              <input
                type="number"
                required
                value={authPort}
                onChange={(e) => setAuthPort(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Acct Port</label>
              <input
                type="number"
                required
                value={acctPort}
                onChange={(e) => setAcctPort(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">NAS Identifier</label>
              <input
                type="text"
                required
                value={nasIdentifier}
                onChange={(e) => setNasIdentifier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Shared Secret Key</label>
              <input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end pt-5 w-full sm:w-auto">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Konfigurasi RADIUS
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Active Radius Sessions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              Sesi Pelanggan Aktif (RADIUS Accounting Radacct)
            </h3>
            <p className="text-xs text-slate-400">
              Pelanggan yang saat ini sedang login secara live dengan alokasi Framed-IP-Address
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {radiusSessions.filter((s) => s.status === 'online').length} Sesi Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Username PPPoE</th>
                <th className="py-2.5 px-3">Framed IP & MAC</th>
                <th className="py-2.5 px-3">Waktu Mulai & Uptime</th>
                <th className="py-2.5 px-3">Konsumsi Kuota / Trafik</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi CoA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {radiusSessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{sess.username}</span>
                    <span className="text-[10px] text-slate-500">NAS: {sess.nasIp}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-emerald-400 font-bold">{sess.framedIp}</div>
                    <span className="text-[10px] text-slate-400">{sess.callingStationId}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    <div>{formatSeconds(sess.uptimeSeconds)}</div>
                    <span className="text-[10px] text-slate-500">{sess.startTime}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <ArrowDownRight className="w-3 h-3" /> {formatBytes(sess.downloadBytes)}
                      </span>
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <ArrowUpRight className="w-3 h-3" /> {formatBytes(sess.uploadBytes)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {sess.status === 'online' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 font-sans">
                        Disconnected
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {sess.status === 'online' && (
                      <button
                        onClick={() => disconnectRadiusSession(sess.id)}
                        className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold font-sans transition-colors"
                        title="Putuskan koneksi via CoA Disconnect Request (Port 3799)"
                      >
                        Disconnect (CoA)
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
