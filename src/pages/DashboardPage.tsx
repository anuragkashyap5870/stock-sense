import React from 'react';
import { useInventory } from '../store/inventoryStore';
import { DemoFlowBar } from '../components/layout/DemoFlowBar';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { MovementChart } from '../components/dashboard/MovementChart';
import { RecentOperationsTable } from '../components/dashboard/RecentOperationsTable';
import { LowStockAlerts } from '../components/dashboard/LowStockAlerts';
import { FacilityOccupancy } from '../components/dashboard/FacilityOccupancy';
import { LiveSystemEvents } from '../components/dashboard/LiveSystemEvents';
import { CategoryDistribution } from '../components/dashboard/CategoryDistribution';
import {
  Sparkles,
  PlusCircle,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser, setActiveModal, selectedWarehouseId, warehouses } = useInventory();

  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header Command Banner */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Good morning, {currentUser.name}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1E222A] text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
              {selectedWarehouseId === 'ALL' ? 'GLOBAL NETWORK ACTIVE' : `[${selectedWh?.code || 'WH-001'}] ACTIVE`}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            Real-Time Inventory Command Center • All systems synchronized across 3 facilities
          </p>
        </div>

        {/* Quick Action Launchers Bar */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setActiveModal('newReceipt')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={() => setActiveModal('newDelivery')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg border border-[#292D35] transition-all"
          >
            <Truck className="w-4 h-4 text-[#3B82F6]" />
            <span>New Delivery</span>
          </button>
          <button
            onClick={() => setActiveModal('newTransfer')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg border border-[#292D35] transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#F59E0B]" />
            <span>Internal Transfer</span>
          </button>
          <button
            onClick={() => setActiveModal('newAdjustment')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg border border-[#292D35] transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#EF4444]" />
            <span>Stock Adjustment</span>
          </button>
          <button
            onClick={() => setActiveModal('newProduct')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg border border-[#292D35] transition-all"
          >
            <Package className="w-4 h-4 text-[#22C55E]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Interactive Hackathon Demo Workflow Pipeline */}
      <DemoFlowBar />

      {/* 7 Core KPI Cards */}
      <KpiGrid />

      {/* Main Dual-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 of 12 cols): Chart & Table */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          <MovementChart />
          <RecentOperationsTable />
        </div>

        {/* Right Column (4 of 12 cols): Alerts & Occupancy */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          <LowStockAlerts />
          <CategoryDistribution />
          <FacilityOccupancy />
          <LiveSystemEvents />
        </div>
      </div>

      {/* Operational Engine Footer */}
      <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#F59E0B] flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">Precision Warehouse Verification Engine (v4.8.2-prod)</h4>
            <p className="text-[11px] text-[#94A3B8]">All operations are immutable and signed via cryptographic hardware keys.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-[#64748B] block text-[10px]">System Latency</span>
            <span className="text-[#22C55E] font-bold">12 ms</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px]">Sync State</span>
            <span className="text-[#22C55E] font-bold">Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
