import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Wifi,
  DollarSign,
  Shield,
  Layers,
  Save,
  Compass,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Customer } from '../../types/isp';
import { MapCoordinatePicker } from '../maps/MapCoordinatePicker';

interface Props {
  customerToEdit?: Customer | null;
  onClose: () => void;
}

export const CustomerModal: React.FC<Props> = ({ customerToEdit, onClose }) => {
  const { addCustomer, updateCustomer, odps, wilayahs, packages } = useISP();

  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [email, setEmail] = useState(customerToEdit?.email || '');
  const [address, setAddress] = useState(customerToEdit?.address || '');

  // Package
  const initialPackage = packages.find((p) => p.name === customerToEdit?.packageName || p.id === customerToEdit?.packageId) || packages[0];
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    customerToEdit?.packageId || (initialPackage?.id || 'pkg-30')
  );
  const [packageName, setPackageName] = useState(
    customerToEdit?.packageName || (initialPackage?.name || 'Paket Home Turbo 30 Mbps')
  );
  const [speedMbps, setSpeedMbps] = useState<number>(
    customerToEdit?.speedMbps || (initialPackage?.speedDownloadMbps || 30)
  );
  const [monthlyPrice, setMonthlyPrice] = useState<number>(
    customerToEdit?.monthlyPrice || (initialPackage?.priceMonthly || 175000)
  );
  const [dueDateDay, setDueDateDay] = useState<number>(customerToEdit?.dueDateDay || 10);

  // Network & PPPoE
  const [pppoeUser, setPppoeUser] = useState(customerToEdit?.pppoeUsername || '');
  const [pppoePass, setPppoePass] = useState(customerToEdit?.pppoePassword || '');
  const [ipAddress, setIpAddress] = useState(customerToEdit?.ipAddress || '');
  const [macAddress, setMacAddress] = useState(customerToEdit?.macAddress || '');

  // Wilayah & ODP
  const [selectedWilayahId, setSelectedWilayahId] = useState<string>(
    customerToEdit?.wilayahId || (wilayahs[0]?.id || '')
  );
  const [selectedOdpId, setSelectedOdpId] = useState<string>(
    customerToEdit?.odpId || (odps[0]?.id || '')
  );

  // Coordinates
  const [lat, setLat] = useState<number>(customerToEdit?.lat || -6.9324);
  const [lng, setLng] = useState<number>(customerToEdit?.lng || 107.7192);

  // When Wilayah changes, pick the first matching ODP
  const filteredOdps = odps.filter((o) => !selectedWilayahId || o.wilayahId === selectedWilayahId);

  useEffect(() => {
    if (!customerToEdit && filteredOdps.length > 0) {
      const firstOdp = filteredOdps[0];
      setSelectedOdpId(firstOdp.id);
      setLat(firstOdp.lat + 0.0005);
      setLng(firstOdp.lng + 0.0005);
    }
  }, [selectedWilayahId]);

  // When ODP changes, adopt coordinates
  const handleOdpChange = (odpId: string) => {
    setSelectedOdpId(odpId);
    const chosenOdp = odps.find((o) => o.id === odpId);
    if (chosenOdp) {
      setLat(+(chosenOdp.lat + (Math.random() - 0.5) * 0.001).toFixed(6));
      setLng(+(chosenOdp.lng + (Math.random() - 0.5) * 0.001).toFixed(6));
    }
  };

  // Auto-generate credentials if empty
  useEffect(() => {
    if (!customerToEdit && name && !pppoeUser) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 10);
      const rand = Math.floor(100 + Math.random() * 899);
      setPppoeUser(`${slug}_${rand}`);
      setPppoePass(`pass_${rand}`);
      setIpAddress(`10.50.12.${Math.floor(20 + Math.random() * 180)}`);
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentWil = wilayahs.find((w) => w.id === selectedWilayahId);
    const currentOdp = odps.find((o) => o.id === selectedOdpId);

    const payload: Partial<Customer> = {
      name,
      phone,
      email,
      address,
      packageId: selectedPackageId,
      packageName,
      speedMbps,
      monthlyPrice,
      dueDateDay,
      pppoeUsername: pppoeUser,
      pppoePassword: pppoePass,
      ipAddress,
      macAddress,
      wilayahId: selectedWilayahId,
      wilayahName: currentWil?.name || 'Wilayah Default',
      odpId: selectedOdpId,
      odpName: currentOdp ? `${currentOdp.code} - ${currentOdp.name}` : 'ODP Default',
      lat,
      lng,
    };

    try {
      if (customerToEdit) {
        // JIKA EDIT: Panggil jalur PUT khusus update
        const res = await fetch(`http://localhost:3001/api/customers/${customerToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log('✅ Hasil Edit MySQL:', data);
        updateCustomer(customerToEdit.id, payload);
      } else {
        // JIKA BARU: Panggil jalur POST khusus tambah
        const res = await fetch('http://localhost:3001/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log('✅ Hasil Tambah MySQL:', data);
        addCustomer(payload);
      }
    } catch (err) {
      console.error('❌ Gagal menghubungi server MySQL:', err);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {customerToEdit ? 'Edit Data Pelanggan' : 'Registrasi Pelanggan Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi biodata, pemilihan ODP, wilayah, koordinat GIS, dan akun PPPoE
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Customer Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              1. Identitas Pelanggan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahmat Hidayat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  No. WhatsApp (Notifikasi Tagihan)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="e.g. rahmat@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alamat Lengkap Pemasangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jl. Cibiru Raya Blok C No. 12"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ODP & Wilayah with Coordinates (Requested Requirement) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              2. Wilayah, ODP & Titik Koordinat Pelanggan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dropdown Wilayah */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Wilayah / Coverage Area
                </label>
                <select
                  value={selectedWilayahId}
                  onChange={(e) => setSelectedWilayahId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {wilayahs.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Pusat Wilayah: [{wilayahs.find(w => w.id === selectedWilayahId)?.centerLat}, {wilayahs.find(w => w.id === selectedWilayahId)?.centerLng}]
                </span>
              </div>

              {/* Dropdown ODP */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih ODP (Optical Distribution Point)
                </label>
                <select
                  value={selectedOdpId}
                  onChange={(e) => handleOdpChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {filteredOdps.length === 0 ? (
                    <option value="">Tidak ada ODP di wilayah ini</option>
                  ) : (
                    filteredOdps.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.code} - {o.name} ({o.usedPorts}/{o.capacity} Port - {o.status === 'full' ? 'PENUH' : 'Tersedia'})
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Kapasitas FAT Port ODP terpilih
                </span>
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Koordinat Latitude (Garis Lintang)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Koordinat Longitude (Garis Bujur)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Interactive Draggable Map Pin Picker */}
            <div className="pt-2">
              <MapCoordinatePicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                pinLabel={name || 'Pelanggan'}
                pinColor="blue"
                title="Peta Lokasi Pemasangan (Geser Pin untuk Mengubah Koordinat)"
                helperText="Geser pin biru atau klik peta di titik rumah pelanggan. Koordinat Latitude & Longitude di atas akan terisi otomatis secara real-time."
                height="240px"
              />
            </div>
          </div>

          {/* Section 3: Package & Billing */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              3. Paket & Jadwal Tagihan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paket Berlangganan</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => {
                    const pkgId = e.target.value;
                    setSelectedPackageId(pkgId);
                    const found = packages.find((p) => p.id === pkgId);
                    if (found) {
                      setPackageName(found.name);
                      setSpeedMbps(found.speedDownloadMbps);
                      setMonthlyPrice(found.priceMonthly);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.speedDownloadMbps} Mbps) - Rp {pkg.priceMonthly.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tarif Bulanan (Rp)</label>
                <input
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal Jatuh Tempo</label>
                <select
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={5}>Tanggal 5 tiap bulan</option>
                  <option value={10}>Tanggal 10 tiap bulan</option>
                  <option value={15}>Tanggal 15 tiap bulan</option>
                  <option value={20}>Tanggal 20 tiap bulan</option>
                  <option value={25}>Tanggal 25 tiap bulan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: PPPoE & Router Network */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              4. Akun PPPoE & Alamat IP
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username PPPoE</label>
                <input
                  type="text"
                  required
                  value={pppoeUser}
                  onChange={(e) => setPppoeUser(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password PPPoE</label>
                <input
                  type="text"
                  required
                  value={pppoePass}
                  onChange={(e) => setPppoePass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">IP Framed Address</label>
                <input
                  type="text"
                  required
                  placeholder="10.50.12.x"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">MAC Address (Opsional)</label>
                <input
                  type="text"
                  placeholder="F4:8E:38:2A:41:09"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-900/40 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {customerToEdit ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
