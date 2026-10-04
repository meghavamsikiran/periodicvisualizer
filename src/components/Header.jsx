import React from 'react';
import { Volume2, VolumeX, Layers, Box, Atom, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/AudioController';

export default function Header({ activeTab, setActiveTab, isMuted, setIsMuted }) {
  const tabs = [
    { id: 'table', label: '3D Periodic Table', desktopLabel: '3D Periodic Table', mobileLabel: 'Table', icon: Layers },
    { id: 'ar-lab', label: 'Spatial AR Workbench', desktopLabel: 'Spatial AR Workbench', mobileLabel: 'AR Lab', icon: Box },
    { id: 'molecules', label: '3D Molecule Library', desktopLabel: '3D Molecule Library', mobileLabel: '3D Library', icon: Atom }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-2xl px-2 sm:px-4 py-1 sm:py-2 short-compact-py flex flex-row items-center justify-between gap-1 sm:gap-2 shrink-0">
      {/* Top Row: Logo + Compact Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 short-compact-logo rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
          <Atom className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-[10px] sm:text-sm md:text-base short-compact-text font-extrabold tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
              LAXMAN'S <span className="neon-text-blue font-mono font-black">PERIODIC</span>
            </h1>
          </div>
          <p className="text-[9px] text-slate-400 font-mono hidden lg:flex short-hide items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-cyan-400" /> 3D & AR Interactive Element & Molecular Chemistry Lab
          </p>
        </div>
      </div>

      {/* Navigation Tabs - All 3 tabs 100% visible on all mobile orientations! */}
      <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-cyan-500/30 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center justify-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 short-compact-py rounded-lg sm:rounded-xl text-[10px] sm:text-xs short-compact-text font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-300/50 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-[1.02]'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span className="hidden md:inline">{tab.desktopLabel}</span>
              <span className="md:hidden">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );

}
