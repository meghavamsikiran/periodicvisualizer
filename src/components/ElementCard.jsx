import React from 'react';
import { CATEGORY_COLORS } from '../data/periodicData';
import { soundFx } from '../utils/AudioController';

export default function ElementCard({ element, onSelect, isSelected }) {
  const catStyle = CATEGORY_COLORS[element.category] || {
    bg: 'bg-slate-900/80',
    border: 'border-slate-700',
    text: 'text-slate-300'
  };

  const handleClick = () => {
    soundFx.playClick();
    onSelect(element);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full h-full p-0.5 sm:p-1 rounded-lg sm:rounded-xl border transition-all duration-300 text-left flex flex-col justify-between overflow-hidden hover:scale-110 hover:-translate-y-0.5 z-10 ${
        catStyle.bg
      } ${catStyle.border} ${
        isSelected
          ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-110 z-20'
          : 'hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
      }`}
    >
      {/* Atomic Number Z & Mass */}
      <div className="flex items-center justify-between w-full leading-none">
        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold text-slate-300">
          {element.number}
        </span>
        <span className="text-[6px] sm:text-[7px] md:text-[8px] font-mono text-slate-400 opacity-75 truncate max-w-[50%]">
          {element.mass}
        </span>
      </div>

      {/* Symbol & Name */}
      <div className="my-auto text-center leading-none py-0.5">
        <h3 className={`text-xs sm:text-sm md:text-base font-black tracking-tight ${catStyle.text}`}>
          {element.symbol}
        </h3>
        <p className="text-[6.5px] sm:text-[7.5px] md:text-[8.5px] font-medium text-slate-200 truncate max-w-full leading-tight mt-0.5 hidden xl:block">
          {element.name}
        </p>
      </div>

      {/* Electron Configuration */}
      <div className="text-[6px] sm:text-[7px] font-mono text-slate-400 truncate opacity-75 leading-none hidden 2xl:block">
        {element.shells?.join('-')}
      </div>
    </button>
  );
}
