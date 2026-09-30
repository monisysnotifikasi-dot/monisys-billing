import React, { useState, useEffect } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Gauge, RefreshCw, Wifi } from 'lucide-react';
import { useISP } from '../../context/ISPContext';

export const BandwidthChart: React.FC = () => {
  const { currentTenant } = useISP();
  const [selectedInterface, setSelectedInterface] = useState<string>('ether1-WAN');
  const [downloadMbps, setDownloadMbps] = useState<number>(342.8);
  const [uploadMbps, setUploadMbps] = useState<number>(184.2);
  const [jitterMs, setJitterMs] = useState<number>(1.8);
  const [history, setHistory] = useState<{ time: string; down: number; up: number }[]>([]);

  // Initialize history
  useEffect(() => {
    const initial = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 2000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      initial.push({
        time: t,
        down: Math.floor(280 + Math.sin(i * 0.5) * 60 + Math.random() * 20),
        up: Math.floor(140 + Math.cos(i * 0.5) * 35 + Math.random() * 15),
      });
    }
    setHistory(initial);
  }, []);

  // Live real-time stream simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const nextDown = Math.max(120, Math.min(850, Math.round(downloadMbps + (Math.random() - 0.48) * 35)));
      const nextUp = Math.max(50, Math.min(420, Math.round(uploadMbps + (Math.random() - 0.48) * 18)));
      const nextJitter = +(1.2 + Math.random() * 1.4).toFixed(1);

      setDownloadMbps(nextDown);
      setUploadMbps(nextUp);
      setJitterMs(nextJitter);

      setHistory((prev) => {
        const next = [...prev.slice(1), { time: nowStr, down: nextDown, up: nextUp }];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [downloadMbps, uploadMbps]);

  // Max scale calculation
  const maxTraffic = Math.max(...history.map((h) => Math.max(h.down, h.up)), 500);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Trafik Bandwidth Real-Time
            </h3>
            <p className="text-xs text-slate-400">
              Gateway: <span className="text-slate-300 font-mono">103.144.20.1</span> ({currentTenant.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            className="bg-slate-800/90 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ether1-WAN">ether1-WAN (Main Uplink 1 Gbps)</option>
            <option value="ether2-LAN">ether2-LAN (Distribution Trunk)</option>
            <option value="sfp-plus1">sfp-plus1 (OLT Uplink 10G)</option>
            <option value="all-pppoe">all-pppoe (Aggregated PPPoE)</option>
          </select>

          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live 2s
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              Download
            </span>
            <span className="text-[10px] text-emerald-400/80">RX</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {downloadMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              Upload
            </span>
            <span className="text-[10px] text-blue-400/80">TX</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
            {uploadMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Peak Traffic
            </span>
            <span className="text-[10px] text-slate-500">24 Jam</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 tabular-nums">
            780.4 <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-purple-400" />
              Jitter / Loss
            </span>
            <span className="text-[10px] text-emerald-400">0.0% loss</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 tabular-nums">
            {jitterMs} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Line Graph */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
        <div className="h-44 w-full flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
              <line
                key={idx}
                x1="0"
                y1={160 - pct * 140}
                x2="500"
                y2={160 - pct * 140}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="0.8"
                opacity="0.4"
              />
            ))}

            {/* Download Area & Line */}
            {history.length > 1 && (
              <>
                <path
                  d={`
                    M 0,${160 - (history[0].down / maxTraffic) * 140}
                    ${history
                      .map((h, i) => `L ${(i / (history.length - 1)) * 500},${160 - (h.down / maxTraffic) * 140}`)
                      .join(' ')}
                    L 500,160 L 0,160 Z
                  `}
                  fill="url(#downloadGradient)"
                />
                <path
                  d={`
                    M 0,${160 - (history[0].down / maxTraffic) * 140}
                    ${history
                      .map((h, i) => `L ${(i / (history.length - 1)) * 500},${160 - (h.down / maxTraffic) * 140}`)
                      .join(' ')}
                  `}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Upload Line */}
            {history.length > 1 && (
              <>
                <path
                  d={`
                    M 0,${160 - (history[0].up / maxTraffic) * 140}
                    ${history
                      .map((h, i) => `L ${(i / (history.length - 1)) * 500},${160 - (h.up / maxTraffic) * 140}`)
                      .join(' ')}
                    L 500,160 L 0,160 Z
                  `}
                  fill="url(#uploadGradient)"
                />
                <path
                  d={`
                    M 0,${160 - (history[0].up / maxTraffic) * 140}
                    ${history
                      .map((h, i) => `L ${(i / (history.length - 1)) * 500},${160 - (h.up / maxTraffic) * 140}`)
                      .join(' ')}
                  `}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3 1"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              Download (RX Mbps)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-400 rounded-full" />
              Upload (TX Mbps)
            </span>
          </div>
          <span className="font-mono text-slate-500">
            Scale Max: {Math.round(maxTraffic)} Mbps
          </span>
        </div>
      </div>
    </div>
  );
};
