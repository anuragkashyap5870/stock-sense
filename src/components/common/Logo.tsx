import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const fontSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon: Engineered Rounded Squircle with Caliper / Monogram */}
      <div
        className={`${iconSize} rounded-lg bg-[#F59E0B] p-[1.5px] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] flex-shrink-0 transition-transform hover:scale-105`}
      >
        <div className="w-full h-full bg-[#111318] rounded-[6px] flex items-center justify-center p-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {/* Caliper / Hex Monogram matching Image 1 */}
            <circle cx="12" cy="7" r="2" fill="#F59E0B" />
            <path
              d="M12 9L5 20H8.5L12 13.5L15.5 20H19L12 9Z"
              fill="#F59E0B"
            />
            <line x1="7.5" y1="16" x2="16.5" y2="16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-bold tracking-tight text-[#F8FAFC] font-['Plus_Jakarta_Sans'] ${fontSize}`}>
              Stock<span className="text-[#F59E0B]">Sense</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] font-semibold mt-0.5">
            Inventory Engine
          </span>
        </div>
      )}
    </div>
  );
};
