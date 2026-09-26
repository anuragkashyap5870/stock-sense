import React from 'react';
import { useInventory } from '../store/inventoryStore';
import { Settings, RotateCcw, ShieldAlert, Bell, Sliders, Warehouse, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetDemoData, setActiveTab, showToast } = useInventory();

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      {/* Header */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
            System Preferences
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
          StockSense System Settings
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Manage inventory thresholds, automated ledger triggers, facility mappings, and hackathon demo state.
        </p>
      </div>

      {/* Demo Data Management Card (Explicit Hackathon Requirement) */}
      <div className="bg-[#171A20] border border-[#F59E0B]/30 rounded-xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Hackathon Demo Data Management</h3>
              <p className="text-xs text-[#94A3B8]">
                Reset all warehouses, products, and movements to initial clean demo state.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B0D10] border border-[#292D35] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#94A3B8]">
            Restores initial values: Steel Rod (500 kg), Copper Wire (78 m), 3 connected facilities, and reset demo trail.
          </div>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Quick Links to Sub-Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('warehouses')}
          className="bg-[#171A20] border border-[#292D35] hover:border-[#F59E0B]/50 p-4 rounded-xl shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B]">
              Warehouses &amp; Locations
            </h4>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Configure physical storage hubs, racks, aisles, receiving docks, and dispatch bays.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('profile')}
          className="bg-[#171A20] border border-[#292D35] hover:border-[#F59E0B]/50 p-4 rounded-xl shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
            <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B]">
              Security &amp; Permissions
            </h4>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Role-based access control, cryptographic key signatures, and operator audit credentials.
          </p>
        </div>
      </div>

      {/* Operational Policy Toggles */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md space-y-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">Inventory Safeguards &amp; Policies</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC] block">
                Strict Negative Stock Prohibition
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Blocks dispatch orders if requested quantity exceeds active physical stock.
              </span>
            </div>
            <span className="font-mono text-xs text-[#22C55E] font-bold">ENFORCED</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC] block">
                Adjustment Confirmation Protocol
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Requires supervisor verification before applying write-off inventory variances.
              </span>
            </div>
            <span className="font-mono text-xs text-[#22C55E] font-bold">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC] block">
                Automatic Movement Ledgering
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Every receipt, transfer, delivery, and recount writes immutable audit blocks.
              </span>
            </div>
            <span className="font-mono text-xs text-[#22C55E] font-bold">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
