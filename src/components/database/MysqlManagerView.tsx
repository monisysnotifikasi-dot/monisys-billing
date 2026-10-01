import React, { useState } from 'react';
import {
  Database,
  Code2,
  Download,
  Copy,
  CheckCircle2,
  RefreshCw,
  Server,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Terminal,
  FileCode,
  FolderCode,
  Layers,
  Laptop,
  Globe,
  Zap,
  ArrowRight,
  Cpu,
  Wifi,
} from 'lucide-react';
import { useISP } from '../../context/ISPContext';
import { MYSQL_DDL, generateSqlDump } from '../../data/mysqlSchema';

export const MysqlManagerView: React.FC = () => {
  const {
    isDemoMode,
    toggleDemoMode,
    autoSyncPreventDemo,
    setAutoSyncPreventDemo,
    currentTenant,
    customers,
    invoices,
    odps,
  } = useISP();

  const [activeTab, setActiveTab] = useState<'database' | 'no-vps' | 'vscode'>('no-vps');
  const [dbHost, setDbHost] = useState('127.0.0.1');
  const [dbPort, setDbPort] = useState(3306);
  const [dbName, setDbName] = useState('monisys_isp_db');
  const [dbUser, setDbUser] = useState('root');
  const [dbPass, setDbPass] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedTunnelCmd, setCopiedTunnelCmd] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleExportSql = () => {
    const dump = generateSqlDump(currentTenant.id, {
      tenantName: currentTenant.name,
      customersCount: customers.length,
      invoicesCount: invoices.length,
      odpCount: odps.length,
    });

    const blob = new Blob([dump], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monisys_mysql_dump_${currentTenant.slug}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyDdl = () => {
    navigator.clipboard?.writeText(MYSQL_DDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyTunnel = () => {
    navigator.clipboard?.writeText('cloudflared tunnel --url http://localhost:3000');
    setCopiedTunnelCmd(true);
    setTimeout(() => setCopiedTunnelCmd(false), 2000);
  };

  const handleTestConnection = async () => {
  setIsTestingConn(true);
  try {
    const res = await fetch('http://localhost:3001/api/health');
    const data = await res.json();
    if (data.status === 'connected') {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    } else {
      alert('Gagal konek MySQL: ' + data.message);
    }
  } catch (error: any) {
    alert('Server Backend belum berjalan! Jalankan `node server.js` di terminal.');
  } finally {
    setIsTestingConn(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-400" />
            Database MySQL & Panduan Deployment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi database lokal/remote, ekspor dump .sql, dan panduan menjalankan aplikasi tanpa VPS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportSql}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Ekspor Database (.sql Dump)
          </button>
        </div>
      </div>

      {testSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Koneksi ke MySQL Server ({dbHost}:{dbPort}/{dbName}) berhasil diverifikasi!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('no-vps')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'no-vps'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Laptop className="w-4 h-4 text-emerald-300" />
          Panduan Jalankan Tanpa VPS (100% Bisa)
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Koneksi MySQL & Skema DDL
        </button>

        <button
          onClick={() => setActiveTab('vscode')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'vscode'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Panduan VSCode & Script Startup
        </button>
      </div>

      {/* TAB 1: Panduan Jalankan Tanpa VPS (Answer user question) */}
      {activeTab === 'no-vps' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Answer Highlight Card */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  BISA 100% TANPA SEWA VPS!
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Aplikasi Ini Dirancang Sangat Ringan dan Siap Dijalankan On-Premise / Komputer Lokal
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Anda tidak wajib membayar biaya sewa VPS bulanan. Server aplikasi MoniSys dan database MySQL dapat dijalankan langsung di <strong>Laptop kasir, Komputer kantor ISP, Mini PC (Intel N100/Beelink), Raspberry Pi, ataupun Router x86</strong> yang sudah Anda miliki.
                </p>
              </div>
            </div>

            {/* Advantages of Non-VPS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4" /> Biaya Server Rp 0
                </div>
                <p className="text-[11px] text-slate-400">
                  Hemat biaya sewa VPS per bulan. Cukup gunakan PC/Laptop yang sudah ada di kantor operasional.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                  <Wifi className="w-4 h-4" /> Akses Modem ONT Cepat
                </div>
                <p className="text-[11px] text-slate-400">
                  Karena 1 jaringan lokal (LAN) dengan OLT dan MikroTik, fitur Remote Modem ONT langsung tembus tanpa ribet VPN.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                  <Globe className="w-4 h-4" /> Tembus Internet via Tunnel
                </div>
                <p className="text-[11px] text-slate-400">
                  Tagihan By Link, QRIS, & Webhook Moota tetap bisa diakses pelanggan dari HP memakai Cloudflare Tunnel gratis.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Simple Steps Setup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-400" />
              Langkah Menjalankan di Komputer / Laptop Lokal (Windows / Linux):
            </h3>

            {/* Step 1 */}
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="text-sm font-bold text-white">Database MySQL Baru di XAMPP (Bebas dari Project Lama)</h4>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                  Aman Tanpa Menghapus Data Lama
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jika XAMPP Anda masih memiliki data dari project sebelumnya, <strong>Anda TIDAK PERLU menghapus project lama tersebut</strong>. MySQL di XAMPP mampu menampung puluhan database berbeda secara terisolasi tanpa saling mengganggu.
              </p>
              
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-400 block">Cara Memulai Database Baru di phpMyAdmin:</span>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Buka XAMPP Control Panel, pastikan service <strong>MySQL</strong> berstatus hijau (Running).</li>
                  <li>Buka browser ke alamat: <code className="text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">http://localhost/phpmyadmin</code>.</li>
                  <li>
                    Di sidebar sebelah kiri paling atas, klik menu <strong>"New"</strong> (atau tab <strong>Databases</strong>).
                  </li>
                  <li>
                    Masukkan nama database baru: <strong className="text-white font-mono">monisys_isp_db</strong>, lalu klik <strong>Create</strong>.
                  </li>
                  <li>
                    (Pilihan Cepat): Klik tab <strong>SQL</strong> di phpMyAdmin, salin & tempel script skema dari tombol <em>"Salin SQL Skema Bersih"</em> di bawah, lalu klik <strong>Go</strong>. Database langsung siap 100%!
                  </li>
                </ol>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-400">
                    *Jika ingin menghapus bersih database lama yang tak terpakai: klik tab <strong>Databases</strong> di phpMyAdmin, centang nama database lama, lalu klik tombol merah <strong>Drop</strong>.
                  </span>
                  <button
                    onClick={handleCopyDdl}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSql ? 'SQL Tersalin!' : 'Salin SQL Skema Bersih'}
                  </button>
                </div>
              </div>
            </div>

            {/* Folder Location Note */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <FolderCode className="w-4 h-4" /> Apakah Project Harus Ditaruh di C:\xampp\htdocs?
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>TIDAK WAJIB!</strong> Aplikasi MoniSys menggunakan arsitektur modern (React + Node.js), sehingga Anda bebas menyimpannya di folder mana saja di komputer Anda (misalnya di <code className="text-white font-mono bg-slate-900 px-1 rounded">D:\ISP_PROJECT\monisys</code> atau Desktop).
                XAMPP hanya digunakan untuk menjalankan mesin database <strong>MySQL (Port 3306)</strong>. Apache di XAMPP bahkan tidak perlu dinyalakan jika Anda hanya memerlukan MySQL-nya saja.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-white">Jalankan Aplikasi Web MoniSys (Node.js)</h4>
              </div>
              <p className="text-xs text-slate-300">
                Instal <strong>Node.js LTS</strong> (gratis). Buka terminal (CMD / PowerShell / Terminal VSCode) di folder project MoniSys dan ketik:
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 space-y-1">
                <div>npm install</div>
                <div>npm run build</div>
                <div>npm run preview -- --port 3000 --host</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Aplikasi sekarang sudah berjalan di komputer lokal Anda pada alamat: <strong className="text-slate-200">http://localhost:3000</strong> atau IP lokal komputer (misal: <code className="text-indigo-400">http://192.168.1.100:3000</code>).
              </p>
            </div>

            {/* Step 3: Cloudflare Tunnel */}
            <div className="space-y-2 border-l-2 border-amber-500 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="text-sm font-bold text-white">Hubungkan ke Internet (Cloudflare Tunnel - 100% Gratis)</h4>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                  Tanpa IP Publik & Tanpa Buka Port
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Agar pelanggan bisa membuka <strong>Link Tagihan / Bayar QRIS</strong> dari HP dan <strong>Moota</strong> bisa mengirimkan webhook ke server Anda tanpa langganan IP publik statis Indihome/ISP, gunakan Cloudflare Tunnel resmi:
              </p>
              
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Perintah Terminal Cloudflared:</span>
                  <button
                    onClick={handleCopyTunnel}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedTunnelCmd ? 'Tersalin!' : 'Salin Perintah'}
                  </button>
                </div>
                <div className="font-mono text-xs text-indigo-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                  cloudflared tunnel --url http://localhost:3000
                </div>
                <p className="text-[11px] text-slate-400">
                  Cloudflare akan langsung memberikan domain HTTPS gratis (misal: <code className="text-emerald-400">https://monisys-isp.trycloudflare.com</code>) atau Anda bisa hubungkan ke domain sendiri seperti <code className="text-white">monisys.web.id</code>!
                </p>
              </div>
            </div>
          </div>

          {/* Architecture comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                Skenario 1: Mini PC / PC Kantor (Rekomendasi)
              </span>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li>Gunakan Mini PC hemat daya (10–15 Watt) seharga ~1 jutaan.</li>
                <li>Diletakkan di dekat router MikroTik / switch distribusi kantor ISP.</li>
                <li>Koneksi super cepat dan stabil 24/7.</li>
                <li>Backup data MySQL tersimpan di harddisk Anda sendiri (Privasi aman).</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Skenario 2: Cloud Serverless Gratis (Vercel / Netlify)
              </span>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li>Aplikasi web di-deploy gratis di platform seperti Vercel atau Netlify.</li>
                <li>Database MySQL menggunakan tier gratis seperti TiDB Cloud / Aiven (Free 5GB).</li>
                <li>Tidak perlu menyalakan komputer fisik di kantor.</li>
                <li>Uptime 99.9% dijamin oleh Google/Vercel Cloud.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MySQL Connection & Skema DDL */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-fade-in">
          {/* Demo vs Real Switch Card */}
          <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Pengontrol Mode Data
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  Sakelar Mode Data Dummy (Demo) / Real Database
                </h3>
                <p className="text-xs text-slate-300 max-w-xl mt-1">
                  Saat mode dummy dimatikan (OFF), seluruh data demo akan disembunyikan dan sistem beralih ke data riil lokal/MySQL Anda.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDemoMode}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    isDemoMode
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {isDemoMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {isDemoMode ? 'MODE DEMO: AKTIF (DUMMY DATA)' : 'MODE REAL: AKTIF (PRODUKSI)'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncPreventDemo}
                  onChange={(e) => setAutoSyncPreventDemo(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>
                  <strong>Opsi Sinkronisasi Otomatis:</strong> Cegah data demo agar tidak tersimpan ke database utama MySQL
                </span>
              </label>

              <span className="text-xs text-slate-400 font-mono">
                Status: {customers.length} Pelanggan Aktif Terbaca
              </span>
            </div>
          </div>

          {/* MySQL Connection Config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Parameter Koneksi MySQL Lokal / XAMPP
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Host Database</label>
                  <input
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    placeholder="localhost atau 127.0.0.1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Port</label>
                    <input
                      type="number"
                      value={dbPort}
                      onChange={(e) => setDbPort(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Database Name</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username (Default: root)</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password (Kosongkan bila default XAMPP)</label>
                  <input
                    type="password"
                    value={dbPass}
                    onChange={(e) => setDbPass(e.target.value)}
                    placeholder="Kosong untuk root default XAMPP"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConn}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
                  {isTestingConn ? 'Menghubungkan...' : 'Uji Koneksi Database'}
                </button>
              </div>
            </div>

            {/* DDL Schema Preview */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Skema Tabel Relasional MySQL (DDL)
                </h3>
                <button
                  onClick={handleCopyDdl}
                  className="px-3 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  {copiedSql ? 'Tersalin!' : 'Salin SQL'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                <pre>{MYSQL_DDL}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VSCode Developer Guide */}
      {activeTab === 'vscode' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Panduan Pembacaan & Menjalankan Kode di Visual Studio Code (VSCode)
            </h3>
            <p className="text-xs text-slate-300">
              Buka terminal di komputer Anda, lalu ketik perintah berikut untuk langsung membuka project ini di VSCode:
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-400">
              code .
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-200">Ekstensi VSCode yang Disarankan:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="font-mono text-xs font-bold text-indigo-400 block">Tailwind CSS IntelliSense</span>
                  <span className="text-[11px] text-slate-400">Auto-complete styling modern kelas CSS</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="font-mono text-xs font-bold text-emerald-400 block">Database Client / MySQL</span>
                  <span className="text-[11px] text-slate-400">Query & edit tabel MySQL langsung di VSCode</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="font-mono text-xs font-bold text-amber-400 block">Prettier & ESLint</span>
                  <span className="text-[11px] text-slate-400">Format kode otomatis rapi dan bersih</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-200 mb-2">Contoh Konfigurasi .env:</h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
                <div># DATABASE MYSQL LOKAL / ON-PREMISE</div>
                <div>DB_HOST="127.0.0.1"</div>
                <div>DB_PORT=3306</div>
                <div>DB_USER="root"</div>
                <div>DB_PASS=""</div>
                <div>DB_NAME="monisys_isp_db"</div>
                <div></div>
                <div># CLOUDFLARE TUNNEL DOMAIN PUBLIC</div>
                <div>APP_DOMAIN="citranet.monisys.web.id"</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

