import React from 'react';
import { Radio, Check, Clock, RefreshCw } from 'lucide-react';

export const LiveSystemEvents: React.FC = () => {
  return (
    <div className="bg-[#171A20] border border-[#292D35] p-4 sm:p-5 rounded-xl shadow-md flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Live System Events</h3>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Check className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[#F8FAFC] font-semibold">Barcode Scan:</span> Batch #ST-9022 checked in at Bay 2 by operator Vikas K.
            <span className="block font-mono text-[10px] text-[#64748B]">14:02:11 • Scanner-04</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[#F8FAFC] font-semibold">Dispatch Window:</span> Carrier Freight-X arrived for Gate 07 dispatch pickup.
            <span className="block font-mono text-[10px] text-[#64748B]">13:58:45 • Automatic ANPR</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RefreshCw className="w-4 h-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[#F8FAFC] font-semibold">Ledger Hash:</span> Block 48,209 synced with cloud ledger store.
            <span className="block font-mono text-[10px] text-[#64748B]">13:50:00 • Engine Node A</span>
          </div>
        </div>
      </div>
    </div>
  );
};
