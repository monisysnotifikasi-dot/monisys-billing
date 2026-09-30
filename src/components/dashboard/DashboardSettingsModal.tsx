import React, { useState } from 'react';
import { X, Sliders, ArrowUp, ArrowDown, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { DashboardWidgetConfig } from '../../types/isp';

interface Props {
  onClose: () => void;
}

export const DashboardSettingsModal: React.FC<Props> = ({ onClose }) => {
  const { dashboardWidgets, updateDashboardWidgets } = useISP();
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>([...dashboardWidgets]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // update order field
    const reordered = updated.map((w, i) => ({ ...w, order: i + 1 }));
    setWidgets(reordered);
  };

  const handleSave = () => {
    updateDashboardWidgets(widgets);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kustomisasi Tata Letak Dashboard</h2>
              <p className="text-xs text-slate-400">
                Pilih widget yang ingin ditampilkan dan atur urutan penempatan sesuai kebutuhan operasional ISP
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tata letak dashboard berhasil disimpan!
            </div>
          )}

          <p className="text-xs text-slate-400 mb-2">
            Gunakan tombol panah untuk menaikkan/menurunkan urutan widget, atau ikon mata untuk menyembunyikan:
          </p>

          <div className="space-y-2">
            {widgets.map((w, idx) => (
              <div
                key={w.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  w.enabled
                    ? 'bg-slate-950/70 border-slate-700 text-slate-100'
                    : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs font-mono font-bold flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">{w.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                      Kategori: {w.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Move Up */}
                  <button
                    disabled={idx === 0}
                    onClick={() => moveWidget(idx, 'up')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 disabled:opacity-30 rounded-lg"
                    title="Geser ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    disabled={idx === widgets.length - 1}
                    onClick={() => moveWidget(idx, 'down')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 disabled:opacity-30 rounded-lg"
                    title="Geser ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle View */}
                  <button
                    onClick={() => toggleWidget(w.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      w.enabled
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={w.enabled ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {w.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-900/40 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Terapkan Tata Letak
          </button>
        </div>
      </div>
    </div>
  );
};
