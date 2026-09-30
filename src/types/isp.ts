export type SubscriptionPlan = 'Enterprise Full Fitur';

export interface BankAccount {
  bankName: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'BSI';
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
}

export interface InternetPackage {
  id: string;
  name: string; // e.g. "Paket Home Turbo 30 Mbps"
  speedDownloadMbps: number;
  speedUploadMbps: number;
  priceMonthly: number;
  rateLimitMikrotik: string; // e.g. "30M/30M"
  mikrotikProfileName: string; // e.g. "PROFILE-30M"
  description: string;
  features: string[];
  isPopular?: boolean;
  activeSubscriberCount: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string; // e.g. "citranet", domain = "citranet.monisys.web.id"
  domain: string;
  logoText: string;
  logoUrl?: string;
  slogan: string;
  themeColor: 'indigo' | 'blue' | 'emerald' | 'cyan' | 'violet';
  primaryColorHex: string;
  address: string;
  phone: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'trial' | 'past_due';
  subscriptionPrice: number;
  registeredAt: string;
  bankAccounts: BankAccount[];
  hqLat?: number;
  hqLng?: number;
  coverageRadiusKm?: number;
}

export interface ModemDetails {
  brand: 'ZTE' | 'Huawei' | 'FiberHome' | 'VSOL';
  model: string;
  serialNumber: string;
  ponStatus: 'O5 (Operational)' | 'O3 (Serial Number)' | 'LOS (Red Alarm)' | 'Offline';
  rxPowerDbm: number; // e.g. -19.45
  txPowerDbm: number; // e.g. +2.30
  temperature: number; // Celsius
  voltage: number; // Volts
  wifiSsid: string;
  wifiPassword: string;
  wanIp: string;
  lan1: boolean;
  lan2: boolean;
  lan3: boolean;
  lan4: boolean;
  uptime: string;
  connectedDevices: number;
}

export interface Customer {
  id: string;
  customerCode: string; // e.g. CUST-1049
  name: string;
  phone: string; // WA format: 0812xxx or 62812xxx
  email: string;
  address: string;
  packageId: string;
  packageName: string;
  speedMbps: number;
  monthlyPrice: number;
  pppoeUsername: string;
  pppoePassword: string;
  ipAddress: string;
  macAddress: string;
  odpId: string;
  odpName: string;
  wilayahId: string;
  wilayahName: string;
  lat: number;
  lng: number;
  status: 'active' | 'isolated' | 'pending' | 'suspended';
  isolatedAt?: string;
  modem: ModemDetails;
  joinedDate: string;
  dueDateDay: number; // 1-28
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-202609-001
  customerId: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  period: string; // "Oktober 2026"
  baseAmount: number;
  uniqueCode: number; // 3-digit unique code for Moota bank validation
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'isolated';
  paymentMethod?: 'QRIS' | 'MOOTA_BCA' | 'MOOTA_MANDIRI' | 'MOOTA_BRI' | 'MANUAL';
  paidAt?: string;
  paymentToken: string; // for public link
  waReminderSentCount: number;
}

export interface MootaMutation {
  id: string;
  bankType: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  accountNumber: string;
  transactionDate: string;
  amount: number;
  type: 'CR' | 'DB';
  description: string;
  matchedInvoiceNumber?: string;
  isMatched: boolean;
}

export interface ODP {
  id: string;
  code: string;
  name: string;
  wilayahId: string;
  wilayahName: string;
  capacity: number; // e.g. 8, 16, 24
  usedPorts: number;
  lat: number;
  lng: number;
  status: 'active' | 'maintenance' | 'full';
  notes: string;
}

export interface Wilayah {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLng: number;
  coverageRadiusKm?: number;
  totalOdp: number;
  totalCustomers: number;
  description: string;
}

export interface RadiusSession {
  id: string;
  username: string;
  nasIp: string;
  framedIp: string;
  callingStationId: string;
  startTime: string;
  uptimeSeconds: number;
  uploadBytes: number;
  downloadBytes: number;
  status: 'online' | 'terminated';
}

export interface RadiusConfig {
  host: string;
  authPort: number;
  acctPort: number;
  secret: string;
  nasIdentifier: string;
  isEnabled: boolean;
  status: 'connected' | 'unreachable';
}

export interface MikrotikConfig {
  host: string;
  apiPort: number;
  username: string;
  password: string;
  useSsl: boolean;
  status: 'connected' | 'error' | 'disconnected';
  routerIdentity: string;
  routerOsVersion: string;
  cpuLoad: number;
  uptime: string;
  lastSync: string;
}

export interface WhatsAppConfig {
  provider: 'wablas' | 'fonnte' | 'custom';
  apiToken: string;
  serverUrl: string;
  deviceId: string;
  status: 'connected' | 'disconnected';
  autoReminderH3: boolean;
  autoReminderH1: boolean;
  autoPaymentSuccess: boolean;
  autoIsolirWarning: boolean;
  templateReminder: string;
  templateSuccess: string;
  templateIsolir: string;
}

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  type: 'tagihan_h3' | 'tagihan_h1' | 'tagihan_terbit' | 'lunas' | 'isolir' | 'custom';
  content: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Network Engineer (NOC)' | 'Finance & Kasir' | 'Teknisi Lapangan' | 'Customer Service';
  status: 'active' | 'inactive';
  lastActive: string;
  avatarSeed: string;
  permissions: {
    canManageBilling: boolean;
    canIsolirCustomer: boolean;
    canAccessRemoteModem: boolean;
    canEditMikrotik: boolean;
    canManageEmployees: boolean;
  };
}

export interface AutoIsolirSettings {
  isEnabled: boolean;
  dueDateCutoffDay: number; // e.g. tanggal 15
  gracePeriodDays: number; // e.g. 2 hari setelah jatuh tempo
  autoActionHour: string; // e.g. "00:01"
  firewallAddressList: string; // "ISOLIR_CLIENT"
  redirectWebIsolirUrl: string;
  autoRestoreOnPaid: boolean;
  sendWhatsAppOnIsolir: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  category: 'metric' | 'chart' | 'list';
}
