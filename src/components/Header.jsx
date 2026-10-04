import React from 'react';
import { Volume2, VolumeX, Layers, Box, Atom, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/AudioController';

export default function Header({ activeTab, setActiveTab, isMuted, setIsMuted }) {
  const tabs = [
    { id: 'table', label: '3D Periodic Table', shortLabel: 'Periodic Table', icon: Layers },
    { id: 'ar-lab', label: 'Spatial AR Workbench', shortLabel: 'AR Workbench', icon: Box },
    { id: 'molecules', label: '3D Molecule Library', shortLabel: '3D Compounds', icon: Atom }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-2xl px-2 sm:px-6 py-1 sm:py-2.5 flex flex-row items-center justify-between gap-1 sm:gap-4 shrink-0">
      {/* Top Row on Mobile: Logo + Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
          <Atom className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-950 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <h1 className="text-[11px] sm:text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
              LAXMAN'S <span className="neon-text-blue font-mono font-black">PERIODIC VISUALIZER</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-mono hidden md:flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-cyan-400" /> 3D & AR Interactive Element & Molecular Chemistry Lab
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-cyan-500/30 overflow-x-auto scrollbar-none shrink-0">
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-300/50 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-[1.02]'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              <span className="xs:hidden sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
