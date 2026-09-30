import React, { useState } from 'react';
import {
  Globe,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Bell,
  Copy,
  CheckCircle2,
  Send,
  Building2,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

interface Props {
  onOpenMootaSim: () => void;
  onBroadcastWa: () => void;
}

export const Topbar: React.FC<Props> = ({ onOpenMootaSim, onBroadcastWa }) => {
  const {
    currentTenant,
    activeSubdomain,
    isDemoMode,
    toggleDemoMode,
    goToMasterPortal,
    customers,
  } = useISP();

  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleCopyDomain = () => {
    navigator.clipboard?.writeText(activeSubdomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <header className="h-16 px-6 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between z-20 backdrop-blur-sm">
      {/* Left: Domain Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono font-medium text-slate-200">
            https://{activeSubdomain}
          </span>
          <button
            onClick={handleCopyDomain}
            className="text-slate-400 hover:text-white ml-1 transition-colors"
            title="Salin Domain Tenant"
          >
            {copiedDomain ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        <button
          onClick={goToMasterPortal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors"
        >
          <span>Portal Pusat: monisys.web.id</span>
        </button>
      </div>

      {/* Right: Mode Toggle, Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Dummy Data Toggle (Requested Requirement) */}
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isDemoMode
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
          title={
            isDemoMode
              ? 'Mode Dummy Aktif: Menampilkan data demo. Klik untuk matikan dummy data.'
              : 'Mode Real Aktif: Menampilkan database riil. Klik untuk aktifkan data demo.'
          }
        >
          {isDemoMode ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-emerald-400" />}
          <span>{isDemoMode ? 'DATA DUMMY: ON' : 'DATA REAL: ON'}</span>
        </button>

        {/* Quick Bank Mutation Simulation */}
        <button
          onClick={onOpenMootaSim}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors"
          title="Buka Simulasi Mutasi Bank Moota"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Simulasi Moota</span>
        </button>

        {/* User profile lockup */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            SF
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-white block leading-tight">Subbhi Fisabilillah</span>
            <span className="text-[10px] text-indigo-400 font-mono">Super Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
