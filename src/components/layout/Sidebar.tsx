import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  Package,
  Layers,
  MapPin,
  ClipboardCheck,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
}

interface NavSubItem {
  id: string;
  label: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false }) => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    currentUser,
    logout,
    pendingReceiptsCount,
    pendingDeliveriesCount,
    totalProductsCount,
  } = useInventory();

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const navItems: NavGroup[] = [
    {
      group: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'products',
          label: 'Products',
          icon: Package,
          badge: totalProductsCount.toLocaleString(),
          subItems: [
            { id: 'products', label: 'All Products' },
            { id: 'categories', label: 'Categories' },
            { id: 'stock-by-location', label: 'Stock by Location' },
          ],
        },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'receipts',
          label: 'Receipts',
          icon: ClipboardCheck,
          badge: `${pendingReceiptsCount} Pending`,
          badgeVariant: 'amber',
        },
        {
          id: 'delivery-orders',
          label: 'Delivery Orders',
          icon: Truck,
          badge: pendingDeliveriesCount.toString(),
        },
        { id: 'internal-transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
        { id: 'stock-adjustments', label: 'Stock Adjustments', icon: SlidersHorizontal },
      ],
    },
    {
      group: 'INVENTORY & INSIGHTS',
      items: [
        { id: 'move-history-ledger', label: 'Move History & Ledger', icon: History },
        { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-64';

  const content = (
    <div className="flex flex-col h-full bg-[#111318] border-r border-[#292D35] select-none">
      {/* Sidebar Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#292D35] bg-[#0E1015]">
        <Logo collapsed={isSidebarCollapsed} />
        {!isMobile ? (
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#1E222A] transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#1E222A] transition-colors"
            aria-label="Close mobile sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-[#64748B] uppercase">
                {group.group}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.subItems && item.subItems.some((sub) => sub.id === activeTab));

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-all group ${
                      isActive
                        ? 'bg-[#F59E0B] text-[#0B0D10] font-semibold shadow-[0_1px_8px_rgba(245,158,11,0.25)]'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171A20]'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-[#0B0D10]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#0B0D10]/20 text-[#0B0D10]'
                            : item.badgeVariant === 'amber'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : 'bg-[#1E222A] text-[#94A3B8]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Sub-items for Products */}
                  {!isSidebarCollapsed && item.subItems && isActive && (
                    <div className="pl-8 pr-1 py-0.5 space-y-0.5 border-l border-[#292D35]/50 ml-4 mt-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              isSubActive
                                ? 'bg-[#171A20] text-[#F59E0B] font-semibold'
                                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171A20]/60'
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-3 border-t border-[#292D35] bg-[#0E1015]">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#171A20] transition-colors">
          <button
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-2.5 overflow-hidden text-left flex-1"
          >
            {/* Aarav Sharma Avatar */}
            <div className="relative w-8 h-8 rounded-full bg-[#1E222A] border border-[#292D35] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="font-bold text-xs text-[#F59E0B]">AS</span>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#22C55E] border border-[#111318] rounded-full" />
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#F8FAFC] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-[#94A3B8] truncate">{currentUser.role}</span>
                <span className="text-[9px] font-mono text-[#F59E0B] truncate">{currentUser.assignedWarehouseName}</span>
              </div>
            )}
          </button>

          {!isSidebarCollapsed && (
            <button
              onClick={logout}
              className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#1E222A] transition-colors flex-shrink-0"
              title="Sign Out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    if (!isMobileSidebarOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 h-screen ${sidebarWidth} z-30 transition-all duration-200`}
    >
      {content}
    </aside>
  );
};
