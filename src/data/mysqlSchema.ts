export const MYSQL_DDL = `-- ============================================================================
-- MONISYS ISP HUB - MULTI-TENANT DATABASE SCHEMA (MySQL 8.0+)
-- Generated for MoniSys Production & VSCode Environment
-- ============================================================================

CREATE DATABASE IF NOT EXISTS monisys_isp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE monisys_isp_db;

-- 1. Tenants (Multi-tenant company & ISP profiles)
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(64) UNIQUE NOT NULL,
  domain VARCHAR(150) UNIQUE NOT NULL,
  logo_text VARCHAR(20) DEFAULT 'ISP',
  logo_url VARCHAR(255) NULL,
  slogan VARCHAR(255) NULL,
  theme_color VARCHAR(30) DEFAULT 'indigo',
  primary_color_hex VARCHAR(10) DEFAULT '#6366f1',
  address TEXT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(100) NULL,
  subscription_plan VARCHAR(50) DEFAULT 'Enterprise Full Fitur',
  subscription_status ENUM('active', 'trial', 'past_due') DEFAULT 'active',
  subscription_price DECIMAL(12,2) DEFAULT 499000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Wilayah (Coverage distribution areas)
CREATE TABLE IF NOT EXISTS wilayah (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  center_lat DECIMAL(10, 7) NOT NULL,
  center_lng DECIMAL(10, 7) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. ODP (Optical Distribution Points)
CREATE TABLE IF NOT EXISTS odp (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  wilayah_id VARCHAR(64) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  capacity INT NOT NULL DEFAULT 16,
  used_ports INT NOT NULL DEFAULT 0,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  status ENUM('active', 'maintenance', 'full') DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (wilayah_id) REFERENCES wilayah(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Internet Packages (Profil Kecepatan & Tarif Bulanan)
CREATE TABLE IF NOT EXISTS internet_packages (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  name VARCHAR(150) NOT NULL,
  speed_download_mbps INT NOT NULL,
  speed_upload_mbps INT NOT NULL,
  price_monthly DECIMAL(12,2) NOT NULL,
  rate_limit_mikrotik VARCHAR(50) NOT NULL,
  mikrotik_profile_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  features JSON NULL,
  is_popular TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Customers (Pelanggan FTTH & Wireless)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(100) NULL,
  address TEXT NOT NULL,
  package_name VARCHAR(100) NOT NULL,
  speed_mbps INT NOT NULL DEFAULT 20,
  monthly_price DECIMAL(12,2) NOT NULL,
  pppoe_username VARCHAR(100) NOT NULL,
  pppoe_password VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  mac_address VARCHAR(30) NULL,
  odp_id VARCHAR(64) NOT NULL,
  wilayah_id VARCHAR(64) NOT NULL,
  lat DECIMAL(10, 7) NULL,
  lng DECIMAL(10, 7) NULL,
  status ENUM('active', 'isolated', 'pending', 'suspended') DEFAULT 'active',
  isolated_at DATETIME NULL,
  due_date_day INT NOT NULL DEFAULT 10,
  modem_brand VARCHAR(50) DEFAULT 'ZTE',
  modem_model VARCHAR(50) DEFAULT 'F609',
  modem_sn VARCHAR(50) NULL,
  wifi_ssid VARCHAR(100) NULL,
  wifi_password VARCHAR(100) NULL,
  joined_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (odp_id) REFERENCES odp(id),
  FOREIGN KEY (wilayah_id) REFERENCES wilayah(id)
) ENGINE=InnoDB;

-- 5. Invoices (Billing & Tagihan by Link)
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  period VARCHAR(50) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  unique_code INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('unpaid', 'paid', 'overdue', 'isolated') DEFAULT 'unpaid',
  payment_method VARCHAR(50) NULL,
  paid_at DATETIME NULL,
  payment_token VARCHAR(100) NOT NULL,
  wa_reminder_sent_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Moota Bank Mutations (Mutasi Bank Otomatis)
CREATE TABLE IF NOT EXISTS moota_mutations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  bank_type ENUM('BCA', 'MANDIRI', 'BRI', 'BNI') NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  transaction_date DATETIME NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  mutation_type ENUM('CR', 'DB') DEFAULT 'CR',
  description TEXT NOT NULL,
  matched_invoice_number VARCHAR(50) NULL,
  is_matched TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. WhatsApp Logs & Configs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  recipient_phone VARCHAR(30) NOT NULL,
  recipient_name VARCHAR(150) NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('sent', 'delivered', 'failed') DEFAULT 'delivered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Employees & RBAC
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

export function generateSqlDump(tenantId: string, currentData: {
  tenantName: string;
  customersCount: number;
  invoicesCount: number;
  odpCount: number;
}): string {
  const timestamp = new Date().toISOString();
  return `-- =======================================================
-- MONISYS DATABASE EXPORT
-- Tenant: ${currentData.tenantName} (${tenantId})
-- Date: ${timestamp}
-- Customers: ${currentData.customersCount}
-- Invoices: ${currentData.invoicesCount}
-- ODP: ${currentData.odpCount}
-- =======================================================

${MYSQL_DDL}

-- INSERT SAMPLE DATA RECORD
INSERT INTO tenants (id, name, slug, domain, slogan, theme_color, subscription_plan)
VALUES ('${tenantId}', '${currentData.tenantName}', 'isp-active', '${currentData.tenantName.toLowerCase().replace(/\s+/g, '')}.monisys.web.id', 'High Speed FTTH Provider', 'indigo', 'Enterprise Full Fitur')
ON DUPLICATE KEY UPDATE name=VALUES(name);
`;
}
