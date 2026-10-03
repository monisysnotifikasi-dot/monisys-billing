import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  Customer,
  Invoice,
  MootaMutation,
  ODP,
  Wilayah,
  RadiusSession,
  RadiusConfig,
  MikrotikConfig,
  WhatsAppConfig,
  WhatsAppLog,
  Employee,
  AutoIsolirSettings,
  DashboardWidgetConfig,
  ModemDetails,
  InternetPackage,
} from '../types/isp';
import {
  INITIAL_TENANTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_MOOTA_MUTATIONS,
  INITIAL_ODP,
  INITIAL_WILAYAH,
  INITIAL_RADIUS_SESSIONS,
  INITIAL_RADIUS_CONFIG,
  INITIAL_MIKROTIK_CONFIG,
  INITIAL_WHATSAPP_CONFIG,
  INITIAL_WHATSAPP_LOGS,
  INITIAL_EMPLOYEES,
  INITIAL_AUTO_ISOLIR,
  INITIAL_DASHBOARD_WIDGETS,
  INITIAL_PACKAGES,
} from '../data/initialData';

interface ISPContextType {
  // Tenant & Domain Navigation
  isMasterPortal: boolean;
  currentTenant: Tenant;
  allTenants: Tenant[];
  activeSubdomain: string;
  isDemoMode: boolean;
  autoSyncPreventDemo: boolean;
  
  // Entities
  customers: Customer[];
  packages: InternetPackage[];
  invoices: Invoice[];
  odps: ODP[];
  wilayahs: Wilayah[];
  mutations: MootaMutation[];
  radiusSessions: RadiusSession[];
  radiusConfig: RadiusConfig;
  mikrotikConfig: MikrotikConfig;
  whatsAppConfig: WhatsAppConfig;
  whatsAppLogs: WhatsAppLog[];
  employees: Employee[];
  autoIsolirSettings: AutoIsolirSettings;
  dashboardWidgets: DashboardWidgetConfig[];

  // Selected for modals / views
  activeRemoteModemCustomer: Customer | null;
  setActiveRemoteModemCustomer: (cust: Customer | null) => void;
  publicViewInvoice: Invoice | null;
  setPublicViewInvoice: (inv: Invoice | null) => void;
  publicIsolirCustomer: Customer | null;
  setPublicIsolirCustomer: (cust: Customer | null) => void;

  // Actions
  switchTenant: (slugOrId: string) => void;
  goToMasterPortal: () => void;
  registerNewTenant: (data: { name: string; slug: string; phone: string; email: string }) => void;
  toggleDemoMode: () => void;
  setAutoSyncPreventDemo: (val: boolean) => void;

  // Packages
  addPackage: (data: Partial<InternetPackage>) => void;
  updatePackage: (id: string, data: Partial<InternetPackage>) => void;
  deletePackage: (id: string) => void;

  // Customers & Bulk
  addCustomer: (data: Partial<Customer>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  bulkImportCustomers: (rows: Partial<Customer>[]) => number;
  isolateCustomer: (customerId: string) => void;
  unIsolateCustomer: (customerId: string) => void;

  // ODP & Wilayah
  addODP: (data: Partial<ODP>) => void;
  updateODP: (id: string, data: Partial<ODP>) => void;
  deleteODP: (id: string) => void;
  addWilayah: (data: Partial<Wilayah>) => void;
  updateWilayah: (id: string, data: Partial<Wilayah>) => void;
  deleteWilayah: (id: string) => void;

  // Invoices & Payments
  payInvoice: (invoiceId: string, method: string) => void;
  createInvoiceForCustomer: (customerId: string) => void;

  // Moota
  processMootaMutation: (mutationId: string) => void;
  simulateIncomingBankTransfer: (bank: 'BCA' | 'MANDIRI' | 'BRI', amount: number, desc: string) => void;

  // Radius & Mikrotik
  disconnectRadiusSession: (sessionId: string) => void;
  updateMikrotikConfig: (cfg: Partial<MikrotikConfig>) => void;
  updateRadiusConfig: (cfg: Partial<RadiusConfig>) => void;

  // Modem
  updateModemDetails: (customerId: string, updates: Partial<ModemDetails>) => void;
  rebootModem: (customerId: string) => void;

  // WhatsApp
  updateWhatsAppConfig: (cfg: Partial<WhatsAppConfig>) => void;
  sendWhatsAppNotification: (customerId: string, type: 'reminder' | 'success' | 'isolir' | 'custom', customMsg?: string) => void;
  broadcastWhatsAppReminder: () => number;

  // Settings & RBAC
  updateTenantBranding: (updates: Partial<Tenant>) => void;
  updateAutoIsolirSettings: (updates: Partial<AutoIsolirSettings>) => void;
  updateDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  addEmployee: (emp: Partial<Employee>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
}

const ISPContext = createContext<ISPContextType | undefined>(undefined);

export const ISPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-tenant state
  const [allTenants, setAllTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(() => {
    const saved = localStorage.getItem('monisys_current_tenant');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TENANTS;
  });  const [isMasterPortal, setIsMasterPortal] = useState<boolean>(false);
  const [activeSubdomain, setActiveSubdomain] = useState<string>('citranet.monisys.web.id');

  // Demo vs Real Mode
  // If isDemoMode is true, we display rich dummy data.
  // If false, dummy data is cleared and only user-created data is shown!
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('monisys_demo_mode');
    return saved !== null ? JSON.parse(saved) : false; // DEFAULT: False (Langsung Mode Database Asli)
  });
  const [autoSyncPreventDemo, setAutoSyncPreventDemo] = useState<boolean>(true);

