/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

  // 1. If currently viewing master root portal (monisys.web.id)
  if (isMasterPortal) {
    return <MasterDomainLanding onTenantSelect={(tId) => switchTenant(tId)} />;
  }

  // 2. If viewing a customer invoice by link (/pay/:token)
  if (publicViewInvoice) {
    return (
      <PublicPaymentPortal
        invoice={publicViewInvoice}
        onClose={() => setPublicViewInvoice(null)}
      />
    );
  }

  // 3. If viewing simulated Web Isolir landing page
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

  // 4. Default: Standard Full ISP Administrator & Network Monitoring Panel
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
