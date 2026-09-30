import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { Customer } from '../../types/isp';

interface Props {
  onClose: () => void;
}

export const BulkImportModal: React.FC<Props> = ({ onClose }) => {
  const { bulkImportCustomers, odps, wilayahs } = useISP();
  const [parsedRows, setParsedRows] = useState<Partial<Customer>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Template CSV Generator
  const handleDownloadTemplate = () => {
    const csvContent =
      'customer_code,name,phone,email,address,package_name,speed_mbps,monthly_price,pppoe_username,pppoe_password,ip_address,mac_address,odp_code,wilayah_name,due_date_day\n' +
      'CFN-2001,Agus Setiawan,08123456701,agus@gmail.com,Jl. Merdeka No. 10,Paket Turbo 20 Mbps,20,165000,agus_pppoe,pass_agus123,10.50.20.10,A4:2B:B0:11:22:33,ODP-CBR-01,Wilayah Bandung Timur,10\n' +
      'CFN-2002,Maya Anggraeni,08123456702,maya@gmail.com,Jl. Dahlia No. 4,Paket Home 30 Mbps,30,175000,maya_pppoe,pass_maya123,10.50.20.11,A4:2B:B0:11:22:34,ODP-BBT-01,Wilayah Buahbatu,10\n' +
      'CFN-2003,Rizki Kurniawan,08123456703,rizki@gmail.com,Jl. Kenanga No. 8,Paket Ultra 50 Mbps,50,250000,rizki_pppoe,pass_rizki123,10.50.20.12,A4:2B:B0:11:22:35,ODP-ARC-01,Wilayah Arcamanik,15\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_pelanggan_monisys.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample data filler for quick test
  const handleLoadSampleData = () => {
    const samples: Partial<Customer>[] = [
      {
        customerCode: `CFN-${Math.floor(2100 + Math.random() * 800)}`,
        name: 'Bayu Pratama (Gamer)',
        phone: '081299881111',
        email: 'bayu.pratama@gmail.com',
        address: 'Jl. Venus Timur No. 12, Bandung',
        packageName: 'Paket Gamer 50 Mbps',
        speedMbps: 50,
        monthlyPrice: 250000,
        pppoeUsername: 'bayu_gamer',
        pppoePassword: 'pass_bayu2026',
        ipAddress: '10.50.20.21',
        macAddress: 'BC:24:11:AA:BB:01',
        odpId: odps[0]?.id || 'odp-01',
        odpName: odps[0]?.name || 'ODP-CBR-01',
        wilayahId: wilayahs[0]?.id || 'wil-01',
        wilayahName: wilayahs[0]?.name || 'Bandung Timur',
        dueDateDay: 10,
      },
      {
        customerCode: `CFN-${Math.floor(2100 + Math.random() * 800)}`,
        name: 'Klinik Medika Pratama',
        phone: '082188772222',
        email: 'klinik.medika@gmail.com',
        address: 'Jl. Ruko Soekarno Hatta No. 25',
        packageName: 'Paket Bisnis Office 100 Mbps',
        speedMbps: 100,
        monthlyPrice: 450000,
        pppoeUsername: 'klinik_medika',
        pppoePassword: 'pass_klinik2026',
        ipAddress: '10.50.20.22',
        macAddress: 'BC:24:11:AA:BB:02',
        odpId: odps[1]?.id || odps[0]?.id || 'odp-02',
        odpName: odps[1]?.name || 'ODP-BBT-01',
        wilayahId: wilayahs[1]?.id || wilayahs[0]?.id || 'wil-02',
        wilayahName: wilayahs[1]?.name || 'Buahbatu',
        dueDateDay: 10,
      },
      {
        customerCode: `CFN-${Math.floor(2100 + Math.random() * 800)}`,
        name: 'Toko Roti Prima Rasa',
        phone: '085711223344',
        email: 'primarasa@rotibandung.com',
        address: 'Jl. Antapani Raya No. 4',
        packageName: 'Paket Home Turbo 30 Mbps',
        speedMbps: 30,
        monthlyPrice: 175000,
        pppoeUsername: 'primarasa_cafe',
        pppoePassword: 'pass_prima2026',
        ipAddress: '10.50.20.23',
        macAddress: 'BC:24:11:AA:BB:03',
        odpId: odps[2]?.id || odps[0]?.id || 'odp-03',
        odpName: odps[2]?.name || 'ODP-ARC-01',
        wilayahId: wilayahs[2]?.id || wilayahs[0]?.id || 'wil-03',
        wilayahName: wilayahs[2]?.name || 'Arcamanik',
        dueDateDay: 15,
      },
    ];

    setParsedRows(samples);
    setFileName('contoh_pelanggan_baru.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return;

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: Partial<Customer>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < 3) continue;

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      rows.push({
        customerCode: rowObj.customer_code || `CFN-${Math.floor(2500 + Math.random() * 500)}`,
        name: rowObj.name || `Pelanggan ${i}`,
        phone: rowObj.phone || '081200000000',
        email: rowObj.email || '',
        address: rowObj.address || '',
        packageName: rowObj.package_name || 'Paket Turbo 20 Mbps',
        speedMbps: parseInt(rowObj.speed_mbps, 10) || 20,
        monthlyPrice: parseInt(rowObj.monthly_price, 10) || 165000,
        pppoeUsername: rowObj.pppoe_username || `user_bulk_${i}`,
        pppoePassword: rowObj.pppoe_password || 'pass12345',
        ipAddress: rowObj.ip_address || `10.50.20.${10 + i}`,
        macAddress: rowObj.mac_address || '',
        odpName: rowObj.odp_code || odps[0]?.name || 'ODP-Default',
        wilayahName: rowObj.wilayah_name || wilayahs[0]?.name || 'Wilayah Default',
        dueDateDay: parseInt(rowObj.due_date_day, 10) || 10,
      });
    }

    setParsedRows(rows);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const count = bulkImportCustomers(parsedRows);
      setIsProcessing(false);
      setImportSuccessCount(count);
      setTimeout(() => {
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Data Pelanggan Massal (CSV / Excel)</h2>
              <p className="text-xs text-slate-400">
                Impor puluhan hingga ratusan data pelanggan sekaligus dengan template terstandarisasi
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {importSuccessCount !== null ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Import Massal Berhasil!</h3>
              <p className="text-sm text-slate-300">
                Sebanyak <strong className="text-emerald-400 font-mono">{importSuccessCount}</strong> data pelanggan baru berhasil didaftarkan ke sistem dan invoice pertama langsung diterbitkan.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1 & 2 actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    Unduh Format Template CSV
                  </span>
                  <p className="text-xs text-slate-400">
                    Gunakan file template dengan kolom yang telah disesuaikan dengan database sistem billing ISP.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-2 px-3 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Template CSV (.csv)
                  </button>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    Coba Data Sampel Cepat
                  </span>
                  <p className="text-xs text-slate-400">
                    Tidak punya file CSV sekarang? Muat data simulasi 3 pelanggan instan untuk menguji fitur import.
                  </p>
                  <button
                    onClick={handleLoadSampleData}
                    className="w-full py-2 px-3 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gunakan Data Sampel Demo
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Upload File CSV Anda
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/50 cursor-pointer relative transition-colors">
                  <input
                    type="file"
                    accept=".csv, text/csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs font-medium text-slate-200 block">
                    {fileName ? fileName : 'Pilih file CSV atau geser (drag & drop) ke sini'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Mendukung format UTF-8 CSV dipisahkan tanda koma
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">
                      Pratinjau Data ({parsedRows.length} Baris Terbaca)
                    </h4>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Siap Diproses
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Kode</th>
                          <th className="py-2.5 px-3">Nama Pelanggan</th>
                          <th className="py-2.5 px-3">No WhatsApp</th>
                          <th className="py-2.5 px-3">Paket</th>
                          <th className="py-2.5 px-3">PPPoE User</th>
                          <th className="py-2.5 px-3">IP Address</th>
                          <th className="py-2.5 px-3">Wilayah & ODP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                        {parsedRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 text-indigo-400 font-semibold">{r.customerCode}</td>
                            <td className="py-2 px-3 text-slate-200 font-sans font-medium">{r.name}</td>
                            <td className="py-2 px-3 text-slate-400">{r.phone}</td>
                            <td className="py-2 px-3 text-slate-300 font-sans">{r.packageName}</td>
                            <td className="py-2 px-3 text-slate-400">{r.pppoeUsername}</td>
                            <td className="py-2 px-3 text-slate-400">{r.ipAddress}</td>
                            <td className="py-2 px-3 text-slate-400 font-sans">{r.wilayahName} - {r.odpName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {importSuccessCount === null && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>

            <button
              onClick={handleCommitImport}
              disabled={parsedRows.length === 0 || isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg shadow-lg shadow-indigo-900/40 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Memproses Data Massal...' : `Impor ${parsedRows.length} Pelanggan ke Database`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