  // Entities state
  const [realCustomers, setRealCustomers] = useState<Customer[]>([]);
  const [realInvoices, setRealInvoices] = useState<Invoice[]>([]);
  const [realOdps, setRealOdps] = useState<ODP[]>([]);
  const [realWilayahs, setRealWilayahs] = useState<Wilayah[]>([]);
  const [realMutations, setRealMutations] = useState<MootaMutation[]>([]);
  const [realPackages, setRealPackages] = useState<InternetPackage[]>(INITIAL_PACKAGES);

  // Active data based on demo mode
  const [demoCustomers, setDemoCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [demoInvoices, setDemoInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [demoOdps, setDemoOdps] = useState<ODP[]>(INITIAL_ODP);
  const [demoWilayahs, setDemoWilayahs] = useState<Wilayah[]>(INITIAL_WILAYAH);
  const [demoMutations, setDemoMutations] = useState<MootaMutation[]>(INITIAL_MOOTA_MUTATIONS);
  const [demoPackages, setDemoPackages] = useState<InternetPackage[]>(INITIAL_PACKAGES);

  // Shared hardware / config states
  const [radiusSessions, setRadiusSessions] = useState<RadiusSession[]>(INITIAL_RADIUS_SESSIONS);
  const [radiusConfig, setRadiusConfig] = useState<RadiusConfig>(INITIAL_RADIUS_CONFIG);
  const [mikrotikConfig, setMikrotikConfig] = useState<MikrotikConfig>(INITIAL_MIKROTIK_CONFIG);
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(INITIAL_WHATSAPP_CONFIG);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>(INITIAL_WHATSAPP_LOGS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [autoIsolirSettings, setAutoIsolirSettings] = useState<AutoIsolirSettings>(INITIAL_AUTO_ISOLIR);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig[]>(INITIAL_DASHBOARD_WIDGETS);

  // Modal / Public view helpers
  const [activeRemoteModemCustomer, setActiveRemoteModemCustomer] = useState<Customer | null>(null);
  const [publicViewInvoice, setPublicViewInvoice] = useState<Invoice | null>(null);
  const [publicIsolirCustomer, setPublicIsolirCustomer] = useState<Customer | null>(null);

  // Compute active lists
  const customers = isDemoMode ? demoCustomers : realCustomers;
  const invoices = isDemoMode ? demoInvoices : realInvoices;
  const odps = isDemoMode ? demoOdps : realOdps;
  const wilayahs = isDemoMode ? demoWilayahs : realWilayahs;
  const mutations = isDemoMode ? demoMutations : realMutations;
  const rawPackages = isDemoMode ? demoPackages : realPackages;

  // Enhance packages with live active subscriber count from customers
  const packages: InternetPackage[] = rawPackages.map((pkg) => {
    const subscriberCount = customers.filter(
      (c) =>
        c.packageId === pkg.id ||
        c.packageName.toLowerCase().includes(pkg.name.toLowerCase()) ||
        pkg.name.toLowerCase().includes(c.packageName.toLowerCase())
    ).length;
    return { ...pkg, activeSubscriberCount: subscriberCount };
  });
// Mengambil data pelanggan dari MySQL secara otomatis
  useEffect(() => {
    // Ambil daftar tenant dari MySQL dan aktifkan tenant yang sesuai
    fetch('http://localhost:3001/api/tenants')
      .then((res) => res.json())
      .then((dbTenants) => {
        if (dbTenants && dbTenants.length > 0) {
          const formatted: Tenant[] = dbTenants.map((t: any) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            domain: t.domain,
            logoText: t.logo_text || t.name.substring(0, 3).toUpperCase(),
            slogan: t.slogan || 'Solusi Internet Cepat',
            themeColor: 'blue',
            primaryColorHex: '#3b82f6',
            address: t.address || '',
            phone: t.phone || '',
            email: t.email || '',
            subscriptionPlan: t.subscription_plan || 'Enterprise Full Fitur',
            subscriptionStatus: 'active',
            subscriptionPrice: 499000,
            registeredAt: t.created_at ? t.created_at.split('T')[0] : '2026-10-01',
            bankAccounts: [],
          }));

          setAllTenants(formatted);

          // Cek apakah ada tenant yang sedang dipilih sebelumnya
          const savedTenantId = localStorage.getItem('monisys_active_tenant_id');
          const activeTenant = formatted.find((t) => t.id === savedTenantId) || formatted[0];

          if (activeTenant) {
            setCurrentTenant(activeTenant);
            setActiveSubdomain(activeTenant.domain);
            localStorage.setItem('monisys_current_tenant', JSON.stringify(activeTenant));
            localStorage.setItem('monisys_active_tenant_id', activeTenant.id);
          }
        }
      })
      .catch((err) => console.log('Gagal memuat tenants dari DB:', err));
    // 1. Ambil Pelanggan dari MySQL
    fetch('http://localhost:3001/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted: Customer[] = data.map((d: any) => ({
            id: d.id,
            customerCode: d.customer_code || 'CFN-000',
            name: d.name,
            phone: d.phone,
            email: d.email || '',
            address: d.address || '',
            packageId: d.package_id || 'pkg-20',
            packageName: d.packageName || 'Paket Internet',
            speedMbps: d.speed_download_mbps || 20,
            monthlyPrice: Number(d.price_monthly) || 150000,
            pppoeUsername: d.pppoe_username || '',
            pppoePassword: d.pppoe_password || '',
            ipAddress: d.ip_address || '',
            macAddress: d.mac_address || '',
            odpId: d.odp_id || 'odp-01',
            odpName: d.odpName || 'ODP Default',
            wilayahId: d.wilayah_id || 'wil-01',
            wilayahName: d.wilayahName || 'Wilayah Default',
            lat: Number(d.lat) || -6.932,
            lng: Number(d.lng) || 107.718,
            status: d.status || 'active',
            joinedDate: d.joined_date || new Date().toISOString().split('T')[0],
            dueDateDay: d.due_date_day || 10,
            modem: {
              brand: 'ZTE',
              model: 'F609',
              serialNumber: 'ZTE123',
              ponStatus: 'O5 (Operational)',
              rxPowerDbm: -19.5,
              txPowerDbm: 2.2,
              temperature: 40,
              voltage: 3.3,
              wifiSsid: `${d.name}-WiFi`,
              wifiPassword: 'password123',
              wanIp: d.ip_address || '10.50.18.20',
              lan1: true,
              lan2: false,
              lan3: false,
              lan4: false,
              uptime: '1 Hari',
              connectedDevices: 2,
            },
          }));
          setRealCustomers(formatted);
        }
      })
      .catch((err) => console.log('Gagal load pelanggan MySQL:', err));

    // 2. Ambil Wilayah dari MySQL
    fetch('http://localhost:3001/api/wilayah')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealWilayahs(data.map((w: any) => ({
            id: w.id,
            code: w.code,
            name: w.name,
            centerLat: Number(w.center_lat),
            centerLng: Number(w.center_lng),
            coverageRadiusKm: Number(w.coverage_radius_km),
            totalOdp: 0,
            totalCustomers: 0,
            description: w.description || '',
          })));
        }
      })
      .catch((err) => console.log('Gagal load wilayah MySQL:', err));

    // 3. Ambil ODP dari MySQL
    fetch('http://localhost:3001/api/odps')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealOdps(data.map((o: any) => ({
            id: o.id,
            code: o.code,
            name: o.name,
            wilayahId: o.wilayah_id,
            wilayahName: 'Wilayah Terkait',
            capacity: o.capacity || 16,
            usedPorts: o.used_ports || 0,
            lat: Number(o.lat),
            lng: Number(o.lng),
            status: o.status || 'active',
            notes: o.notes || '',
          })));
        }
      })
      .catch((err) => console.log('Gagal load ODP MySQL:', err));

    // 4. Ambil Paket Internet dari MySQL
    fetch('http://localhost:3001/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealPackages(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            speedDownloadMbps: p.speed_download_mbps,
            speedUploadMbps: p.speed_upload_mbps,
            priceMonthly: Number(p.price_monthly),
            rateLimitMikrotik: p.rate_limit_mikrotik || '20M/20M',
            mikrotikProfileName: p.mikrotik_profile_name || 'PROFILE',
            description: p.description || '',
            features: ['Unlimited Kuota Tanpa FUP', 'Support 24/7'],
            activeSubscriberCount: 0,
          })));
        }
      })
      .catch((err) => console.log('Gagal load paket MySQL:', err));
      // Ambil konfigurasi MikroTik dari MySQL saat web dibuka
    fetch('http://localhost:3001/api/mikrotik/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.host) {
          setMikrotikConfig({
            host: data.host,
            apiPort: data.api_port,
            username: data.username,
            password: data.password,
            useSsl: Boolean(data.use_ssl),
            status: data.status || 'connected',
            routerIdentity: data.router_identity || '',
            routerOsVersion: data.router_os_version || '',
            cpuLoad: data.cpu_load || 0,
            uptime: data.uptime || '',
            lastSync: 'Tersinkron dari MySQL',
          });
        }
      })
      .catch((err) => console.log('Belum ada config mikrotik di MySQL:', err));
    }, []);
  // Package CRUD
  const addPackage = (data: Partial<InternetPackage>) => {
    const down = data.speedDownloadMbps || 20;
    const up = data.speedUploadMbps || down;
    const newPkg: InternetPackage = {
      id: `pkg-${Date.now()}`,
      name: data.name || `Paket ${down} Mbps`,
      speedDownloadMbps: down,
      speedUploadMbps: up,
      priceMonthly: data.priceMonthly || 150000,
      rateLimitMikrotik: data.rateLimitMikrotik || `${down}M/${up}M`,
      mikrotikProfileName: data.mikrotikProfileName || `PROFILE-${down}M`,
      description: data.description || '',
      features: data.features || ['Unlimited Kuota Tanpa FUP', 'Support 24/7'],
      isPopular: data.isPopular || false,
      activeSubscriberCount: 0,
    };
    
    if (isDemoMode) setDemoPackages((prev) => [...prev, newPkg]);
    else {
      setRealPackages((prev) => [...prev, newPkg]);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg),
      }).catch(err => console.error(err));
    }
  };

  const updatePackage = (id: string, data: Partial<InternetPackage>) => {
    const updater = (list: InternetPackage[]) => list.map((p) => (p.id === id ? { ...p, ...data } : p));
    if (isDemoMode) setDemoPackages(updater);
    else {
      setRealPackages(updater);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      }).catch(err => console.error(err));
    }
  };
  const deletePackage = (id: string) => {
    if (isDemoMode) setDemoPackages((prev) => prev.filter((p) => p.id !== id));
    else setRealPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // Auto update ODP usedPorts when customers list changes
  useEffect(() => {
    const odpUsageMap: Record<string, number> = {};
    customers.forEach((c) => {
      if (c.odpId) {
        odpUsageMap[c.odpId] = (odpUsageMap[c.odpId] || 0) + 1;
      }
    });

    if (isDemoMode) {
      setDemoOdps((prev) =>
        prev.map((o) => ({
          ...o,
          usedPorts: odpUsageMap[o.id] ?? o.usedPorts,
          status: (odpUsageMap[o.id] ?? o.usedPorts) >= o.capacity ? 'full' : o.status,
        }))
      );
    } else {
      setRealOdps((prev) =>
        prev.map((o) => ({
          ...o,
          usedPorts: odpUsageMap[o.id] || 0,
          status: (odpUsageMap[o.id] || 0) >= o.capacity ? 'full' : o.status,
        }))
      );
    }
  }, [customers.length, isDemoMode]);

  // Tenant navigation
  const switchTenant = (tenantId: string) => {
    const found = allTenants.find((t) => t.id === tenantId);
    if (found) {
      setCurrentTenant(found);
      setActiveSubdomain(found.domain);
      // KUNCI TENANT INI:
      localStorage.setItem('monisys_active_tenant_id', found.id);
      localStorage.setItem('monisys_current_tenant', JSON.stringify(found));
    }
  };

  const goToMasterPortal = () => {
    setIsMasterPortal(true);
    setActiveSubdomain('monisys.web.id');
    setPublicViewInvoice(null);
    setPublicIsolirCustomer(null);
  };

  const registerNewTenant = async (data: { name: string; slug: string; phone: string; email: string }) => {
    const rawSlug = (data.slug && !/^\d+$/.test(data.slug)) ? data.slug : data.name;
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: data.name,
      slug: cleanSlug,
      subdomain: cleanSlug,
      domain: `${cleanSlug}.monisys.web.id`,
      logoText: data.name.substring(0, 3).toUpperCase(),
      slogan: 'Koneksi Cepat & Handal',
      themeColor: 'blue',
      primaryColorHex: '#3b82f6',
      address: 'Jl. Protokol Pusat No. 10',
      phone: data.phone,
      email: data.email,
      subscriptionPlan: 'Enterprise Full Fitur',
      subscriptionStatus: 'active',
      subscriptionPrice: 499000,
      registeredAt: new Date().toISOString().split('T')[0],
      bankAccounts: [
        {
          bankName: 'BCA',
          accountNumber: '8910294821',
          accountHolder: data.name.toUpperCase(),
        },
      ],
    };

    // =======================================================
    // SIMPAN TENANT BARU SECARA PERMANEN KE DATABASE MYSQL
    // =======================================================
    try {
      const res = await fetch('http://localhost:3001/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
      const result = await res.json();
      console.log('✅ Tenant berhasil tersimpan ke MySQL:', result);
    } catch (err) {
      console.error('❌ Gagal simpan tenant ke MySQL:', err);
    }

    setAllTenants((prev) => [...prev, newTenant]);
    setCurrentTenant(newTenant);
    setActiveSubdomain(newTenant.domain);
    setIsMasterPortal(false);
    localStorage.setItem('monisys_active_tenant_id', newTenant.id);
    localStorage.setItem('monisys_current_tenant', JSON.stringify(newTenant));
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  // Customer Management
  const addCustomer = (data: Partial<Customer>): Customer => {
    const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      customerCode: data.customerCode || `CFN-${uniqueNumber}`,
      name: data.name || 'Pelanggan Baru',
      phone: data.phone || '081200000000',
      email: data.email || 'pelanggan@mail.com',
      address: data.address || 'Alamat Belum Diisi',
      packageId: data.packageId || 'pkg-20',
      packageName: data.packageName || 'Paket Turbo 20 Mbps',
      speedMbps: data.speedMbps || 20,
      monthlyPrice: data.monthlyPrice || 165000,
      pppoeUsername: data.pppoeUsername || `user_${uniqueNumber}`,
      pppoePassword: data.pppoePassword || `pass_${uniqueNumber}`,
      ipAddress: data.ipAddress || `10.50.18.${Math.floor(Math.random() * 200) + 10}`,
      macAddress: data.macAddress || 'A0:B1:C2:D3:E4:F5',
      odpId: data.odpId || (odps[0]?.id || 'odp-01'),
      odpName: data.odpName || (odps[0]?.name || 'ODP Pusat'),
      wilayahId: data.wilayahId || (wilayahs[0]?.id || 'wil-01'),
      wilayahName: data.wilayahName || (wilayahs[0]?.name || 'Wilayah Utama'),
      lat: data.lat || -6.932,
      lng: data.lng || 107.718,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      dueDateDay: data.dueDateDay || 10,
      modem: {
        brand: 'ZTE',
        model: 'ZXHN F609',
        serialNumber: `ZTEG${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ponStatus: 'O5 (Operational)',
        rxPowerDbm: -18.6,
        txPowerDbm: 2.2,
        temperature: 41,
        voltage: 3.28,
        wifiSsid: `${data.name || 'Pelanggan'}-WiFi`,
        wifiPassword: 'password123',
        wanIp: data.ipAddress || '10.50.18.20',
        lan1: true,
        lan2: false,
        lan3: false,
        lan4: false,
        uptime: '0 Hari 1 Jam',
        connectedDevices: 2,
      },
    };

    if (isDemoMode) {
      setDemoCustomers((prev) => [newCust, ...prev]);
    } else {
      setRealCustomers((prev) => [newCust, ...prev]);
    }

    // Auto create first invoice
    createInvoiceForCustomer(newCust.id, newCust);

    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updater = (list: Customer[]) =>
      list.map((c) => (c.id === id ? { ...c, ...updates } : c));
    if (isDemoMode) {
      setDemoCustomers(updater);
    } else {
      setRealCustomers(updater);
    }
  };

  const deleteCustomer = (id: string) => {
    if (isDemoMode) {
      setDemoCustomers((prev) => prev.filter((c) => c.id !== id));
    } else {
      // Hapus dari tampilan layar
      setRealCustomers((prev) => prev.filter((c) => c.id !== id));

      // HAPUS PERMANEN DARI MYSQL
      fetch(`http://localhost:3001/api/customers/${id}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('✅ Berhasil terhapus dari MySQL:', data);
        })
        .catch((err) => {
          console.error('❌ Gagal menghapus dari MySQL:', err);
        });
    }
  };

  const bulkImportCustomers = (rows: Partial<Customer>[]): number => {
    let count = 0;
    const imported: Customer[] = rows.map((r, i) => {
      count++;
      const uniqueNumber = Math.floor(2000 + i * 10 + Math.random() * 9);
      return {
        id: `bulk-${Date.now()}-${i}`,
        customerCode: r.customerCode || `CUST-${uniqueNumber}`,
        name: r.name || `Pelanggan Massal ${i + 1}`,
        phone: r.phone || '081299001122',
        email: r.email || `pelanggan${i}@domain.com`,
        address: r.address || 'Alamat Registrasi Massal',
        packageId: 'pkg-massal',
        packageName: r.packageName || 'Paket Home 20 Mbps',
        speedMbps: r.speedMbps || 20,
        monthlyPrice: r.monthlyPrice || 165000,
        pppoeUsername: r.pppoeUsername || `bulk_pppoe_${uniqueNumber}`,
        pppoePassword: r.pppoePassword || `secret_${uniqueNumber}`,
        ipAddress: r.ipAddress || `10.50.20.${10 + i}`,
        macAddress: r.macAddress || `40:11:88:AA:BB:${(i + 10).toString(16)}`,
        odpId: r.odpId || (odps[0]?.id || 'odp-01'),
        odpName: r.odpName || (odps[0]?.name || 'ODP Default'),
        wilayahId: r.wilayahId || (wilayahs[0]?.id || 'wil-01'),
        wilayahName: r.wilayahName || (wilayahs[0]?.name || 'Wilayah Default'),
        lat: r.lat || -6.93 + (Math.random() - 0.5) * 0.05,
        lng: r.lng || 107.71 + (Math.random() - 0.5) * 0.05,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        dueDateDay: 10,
        modem: {
          brand: 'ZTE',
          model: 'ZXHN F609 V3',
          serialNumber: `ZTEG${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          ponStatus: 'O5 (Operational)',
          rxPowerDbm: -19.1,
          txPowerDbm: 2.1,
          temperature: 40,
          voltage: 3.28,
          wifiSsid: `WiFi-${r.name || 'Home'}`,
          wifiPassword: 'password123',
          wanIp: `10.50.20.${10 + i}`,
          lan1: true,
          lan2: false,
          lan3: false,
          lan4: false,
          uptime: '1 Hari 0 Jam',
          connectedDevices: 3,
        },
      };
    });

    return count;
  };

  const isolateCustomer = (customerId: string) => {
    const nowStr = new Date().toLocaleString('id-ID');
    const updateFn = (list: Customer[]) =>
      list.map((c) =>
        c.id === customerId
          ? {
              ...c,
              status: 'isolated' as const,
              isolatedAt: `${nowStr} WIB`,
            }
          : c
      );
    if (isDemoMode) {
      setDemoCustomers(updateFn);
    } else {
      setRealCustomers(updateFn);
    }

    // Also update invoice status
    const invUpdate = (invs: Invoice[]) =>
      invs.map((inv) =>
        inv.customerId === customerId && inv.status === 'unpaid'
          ? { ...inv, status: 'isolated' as const }
          : inv
      );
    if (isDemoMode) setDemoInvoices(invUpdate);
    else setRealInvoices(invUpdate);

    // Send auto WA notification if enabled
    if (autoIsolirSettings.sendWhatsAppOnIsolir) {
      sendWhatsAppNotification(customerId, 'isolir');
    }
  };

  const unIsolateCustomer = (customerId: string) => {
    const updateFn = (list: Customer[]) =>
      list.map((c) =>
        c.id === customerId
          ? {
              ...c,
              status: 'active' as const,
              isolatedAt: undefined,
            }
          : c
      );
    if (isDemoMode) {
      setDemoCustomers(updateFn);
    } else {
      setRealCustomers(updateFn);
    }
  };

  const addODP = (data: Partial<ODP>) => {
    const newOdp: ODP = {
      id: `odp-${Date.now()}`,
      code: data.code || `ODP-NEW-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name || 'ODP Baru',
      wilayahId: data.wilayahId || (wilayahs[0]?.id || 'wil-01'),
      wilayahName: data.wilayahName || (wilayahs[0]?.name || 'Wilayah Default'),
      capacity: data.capacity || 16,
      usedPorts: 0,
      lat: data.lat || -6.932,
      lng: data.lng || 107.718,
      status: 'active',
      notes: data.notes || '',
    };
    if (isDemoMode) setDemoOdps((prev) => [...prev, newOdp]);
    else {
      setRealOdps((prev) => [...prev, newOdp]);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/odps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOdp),
      }).catch(err => console.error(err));
    }
  };

  const updateODP = (id: string, data: Partial<ODP>) => {
    const updater = (list: ODP[]) => list.map((o) => (o.id === id ? { ...o, ...data } : o));
    if (isDemoMode) setDemoOdps(updater);
    else {
      setRealOdps(updater);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/odps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      }).catch(err => console.error(err));
    }
  };
  const deleteODP = (id: string) => {
    if (isDemoMode) setDemoOdps((prev) => prev.filter((o) => o.id !== id));
    else setRealOdps((prev) => prev.filter((o) => o.id !== id));
  };
