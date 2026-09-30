import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation,
  Copy,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Layers,
  Radio,
} from 'lucide-react';

interface MapCoordinatePickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  title?: string;
  helperText?: string;
  pinLabel?: string;
  pinColor?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'red';
  showRadius?: boolean;
  radiusKm?: number;
  onRadiusChange?: (radiusKm: number) => void;
  height?: string;
  minZoom?: number;
  maxZoom?: number;
}

export const MapCoordinatePicker: React.FC<MapCoordinatePickerProps> = ({
  lat,
  lng,
  onChange,
  title,
  helperText = 'Klik peta atau geser (drag) pin merah/biru untuk menentukan titik koordinat otomatis.',
  pinLabel = 'Titik Lokasi',
  pinColor = 'indigo',
  showRadius = false,
  radiusKm = 5,
  onRadiusChange,
  height = '280px',
  minZoom = 5,
  maxZoom = 19,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [copied, setCopied] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapTileStyle, setMapTileStyle] = useState<'dark' | 'standard' | 'satellite'>('dark');

  // Generate SVG custom pin according to pinColor
  const getPinColorHex = (color: string) => {
    switch (color) {
      case 'emerald':
        return '#10b981';
      case 'purple':
        return '#a855f7';
      case 'amber':
        return '#f59e0b';
      case 'blue':
        return '#3b82f6';
      case 'red':
        return '#ef4444';
      case 'indigo':
      default:
        return '#6366f1';
    }
  };

  const createPinIcon = (color: string, label: string) => {
    const hex = getPinColorHex(color);
    const htmlMarkup = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
        <div style="
          background-color: #0f172a;
          color: #f8fafc;
          border: 1px solid ${hex};
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background-color: ${hex}; animation: pulse 2s infinite;"></span>
          ${label}
        </div>
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${hex}"/>
          <circle cx="17" cy="17" r="8" fill="#0f172a"/>
          <circle cx="17" cy="17" r="4.5" fill="#ffffff"/>
        </svg>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: htmlMarkup,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default fallback coordinates if NaN or 0
    const initialLat = Number.isFinite(lat) && lat !== 0 ? lat : -6.9324;
    const initialLng = Number.isFinite(lng) && lng !== 0 ? lng : 107.7192;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      minZoom,
      maxZoom,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Tile layers
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapTileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: mapTileStyle === 'dark' ? 'dark-tiles' : '',
    }).addTo(map);

    // Draggable Marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createPinIcon(pinColor, pinLabel),
    }).addTo(map);

    markerRef.current = marker;

    // Drag events: continuous and on drag end
    marker.on('drag', (e: any) => {
      const pos = (e.target as any).getLatLng();
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      if (circleRef.current) {
        circleRef.current.setLatLng(pos);
      }
    });

    marker.on('dragend', (e: any) => {
      const pos = (e.target as any).getLatLng();
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      if (circleRef.current) {
        circleRef.current.setLatLng(pos);
      }
    });

    // Click to relocate pin
    map.on('click', (e: any) => {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLng]);
      if (circleRef.current) {
        circleRef.current.setLatLng([newLat, newLng]);
      }
      onChange(newLat, newLng);
    });

    // Coverage Radius Circle (if showRadius is true)
    if (showRadius) {
      const hex = getPinColorHex(pinColor);
      const circle = L.circle([initialLat, initialLng], {
        radius: (radiusKm || 5) * 1000,
        color: hex,
        weight: 2,
        dashArray: '5, 5',
        fillColor: hex,
        fillOpacity: 0.15,
      }).addTo(map);
      circleRef.current = circle;
    }

    // Force map to render correctly when container opens inside modal
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapTileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: mapTileStyle === 'dark' ? 'dark-tiles' : '',
    }).addTo(map);

    // Re-bring marker to front
    if (markerRef.current) {
      markerRef.current.setZIndexOffset(1000);
    }
  }, [mapTileStyle]);

  // Sync position from external state (e.g. text inputs)
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;

    const currentPos = markerRef.current.getLatLng();
    if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
      markerRef.current.setLatLng([lat, lng]);
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Sync Radius changes
  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setRadius((radiusKm || 5) * 1000);
  }, [radiusKm]);

  // Trigger GPS Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung pendeteksi lokasi Geolocation.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const newLat = Number(pos.coords.latitude.toFixed(6));
        const newLng = Number(pos.coords.longitude.toFixed(6));

        onChange(newLat, newLng);

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([newLat, newLng]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Geolocation warning:', err.message);
        alert('Gagal mengambil titik GPS: ' + err.message + '. Anda tetap bisa menggeser pin secara manual di peta.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Copy LatLng to Clipboard
  const handleCopyCoordinates = () => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Center view on marker
  const handleCenterOnMarker = () => {
    if (mapInstanceRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            {title}
          </label>
          <span className="text-[10px] text-slate-400">Interaktif Drag & Click Pin</span>
        </div>
      )}

      {/* Map Card Container */}
      <div className="relative rounded-xl border border-slate-700/80 overflow-hidden bg-slate-950 shadow-inner group">
        {/* The Leaflet Div */}
        <div
          ref={mapContainerRef}
          style={{ height, width: '100%' }}
          className="z-10 focus:outline-none"
        />

        {/* Floating Top-Right Controls */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
          {/* Map Style Selector */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-0.5 shadow-md">
            <button
              type="button"
              onClick={() => setMapTileStyle('dark')}
              className={`px-2 py-1 text-[10px] font-semibold rounded ${
                mapTileStyle === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Peta Gelap"
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setMapTileStyle('standard')}
              className={`px-2 py-1 text-[10px] font-semibold rounded ${
                mapTileStyle === 'standard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Peta Standar OSM"
            >
              Jalan
            </button>
            <button
              type="button"
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2 py-1 text-[10px] font-semibold rounded ${
                mapTileStyle === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Satelit Esri"
            >
              Satelit
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gpsLoading}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-700 rounded-lg shadow-md transition-all flex items-center justify-center"
              title="Ambil Lokasi GPS Saya Saat Ini"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleCenterOnMarker}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg shadow-md transition-all flex items-center justify-center"
              title="Pusatkan Peta ke Pin Koordinat"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Bottom HUD: Lat/Lng Display */}
        <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-white shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans">Lat:</span>
              <span className="font-bold text-emerald-400">{lat?.toFixed(6) ?? '0.000000'}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans">Lng:</span>
              <span className="font-bold text-blue-400">{lng?.toFixed(6) ?? '0.000000'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyCoordinates}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
              title="Salin Latitude & Longitude"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>

            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg flex items-center gap-1 transition-colors border border-indigo-500/30"
              title="Buka di Google Maps"
            >
              <ExternalLink className="w-3 h-3" />
              G-Maps
            </a>
          </div>
        </div>
      </div>

      {/* Customizable Coverage Radius Slider (if showRadius is true) */}
      {showRadius && onRadiusChange && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Radius Cakupan Area (Coverage):</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <span>{radiusKm} km</span>
              <span className="text-[10px] text-slate-400 font-normal">({(radiusKm * 1000).toLocaleString('id-ID')} m)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={50}
              step={0.5}
              value={radiusKm}
              onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex items-center gap-1">
              {[2, 5, 10, 15, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onRadiusChange(preset)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                    radiusKm === preset
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {preset}k
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            Lingkaran di peta merepresentasikan estimasi jangkauan pancaran sinyal / coverage FTTH FAT & Wireless.
          </p>
        </div>
      )}

      {/* Helper Guidance Text */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span>{helperText}</span>
      </p>
    </div>
  );
};
