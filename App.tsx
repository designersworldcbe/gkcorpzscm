
import React from 'react';
import Layout, { Tab } from './components/Layout';
import Dashboard from './components/Dashboard';
import { PartsMaster, CustomersMaster, SuppliersMaster, ProcessMaster } from './components/MasterData';
import ToolingMaster from './components/ToolingMaster';
import SalesOrders from './components/SalesOrders';
import CustomerInvoicing from './components/CustomerInvoicing';
import PurchaseOrders from './components/PurchaseOrders';
import InboundReceipts from './components/InboundReceipts';
import JobWorkOrders from './components/JobWorkOrders';
import JobWorkReceipts from './components/JobWorkReceipts';
import JobWorkInvoicing from './components/JobWorkInvoicing';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { AppProvider, useApp } from './store/AppContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <Layout>
      {(activeTab) => {
        switch (activeTab) {
          case 'Dashboard': return <Dashboard />;
          case 'Product Master': return <PartsMaster />;
          case 'Customer Accounts': return <CustomersMaster />;
          case 'Vendor Registry': return <SuppliersMaster />;
          case 'Process Master': return <ProcessMaster />;
          case 'Asset Management': return <ToolingMaster />;
          case 'Sales Orders': return <SalesOrders />;
          case 'Customer Invoicing': return <CustomerInvoicing />;
          case 'Purchase Orders': return <PurchaseOrders />;
          case 'Inbound Receipts (GRN)': return <InboundReceipts />;
          case 'Job Work Orders': return <JobWorkOrders />;
          case 'JW Receipts (Inward)': return <JobWorkReceipts />;
          case 'JW Service Invoicing': return <JobWorkInvoicing />;
          case 'Inventory Controls': return <Inventory />;
          case 'Financial Reports': return <Reports />;
          case 'Portal Settings': return <Settings />;
          default: return <Dashboard />;
        }
      }}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
