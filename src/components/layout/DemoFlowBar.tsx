import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { CheckCircle2, RotateCcw, ArrowRight, Play, Sparkles } from 'lucide-react';

export const DemoFlowBar: React.FC = () => {
  const { demoStep, executeDemoWorkflowStep, resetDemoData } = useInventory();

  const steps = [
    {
      step: 1,
      name: 'Dashboard',
      desc: 'Real-time Telemetry',
      actionHint: 'Step 1: Telemetry',
    },
    {
      step: 2,
      name: 'Receive Stock',
      desc: '+100kg Steel Rod',
      actionHint: 'Validate Receipt (+100kg)',
    },
    {
      step: 3,
      name: 'Transfer',
      desc: '30kg to Prod WH',
      actionHint: 'Transfer 30kg internally',
    },
    {
      step: 4,
      name: 'Deliver Order',
      desc: '20kg to Client',
      actionHint: 'Deliver 20kg to Client',
    },
    {
      step: 5,
      name: 'Stock Adjust',
      desc: '-3kg Damaged',
      actionHint: 'Write off 3kg damaged',
    },
    {
      step: 6,
      name: 'Move Ledger',
      desc: 'Verified Audit',
      actionHint: 'Review audit ledger',
    },
  ];

  return (
    <div className="bg-[#171A20] border border-[#292D35] p-3.5 sm:p-4 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
            Interactive Workflow Pipeline • Operational Demo Trail
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#94A3B8]">
            Step <span className="text-[#F8FAFC] font-bold">{demoStep}</span> of 6
          </span>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1 text-[11px] font-mono text-[#F59E0B] hover:text-[#FBBF24] hover:underline uppercase transition-colors"
            title="Reset to clean initial demo state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Flow</span>
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((s) => {
          const isActive = demoStep === s.step;
          const isCompleted = demoStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => executeDemoWorkflowStep(s.step)}
              className={`flex flex-col p-2.5 rounded-lg text-left transition-all relative overflow-hidden group ${
                isActive
                  ? 'bg-[#1E222A] border border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : isCompleted
                  ? 'bg-[#111318]/90 border border-[#22C55E]/30 hover:bg-[#1E222A]'
                  : 'bg-[#111318]/60 border border-[#292D35] hover:border-[#F59E0B]/50 hover:bg-[#171A20]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-mono font-bold ${
                    isActive ? 'text-[#F59E0B]' : isCompleted ? 'text-[#22C55E]' : 'text-[#64748B]'
                  }`}
                >
                  0{s.step}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                ) : (
                  <Play className="w-3 h-3 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <span className={`text-xs font-semibold truncate ${isActive ? 'text-[#F8FAFC]' : 'text-[#E2E8F0]'}`}>
                {s.name}
              </span>
              <span
                className={`text-[10px] font-mono truncate ${
                  isActive
                    ? 'text-[#F59E0B]'
                    : isCompleted
                    ? 'text-[#22C55E]'
                    : s.step === 5
                    ? 'text-[#EF4444]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
