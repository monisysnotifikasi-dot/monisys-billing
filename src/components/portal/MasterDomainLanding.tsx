import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Server,
  DollarSign,
  Radio,
  MessageSquare,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';

interface Props {
  onTenantSelect: (tenantId: string) => void;
}

export const MasterDomainLanding: React.FC<Props> = ({ onTenantSelect }) => {
  const { allTenants, registerNewTenant } = useISP();

  const [ispName, setIspName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from ISP Name
  const handleNameChange = (val: string) => {
    setIspName(val);
    if (!slug || slug === ispName.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ispName || !slug) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      await registerNewTenant({
        name: ispName,
        slug,
        phone,
        email,
      });
      setIsSubmitting(false);
      
      // ✅ LANGSUNG ARAHKAN KE DOMAIN SLUG (xplorefiber.monisys.web.id)
      window.location.href = `https://${slug}.monisys.web.id`;
    }, 800);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
              M
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">MoniSys</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono ml-2 font-semibold">
                monisys.web.id
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#daftar"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-900/30"
            >
              Daftar ISP Baru
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Platform Multi-Tenant Monitoring & Billing ISP Indonesia
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Kelola Jaringan ISP, Billing Tagihan Link & Otomasi Mikrotik dalam Satu Dasbor
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Dilengkapi sinkronisasi mutasi bank otomatis via <strong>Moota</strong>, pembayaran <strong>QRIS</strong> instan, remote akses modem ONT pelanggan, web isolir otomatis, RADIUS server, dan WhatsApp gateway (Wablas/Fonnte).
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#daftar"
                  className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-900/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Mulai Registrasi Tenant</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#tenants"
                  className="px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
                >
                  Pilih Tenant Demo
                </a>
              </div>
            </div>

            {/* Visual Hero Banner with Generated Image Asset */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-video flex items-center justify-center">
              <img
                src="/src/assets/images/monisys_hero_network_1790771566249.jpg"
                alt="MoniSys Network Operations Center"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback styled gradient if asset path fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MoniSys FTTH Cloud Engine 2026
                  </div>
                  <p className="text-sm font-bold text-white mt-1">Multi-Tenant High Availability Network Stack</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Tenants Quick Access */}
        <section id="tenants" className="py-12 px-6 bg-slate-900/50 border-y border-slate-800/80">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">Tenant ISP yang Sedang Aktif</h2>
                <p className="text-xs text-slate-400">Pilih tenant di bawah untuk langsung masuk ke dasbor masing-masing domain</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTenants.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-md group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono">
                        {t.logoText}
                      </div>
                      <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-400 transition-colors">
                        {t.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono block">{t.domain}</span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Enterprise
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{t.slogan}</p>

                  <button
                    onClick={() => onTenantSelect(t.id)}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Masuk ke Dashboard Tenant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 1 Single Subscription Plan (Enterprise Full Fitur) */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Paket Berlangganan MoniSys
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Satu Pilihan Paket, Semua Fitur Tanpa Batas
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Tidak ada batasan jumlah pelanggan atau biaya tersembunyi. Satu paket lengkap untuk seluruh kebutuhan operasional ISP Anda.
            </p>

            <div className="pt-6">
              <div className="bg-gradient-to-b from-indigo-900/30 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 max-w-xl mx-auto shadow-2xl relative overflow-hidden text-left space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-bold uppercase">Paket Resmi</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">Enterprise Full Fitur</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-400">Rp 499.000</span>
                    <span className="text-xs text-slate-400 block font-sans">/ bulan flat</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Domain & Subdomain Sendiri: <strong>nama-isp.monisys.web.id</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sistem Tagihan by Link & Otomasi Mutasi Bank via <strong>Moota (BCA, Mandiri, BRI)</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pembayaran Otomatis <strong>QRIS Real-Time</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fitur <strong>Masuk Modem ONT Remote Langsung</strong> dari Dasbor Admin</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sistem <strong>Web Isolir & Auto-Suspend</strong> Terintegrasi Firewall MikroTik</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pemantauan Trafik <strong>Bandwidth Real-Time</strong> Grafis</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Notifikasi WhatsApp Otomatis: <strong>Wablas / Fonnte / Custom</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Upload Pelanggan Massal (CSV/Excel) & Unduh Template</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pemetaan ODP & Wilayah Lengkap dengan Koordinat GIS</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Database MySQL 8.0 & Kustomisasi Widget Dasbor</span>
                  </div>
                </div>

                <a
                  href="#daftar"
                  className="block w-full py-3 px-6 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/40 transition-colors"
                >
                  Daftarkan ISP Anda Sekarang
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tenant Registration Form */}
        <section id="daftar" className="py-16 px-6 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Formulir Pendaftaran Tenant Baru</h2>
              <p className="text-xs text-slate-400">
                Isi nama ISP dan nama domain yang diinginkan. Anda akan langsung dialihkan ke domain tenant Anda!
              </p>
            </div>

            <form onSubmit={handleRegister} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama ISP / Provider Anda
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Speed Fiber Net"
                  value={ispName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Subdomain Tenant
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs">
                  <input
                    type="text"
                    required
                    placeholder="megaspeed"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                  <span className="text-slate-500 shrink-0">.monisys.web.id</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Domain akses dashboard: <strong>{slug || 'nama'}.monisys.web.id</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">No. WhatsApp Admin</label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@ispanda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-300">
                <span>Paket Langganan:</span>
                <strong className="text-indigo-400">Enterprise Full Fitur (Rp 499.000 / bln)</strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/40 transition-colors flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Mendaftarkan Tenant...' : 'Daftar Tenant & Langsung Buka Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <div>MoniSys ISP Hub · Domain Induk: <strong className="text-slate-300 font-mono">monisys.web.id</strong></div>
        <p>© {new Date().getFullYear()} MoniSys Cloud Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
}