const addWilayah = (data: Partial<Wilayah>) => {
    const newWil: Wilayah = {
      id: `wil-${Date.now()}`,
      code: data.code || `WIL-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Wilayah Baru',
      centerLat: data.centerLat || -6.93,
      centerLng: data.centerLng || 107.71,
      totalOdp: 0,
      totalCustomers: 0,
      description: data.description || '',
    };
    if (isDemoMode) setDemoWilayahs((prev) => [...prev, newWil]);
    else {
      setRealWilayahs((prev) => [...prev, newWil]);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/wilayah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWil),
      }).catch(err => console.error(err));
    }
  };

  const updateWilayah = (id: string, data: Partial<Wilayah>) => {
    const updater = (list: Wilayah[]) => list.map((w) => (w.id === id ? { ...w, ...data } : w));
    if (isDemoMode) setDemoWilayahs(updater);
    else {
      setRealWilayahs(updater);
      // SIMPAN KE MYSQL
      fetch('http://localhost:3001/api/wilayah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      }).catch(err => console.error(err));
    }
  };
  const deleteWilayah = (id: string) => {
    if (isDemoMode) setDemoWilayahs((prev) => prev.filter((w) => w.id !== id));
    else setRealWilayahs((prev) => prev.filter((w) => w.id !== id));
  };

  // Invoices & Payments
  const createInvoiceForCustomer = (customerId: string, targetCust?: Customer) => {
    const cust = targetCust || customers.find((c) => c.id === customerId);
    if (!cust) return;

    const uniqueCode = Math.floor(100 + Math.random() * 899);
    const totalAmount = cust.monthlyPrice + uniqueCode;
    const invNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      customerId: cust.id,
      customerCode: cust.customerCode,
      customerName: cust.name,
      customerPhone: cust.phone,
      packageName: cust.packageName,
      period: 'Oktober 2026',
      baseAmount: cust.monthlyPrice,
      uniqueCode,
      totalAmount,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: `2026-10-${String(cust.dueDateDay).padStart(2, '0')}`,
      status: 'unpaid',
      paymentToken: `token_${Math.random().toString(36).substring(2, 10)}`,
      waReminderSentCount: 0,
    };

    if (isDemoMode) setDemoInvoices((prev) => [newInv, ...prev]);
    else setRealInvoices((prev) => [newInv, ...prev]);
  };

  const payInvoice = (invoiceId: string, method: string) => {
    const nowTime = new Date().toLocaleString('id-ID') + ' WIB';
    let paidCustomerId: string | null = null;

    const invUpdater = (invs: Invoice[]) =>
      invs.map((inv) => {
        if (inv.id === invoiceId) {
          paidCustomerId = inv.customerId;
          return {
            ...inv,
            status: 'paid' as const,
            paymentMethod: method as any,
            paidAt: nowTime,
          };
        }
        return inv;
      });

    if (isDemoMode) setDemoInvoices(invUpdater);
    else setRealInvoices(invUpdater);

    // Auto un-isolate customer if isolated!
    if (paidCustomerId) {
      unIsolateCustomer(paidCustomerId);
      if (whatsAppConfig.autoPaymentSuccess) {
        sendWhatsAppNotification(paidCustomerId, 'success');
      }
    }
  };

  // Moota real-time mutation processing
  const processMootaMutation = (mutationId: string) => {
    const mut = mutations.find((m) => m.id === mutationId);
    if (!mut) return;

    // Find invoice by amount (which has the unique 3 digits) or matched invoice
    const targetInvoice = invoices.find(
      (inv) =>
        inv.status !== 'paid' &&
        (inv.totalAmount === mut.amount || inv.invoiceNumber === mut.matchedInvoiceNumber)
    );

    if (targetInvoice) {
      payInvoice(targetInvoice.id, `MOOTA_${mut.bankType}`);
      // Mark mutation as matched
      const mutUpdater = (list: MootaMutation[]) =>
        list.map((m) =>
          m.id === mutationId
            ? { ...m, isMatched: true, matchedInvoiceNumber: targetInvoice.invoiceNumber }
            : m
        );
      if (isDemoMode) setDemoMutations(mutUpdater);
      else setRealMutations(mutUpdater);
    }
  };

  const simulateIncomingBankTransfer = (
    bank: 'BCA' | 'MANDIRI' | 'BRI',
    amount: number,
    desc: string
  ) => {
    const newMut: MootaMutation = {
      id: `mut-${Date.now()}`,
      bankType: bank,
      accountNumber: bank === 'BCA' ? '8420198821' : '1310098442190',
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      amount,
      type: 'CR',
      description: desc,
      isMatched: false,
    };

    if (isDemoMode) setDemoMutations((prev) => [newMut, ...prev]);
    else setRealMutations((prev) => [newMut, ...prev]);

    // Auto-match if matching amount exists!
    const targetInvoice = invoices.find((inv) => inv.status !== 'paid' && inv.totalAmount === amount);
    if (targetInvoice) {
      setTimeout(() => {
        payInvoice(targetInvoice.id, `MOOTA_${bank}`);
        const updateMatches = (list: MootaMutation[]) =>
          list.map((m) =>
            m.id === newMut.id
              ? { ...m, isMatched: true, matchedInvoiceNumber: targetInvoice.invoiceNumber }
              : m
          );
        if (isDemoMode) setDemoMutations(updateMatches);
        else setRealMutations(updateMatches);
      }, 800);
    }
  };

  // Remote Modem / ONT
  const updateModemDetails = (customerId: string, updates: Partial<ModemDetails>) => {
    const updater = (list: Customer[]) =>
      list.map((c) =>
        c.id === customerId
          ? {
              ...c,
              modem: { ...c.modem, ...updates },
            }
          : c
      );
    if (isDemoMode) setDemoCustomers(updater);
    else setRealCustomers(updater);

    if (activeRemoteModemCustomer && activeRemoteModemCustomer.id === customerId) {
      setActiveRemoteModemCustomer((prev) =>
        prev ? { ...prev, modem: { ...prev.modem, ...updates } } : null
      );
    }
  };

  const rebootModem = (customerId: string) => {
    updateModemDetails(customerId, {
      ponStatus: 'O3 (Serial Number)',
      uptime: '0 Hari 0 Jam (Rebooting...)',
    });
    setTimeout(() => {
      updateModemDetails(customerId, {
        ponStatus: 'O5 (Operational)',
        uptime: '0 Hari 0 Jam 1 Menit',
      });
    }, 2000);
  };

  // Radius
  const disconnectRadiusSession = (sessionId: string) => {
    setRadiusSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'terminated' as const } : s))
    );
  };

  const updateMikrotikConfig = (config: Partial<MikrotikConfig>) => {
    setMikrotikConfig((prev) => {
      const updated = { ...prev, ...config };

      // SIMPAN PERMANEN KE DATABASE MYSQL
      fetch('http://localhost:3001/api/mikrotik/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
        .then((res) => res.json())
        .then(() => console.log('✅ Konfigurasi MikroTik tersimpan ke MySQL!'))
        .catch((err) => console.error('❌ Gagal simpan config ke MySQL:', err));

      return updated;
    });
  };

  const updateRadiusConfig = (cfg: Partial<RadiusConfig>) => {
    setRadiusConfig((prev) => ({ ...prev, ...cfg }));
  };

  // WhatsApp
  const updateWhatsAppConfig = (cfg: Partial<WhatsAppConfig>) => {
    setWhatsAppConfig((prev) => ({ ...prev, ...cfg }));
  };

  const sendWhatsAppNotification = (
    customerId: string,
    type: 'reminder' | 'success' | 'isolir' | 'custom',
    customMsg?: string
  ) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const inv = invoices.find((i) => i.customerId === customerId);
    const linkBayar = `https://${currentTenant.domain}/pay/${inv?.paymentToken || 'demo'}`;

    let content = customMsg || '';
    if (!customMsg) {
      if (type === 'reminder') {
        content = whatsAppConfig.templateReminder
          .replace('{nama_pelanggan}', cust.name)
          .replace('{nama_isp}', currentTenant.name)
          .replace('{bulan_tagihan}', inv?.period || 'Bulan Ini')
          .replace('{nominal}', (inv?.totalAmount || cust.monthlyPrice).toLocaleString('id-ID'))
          .replace('{jatuh_tempo}', inv?.dueDate || '10 Oktober 2026')
          .replace('{link_bayar}', linkBayar);
      } else if (type === 'success') {
        content = whatsAppConfig.templateSuccess
          .replace('{nama_pelanggan}', cust.name)
          .replace('{nama_isp}', currentTenant.name)
          .replace('{bulan_tagihan}', inv?.period || 'Bulan Ini')
          .replace('{nominal}', (inv?.totalAmount || cust.monthlyPrice).toLocaleString('id-ID'))
          .replace('{metode_bayar}', inv?.paymentMethod || 'QRIS Realtime')
          .replace('{link_bayar}', linkBayar);
      } else if (type === 'isolir') {
        content = whatsAppConfig.templateIsolir
          .replace('{nama_pelanggan}', cust.name)
          .replace('{nomor_layanan}', cust.customerCode)
          .replace('{bulan_tagihan}', inv?.period || 'Bulan Ini')
          .replace('{link_bayar}', linkBayar);
      }
    }

    const log: WhatsAppLog = {
      id: `walog-${Date.now()}`,
      recipientPhone: cust.phone,
      recipientName: cust.name,
      type: type === 'reminder' ? 'tagihan_h3' : type === 'success' ? 'lunas' : type === 'isolir' ? 'isolir' : 'custom',
      content,
      status: 'delivered',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setWhatsAppLogs((prev) => [log, ...prev]);

    // increment invoice reminder count
    if (inv) {
      const invUp = (list: Invoice[]) =>
        list.map((i) =>
          i.id === inv.id ? { ...i, waReminderSentCount: i.waReminderSentCount + 1 } : i
        );
      if (isDemoMode) setDemoInvoices(invUp);
      else setRealInvoices(invUp);
    }
  };

  const broadcastWhatsAppReminder = (): number => {
    const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue');
    unpaidInvoices.forEach((inv) => {
      sendWhatsAppNotification(inv.customerId, 'reminder');
    });
    return unpaidInvoices.length;
  };

  // Settings & RBAC
  const updateTenantBranding = (updates: Partial<Tenant>) => {
    setCurrentTenant((prev) => {
      const updated = { ...prev, ...updates };
      setAllTenants((all) => all.map((t) => (t.id === updated.id ? updated : t)));
      return updated;
    });
  };

  const updateAutoIsolirSettings = (updates: Partial<AutoIsolirSettings>) => {
    setAutoIsolirSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateDashboardWidgets = (widgets: DashboardWidgetConfig[]) => {
    setDashboardWidgets(widgets);
  };

  const addEmployee = (emp: Partial<Employee>) => {
    const newEmp: Employee = {
      id: `emp-${()}`,
      name: emp.name || 'Karyawan Baru',
      email: emp.email || 'staff@isp.com',
      phone: emp.phone || '08123456789',
      role: emp.role || 'Teknisi Lapangan',
      status: 'active',
      lastActive: 'Baru saja ditambahkan',
      avatarSeed: emp.name || 'Staff',
      permissions: emp.permissions || {
        canManageBilling: false,
        canIsolirCustomer: false,
        canAccessRemoteModem: true,
        canEditMikrotik: false,
        canManageEmployees: false,
      },
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ISPContext.Provider
      value={{
        isMasterPortal,
        currentTenant,
        allTenants,
        activeSubdomain,
        isDemoMode,
        autoSyncPreventDemo,
        customers,
        packages,
        invoices,
        odps,
        wilayahs,
        mutations,
        radiusSessions,
        radiusConfig,
        mikrotikConfig,
        whatsAppConfig,
        whatsAppLogs,
        employees,
        autoIsolirSettings,
        dashboardWidgets,
        activeRemoteModemCustomer,
        setActiveRemoteModemCustomer,
        publicViewInvoice,
        setPublicViewInvoice,
        publicIsolirCustomer,
        setPublicIsolirCustomer,
        switchTenant,
        goToMasterPortal,
        registerNewTenant,
        toggleDemoMode,
        setAutoSyncPreventDemo,
        addPackage,
        updatePackage,
        deletePackage,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        bulkImportCustomers,
        isolateCustomer,
        unIsolateCustomer,
        addODP,
        updateODP,
        deleteODP,
        addWilayah,
        updateWilayah,
        deleteWilayah,
        payInvoice,
        createInvoiceForCustomer,
        processMootaMutation,
        simulateIncomingBankTransfer,
        disconnectRadiusSession,
        updateMikrotikConfig,
        updateRadiusConfig,
        updateModemDetails,
        rebootModem,
        updateWhatsAppConfig,
        sendWhatsAppNotification,
        broadcastWhatsAppReminder,
        updateTenantBranding,
        updateAutoIsolirSettings,
        updateDashboardWidgets,
        addEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </ISPContext.Provider>
  );
};

export const useISP = () => {
  const context = useContext(ISPContext);
  if (!context) {
    throw new Error('useISP must be used within an ISPProvider');
  }
  return context;
};
