import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  Globe,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

interface Props {
  onClose: () => void;
}

export const TenantSelectorModal: React.FC<Props> = ({ onClose }) => {
  const { allTenants, currentTenant, switchTenant, registerNewTenant, goToMasterPortal } = useISP();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSelect = (tenantId: string) => {
    switchTenant(tenantId);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    registerNewTenant({ name, slug, phone, email });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pilih Tenant ISP</h2>
              <p className="text-xs text-slate-400">Pindah antarmuka ISP atau daftarkan subdomain baru</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isRegistering ? (
            <>
              <div className="space-y-2">
                {allTenants.map((t) => {
                  const isCurrent = t.id === currentTenant.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelect(t.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-md text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: t.primaryColorHex || '#6366f1' }}
                        >
                          {t.logoText}
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-white">{t.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{t.domain}</span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold font-mono">
                          <CheckCircle2 className="w-4 h-4" /> Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 hover:text-slate-200">Pilih ↗</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    goToMasterPortal();
                    onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Buka Portal monisys.web.id
                </button>

                <button
                  onClick={() => setIsRegistering(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Tambah Tenant Baru
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama ISP / Perusahaan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusantara Fiber Net"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subdomain Tenant</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs">
                  <input
                    type="text"
                    required
                    placeholder="nusantara"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                  <span className="text-slate-500 shrink-0">.monisys.web.id</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">No. WhatsApp Admin</label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Billing</label>
                <input
                  type="email"
                  required
                  placeholder="billing@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5"
                >
                  <span>Daftar & Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
