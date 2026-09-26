import React from 'react';
import { OperationStatus } from '../../types/inventory';

interface StatusBadgeProps {
  status: OperationStatus | 'Critical' | 'Low Stock' | 'In Stock' | 'Out of Stock' | 'Applied' | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', pulse = false }) => {
  const normalized = status.toLowerCase();

  let bgClass = 'bg-[#1E222A] text-[#94A3B8] border-[#292D35]';
  let dotColor = 'bg-[#94A3B8]';

  if (normalized === 'done' || normalized === 'in stock' || normalized === 'verified' || normalized === 'applied') {
    bgClass = 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/20';
    dotColor = 'bg-[#22C55E]';
  } else if (normalized === 'ready' || normalized === 'staged') {
    bgClass = 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25';
    dotColor = 'bg-[#3B82F6]';
  } else if (normalized === 'waiting' || normalized === 'low stock' || normalized === 'under buffer') {
    bgClass = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/25';
    dotColor = 'bg-[#F59E0B]';
  } else if (normalized === 'critical' || normalized === 'out of stock' || normalized === 'cancelled') {
    bgClass = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25';
    dotColor = 'bg-[#EF4444]';
  } else if (normalized === 'draft') {
    bgClass = 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/20';
    dotColor = 'bg-[#64748B]';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${bgClass} ${padding} uppercase tracking-wider whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
