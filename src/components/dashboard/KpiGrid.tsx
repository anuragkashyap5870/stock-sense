import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import {
  Package,
  Boxes,
  AlertTriangle,
  AlertOctagon,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';

export const KpiGrid: React.FC = () => {
  const {
    totalProductsCount,
    totalStockUnits,
    totalInventoryValuation,
    lowStockCount,
    outOfStockCount,
    pendingReceiptsCount,
    pendingDeliveriesCount,
    scheduledTransfersCount,
    setActiveTab,
  } = useInventory();

  const cards = [
    {
      title: 'Total Products',
      value: totalProductsCount.toLocaleString(),
      subtext: '+14 this month',
      subtextTrend: 'up',
      icon: Package,
      accent: 'text-[#F59E0B]',
      borderHover: 'hover:border-[#F59E0B]/50',
      onClick: () => setActiveTab('products'),
    },
    {
      title: 'Total Stock',
      value: `${totalStockUnits.toLocaleString()} units`,
      subtext: `$${totalInventoryValuation.toLocaleString()} Valuation`,
      subtextTrend: 'neutral',
      icon: Boxes,
      accent: 'text-[#3B82F6]',
      borderHover: 'hover:border-[#3B82F6]/50',
      onClick: () => setActiveTab('products'),
    },
    {
      title: 'Low Stock',
      value: lowStockCount.toString(),
      subtext: 'Needs Reorder SKUs',
      badge: 'Reorder',
      badgeClass: 'bg-[#F59E0B]/20 text-[#F59E0B]',
      icon: AlertTriangle,
      accent: 'text-[#F59E0B]',
      borderHover: 'hover:border-[#F59E0B]/60',
      onClick: () => setActiveTab('products'),
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount.toString(),
      subtext: 'Critical Alert · 0 Units',
      badge: 'Critical',
      badgeClass: 'bg-[#EF4444]/20 text-[#EF4444]',
      icon: AlertOctagon,
      accent: 'text-[#EF4444]',
      borderHover: 'hover:border-[#EF4444]/60',
      onClick: () => setActiveTab('products'),
    },
    {
      title: 'Inbound Receipts',
      value: pendingReceiptsCount.toString(),
      subtext: 'Active Supplier POs',
      badge: 'Expected',
      badgeClass: 'bg-[#22C55E]/20 text-[#22C55E]',
      icon: ClipboardList,
      accent: 'text-[#22C55E]',
      borderHover: 'hover:border-[#22C55E]/50',
      onClick: () => setActiveTab('receipts'),
    },
    {
      title: 'Outbound Deliveries',
      value: pendingDeliveriesCount.toString(),
      subtext: 'Cutoff 17:30 IST',
      badge: 'Dispatches',
      badgeClass: 'bg-[#3B82F6]/20 text-[#3B82F6]',
      icon: Truck,
      accent: 'text-[#3B82F6]',
      borderHover: 'hover:border-[#3B82F6]/50',
      onClick: () => setActiveTab('delivery-orders'),
    },
    {
      title: 'Scheduled Transfers',
      value: scheduledTransfersCount.toString(),
      subtext: 'Active Inter-bay Routes',
      badge: 'In-Transit',
      badgeClass: 'bg-[#F59E0B]/20 text-[#F59E0B]',
      icon: ArrowLeftRight,
      accent: 'text-[#F59E0B]',
      borderHover: 'hover:border-[#F59E0B]/50',
      onClick: () => setActiveTab('internal-transfers'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            onClick={c.onClick}
            className={`bg-[#171A20] border border-[#292D35] p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${c.borderHover} group`}
          >
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold group-hover:text-[#F8FAFC] transition-colors">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.accent}`} />
            </div>

            <div className="my-2.5">
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC] tracking-tight">
                {c.value}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#292D35]/50">
              <span className="text-[#94A3B8] font-mono truncate">{c.subtext}</span>
              {c.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${c.badgeClass}`}>
                  {c.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
