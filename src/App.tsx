import React from 'react';
import { InventoryProvider, useInventory } from './store/inventoryStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { NewProductModal } from './components/modals/NewProductModal';
import { NewReceiptModal } from './components/modals/NewReceiptModal';
import { NewDeliveryModal } from './components/modals/NewDeliveryModal';
import { InternalTransferModal } from './components/modals/InternalTransferModal';
import { StockAdjustmentModal } from './components/modals/StockAdjustmentModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { StockByLocationPage } from './pages/StockByLocationPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { DeliveryOrdersPage } from './pages/DeliveryOrdersPage';
import { InternalTransfersPage } from './pages/InternalTransfersPage';
import { StockAdjustmentsPage } from './pages/StockAdjustmentsPage';
import { MoveHistoryLedgerPage } from './pages/MoveHistoryLedgerPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab, isSidebarCollapsed } = useInventory();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'stock-by-location':
        return <StockByLocationPage />;
      case 'receipts':
        return <ReceiptsPage />;
      case 'delivery-orders':
        return <DeliveryOrdersPage />;
      case 'internal-transfers':
        return <InternalTransfersPage />;
      case 'stock-adjustments':
        return <StockAdjustmentsPage />;
      case 'move-history-ledger':
        return <MoveHistoryLedgerPage />;
      case 'warehouses':
        return <WarehousesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F8FAFC] flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Sidebar */}
      <Sidebar isMobile={true} />

      {/* Top Header */}
      <Header />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 pt-16 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } pl-0`}
      >
        <div className="w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-7">
          {renderActiveTab()}
        </div>
      </main>

      {/* Operational Modals */}
      <NewProductModal />
      <NewReceiptModal />
      <NewDeliveryModal />
      <InternalTransferModal />
      <StockAdjustmentModal />
      <GlobalSearchModal />

      {/* Fixed HUD Floating Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
