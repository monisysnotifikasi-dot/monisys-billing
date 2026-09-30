import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Radio,
  Layers,
  Users,
  Building2,
  Server,
  Maximize2,
  Save,
  CheckCircle2,
  Filter,
  Navigation,
  ExternalLink,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { ODP, Wilayah, Customer } from '../../types/isp';

export const ISPNetworkCoverageMap: React.FC = () => {
  const { currentTenant, updateTenantBranding, odps, wilayahs, customers } = useISP();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Layer groups refs
  const ispHqMarkerRef = useRef<any>(null);
  const ispRadiusCircleRef = useRef<any>(null);
  const wilayahLayerGroupRef = useRef<any>(null);
  const odpLayerGroupRef = useRef<any>(null);
  const customerLayerGroupRef = useRef<any>(null);
  const cablesLayerGroupRef = useRef<any>(null);

  // States
  const [hqLat, setHqLat] = useState<number>(currentTenant.hqLat || -6.9324);
  const [hqLng, setHqLng] = useState<number>(currentTenant.hqLng || 107.7192);
  const [coverageRadiusKm, setCoverageRadiusKm] = useState<number>(currentTenant.coverageRadiusKm || 12);
  const [isHqDraggable, setIsHqDraggable] = useState<boolean>(true);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Visibility filters
  const [showIspRadius, setShowIspRadius] = useState<boolean>(true);
  const [showWilayah, setShowWilayah] = useState<boolean>(true);
  const [showOdps, setShowOdps] = useState<boolean>(true);
  const [showCustomers, setShowCustomers] = useState<boolean>(true);
  const [showFiberCables, setShowFiberCables] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'standard' | 'satellite'>('dark');

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'isp' | 'odp' | 'customer' | 'wilayah';
    data: any;
  } | null>({
    type: 'isp',
    data: {
      name: currentTenant.name,
      domain: currentTenant.domain,
      lat: hqLat,
      lng: hqLng,
      radiusKm: coverageRadiusKm,
    },
  });

  // Calculate Distance in Km between two lat/lng
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Stats calculation
  const coveredOdps = odps.filter((o) => calculateDistanceKm(hqLat, hqLng, o.lat, o.lng) <= coverageRadiusKm);
  const coveredCustomers = customers.filter(
    (c) => calculateDistanceKm(hqLat, hqLng, c.lat, c.lng) <= coverageRadiusKm
  );
  const coverageAreaSqKm = Math.round(Math.PI * Math.pow(coverageRadiusKm, 2));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [hqLat, hqLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Tile layer
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: mapStyle === 'dark' ? 'dark-tiles' : '',
    }).addTo(map);

    // Layer groups
    wilayahLayerGroupRef.current = L.layerGroup().addTo(map);
    odpLayerGroupRef.current = L.layerGroup().addTo(map);
    customerLayerGroupRef.current = L.layerGroup().addTo(map);
    cablesLayerGroupRef.current = L.layerGroup().addTo(map);

    // Initial render of all elements
    renderIspHq(map, hqLat, hqLng, coverageRadiusKm, isHqDraggable);
    renderWilayahMarkers();
    renderOdpMarkers();
    renderCustomerMarkers();
    renderFiberCables();

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: mapStyle === 'dark' ? 'dark-tiles' : '',
    }).addTo(map);
  }, [mapStyle]);

  // Render ISP HQ and Coverage Circle
  const renderIspHq = (
    map: any,
    latVal: number,
    lngVal: number,
    radiusVal: number,
    draggableVal: boolean
  ) => {
    if (ispHqMarkerRef.current) {
      map.removeLayer(ispHqMarkerRef.current);
    }
    if (ispRadiusCircleRef.current) {
      map.removeLayer(ispRadiusCircleRef.current);
    }

    // Custom Icon for ISP HQ (Tower)
    const ispHqIcon = L.divIcon({
      className: 'custom-isp-hq-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: ${
          draggableVal ? 'grab' : 'pointer'
        };">
          <div style="
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: #ffffff;
            border: 2px solid #a5b4fc;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 8px 16px rgba(79, 70, 229, 0.4);
            display: flex;
            align-items: center;
            gap: 5px;
          ">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background-color: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
            Pusat NOC: ${currentTenant.name}
          </div>
          <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.6));">
            <path d="M20 0C8.9543 0 0 8.9543 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 8.9543 31.0457 0 20 0Z" fill="#6366f1"/>
            <circle cx="20" cy="20" r="14" fill="#0f172a"/>
            <!-- Transmitter Tower Icon -->
            <path d="M20 10L14 26H26L20 10Z" fill="#38bdf8"/>
            <path d="M12 28H28M10 24C10 24 13 18 20 18C27 18 30 24 30 24" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });

    const marker = L.marker([latVal, lngVal], {
      draggable: draggableVal,
      icon: ispHqIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.on('drag', (e: any) => {
      const pos = (e.target as any).getLatLng();
      const nLat = Number(pos.lat.toFixed(6));
      const nLng = Number(pos.lng.toFixed(6));
      setHqLat(nLat);
      setHqLng(nLng);
      if (ispRadiusCircleRef.current) {
        ispRadiusCircleRef.current.setLatLng(pos);
      }
    });

    marker.on('dragend', (e: any) => {
      const pos = (e.target as any).getLatLng();
      const nLat = Number(pos.lat.toFixed(6));
      const nLng = Number(pos.lng.toFixed(6));
      setHqLat(nLat);
      setHqLng(nLng);
      if (ispRadiusCircleRef.current) {
        ispRadiusCircleRef.current.setLatLng(pos);
      }
      setSelectedEntity({
        type: 'isp',
        data: {
          name: currentTenant.name,
          domain: currentTenant.domain,
          lat: nLat,
          lng: nLng,
          radiusKm: coverageRadiusKm,
        },
      });
    });

    marker.on('click', () => {
      setSelectedEntity({
        type: 'isp',
        data: {
          name: currentTenant.name,
          domain: currentTenant.domain,
          lat: latVal,
          lng: lngVal,
          radiusKm: coverageRadiusKm,
        },
      });
    });

    ispHqMarkerRef.current = marker;

    // Coverage Circle
    if (showIspRadius) {
      const circle = L.circle([latVal, lngVal], {
        radius: radiusVal * 1000,
        color: '#6366f1',
        weight: 2,
        dashArray: '8, 8',
        fillColor: '#6366f1',
        fillOpacity: 0.12,
      }).addTo(map);

      ispRadiusCircleRef.current = circle;
    }
  };

  // Re-sync ISP HQ Marker & Radius when states update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderIspHq(mapInstanceRef.current, hqLat, hqLng, coverageRadiusKm, isHqDraggable);
  }, [hqLat, hqLng, coverageRadiusKm, isHqDraggable, showIspRadius]);

  // Render Wilayah Markers & Boundary Circles
  const renderWilayahMarkers = () => {
    if (!wilayahLayerGroupRef.current) return;
    wilayahLayerGroupRef.current.clearLayers();

    if (!showWilayah) return;

    wilayahs.forEach((wil) => {
      const wilIcon = L.divIcon({
        className: 'custom-wilayah-icon',
        html: `
          <div style="background-color: #1e1b4b; color: #c7d2fe; border: 1.5px solid #818cf8; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translate(-50%, -50%);">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #818cf8;"></span>
            ${wil.code}
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([wil.centerLat, wil.centerLng], { icon: wilIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'wilayah', data: wil });
      });
      wilayahLayerGroupRef.current?.addLayer(marker);

      // Wilayah boundary circle (e.g. 3-4 km)
      const wilCircle = L.circle([wil.centerLat, wil.centerLng], {
        radius: (wil.coverageRadiusKm || 3.5) * 1000,
        color: '#818cf8',
        weight: 1.5,
        dashArray: '4, 6',
        fillColor: '#4338ca',
        fillOpacity: 0.07,
      });
      wilayahLayerGroupRef.current?.addLayer(wilCircle);
    });
  };

  useEffect(() => {
    renderWilayahMarkers();
  }, [wilayahs, showWilayah]);

  // Render ODP FAT Markers
  const renderOdpMarkers = () => {
    if (!odpLayerGroupRef.current) return;
    odpLayerGroupRef.current.clearLayers();

    if (!showOdps) return;

    odps.forEach((odp) => {
      const isFull = odp.usedPorts >= odp.capacity;
      const hexColor = isFull ? '#ef4444' : '#10b981';

      const odpIcon = L.divIcon({
        className: 'custom-odp-icon',
        html: `
          <div style="transform: translate(-50%, -100%); cursor: pointer; display: flex; flex-direction: column; align-items: center;">
            <div style="background: #0f172a; border: 1.5px solid ${hexColor}; color: #f8fafc; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); margin-bottom: 2px;">
              ${odp.code} (${odp.usedPorts}/${odp.capacity})
            </div>
            <div style="width: 22px; height: 22px; border-radius: 6px; background-color: ${hexColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px ${hexColor}66; border: 2px solid #ffffff;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/>
                <line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [30, 38],
        iconAnchor: [15, 38],
      });

      const marker = L.marker([odp.lat, odp.lng], { icon: odpIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'odp', data: odp });
      });
      odpLayerGroupRef.current?.addLayer(marker);
    });
  };

  useEffect(() => {
    renderOdpMarkers();
  }, [odps, showOdps]);

  // Render Customer Markers
  const renderCustomerMarkers = () => {
    if (!customerLayerGroupRef.current) return;
    customerLayerGroupRef.current.clearLayers();

    if (!showCustomers) return;

    customers.forEach((cust) => {
      const isIsolated = cust.status === 'isolated';
      const hexColor = isIsolated ? '#ef4444' : '#38bdf8';

      const custIcon = L.divIcon({
        className: 'custom-customer-icon',
        html: `
          <div style="transform: translate(-50%, -50%); cursor: pointer; width: 14px; height: 14px; border-radius: 9999px; background-color: ${hexColor}; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.5);" title="${cust.name}">
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([cust.lat, cust.lng], { icon: custIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'customer', data: cust });
      });
      customerLayerGroupRef.current?.addLayer(marker);
    });
  };

  useEffect(() => {
    renderCustomerMarkers();
  }, [customers, showCustomers]);

  // Render Fiber Cable PolyLines (Connecting Customers to their ODP)
  const renderFiberCables = () => {
    if (!cablesLayerGroupRef.current) return;
    cablesLayerGroupRef.current.clearLayers();

    if (!showFiberCables) return;

    customers.forEach((cust) => {
      const odp = odps.find((o) => o.id === cust.odpId);
      if (odp) {
        const polyline = L.polyline(
          [
            [cust.lat, cust.lng],
            [odp.lat, odp.lng],
          ],
          {
            color: cust.status === 'isolated' ? '#ef4444' : '#0ea5e9',
            weight: 1.5,
            opacity: 0.6,
            dashArray: '4, 4',
          }
        );
        cablesLayerGroupRef.current?.addLayer(polyline);
      }
    });
  };

  useEffect(() => {
    renderFiberCables();
  }, [customers, odps, showFiberCables]);

  // Save updated ISP coordinates and coverage radius
  const handleSaveIspCoordinates = () => {
    updateTenantBranding({
      hqLat,
      hqLng,
      coverageRadiusKm,
    });
    setSavedAlert('Titik koordinat NOC & radius cakupan ISP berhasil diperbarui ke database!');
    setTimeout(() => setSavedAlert(null), 3500);
  };

  // Center on entity
  const handleFlyTo = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-indigo-400" />
            Peta Geospasial (GIS) & Radius Cakupan Layanan ISP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi distribusi jaringan FTTH, titik ODP FAT, pelanggan, dan penyesuaian pelebaran radius coverage ISP
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleFlyTo(hqLat, hqLng)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Pusat NOC
          </button>

          <button
            onClick={handleSaveIspCoordinates}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi Cakupan
          </button>
        </div>
      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Radius Cakupan ISP</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {coverageRadiusKm} <span className="text-xs font-normal text-slate-400">KM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Luas Area: ~{coverageAreaSqKm} km²</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">ODP Dalam Cakupan</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {coveredOdps.length} / {odps.length} <span className="text-xs font-normal text-slate-400">Titik</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            {Math.round((coveredOdps.length / (odps.length || 1)) * 100)}% FAT Terlindungi
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Pelanggan Tercover</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {coveredCustomers.length} / {customers.length} <span className="text-xs font-normal text-slate-400">User</span>
          </div>
          <p className="text-[11px] text-blue-400/80 mt-1">
            {Math.round((coveredCustomers.length / (customers.length || 1)) * 100)}% Dalam Radius
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Wilayah Operasional</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {wilayahs.length} <span className="text-xs font-normal text-slate-400">Cluster Area</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{currentTenant.name}</p>
        </div>
      </div>

      {/* Main Interactive Map & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Interactive Map */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
            {/* The Map Div */}
            <div
              ref={mapContainerRef}
              style={{ height: '560px', width: '100%' }}
              className="z-10 focus:outline-none"
            />

            {/* Top Control Bar inside Map */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              {/* Map Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setShowIspRadius(!showIspRadius)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showIspRadius ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Radius ISP ({coverageRadiusKm}km)
                </button>

                <button
                  type="button"
                  onClick={() => setShowWilayah(!showWilayah)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showWilayah ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Wilayah ({wilayahs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setShowOdps(!showOdps)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showOdps ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  ODP FAT ({odps.length})
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustomers(!showCustomers)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showCustomers ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Pelanggan ({customers.length})
                </button>

                <button
                  type="button"
                  onClick={() => setShowFiberCables(!showFiberCables)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showFiberCables ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kabel Drop
                </button>
              </div>

              {/* Map Basemap Style */}
              <div className="flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setMapStyle('dark')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    mapStyle === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark GIS
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('standard')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    mapStyle === 'standard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  OpenStreetMap
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    mapStyle === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satelit
                </button>
              </div>
            </div>

            {/* Bottom HUD Bar inside Map */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">Mode Geser Pin Pusat ISP:</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHqDraggable}
                    onChange={(e) => setIsHqDraggable(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>{isHqDraggable ? 'Aktif (Pin dapat digeser langsung)' : 'Terkunci'}</span>
                </label>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400">NOC Lat:</span>{' '}
                  <span className="text-emerald-400 font-bold">{hqLat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-slate-400">NOC Lng:</span>{' '}
                  <span className="text-blue-400 font-bold">{hqLng.toFixed(6)}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${hqLat},${hqLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-sans font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> G-Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Coverage Controller & Entity Details */}
        <div className="space-y-4">
          {/* Pelebaran Wilayah & Radius Customizer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Custom Pelebaran Wilayah</h3>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Auto Resizing
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Radius Cakupan (Km):</span>
                  <span className="font-bold font-mono text-indigo-400 text-sm">{coverageRadiusKm} KM</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={0.5}
                  value={coverageRadiusKm}
                  onChange={(e) => setCoverageRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[5, 10, 15, 25].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCoverageRadiusKm(preset)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                      coverageRadiusKm === preset
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {preset} km
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Jangkauan Garis Lurus:</span>
                  <span className="font-mono text-white">{(coverageRadiusKm * 1000).toLocaleString('id-ID')} Meter</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Luas Area:</span>
                  <span className="font-mono text-emerald-400">~{coverageAreaSqKm} km²</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ODP Masuk Jangkauan:</span>
                  <span className="font-mono text-indigo-400 font-bold">{coveredOdps.length} ODP</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pelanggan Tercover:</span>
                  <span className="font-mono text-blue-400 font-bold">{coveredCustomers.length} User</span>
                </div>
              </div>

              <button
                onClick={handleSaveIspCoordinates}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-950"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Radius ke Profil ISP
              </button>
            </div>
          </div>

          {/* Entity Inspector Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Detail Titik Terpilih
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {selectedEntity?.type || 'None'}
              </span>
            </div>

            {selectedEntity?.type === 'isp' && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{currentTenant.name} (NOC)</div>
                <p className="text-slate-400">{currentTenant.address}</p>
                <div className="p-2.5 bg-slate-950 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-emerald-400">Lat: {hqLat.toFixed(6)}</div>
                  <div className="text-blue-400">Lng: {hqLng.toFixed(6)}</div>
                  <div className="text-indigo-400">Radius: {coverageRadiusKm} KM</div>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 Tips: Aktifkan mode &quot;Geser Pin&quot; di bagian bawah peta untuk memindahkan posisi NOC ISP ke lokasi sebenarnya.
                </p>
              </div>
            )}

            {selectedEntity?.type === 'odp' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{selectedEntity.data.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedEntity.data.usedPorts >= selectedEntity.data.capacity
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {selectedEntity.data.usedPorts >= selectedEntity.data.capacity ? 'PENUH' : 'TERSEDIA'}
                  </span>
                </div>
                <p className="text-slate-300 font-medium">{selectedEntity.data.name}</p>
                <div className="p-2.5 bg-slate-950 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-slate-400">Wilayah: {selectedEntity.data.wilayahName}</div>
                  <div className="text-emerald-400">
                    Port: {selectedEntity.data.usedPorts} / {selectedEntity.data.capacity} Port
                  </div>
                  <div className="text-slate-400">Lat: {selectedEntity.data.lat}</div>
                  <div className="text-slate-400">Lng: {selectedEntity.data.lng}</div>
                </div>
                <p className="text-[11px] text-slate-400">{selectedEntity.data.notes}</p>
              </div>
            )}

            {selectedEntity?.type === 'customer' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{selectedEntity.data.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedEntity.data.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : selectedEntity.data.status === 'isolated'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {selectedEntity.data.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-400">{selectedEntity.data.customerCode} · {selectedEntity.data.phone}</div>
                <div className="p-2.5 bg-slate-950 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-indigo-400 font-semibold">{selectedEntity.data.packageName}</div>
                  <div className="text-slate-400">PPPoE: {selectedEntity.data.pppoeUsername}</div>
                  <div className="text-slate-400">IP: {selectedEntity.data.ipAddress}</div>
                  <div className="text-slate-400">ODP: {selectedEntity.data.odpName}</div>
                  <div className="text-emerald-400">Lat: {selectedEntity.data.lat}</div>
                  <div className="text-blue-400">Lng: {selectedEntity.data.lng}</div>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{selectedEntity.data.address}</p>
              </div>
            )}

            {selectedEntity?.type === 'wilayah' && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{selectedEntity.data.name}</div>
                <p className="text-slate-400">{selectedEntity.data.code}</p>
                <div className="p-2.5 bg-slate-950 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-slate-400">Total ODP: {selectedEntity.data.totalOdp} Box</div>
                  <div className="text-slate-400">Total Pelanggan: {selectedEntity.data.totalCustomers} User</div>
                  <div className="text-emerald-400">Center Lat: {selectedEntity.data.centerLat}</div>
                  <div className="text-blue-400">Center Lng: {selectedEntity.data.centerLng}</div>
                  <div className="text-indigo-400">Radius: {selectedEntity.data.coverageRadiusKm || 3.5} KM</div>
                </div>
                <p className="text-[11px] text-slate-400">{selectedEntity.data.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
