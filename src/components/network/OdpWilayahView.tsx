import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Plus,
  Compass,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Server,
  Share2,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { ODP, Wilayah } from '../../types/isp';
import { MapCoordinatePicker } from '../maps/MapCoordinatePicker';
import { ISPNetworkCoverageMap } from '../maps/ISPNetworkCoverageMap';

export const OdpWilayahView: React.FC = () => {
  const { odps, wilayahs, addODP, updateODP, deleteODP, addWilayah, updateWilayah, deleteWilayah } = useISP();

  const [activeTab, setActiveTab] = useState<'map' | 'odp' | 'wilayah'>('map');

  // ODP Modal State
  const [isOdpModalOpen, setIsOdpModalOpen] = useState(false);
  const [odpToEdit, setOdpToEdit] = useState<ODP | null>(null);
  const [odpCode, setOdpCode] = useState('');
  const [odpName, setOdpName] = useState('');
  const [odpWilayahId, setOdpWilayahId] = useState(wilayahs[0]?.id || '');
  const [odpCapacity, setOdpCapacity] = useState(16);
  const [odpLat, setOdpLat] = useState(-6.9324);
  const [odpLng, setOdpLng] = useState(107.7192);
  const [odpNotes, setOdpNotes] = useState('');

  // Wilayah Modal State
  const [isWilayahModalOpen, setIsWilayahModalOpen] = useState(false);
  const [wilayahToEdit, setWilayahToEdit] = useState<Wilayah | null>(null);
  const [wilCode, setWilCode] = useState('');
  const [wilName, setWilName] = useState('');
  const [wilLat, setWilLat] = useState(-6.9312);
  const [wilLng, setWilLng] = useState(107.7185);
  const [wilRadiusKm, setWilRadiusKm] = useState(3.5);
  const [wilDesc, setWilDesc] = useState('');

  // Handle ODP Submit
  const handleOdpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wil = wilayahs.find((w) => w.id === odpWilayahId);
    const payload: Partial<ODP> = {
      code: odpCode,
      name: odpName,
      wilayahId: odpWilayahId,
      wilayahName: wil?.name || 'Wilayah Default',
      capacity: odpCapacity,
      lat: odpLat,
      lng: odpLng,
      notes: odpNotes,
    };

    if (odpToEdit) {
      updateODP(odpToEdit.id, payload);
    } else {
      addODP(payload);
    }

    setIsOdpModalOpen(false);
    setOdpToEdit(null);
  };

  // Handle Wilayah Submit
  const handleWilayahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Wilayah> = {
      code: wilCode,
      name: wilName,
      centerLat: wilLat,
      centerLng: wilLng,
      coverageRadiusKm: wilRadiusKm,
      description: wilDesc,
    };

    if (wilayahToEdit) {
      updateWilayah(wilayahToEdit.id, payload);
    } else {
      addWilayah(payload);
    }

    setIsWilayahModalOpen(false);
    setWilayahToEdit(null);
  };

  const openOdpAdd = () => {
    setOdpToEdit(null);
    setOdpCode(`ODP-NEW-${Math.floor(10 + Math.random() * 90)}`);
    setOdpName('');
    setOdpWilayahId(wilayahs[0]?.id || '');
    setOdpCapacity(16);
    setOdpLat(-6.9324);
    setOdpLng(107.7192);
    setOdpNotes('');
    setIsOdpModalOpen(true);
  };

  const openOdpEdit = (o: ODP) => {
    setOdpToEdit(o);
    setOdpCode(o.code);
    setOdpName(o.name);
    setOdpWilayahId(o.wilayahId);
    setOdpCapacity(o.capacity);
    setOdpLat(o.lat);
    setOdpLng(o.lng);
    setOdpNotes(o.notes);
    setIsOdpModalOpen(true);
  };

  const openWilayahAdd = () => {
    setWilayahToEdit(null);
    setWilCode(`BDG-${Date.now().toString().slice(-3)}`);
    setWilName('');
    setWilLat(-6.93);
    setWilLng(107.71);
    setWilRadiusKm(3.5);
    setWilDesc('');
    setIsWilayahModalOpen(true);
  };

  const openWilayahEdit = (w: Wilayah) => {
    setWilayahToEdit(w);
    setWilCode(w.code);
    setWilName(w.name);
    setWilLat(w.centerLat);
    setWilLng(w.centerLng);
    setWilRadiusKm(w.coverageRadiusKm || 3.5);
    setWilDesc(w.description);
    setIsWilayahModalOpen(true);
  };

  // Stats
  const totalCapacity = odps.reduce((acc, o) => acc + o.capacity, 0);
  const totalUsed = odps.reduce((acc, o) => acc + o.usedPorts, 0);
  const portUtilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-400" />
            Manajemen Lokasi ODP & Wilayah Coverage
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data geolokasi FAT/ODP Fiber Optik, utilisasi port splitter, dan titik koordinat Google Maps
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'odp' ? (
            <button
              onClick={openOdpAdd}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Lokasi ODP
            </button>
          ) : (
            <button
              onClick={openWilayahAdd}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Wilayah Baru
            </button>
          )}
        </div>
      </div>

      {/* Utilization Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total ODP Terpasang</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {odps.length} <span className="text-xs font-normal text-slate-400">Titik FAT</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Tersebar di {wilayahs.length} Wilayah Cakupan</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Utilisasi Port ODP Global</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {totalUsed} / {totalCapacity} <span className="text-xs font-normal text-slate-400">Port ({portUtilization}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${portUtilization}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Port Tersedia untuk Pelanggan Baru</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {totalCapacity - totalUsed} <span className="text-xs font-normal text-slate-400">Port Kosong</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Siap untuk aktivasi pelanggan baru instan</p>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4 text-indigo-400" />
          Peta Geospasial (GIS) & Radius Coverage
        </button>
        <button
          onClick={() => setActiveTab('odp')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'odp'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-400" />
          Daftar ODP FAT ({odps.length})
        </button>
        <button
          onClick={() => setActiveTab('wilayah')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'wilayah'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          Wilayah & Area Cakupan ({wilayahs.length})
        </button>
      </div>

      {/* Tab: GIS Network & Coverage Map */}
      {activeTab === 'map' && <ISPNetworkCoverageMap />}

      {/* Tab: ODP List */}
      {activeTab === 'odp' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Kode & Nama ODP</th>
                    <th className="py-3 px-4">Wilayah</th>
                    <th className="py-3 px-4">Kapasitas & Pemakaian Port</th>
                    <th className="py-3 px-4">Titik Koordinat (GIS)</th>
                    <th className="py-3 px-4">Status & Catatan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {odps.map((odp) => {
                    const pct = Math.round((odp.usedPorts / odp.capacity) * 100);
                    const isFull = odp.usedPorts >= odp.capacity;

                    return (
                      <tr key={odp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100 text-sm font-mono text-emerald-400">
                            {odp.code}
                          </div>
                          <div className="text-slate-300 text-xs font-sans mt-0.5">{odp.name}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {odp.wilayahName}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono font-semibold text-slate-200">
                              {odp.usedPorts} / {odp.capacity} Port
                            </span>
                            <span className={`text-[10px] font-mono ${isFull ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="w-36 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-300 text-[11px] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{odp.lat.toFixed(6)}, {odp.lng.toFixed(6)}</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${odp.lat},${odp.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Buka Maps
                          </a>
                        </td>

                        <td className="py-3 px-4">
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
                              Port Penuh
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              Tersedia
                            </span>
                          )}
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{odp.notes || '-'}</p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openOdpEdit(odp)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Edit ODP"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus ODP ${odp.code}?`)) {
                                  deleteODP(odp.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Hapus ODP"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wilayah List */}
      {activeTab === 'wilayah' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wilayahs.map((w) => {
            const countOdp = odps.filter((o) => o.wilayahId === w.id).length;

            return (
              <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {w.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{w.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openWilayahEdit(w)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus wilayah ${w.name}?`)) {
                          deleteWilayah(w.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{w.description}</p>

                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Titik Pusat (Lat, Lng):</span>
                    <span className="text-slate-200">[{w.centerLat}, {w.centerLng}]</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total ODP Terpasang:</span>
                    <span className="text-emerald-400 font-semibold">{countOdp} Titik FAT</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${w.centerLat},${w.centerLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Lihat Area di Google Maps
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* ODP Modal */}
      {isOdpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {odpToEdit ? 'Edit Lokasi ODP' : 'Tambah ODP Fiber Optik Baru'}
            </h3>

            <form onSubmit={handleOdpSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kode ODP</label>
                  <input
                    type="text"
                    required
                    value={odpCode}
                    onChange={(e) => setOdpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kapasitas Port</label>
                  <select
                    value={odpCapacity}
                    onChange={(e) => setOdpCapacity(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  >
                    <option value={8}>8 Port</option>
                    <option value={16}>16 Port</option>
                    <option value={24}>24 Port</option>
                    <option value={32}>32 Port</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama / Keterangan Lokasi ODP</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ODP Cibiru Kulon RW 04"
                  value={odpName}
                  onChange={(e) => setOdpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Pilih Wilayah</label>
                <select
                  value={odpWilayahId}
                  onChange={(e) => setOdpWilayahId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  {wilayahs.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={odpLat}
                    onChange={(e) => setOdpLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={odpLng}
                    onChange={(e) => setOdpLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Interactive Draggable Pin for ODP */}
              <div className="pt-1">
                <MapCoordinatePicker
                  lat={odpLat}
                  lng={odpLng}
                  onChange={(newLat, newLng) => {
                    setOdpLat(newLat);
                    setOdpLng(newLng);
                  }}
                  pinColor="emerald"
                  pinLabel={odpCode || 'ODP FAT'}
                  title="Peta Titik ODP FAT (Geser Pin untuk Penempatan)"
                  helperText="Geser pin hijau di peta ke tiang atau titik lokasi ODP. Koordinat Lat/Lng otomatis terupdate."
                  height="220px"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Catatan Tambahan (Tiang, Splitter)</label>
                <textarea
                  rows={2}
                  value={odpNotes}
                  onChange={(e) => setOdpNotes(e.target.value)}
                  placeholder="e.g. Tiang PLN No. 44, splitter PLC 1:16"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOdpModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Simpan ODP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wilayah Modal */}
      {isWilayahModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {wilayahToEdit ? 'Edit Wilayah' : 'Tambah Wilayah Coverage Baru'}
            </h3>

            <form onSubmit={handleWilayahSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Kode Wilayah</label>
                <input
                  type="text"
                  required
                  value={wilCode}
                  onChange={(e) => setWilCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama Wilayah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wilayah Bandung Barat (Cimahi)"
                  value={wilName}
                  onChange={(e) => setWilName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Center Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={wilLat}
                    onChange={(e) => setWilLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Center Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={wilLng}
                    onChange={(e) => setWilLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Interactive Draggable Pin for Wilayah with Radius slider */}
              <div className="pt-1">
                <MapCoordinatePicker
                  lat={wilLat}
                  lng={wilLng}
                  onChange={(newLat, newLng) => {
                    setWilLat(newLat);
                    setWilLng(newLng);
                  }}
                  showRadius={true}
                  radiusKm={wilRadiusKm}
                  onRadiusChange={(r) => setWilRadiusKm(r)}
                  pinColor="purple"
                  pinLabel={wilCode || 'Wilayah'}
                  title="Peta Titik Pusat Wilayah & Pelebaran Radius (Geser Pin / Slider)"
                  helperText="Geser pin ungu untuk menentukan pusat cluster wilayah. Geser slider radius untuk mengatur pelebaran jangkauan wilayah."
                  height="220px"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Deskripsi Wilayah</label>
                <textarea
                  rows={2}
                  value={wilDesc}
                  onChange={(e) => setWilDesc(e.target.value)}
                  placeholder="Kawasan pemukiman, ruko, dll."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWilayahModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Simpan Wilayah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
