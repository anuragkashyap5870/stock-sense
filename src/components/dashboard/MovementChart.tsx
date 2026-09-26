import React, { useState } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const MovementChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m'>('7d');

  // Chart data scenarios based on timeRange
  const dataMap = {
    '7d': {
      inbound: '+84.2t',
      outbound: '-68.5t',
      velocity: '+15.7t',
      labels: ['Mon 02', 'Tue 03', 'Wed 04', 'Thu 05', 'Fri 06', 'Sat 07', 'Today 08'],
      inboundPoints: [130, 90, 150, 100, 60, 45, 40],
      outboundPoints: [170, 140, 120, 150, 90, 110, 125],
    },
    '30d': {
      inbound: '+342.8t',
      outbound: '-295.4t',
      velocity: '+47.4t',
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      inboundPoints: [140, 110, 85, 60, 42],
      outboundPoints: [160, 130, 100, 120, 95],
    },
    '3m': {
      inbound: '+980.5t',
      outbound: '-845.0t',
      velocity: '+135.5t',
      labels: ['July', 'August', 'September'],
      inboundPoints: [150, 90, 45],
      outboundPoints: [160, 110, 85],
    },
  };

  const current = dataMap[timeRange];

  return (
    <div className="bg-[#171A20] border border-[#292D35] p-4 sm:p-5 rounded-xl shadow-md flex flex-col">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-base font-semibold text-[#F8FAFC]">Stock Movement Dynamics</h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Incoming supply flow versus outgoing delivery volumes
          </p>
        </div>

        {/* Time Segment Controls */}
        <div className="flex items-center bg-[#0B0D10] border border-[#292D35] p-1 rounded-lg self-start sm:self-auto">
          {(['7d', '30d', '3m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-[#1E222A] text-[#F8FAFC] shadow-sm font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Stats Banner */}
      <div className="flex flex-wrap items-center justify-between py-2 px-3 sm:px-4 bg-[#0B0D10] border border-[#292D35]/60 rounded-lg mb-4 gap-3">
        <div className="flex items-center gap-5 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
            <span className="text-xs text-[#F8FAFC] font-medium">Inbound Receipts</span>
            <span className="font-mono text-xs text-[#22C55E] font-bold ml-1">{current.inbound}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
            <span className="text-xs text-[#F8FAFC] font-medium">Outbound Shipments</span>
            <span className="font-mono text-xs text-[#F59E0B] font-bold ml-1">{current.outbound}</span>
          </div>
        </div>

        <div className="text-xs font-mono text-[#94A3B8]">
          Net Velocity: <span className="text-[#22C55E] font-bold">{current.velocity}</span>
        </div>
      </div>

      {/* SVG Responsive Wave Graph */}
      <div className="w-full h-56 sm:h-64 relative flex items-end">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 240">
          <defs>
            <linearGradient id="inboundGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="outboundGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40" x2="700" y2="40" stroke="#292D35" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="100" x2="700" y2="100" stroke="#292D35" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="160" x2="700" y2="160" stroke="#292D35" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="210" x2="700" y2="210" stroke="#292D35" strokeWidth="1" />

          {/* Outbound Area & Line (Amber) */}
          <path
            d="M 0,170 C 80,180 120,120 200,140 C 280,160 320,80 400,110 C 480,140 520,70 600,90 C 650,105 680,130 700,125 L 700,210 L 0,210 Z"
            fill="url(#outboundGrad)"
          />
          <path
            d="M 0,170 C 80,180 120,120 200,140 C 280,160 320,80 400,110 C 480,140 520,70 600,90 C 650,105 680,130 700,125"
            fill="none"
            stroke="#F59E0B"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          {/* Inbound Area & Line (Green) */}
          <path
            d="M 0,130 C 80,90 120,150 200,100 C 280,50 340,130 420,70 C 500,20 540,110 620,60 C 660,35 680,50 700,45 L 700,210 L 0,210 Z"
            fill="url(#inboundGrad)"
          />
          <path
            d="M 0,130 C 80,90 120,150 200,100 C 280,50 340,130 420,70 C 500,20 540,110 620,60 C 660,35 680,50 700,45"
            fill="none"
            stroke="#22C55E"
            strokeLinecap="round"
            strokeWidth="3"
          />

          {/* Points */}
          <circle cx="200" cy="100" r="4.5" fill="#111318" stroke="#22C55E" strokeWidth="2.5" />
          <circle cx="420" cy="70" r="4.5" fill="#111318" stroke="#22C55E" strokeWidth="2.5" />
          <circle cx="620" cy="60" r="5" fill="#22C55E" stroke="#111318" strokeWidth="2" />
          <circle cx="320" cy="80" r="4" fill="#111318" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="600" cy="90" r="5" fill="#F59E0B" stroke="#111318" strokeWidth="2" />
        </svg>
      </div>

      {/* X-Axis labels */}
      <div className="flex justify-between items-center pt-2.5 font-mono text-[11px] text-[#94A3B8]">
        {current.labels.map((label, idx) => (
          <span
            key={idx}
            className={idx === current.labels.length - 1 ? 'text-[#F59E0B] font-bold' : ''}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
