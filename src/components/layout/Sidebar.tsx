import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  ShieldAlert,
  MapPin,
  Radio,
  Server,
  MessageSquare,
  Building,
  ShieldCheck,
  Database,
  Globe,
  ChevronDown,
  Layers,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenTenantModal: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange, onOpenTenantModal }) => {
  const { currentTenant, goToMasterPortal } = useISP();

  const menuSections = [
    {
      title: 'OPERASIONAL UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard ISP', icon: LayoutDashboard },
        { id: 'customers', label: 'Data Pelanggan', icon: Users },
        { id: 'packages', label: 'Paket Internet', icon: Wifi },
        { id: 'billing', label: 'Tagihan by Link & QRIS', icon: FileText },
        { id: 'moota', label: 'Moota Mutasi Bank', icon: Building2 },
      ],
    },
    {
      title: 'JARINGAN & INFRASTRUKTUR',
      items: [
        { id: 'odp', label: 'Lokasi ODP & Wilayah', icon: MapPin },
        { id: 'isolir', label: 'Web Isolir & Suspend', icon: ShieldAlert },
        { id: 'radius', label: 'RADIUS Server AAA', icon: Radio },
        { id: 'mikrotik', label: 'MikroTik RouterOS', icon: Server },
      ],
    },
    {
      title: 'KOMUNIKASI & MANAJEMEN',
      items: [
        { id: 'whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
        { id: 'company', label: 'Profil ISP & Branding', icon: Building },
        { id: 'employees', label: 'Karyawan & Hak Akses', icon: ShieldCheck },
        { id: 'mysql', label: 'Database MySQL & VSCode', icon: Database },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none z-30">
      {/* Header with Tenant Branding & Dropdown */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={onOpenTenantModal}
          className="w-full p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-left transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
              style={{ backgroundColor: currentTenant.primaryColorHex || '#6366f1' }}
            >
              {currentTenant.logoText}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-white block truncate group-hover:text-indigo-400 transition-colors">
                {currentTenant.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {currentTenant.domain}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />
        </button>

        <div className="mt-2.5 flex items-center justify-between px-1">
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Enterprise Full Fitur
          </span>
          <button
            onClick={goToMasterPortal}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            title="Kembali ke Portal Induk monisys.web.id"
          >
            <Globe className="w-3 h-3" /> monisys.web.id
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-1 overflow-y-auto space-y-5">
        {menuSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MoniSys Core v3.8</span>
        </div>
        <span className="font-mono text-slate-400">MySQL 8.0</span>
      </div>
    </aside>
  );
};
