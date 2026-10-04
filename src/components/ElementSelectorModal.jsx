import React, { useState } from 'react';
import { ELEMENTS, CATEGORY_COLORS } from '../data/periodicData';
import { Search, X, Atom, Filter } from 'lucide-react';
import { soundFx } from '../utils/AudioController';
import { filterElements } from '../utils/elementSearch';

export default function ElementSelectorModal({ isOpen, onClose, onSelectElement, selectedSymbol }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All 118 Elements' },
    { id: 'alkali-metal', label: 'Alkali Metals' },
    { id: 'alkaline-earth', label: 'Alkaline Earth' },
    { id: 'transition-metal', label: 'Transition Metals' },
    { id: 'post-transition', label: 'Post-Transition' },
    { id: 'metalloid', label: 'Metalloids' },
    { id: 'reactive-nonmetal', label: 'Nonmetals' },
    { id: 'halogen', label: 'Halogens' },
    { id: 'noble-gas', label: 'Noble Gases' },
    { id: 'lanthanide', label: 'Lanthanides' },
    { id: 'actinide', label: 'Actinides' }
  ];

  // Count elements per category for filter badges
  const categoryCounts = React.useMemo(() => {
    const counts = { all: ELEMENTS.length };
    ELEMENTS.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredElements = filterElements(ELEMENTS, searchQuery, selectedCategory);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel-glow rounded-3xl p-5 md:p-6 text-white border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Atom className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Select Periodic Element (1 - 118)
              </h2>
              <p className="text-xs text-slate-400">
                Choose any element to inspect its 3D molecular structures or 3D pure elemental crystal lattice.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search by name, symbol, or atomic number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none max-w-full">
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1 ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)] font-bold'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 118 Elements Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredElements.map((elem) => {
            const catColor = CATEGORY_COLORS[elem.category] || { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-300' };
            const isSelected = selectedSymbol === elem.symbol;

            return (
              <button
                key={elem.number}
                onClick={() => {
                  soundFx.playClick();
                  onSelectElement(elem.symbol);
                  onClose();
                }}
                className={`p-2 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-300 ring-2 ring-cyan-400 shadow-[0_0_15px_#00f0ff] scale-105 z-10'
                    : `${catColor.bg} ${catColor.border} hover:border-cyan-400 hover:scale-[1.03]`
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{elem.number}</span>
                  <span className={`text-[9px] font-mono px-1 rounded ${catColor.text} bg-slate-950/60`}>
                    {elem.valency > 0 ? `v:${elem.valency}` : '0'}
                  </span>
                </div>
                <div className="my-1">
                  <span className={`text-xl font-extrabold font-mono block ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {elem.symbol}
                  </span>
                  <span className="text-[11px] font-bold text-slate-200 truncate block">{elem.name}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 block truncate">{elem.mass} u</span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-cyan-400">{filteredElements.length}</strong> of 118 Elements
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectElement('all');
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-semibold transition-all"
            >
              Reset to All Compounds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
