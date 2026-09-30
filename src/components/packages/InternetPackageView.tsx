import React, { useState } from 'react';
import {
  Wifi,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Server,
  Copy,
  Users,
  DollarSign,
  X,
  Save,
  Check,
  Star,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { InternetPackage } from '../../types/isp';

export const InternetPackageView: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, currentTenant, customers } = useISP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<InternetPackage | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [speedDownload, setSpeedDownload] = useState(30);
  const [speedUpload, setSpeedUpload] = useState(30);
  const [priceMonthly, setPriceMonthly] = useState(175000);
  const [rateLimit, setRateLimit] = useState('30M/30M');
  const [profileName, setProfileName] = useState('PROFILE-30M');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  const [copiedScript, setCopiedScript] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // When speeds change, auto-update rateLimit & profileName if unmodified
  const handleSpeedDownloadChange = (val: number) => {
    setSpeedDownload(val);
    setRateLimit(`${val}M/${speedUpload}M`);
    setProfileName(`PROFILE-${val}M`);
  };

  const handleSpeedUploadChange = (val: number) => {
    setSpeedUpload(val);
    setRateLimit(`${speedDownload}M/${val}M`);
  };

  const openAdd = () => {
    setPackageToEdit(null);
    setName('');
    setSpeedDownload(30);
    setSpeedUpload(30);
    setPriceMonthly(175000);
    setRateLimit('30M/30M');
    setProfileName('PROFILE-30M');
    setDescription('');
    setFeaturesText('Unlimited Kuota Tanpa FUP, Kecepatan Simetris 1:1, Peminjaman Modem ONT GPON, Support 24/7');
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEdit = (pkg: InternetPackage) => {
    setPackageToEdit(pkg);
    setName(pkg.name);
    setSpeedDownload(pkg.speedDownloadMbps);
    setSpeedUpload(pkg.speedUploadMbps);
    setPriceMonthly(pkg.priceMonthly);
    setRateLimit(pkg.rateLimitMikrotik);
    setProfileName(pkg.mikrotikProfileName);
    setDescription(pkg.description);
    setFeaturesText(pkg.features.join(', '));
    setIsPopular(pkg.isPopular || false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload: Partial<InternetPackage> = {
      name,
      speedDownloadMbps: speedDownload,
      speedUploadMbps: speedUpload,
      priceMonthly,
      rateLimitMikrotik: rateLimit,
      mikrotikProfileName: profileName,
      description,
      features: features.length > 0 ? features : ['Unlimited Kuota Tanpa FUP', 'Support 24/7'],
      isPopular,
    };

    if (packageToEdit) {
      updatePackage(packageToEdit.id, payload);
      setSavedAlert(`Paket "${name}" berhasil diperbarui!`);
    } else {
      addPackage(payload);
      setSavedAlert(`Paket baru "${name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSavedAlert(null), 3500);
  };

  // Generate All MikroTik PPP Profiles Script
  const generateMikrotikPppScript = () => {
    return (
      `# MIKROTIK ROUTEROS PPP PROFILES SCRIPT FOR ${currentTenant.name.toUpperCase()}\n` +
      `/ppp profile\n` +
      packages
        .map(
          (p) =>
            `add name="${p.mikrotikProfileName}" rate-limit="${p.rateLimitMikrotik}" local-address=10.50.0.1 remote-address=pool-pppoe dns-server=8.8.8.8,1.1.1.1 comment="${p.name} - Rp ${p.priceMonthly.toLocaleString('id-ID')}"`
        )
        .join('\n')
    );
  };

  const handleCopyMikrotikScript = () => {
    navigator.clipboard?.writeText(generateMikrotikPppScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Dynamic subscriber count helper
  const getPackageSubscriberCount = (pkg: InternetPackage) => {
    const directCount = customers.filter(
      (c) => c.packageId === pkg.id || c.packageName.toLowerCase().includes(pkg.name.toLowerCase()) || pkg.name.toLowerCase().includes(c.packageName.toLowerCase())
    ).length;
    return directCount > 0 ? directCount : (pkg.activeSubscriberCount || 0);
  };

  // Stats
  const totalSubscribers = packages.reduce((acc, p) => acc + getPackageSubscriberCount(p), 0);
  const avgPrice =
    packages.length > 0
      ? Math.round(packages.reduce((acc, p) => acc + p.priceMonthly, 0) / packages.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wifi className="w-6 h-6 text-indigo-400" />
            Manajemen Paket Layanan Internet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi profil kecepatan (Download/Upload Mbps), tarif langganan, dan sinkronisasi PPP Profile MikroTik
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyMikrotikScript}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            {copiedScript ? 'Script Tersalin!' : 'Salin Script MikroTik Profile'}
          </button>

          <button
            onClick={openAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Paket Baru
          </button>
        </div>
      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Paket Aktif</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {packages.length} <span className="text-xs font-normal text-slate-400">Varian Paket</span>
          </div>
          <p className="text-[11px] text-indigo-400 mt-1">Mulai 20 Mbps hingga 200 Mbps</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Rata-rata Tarif Paket</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            Rp {avgPrice.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">/ bln</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Skema tarif bulanan simetris</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Pelanggan Terhubung ke Paket</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {totalSubscribers} <span className="text-xs font-normal text-slate-400">Pelanggan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Terdistribusi di jaringan FTTH {currentTenant.name}</p>
        </div>
      </div>

      {/* Packages Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden shadow-lg ${
              pkg.isPopular
                ? 'border-indigo-500/80 shadow-indigo-950/50 bg-gradient-to-b from-indigo-950/20 to-slate-900'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Popular Ribbon */}
            {pkg.isPopular && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-300" /> Paling Laris
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                  {pkg.mikrotikProfileName}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pkg.description || 'Koneksi FTTH berkecepatan tinggi.'}</p>
              </div>

              {/* Speed Meter Badge */}
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ArrowDownRight className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-base font-bold tabular-nums">{pkg.speedDownloadMbps}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">Down (Mbps)</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div className="flex items-center gap-1.5 text-blue-400">
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-base font-bold tabular-nums">{pkg.speedUploadMbps}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">Up (Mbps)</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300 block">{pkg.rateLimitMikrotik}</span>
                  <span className="text-[10px] text-slate-500 block font-sans">Rate-Limit</span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="py-2 border-y border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    Rp {pkg.priceMonthly.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-400"> / bulan</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-300 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  <span>{getPackageSubscriberCount(pkg)} Pelanggan</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 text-xs text-slate-300">
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bottom Bar */}
            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => openEdit(pkg)}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Paket
              </button>

              <button
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus paket "${pkg.name}"?`)) {
                    deletePackage(pkg.id);
                  }
                }}
                className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                title="Hapus Paket"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {packageToEdit ? 'Edit Paket Internet' : 'Tambah Paket Internet Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Paket Internet</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paket Gamer Extreme 100 Mbps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Speeds & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Download Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={speedDownload}
                    onChange={(e) => handleSpeedDownloadChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Upload Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={speedUpload}
                    onChange={(e) => handleSpeedUploadChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tarif Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    step={1000}
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* MikroTik Profile & Rate-Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Profile MikroTik PPP
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PROFILE-50M"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Nama profile yang ada di RouterOS
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rate-Limit (Upload/Download)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="30M/30M"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Format MikroTik: [rx/tx] e.g. 50M/50M
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan peruntukan pelanggan (keluarga, kantor, dsb.)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fitur-fitur Unggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Unlimited Kuota Tanpa FUP, IP Statis, Support 24/7"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Tandai sebagai <strong>Paket Populer / Rekomendasi</strong> (Badge Bintang)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/30"
                >
                  <Save className="w-4 h-4" />
                  Simpan Paket Internet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
