import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { Warehouse as WarehouseIcon, Plus, MapPin, Building, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Warehouse } from '../types/inventory';

export const WarehousesPage: React.FC = () => {
  const { warehouses, products, addWarehouse, showToast } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhCode, setNewWhCode] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhCap, setNewWhCap] = useState('8000');

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhCode.trim()) return;

    addWarehouse({
      name: newWhName.trim(),
      code: newWhCode.trim().toUpperCase(),
      address: newWhAddress.trim() || 'Industrial Complex Belt',
      totalProductsCount: 0,
      totalCapacityM3: Number(newWhCap) || 5000,
      occupiedCapacityPercent: 12,
      status: 'Active',
      locations: [
        { id: `loc-${Date.now()}-1`, name: 'Receiving Dock 1', type: 'Receiving', capacityM3: 2000, currentItemsCount: 0 },
        { id: `loc-${Date.now()}-2`, name: 'Storage Rack A', type: 'Storage Rack', capacityM3: 3000, currentItemsCount: 0 },
        { id: `loc-${Date.now()}-3`, name: 'Dispatch Bay 1', type: 'Dispatch Bay', capacityM3: 3000, currentItemsCount: 0 },
      ],
    });

    setIsAddModalOpen(false);
    setNewWhName('');
    setNewWhCode('');
    setNewWhAddress('');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
              Facility Topology
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">3 Production Hubs Linked</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Warehouse Network &amp; Locations
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Configure physical storage facilities, capacity limits, bay telemetry, and rack allocations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Warehouse</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="space-y-5">
        {warehouses.map((wh) => {
          // Calculate stock in this warehouse
          const whProducts = products.filter((p) =>
            p.locationStocks.some((ls) => ls.warehouseId === wh.id && ls.quantity > 0)
          );
          const totalStockInWh = whProducts.reduce((sum, p) => {
            const ls = p.locationStocks.find((l) => l.warehouseId === wh.id);
            return sum + (ls ? ls.quantity : 0);
          }, 0);

          return (
            <div
              key={wh.id}
              className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden space-y-4 p-5"
            >
              {/* Warehouse Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#292D35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center font-mono font-bold text-sm">
                    <WarehouseIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#F8FAFC]">{wh.name}</h2>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0B0D10] text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
                        {wh.code}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] uppercase font-semibold">
                        {wh.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                      {wh.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Active SKUs</span>
                    <span className="font-bold text-[#F8FAFC]">{whProducts.length} SKUs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Physical Units</span>
                    <span className="font-bold text-[#22C55E]">{totalStockInWh.toLocaleString()} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Capacity</span>
                    <span className="font-bold text-[#F8FAFC]">{wh.occupiedCapacityPercent}% occupied</span>
                  </div>
                </div>
              </div>

              {/* Warehouse Locations / Bays */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#F8FAFC] block">Configured Bays &amp; Racks</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wh.locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#F8FAFC]">{loc.name}</span>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#171A20] text-[#94A3B8]">
                          {loc.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
                        <span>Capacity: {loc.capacityM3} m³</span>
                        <span className="text-[#22C55E]">{loc.currentItemsCount} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Warehouse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#292D35] pb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Provision New Facility</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="e.g. Export Distribution Terminal"
                  className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Code *</label>
                  <input
                    type="text"
                    required
                    value={newWhCode}
                    onChange={(e) => setNewWhCode(e.target.value)}
                    placeholder="WH-004"
                    className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Capacity (m³)</label>
                  <input
                    type="number"
                    value={newWhCap}
                    onChange={(e) => setNewWhCap(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Address</label>
                <input
                  type="text"
                  value={newWhAddress}
                  onChange={(e) => setNewWhAddress(e.target.value)}
                  placeholder="Street / City / Industrial Area"
                  className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#292D35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#111318] text-xs text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#F59E0B] text-[#0B0D10] text-xs font-bold"
                >
                  Provision Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
