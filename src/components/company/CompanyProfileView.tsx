import React, { useState } from 'react';
import {
  Building2,
  Palette,
  CreditCard,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Globe,
  Radio,
  Compass,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { BankAccount } from '../../types/isp';
import { MapCoordinatePicker } from '../maps/MapCoordinatePicker';

export const CompanyProfileView: React.FC = () => {
  const { currentTenant, updateTenantBranding } = useISP();

  const [name, setName] = useState(currentTenant.name);
  const [slogan, setSlogan] = useState(currentTenant.slogan);
  const [logoText, setLogoText] = useState(currentTenant.logoText);
  const [themeColor, setThemeColor] = useState(currentTenant.themeColor);
  const [phone, setPhone] = useState(currentTenant.phone);
  const [email, setEmail] = useState(currentTenant.email);
  const [address, setAddress] = useState(currentTenant.address);
  const [hqLat, setHqLat] = useState(currentTenant.hqLat || -6.9324);
  const [hqLng, setHqLng] = useState(currentTenant.hqLng || 107.7192);
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(currentTenant.coverageRadiusKm || 12);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(currentTenant.bankAccounts);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const colors = [
    { id: 'indigo', name: 'Navy Indigo', hex: '#6366f1' },
    { id: 'blue', name: 'Ocean Blue', hex: '#3b82f6' },
    { id: 'emerald', name: 'Emerald Cyber', hex: '#10b981' },
    { id: 'cyan', name: 'Electric Cyan', hex: '#06b6d4' },
    { id: 'violet', name: 'Deep Violet', hex: '#8b5cf6' },
  ];

  const handleAddBank = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        bankName: 'BCA',
        accountNumber: '8910000000',
        accountHolder: `PT ${name.toUpperCase()}`,
      },
    ]);
  };

  const handleRemoveBank = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const handleBankChange = (index: number, field: keyof BankAccount, val: string) => {
    const updated = [...bankAccounts];
    (updated[index] as any)[field] = val;
    setBankAccounts(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenColor = colors.find((c) => c.id === themeColor);

    updateTenantBranding({
      name,
      slogan,
      logoText,
      themeColor: themeColor as any,
      primaryColorHex: chosenColor?.hex || '#6366f1',
      phone,
      email,
      address,
      hqLat,
      hqLng,
      coverageRadiusKm,
      bankAccounts,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Data Perusahaan & Kustomisasi Tampilan ISP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalisasi nama ISP, logo teks, slogan, warna tema, rekening bank transfer, dan profil legal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
            Paket: {currentTenant.subscriptionPlan}
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profil perusahaan dan kustomisasi tampilan berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            Identitas Visual & Domain Tenant
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama ISP / Perusahaan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Logo Singkatan / Inisial</label>
              <input
                type="text"
                required
                maxLength={5}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subdomain Tenant</label>
              <input
                type="text"
                readOnly
                disabled
                value={currentTenant.domain}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Slogan ISP</label>
            <input
              type="text"
              required
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Theme Color Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Pilihan Warna Utama Tema Dashboard (Aksentuasi Visual)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {colors.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setThemeColor(c.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                    themeColor === c.id
                      ? 'border-white bg-slate-800 shadow-md'
                      : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs font-medium text-slate-200">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Kontak Resmi & Alamat Kantor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">No. Telepon / WhatsApp Resmi</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Billing & Helpdesk</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Alamat Kantor Pusat</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Titik Koordinat NOC & Pelebaran Radius Cakupan Layanan ISP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                Titik Koordinat NOC & Pelebaran Radius Cakupan Layanan ISP
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Geser pin di peta untuk memposisikan kantor NOC ISP Anda, dan sesuaikan slider untuk pelebaran radius coverage wilayah.
              </p>
            </div>
            <div className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Radius: {coverageRadiusKm} KM
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Latitude NOC ISP
              </label>
              <input
                type="number"
                step="any"
                value={hqLat}
                onChange={(e) => setHqLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Longitude NOC ISP
              </label>
              <input
                type="number"
                step="any"
                value={hqLng}
                onChange={(e) => setHqLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <MapCoordinatePicker
            lat={hqLat}
            lng={hqLng}
            onChange={(newLat, newLng) => {
              setHqLat(newLat);
              setHqLng(newLng);
            }}
            showRadius={true}
            radiusKm={coverageRadiusKm}
            onRadiusChange={(r) => setCoverageRadiusKm(r)}
            pinColor="indigo"
            pinLabel={name || 'Kantor NOC ISP'}
            title="Peta Interaktif Lokasi & Jangkauan Pelayanan (Coverage Area)"
            helperText="Geser pin indigo di peta atau klik untuk memindahkan lokasi server/NOC. Geser slider untuk mengatur pelebaran radius cakupan layanan Anda."
            height="280px"
          />
        </div>

        {/* Bank accounts for customer billing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Rekening Bank Perusahaan (Tujuan Transfer Pelanggan)
              </h3>
              <p className="text-xs text-slate-400">
                Akan otomatis terhubung dengan sinkronisasi mutasi Moota
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddBank}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Rekening
            </button>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((b, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Nama Bank</label>
                  <select
                    value={b.bankName}
                    onChange={(e) => handleBankChange(idx, 'bankName', e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="BSI">Bank BSI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={b.accountNumber}
                    onChange={(e) => handleBankChange(idx, 'accountNumber', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Atas Nama (Rekening)</label>
                  <input
                    type="text"
                    value={b.accountHolder}
                    onChange={(e) => handleBankChange(idx, 'accountHolder', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase"
                  />
                </div>

                <div className="flex justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveBank(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Perusahaan
          </button>
        </div>
      </form>
    </div>
  );
};
