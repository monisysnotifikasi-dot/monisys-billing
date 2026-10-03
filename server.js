import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { RouterOSAPI } from 'node-routeros';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Konfigurasi Koneksi ke Database Cloud TiDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: process.env.DB_USER || 'htV2A7R5gESTKEf.root',
  password: process.env.DB_PASSWORD || 'FJzneNDKei1xUmZW',
  database: process.env.DB_NAME || 'db_monitoring_billing',
  port: Number(process.env.DB_PORT) || 4000,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((conn) => {
    console.log('✅ BERHASIL TERHUBUNG KE MYSQL (db_monitoring_billing)!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ GAGAL KONEKSI KE MYSQL:', err.message);
  });

app.get('/api/health', (req, res) => {
  res.json({ status: 'connected' });
});

// ==========================================
// 1. PELANGGAN (CUSTOMERS) - AMBIL, SIMPAN/EDIT, HAPUS
// ==========================================
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    console.log(`Mengambil ${rows.length} pelanggan dari MySQL.`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. TAMBAH PELANGGAN BARU (MURNI INSERT)
// ==========================================
app.post('/api/customers', async (req, res) => {
  const c = req.body;
  console.log('➕ Mendaftarkan pelanggan baru:', c.name);

  try {
    const insertSql = `
      INSERT INTO customers 
      (id, customer_code, name, phone, email, address, package_id, odp_id, wilayah_id, lat, lng, due_date_day, pppoe_username, pppoe_password, ip_address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(insertSql, [
      c.id || `cust-${Date.now()}`,
      c.customerCode || `CFN-${Math.floor(1000 + Math.random() * 9000)}`,
      c.name || 'Pelanggan Baru',
      c.phone || '-',
      c.email || '',
      c.address || '',
      c.packageId || null,
      c.odpId || null,
      c.wilayahId || null,
      c.lat || null,
      c.lng || null,
      c.dueDateDay || 10,
      c.pppoeUsername || '',
      c.pppoePassword || '',
      c.ipAddress || '',
      c.status || 'active'
    ]);

    console.log('✅ SUKSES: Pelanggan baru berhasil didaftarkan ke MySQL!');
    res.json({ success: true, message: 'Pelanggan baru berhasil disimpan' });
  } catch (err) {
    console.error('❌ Gagal tambah pelanggan:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. EDIT PELANGGAN (MURNI UPDATE BY ID)
// ==========================================
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  console.log(`✏️ Memperbarui data pelanggan ID: ${id} (${c.name})`);

  try {
    const updateSql = `
      UPDATE customers SET
        name = ?, phone = ?, email = ?, address = ?,
        package_id = ?, odp_id = ?, wilayah_id = ?,
        lat = ?, lng = ?, due_date_day = ?,
        pppoe_username = ?, pppoe_password = ?, ip_address = ?
      WHERE id = ?
    `;
    await pool.query(updateSql, [
      c.name, c.phone, c.email, c.address,
      c.packageId || null, c.odpId || null, c.wilayahId || null,
      c.lat || null, c.lng || null, c.dueDateDay || 10,
      c.pppoeUsername || '', c.pppoePassword || '', c.ipAddress || '',
      id
    ]);

    console.log(`✅ SUKSES: Data pelanggan ID ${id} berhasil diperbarui di MySQL!`);
    res.json({ success: true, message: 'Data pelanggan berhasil diperbarui' });
  } catch (err) {
    console.error('❌ Gagal update pelanggan:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Menerima permintaan HAPUS pelanggan ID: ${id}`);

  try {
    await pool.query('DELETE FROM invoices WHERE customer_id = ?', [id]);
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);

    console.log(`✅ SUKSES: Pelanggan ID ${id} berhasil dihapus dari MySQL!`);
    res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    console.error('❌ Gagal menghapus pelanggan:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. PAKET INTERNET (PACKAGES)
// ==========================================
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM internet_packages');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/packages', async (req, res) => {
  const p = req.body;
  try {
    const sql = `
      INSERT INTO internet_packages 
      (id, name, speed_download_mbps, speed_upload_mbps, price_monthly, rate_limit_mikrotik, mikrotik_profile_name, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      name = VALUES(name), speed_download_mbps = VALUES(speed_download_mbps),
      speed_upload_mbps = VALUES(speed_upload_mbps), price_monthly = VALUES(price_monthly),
      rate_limit_mikrotik = VALUES(rate_limit_mikrotik), mikrotik_profile_name = VALUES(mikrotik_profile_name),
      description = VALUES(description)
    `;
    await pool.query(sql, [
      p.id, p.name, p.speedDownloadMbps || 20, p.speedUploadMbps || 20,
      p.priceMonthly || 150000, p.rateLimitMikrotik || '20M/20M',
      p.mikrotikProfileName || 'PROFILE', p.description || ''
    ]);
    console.log('✅ SUKSES update Paket Internet di MySQL:', p.name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. WILAYAH (COVERAGE AREA)
// ==========================================
app.get('/api/wilayah', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wilayah');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wilayah', async (req, res) => {
  const w = req.body;
  try {
    const sql = `
      INSERT INTO wilayah (id, code, name, center_lat, center_lng, coverage_radius_km, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      code = VALUES(code), name = VALUES(name), center_lat = VALUES(center_lat),
      center_lng = VALUES(center_lng), coverage_radius_km = VALUES(coverage_radius_km),
      description = VALUES(description)
    `;
    await pool.query(sql, [
      w.id, w.code, w.name, w.centerLat || -6.93, w.centerLng || 107.71,
      w.coverageRadiusKm || 3.0, w.description || ''
    ]);
    console.log('✅ SUKSES update Wilayah di MySQL:', w.name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ODP (OPTICAL DISTRIBUTION POINT)
// ==========================================
app.get('/api/odps', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM odps');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/odps', async (req, res) => {
  const o = req.body;
  try {
    const sql = `
      INSERT INTO odps (id, code, name, wilayah_id, capacity, used_ports, lat, lng, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      code = VALUES(code), name = VALUES(name), wilayah_id = VALUES(wilayah_id),
      capacity = VALUES(capacity), used_ports = VALUES(used_ports),
      lat = VALUES(lat), lng = VALUES(lng), status = VALUES(status), notes = VALUES(notes)
    `;
    await pool.query(sql, [
      o.id, o.code, o.name, o.wilayahId || null, o.capacity || 16,
      o.usedPorts || 0, o.lat || -6.93, o.lng || 107.71,
      o.status || 'active', o.notes || ''
    ]);
    console.log('✅ SUKSES update ODP di MySQL:', o.name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// 1. AMBIL KONFIGURASI MIKROTIK DARI MYSQL
// ==========================================
app.get('/api/mikrotik/config', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mikrotik_configs WHERE id = 'primary_router' LIMIT 1");
    if (rows.length > 0) {
      console.log('📡 Berhasil memuat konfigurasi MikroTik dari MySQL.');
      res.json(rows[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('❌ Gagal ambil konfigurasi MikroTik:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. SIMPAN / UPDATE KONFIGURASI KE MYSQL
// ==========================================
app.post('/api/mikrotik/config', async (req, res) => {
  const c = req.body;
  console.log('💾 Menyimpan konfigurasi MikroTik ke database MySQL...');

  try {
    const sql = `
      INSERT INTO mikrotik_configs 
      (id, host, api_port, username, password, use_ssl, status, router_identity, router_os_version, cpu_load, uptime)
      VALUES ('primary_router', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      host = VALUES(host),
      api_port = VALUES(api_port),
      username = VALUES(username),
      password = VALUES(password),
      use_ssl = VALUES(use_ssl),
      status = VALUES(status),
      router_identity = VALUES(router_identity),
      router_os_version = VALUES(router_os_version),
      cpu_load = VALUES(cpu_load),
      uptime = VALUES(uptime)
    `;

    await pool.query(sql, [
      c.host || '',
      c.apiPort || 8728,
      c.username || '',
      c.password || '',
      c.useSsl ? 1 : 0,
      c.status || 'disconnected',
      c.routerIdentity || '',
      c.routerOsVersion || '',
      c.cpuLoad || 0,
      c.uptime || ''
    ]);

    console.log('✅ SUKSES: Konfigurasi MikroTik tersimpan permanen di MySQL!');
    res.json({ success: true, message: 'Konfigurasi tersimpan di database' });
  } catch (err) {
    console.error('❌ Gagal simpan konfigurasi MikroTik ke MySQL:', err.message);
    res.status(500).json({ error: err.message });
  }
});
/// ==========================================
// UJI KONEKSI ASLI MIKROTIK (MENDUKUNG TUNNEL.ID)
// ==========================================
app.post('/api/mikrotik/test-connection', async (req, res) => {
  let { host, apiPort, username, password } = req.body;

  let cleanHost = (host || '').trim();
  let cleanPort = Number(apiPort) || 8728;
  if (cleanHost.includes(':')) {
    const parts = cleanHost.split(':');
    cleanHost = parts[0].trim();
    cleanPort = Number(parts[1]) || cleanPort;
  }

  const client = new RouterOSAPI({
    host: cleanHost,
    user: username,
    password: password || '',
    port: cleanPort,
    timeout: 5,
    keepalive: false,
  });

  try {
    await client.connect();

    const identityRes = await client.write('/system/identity/print');
    const resourceRes = await client.write('/system/resource/print');
    await client.close();

    const identity = identityRes[0]?.name || 'MikroTik Router';
    const resource = resourceRes[0] || {};

    res.json({
      success: true,
      message: `Terhubung ke MikroTik ${identity}`,
      data: {
        routerIdentity: identity,
        routerOsVersion: `RouterOS v${resource.version || '7.x'}`,
        // MEMBACA ARSITEKTUR & TIPE BOARD ASLI MIKROTIK:
        architecture: resource['architecture-name'] || 'mmips',
        boardName: resource['board-name'] || 'hEX',
        cpuLoad: Number(resource['cpu-load']) || 0,
        uptime: resource.uptime || 'Online',
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `Gagal: ${err.message}`,
    });
  }
});
// ==========================================
// KELOLA TENANTS (SESUAI STRUKTUR TABEL PHP MYADMIN)
// ==========================================
app.get('/api/tenants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Gagal ambil tenants:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tenants', async (req, res) => {
  const t = req.body;
  console.log('🏢 Menerima pendaftaran Tenant Baru:', t.name);

  try {
    const tenantId = t.id || `tenant-${Date.now()}`;
    const slug = t.slug || (t.name || 'isp').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const domain = t.domain || `${slug}.monisys.web.id`;

    const sql = `
      INSERT INTO tenants 
      (id, name, slug, domain, logo_text, slogan, phone, email, address, subscription_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      slug = VALUES(slug),
      domain = VALUES(domain),
      logo_text = VALUES(logo_text),
      slogan = VALUES(slogan),
      phone = VALUES(phone),
      email = VALUES(email),
      address = VALUES(address),
      subscription_plan = VALUES(subscription_plan)
    `;

    await pool.query(sql, [
      tenantId,
      t.name || 'ISP Baru',
      slug,
      domain,
      t.logoText || t.logo_text || (t.name ? t.name.substring(0, 3).toUpperCase() : 'ISP'),
      t.slogan || t.tagline || 'Solusi Internet Cepat & Andal',
      t.phone || '-',
      t.email || '',
      t.address || '',
      t.subscriptionPlan || t.subscription_plan || 'Enterprise Full Fitur'
    ]);

    console.log('✅ SUKSES: Tenant baru tersimpan ke MySQL:', t.name);
    res.json({ success: true, message: 'Tenant berhasil didaftarkan', tenantId });
  } catch (err) {
    console.error('❌ GAGAL SIMPAN TENANT KE MYSQL:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// 1. AMBIL DAFTAR INTERFACE MIKROTIK ASLI
// ==========================================
app.get('/api/mikrotik/interfaces', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mikrotik_configs WHERE id = "primary_router" LIMIT 1');
    if (!rows || rows.length === 0 || !rows[0].host) {
      return res.status(400).json({ error: 'Konfigurasi MikroTik belum diatur di menu MikroTik RouterOS' });
    }
    const cfg = rows[0];

    const conn = new RouterOSAPI({
      host: cfg.host,
      user: cfg.username,
      password: cfg.password,
      port: cfg.api_port || 8728,
      timeout: 5
    });

    await conn.connect();
    const rawInterfaces = await conn.write('/interface/print');
    conn.close();

    const interfaces = rawInterfaces.map(i => i.name);
    res.json({ success: true, interfaces });
  } catch (err) {
    console.error('❌ Gagal ambil interface MikroTik:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. MONITOR TRAFIK RX & TX REAL-TIME DARI MIKROTIK
// ==========================================
app.get('/api/mikrotik/traffic', async (req, res) => {
  const iface = req.query.interface || 'ether1';
  try {
    const [rows] = await pool.query('SELECT * FROM mikrotik_configs WHERE id = "primary_router" LIMIT 1');
    if (!rows || rows.length === 0 || !rows[0].host) {
      return res.status(400).json({ error: 'Konfigurasi MikroTik belum diatur' });
    }
    const cfg = rows[0];

    const conn = new RouterOSAPI({
      host: cfg.host,
      user: cfg.username,
      password: cfg.password,
      port: cfg.api_port || 8728,
      timeout: 3
    });

    await conn.connect();
    // Mengambil monitor traffic 1 kali langsung dari hardware router
    const data = await conn.write('/interface/monitor-traffic', [
      `=interface=${iface}`,
      '=once='
    ]);
    conn.close();

    if (data && data.length > 0) {
      const rxBps = parseInt(data[0]['rx-bits-per-second'] || 0, 10);
      const txBps = parseInt(data[0]['tx-bits-per-second'] || 0, 10);

      // Konversi bit ke Mbps
      const rxMbps = parseFloat((rxBps / 1000000).toFixed(2));
      const txMbps = parseFloat((txBps / 1000000).toFixed(2));

      res.json({
        success: true,
        interface: iface,
        rx_mbps: rxMbps,
        tx_mbps: txMbps
      });
    } else {
      res.json({ success: true, rx_mbps: 0, tx_mbps: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, rx_mbps: 0, tx_mbps: 0 });
  }
});
// ==========================================
// 1. ENDPOINT: AMBIL INTERFACE MIKROTIK
// ==========================================
app.get('/api/mikrotik/interfaces', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mikrotik_configs WHERE id = "primary_router" LIMIT 1');
    if (!rows || rows.length === 0 || !rows[0].host) {
      return res.json({ success: false, interfaces: [] });
    }
    const cfg = rows[0];
    const conn = new RouterOSAPI({
      host: cfg.host,
      user: cfg.username,
      password: cfg.password,
      port: cfg.api_port || 8728,
      timeout: 5
    });
    await conn.connect();
    const raw = await conn.write('/interface/print');
    conn.close();

    const interfaces = raw.map(i => i.name);
    res.json({ success: true, interfaces, host: cfg.host, identity: cfg.router_identity });
  } catch (err) {
    console.error('❌ Gagal koneksi MikroTik:', err.message);
    res.json({ success: false, interfaces: [], error: err.message });
  }
});

// ==========================================
// 2. ENDPOINT: MONITOR TRAFIK LIVE RX & TX
// ==========================================
app.get('/api/mikrotik/traffic', async (req, res) => {
  const iface = req.query.interface || 'ether1';
  try {
    const [rows] = await pool.query('SELECT * FROM mikrotik_configs WHERE id = "primary_router" LIMIT 1');
    if (!rows || rows.length === 0 || !rows[0].host) {
      return res.json({ success: false, isReal: false });
    }
    const cfg = rows[0];
    const conn = new RouterOSAPI({
      host: cfg.host,
      user: cfg.username,
      password: cfg.password,
      port: cfg.api_port || 8728,
      timeout: 3
    });
    await conn.connect();

    const data = await conn.write('/interface/monitor-traffic', [
      `=interface=${iface}`,
      '=once='
    ]);
    conn.close();

    if (data && data.length > 0) {
      const rxBps = parseInt(data[0]['rx-bits-per-second'] || 0, 10);
      const txBps = parseInt(data[0]['tx-bits-per-second'] || 0, 10);

      const rxMbps = parseFloat((rxBps / 1000000).toFixed(2));
      const txMbps = parseFloat((txBps / 1000000).toFixed(2));

      return res.json({
        success: true,
        isReal: true,
        interface: iface,
        rx_mbps: rxMbps,
        tx_mbps: txMbps
      });
    }
    res.json({ success: false, isReal: false });
  } catch (err) {
    res.json({ success: false, isReal: false, error: err.message });
  }
});
// ==========================================
// 1. API DATA KARYAWAN (EMPLOYEES)
// ==========================================
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  const { id, tenant_id, name, role, email, phone, status } = req.body;
  try {
    await db.query(
      `INSERT INTO employees (id, tenant_id, name, role, email, phone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=?, role=?, email=?, phone=?, status=?`,
      [id, tenant_id || 'tenant-default', name, role, email, phone, status || 'active', name, role, email, phone, status || 'active']
    );
    res.json({ success: true, message: 'Karyawan tersimpan ke MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Karyawan terhapus dari MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. API PAKET INTERNET (PACKAGES)
// ==========================================
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM packages');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/packages', async (req, res) => {
  const { id, tenant_id, name, speed, price, type, description } = req.body;
  try {
    await db.query(
      `INSERT INTO packages (id, tenant_id, name, speed, price, type, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=?, speed=?, price=?, type=?, description=?`,
      [id, tenant_id || 'tenant-default', name, speed, price, type, description, name, speed, price, type, description]
    );
    res.json({ success: true, message: 'Paket tersimpan ke MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM packages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Paket terhapus dari MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. API LOKASI ODP (OPTICAL DISTRIBUTION POINT)
// ==========================================
app.get('/api/odps', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM odps');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/odps', async (req, res) => {
  const { id, tenant_id, name, zone, ports_total, ports_used, lat, lng, status } = req.body;
  try {
    await db.query(
      `INSERT INTO odps (id, tenant_id, name, zone, ports_total, ports_used, lat, lng, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=?, zone=?, ports_total=?, ports_used=?, lat=?, lng=?, status=?`,
      [id, tenant_id || 'tenant-default', name, zone, ports_total, ports_used, lat, lng, status, name, zone, ports_total, ports_used, lat, lng, status]
    );
    res.json({ success: true, message: 'ODP tersimpan ke MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/odps/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM odps WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'ODP terhapus dari MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. API WILAYAH / ZONA
// ==========================================
app.get('/api/wilayah', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM wilayah');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wilayah', async (req, res) => {
  const { id, tenant_id, name, code, pic, contact } = req.body;
  try {
    await db.query(
      `INSERT INTO wilayah (id, tenant_id, name, code, pic, contact) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=?, code=?, pic=?, contact=?`,
      [id, tenant_id || 'tenant-default', name, code, pic, contact, name, code, pic, contact]
    );
    res.json({ success: true, message: 'Wilayah tersimpan ke MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wilayah/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM wilayah WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Wilayah terhapus dari MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server MoniSys aktif pada port ${PORT}`);
});