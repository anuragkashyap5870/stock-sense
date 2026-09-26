import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../store/inventoryStore';
import {
  Menu,
  Search,
  Warehouse,
  ChevronDown,
  Plus,
  Bell,
  Check,
  AlertTriangle,
  ArrowRight,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    selectedWarehouseId,
    setSelectedWarehouseId,
    warehouses,
    setIsMobileSidebarOpen,
    setIsGlobalSearchOpen,
    setActiveModal,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    currentUser,
    isSidebarCollapsed,
  } = useInventory();

  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const warehouseRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (warehouseRef.current && !warehouseRef.current.contains(event.target as Node)) {
        setIsWarehouseDropdownOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#111318]/95 backdrop-blur-md border-b border-[#292D35] z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-200 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } left-0`}
    >
      {/* Left zone: Mobile Toggle + Warehouse Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#1E222A] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Warehouse Selector Dropdown */}
        <div className="relative" ref={warehouseRef}>
          <button
            onClick={() => setIsWarehouseDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-[#171A20] hover:bg-[#1E222A] border border-[#292D35] text-[#F8FAFC] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Warehouse className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-mono truncate max-w-[140px] sm:max-w-[240px]">
              {selectedWarehouseId === 'ALL'
                ? 'All Facilities (Consolidated)'
                : `[${selectedWarehouse?.code}] ${selectedWarehouse?.name}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {isWarehouseDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-[#64748B] font-semibold border-b border-[#292D35] mb-1">
                Select Operational Facility
              </div>
              <button
                onClick={() => {
                  setSelectedWarehouseId('ALL');
                  setIsWarehouseDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  selectedWarehouseId === 'ALL'
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B] font-semibold'
                    : 'text-[#F8FAFC] hover:bg-[#1E222A]'
                }`}
              >
                <span>All Facilities (Consolidated)</span>
                {selectedWarehouseId === 'ALL' && <Check className="w-3.5 h-3.5" />}
              </button>

              {warehouses.map((wh) => (
                <button
                  key={wh.id}
                  onClick={() => {
                    setSelectedWarehouseId(wh.id);
                    setIsWarehouseDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                    selectedWarehouseId === wh.id
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B] font-semibold'
                      : 'text-[#F8FAFC] hover:bg-[#1E222A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">[{wh.code}] {wh.name}</span>
                    {selectedWarehouseId === wh.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] truncate">{wh.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center / Search zone */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between bg-[#171A20] hover:bg-[#1E222A] border border-[#292D35] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] transition-colors group text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors" />
            <span className="truncate">Search products, SKUs, receipts, transfers...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-[#0B0D10] border border-[#292D35] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#64748B]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right zone: Live Sync, Quick Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search button */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="md:hidden text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-lg hover:bg-[#171A20] transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Live Sync telemetry status */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#171A20] border border-[#292D35] px-2.5 py-1 rounded-full text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-[11px] font-mono font-medium text-[#22C55E]">Live Sync (0s)</span>
        </div>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => setIsQuickActionOpen((prev) => !prev)}
            className="flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold">
                Operational Launchers
              </div>
              <button
                onClick={() => {
                  setActiveModal('newReceipt');
                  setIsQuickActionOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#F8FAFC] hover:bg-[#1E222A] flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span>+ New Receipt (Inbound)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('newDelivery');
                  setIsQuickActionOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#F8FAFC] hover:bg-[#1E222A] flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span>+ New Delivery (Outbound)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('newTransfer');
                  setIsQuickActionOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#F8FAFC] hover:bg-[#1E222A] flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>+ Internal Transfer</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('newAdjustment');
                  setIsQuickActionOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#F8FAFC] hover:bg-[#1E222A] flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>+ Stock Adjustment</span>
              </button>
              <div className="border-t border-[#292D35] my-1" />
              <button
                onClick={() => {
                  setActiveModal('newProduct');
                  setIsQuickActionOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#F59E0B] hover:bg-[#1E222A] font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Product</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171A20] rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-80 sm:w-96 bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#292D35] mb-1">
                <span className="text-xs font-semibold text-[#F8FAFC]">Inventory Alerts & Events</span>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-mono text-[#F59E0B] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#64748B]">No notifications recorded.</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) setActiveTab(notif.linkTab);
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        notif.read ? 'hover:bg-[#1E222A] opacity-75' : 'bg-[#1E222A]/80 hover:bg-[#1E222A] border-l-2 border-[#F59E0B]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#F8FAFC] leading-snug">{notif.title}</span>
                        <span className="text-[10px] font-mono text-[#64748B] flex-shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Thumbnail */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#171A20] transition-colors"
          title="Open User Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#1E222A] border border-[#292D35] flex items-center justify-center font-bold text-xs text-[#F59E0B] overflow-hidden">
            AS
          </div>
        </button>
      </div>
    </header>
  );
};
