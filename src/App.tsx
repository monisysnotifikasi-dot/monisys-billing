/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ISPProvider, useISP } from './context/ISPContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { TenantSelectorModal } from './components/layout/TenantSelectorModal';
import { MasterDomainLanding } from './components/portal/MasterDomainLanding';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerListView } from './components/customers/CustomerListView';
import { InvoiceListView } from './components/billing/InvoiceListView';
import { PaymentGatewayMoota } from './components/billing/PaymentGatewayMoota';
import { OdpWilayahView } from './components/network/OdpWilayahView';
import { WebIsolirView } from './components/isolir/WebIsolirView';
import { RadiusServerView } from './components/network/RadiusServerView';
import { MikrotikConfigView } from './components/network/MikrotikConfigView';
import { WhatsAppGatewayView } from './components/communication/WhatsAppGatewayView';
import { CompanyProfileView } from './components/company/CompanyProfileView';
import { EmployeeRbacView } from './components/company/EmployeeRbacView';
import { MysqlManagerView } from './components/database/MysqlManagerView';
import { RemoteModemModal } from './components/network/RemoteModemModal';
import { PublicPaymentPortal } from './components/billing/PublicPaymentPortal';
import { IsolirCustomerLanding } from './components/isolir/IsolirCustomerLanding';
import { InternetPackageView } from './components/packages/InternetPackageView';

function ISPAppContent() {
  const {
    isMasterPortal,
    switchTenant,
    allTenants,
    currentTenant,
    publicViewInvoice,
    setPublicViewInvoice,
    publicIsolirCustomer,
    setPublicIsolirCustomer,
    invoices,
    broadcastWhatsAppReminder,
  } = useISP();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isTenantModalOpen, setIsTenantModalOpen] = useState<boolean>(false);
  const [globalBannerMsg, setGlobalBannerMsg] = useState<string | null>(null);

  // ========================================================
  // LOGIKA MULTI-TENANT DOMAIN ROUTING
  // ========================================================
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';

  // Cek apakah sedang membuka subdomain tenant (misal: xplorefiber.monisys.web.id)
  const isSubdomainTenant =
    (hostname.endsWith('.monisys.web.id') && hostname !== 'monisys.web.id' && !hostname.startsWith('www.')) ||
    (hostname.includes('.localhost') && hostname !== 'localhost');

  // Jika membuka domain root utama (monisys.web.id atau www.monisys.web.id), tampilkan Master Landing & Registrasi
  const isMainLanding =
    (hostname === 'monisys.web.id' || hostname === 'www.monisys.web.id' || isMasterPortal) &&
    !isSubdomainTenant;

  // Otomatis sinkronkan tenant jika diakses lewat subdomain langsung (misal xplorefiber.monisys.web.id)
  useEffect(() => {
    if (isSubdomainTenant) {
      const sub = hostname.split('.')[0];
      const matched = allTenants.find(
        (t) => (t.subdomain && t.subdomain.toLowerCase() === sub) || t.id.toLowerCase().includes(sub)
      );
      if (matched && matched.id !== currentTenant.id) {
        switchTenant(matched.id);
      }
    }
  }, [hostname, isSubdomainTenant, allTenants, currentTenant.id, switchTenant]);

  // 1. Jika di domain utama (monisys.web.id), tampilkan Halaman Landing & Registrasi Tenant Baru
  if (isMainLanding) {
    return (
      <MasterDomainLanding
        onTenantSelect={(tId) => {
          const selected = allTenants.find((t) => t.id === tId);
          if (selected) {
            // Jika di domain monisys.web.id, arahkan langsung ke subdomain tenant tersebut
            if (hostname.includes('monisys.web.id')) {
              const sub = selected.slug || selected.subdomain || selected.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                window.location.href = `https://${sub}.monisys.web.id`;
              return;
            }
          }
          switchTenant(tId);
        }}
      />
    );
  }

  // 2. Jika sedang melihat tagihan customer (/pay/:token)
  if (publicViewInvoice) {
    return (
      <PublicPaymentPortal
        invoice={publicViewInvoice}
        onClose={() => setPublicViewInvoice(null)}
      />
    );
  }

  // 3. Jika sedang melihat simulasi Web Isolir
  if (publicIsolirCustomer) {
    return (
      <IsolirCustomerLanding
        customer={publicIsolirCustomer}
        onPayNow={() => {
          const inv = invoices.find(
            (i) => i.customerId === publicIsolirCustomer.id && i.status !== 'paid'
          );
          if (inv) {
            setPublicIsolirCustomer(null);
            setPublicViewInvoice(inv);
          }
        }}
        onBackToAdmin={() => setPublicIsolirCustomer(null)}
      />
    );
  }

  // 4. Default: Tampilan Dashboard Operasional Tenant ISP
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenTenantModal={() => setIsTenantModalOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        <Topbar
          onOpenMootaSim={() => setActiveTab('moota')}
          onBroadcastWa={() => {
            const count = broadcastWhatsAppReminder();
            setGlobalBannerMsg(`Berhasil mengirimkan broadcast pengingat tagihan ke ${count} pelanggan.`);
            setTimeout(() => setGlobalBannerMsg(null), 3000);
          }}
        />

        {globalBannerMsg && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-400 font-medium">
            {globalBannerMsg}
          </div>
        )}

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
            {activeTab === 'customers' && <CustomerListView />}
            {activeTab === 'packages' && <InternetPackageView />}
            {activeTab === 'billing' && <InvoiceListView />}
            {activeTab === 'moota' && <PaymentGatewayMoota />}
            {activeTab === 'odp' && <OdpWilayahView />}
            {activeTab === 'isolir' && <WebIsolirView />}
            {activeTab === 'radius' && <RadiusServerView />}
            {activeTab === 'mikrotik' && <MikrotikConfigView />}
            {activeTab === 'whatsapp' && <WhatsAppGatewayView />}
            {activeTab === 'company' && <CompanyProfileView />}
            {activeTab === 'employees' && <EmployeeRbacView />}
            {activeTab === 'mysql' && <MysqlManagerView />}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <RemoteModemModal />

      {isTenantModalOpen && (
        <TenantSelectorModal onClose={() => setIsTenantModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ISPProvider>
      <ISPAppContent />
    </ISPProvider>
  );
}