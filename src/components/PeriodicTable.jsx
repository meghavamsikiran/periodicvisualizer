import React, { useState, useMemo } from 'react';
import { ELEMENTS, CATEGORY_COLORS } from '../data/periodicData';
import ElementCard from './ElementCard';
import ElementDetailModal from './ElementDetailModal';
import { Search, Filter, Info, X, Sparkles, ExternalLink } from 'lucide-react';
import { soundFx } from '../utils/AudioController';
import { matchesElementSearch, filterElements } from '../utils/elementSearch';

export default function PeriodicTable({ onSpawnElement, onViewMolecules }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeElement, setActiveElement] = useState(null);

  const categories = [
    { id: 'all', label: 'All Families' },
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

  const groupLabels = [
    { num: 1, label: '1 (IA)' },
    { num: 2, label: '2 (IIA)' },
    { num: 3, label: '3 (IIIB)' },
    { num: 4, label: '4 (IVB)' },
    { num: 5, label: '5 (VB)' },
    { num: 6, label: '6 (VIB)' },
    { num: 7, label: '7 (VIIB)' },
    { num: 8, label: '8 (VIIIB)' },
    { num: 9, label: '9 (VIIIB)' },
    { num: 10, label: '10 (VIIIB)' },
    { num: 11, label: '11 (IB)' },
    { num: 12, label: '12 (IIB)' },
    { num: 13, label: '13 (IIIA)' },
    { num: 14, label: '14 (IVA)' },
    { num: 15, label: '15 (VA)' },
    { num: 16, label: '16 (VIA)' },
    { num: 17, label: '17 (VIIA)' },
    { num: 18, label: '18 (VIIIA)' }
  ];

  // Count elements per category for filter badges
  const categoryCounts = useMemo(() => {
    const counts = { all: ELEMENTS.length };
    ELEMENTS.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Centralized strict search — name, symbol, atomic number only
  const checkElementMatch = (elem, queryText, catId) => matchesElementSearch(elem, queryText, catId);

  const matchingElements = useMemo(() => {
    return filterElements(ELEMENTS, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const isSearchActive = searchQuery.trim() !== '';
  const isCategoryActive = selectedCategory !== 'all';
  const isFilterActive = isSearchActive || isCategoryActive;

  const handleClearFilters = () => {
    soundFx.playClick();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasLanthanideMatch = useMemo(() => {
    return matchingElements.some(e => e.category === 'lanthanide');
  }, [matchingElements]);

  const hasActinideMatch = useMemo(() => {
    return matchingElements.some(e => e.category === 'actinide');
  }, [matchingElements]);

  const isLanthanideHighlighted = !isFilterActive || hasLanthanideMatch;
  const isActinideHighlighted = !isFilterActive || hasActinideMatch;

  return (
    <div className="w-full space-y-3">
      {/* Search & Category Filter Toolbar */}
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 shadow-xl">
        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search by name, symbol, or atomic number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-8 py-1.5 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-400 text-[11px] sm:text-xs focus:outline-none focus:border-cyan-400 font-medium"
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

        {/* Category Filter Pills with Badges */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none max-w-full">
          {categories.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1 ${
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

      {/* Active Results Bar — Properly separated Search vs Filter context */}
      {isFilterActive && (
        <div className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-cyan-400/40 bg-slate-950/90 backdrop-blur-md shadow-2xl space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              {isSearchActive && isCategoryActive ? (
                <span className="font-extrabold text-white font-mono">
                  <span className="text-cyan-300">{matchingElements.length}</span> Result{matchingElements.length !== 1 ? 's' : ''} for "<span className="text-amber-300">{searchQuery}</span>" in <span className="text-emerald-300">{categories.find(c => c.id === selectedCategory)?.label}</span>
                </span>
              ) : isSearchActive ? (
                <span className="font-extrabold text-white font-mono">
                  <span className="text-cyan-300">{matchingElements.length}</span> Result{matchingElements.length !== 1 ? 's' : ''} for "<span className="text-amber-300">{searchQuery}</span>"
                </span>
              ) : (
                <span className="font-extrabold text-white font-mono">
                  Showing <span className="text-cyan-300">{matchingElements.length}</span> <span className="text-emerald-300">{categories.find(c => c.id === selectedCategory)?.label}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {isSearchActive && (
                <button
                  onClick={() => { soundFx.playClick(); setSearchQuery(''); }}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Search
                </button>
              )}
              {isCategoryActive && (
                <button
                  onClick={() => { soundFx.playClick(); setSelectedCategory('all'); }}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Category
                </button>
              )}
            </div>
          </div>

          {/* Quick Clickable Chips for Matched Elements (only show for search, not category browse) */}
          {isSearchActive && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
              {matchingElements.length === 0 ? (
                <div className="text-xs text-amber-300 font-medium py-1">
                  No elements match your search{isCategoryActive ? ` within ${categories.find(c => c.id === selectedCategory)?.label}` : ''}. Try a different term.
                </div>
              ) : (
                matchingElements.map(elem => {
                  const catColor = CATEGORY_COLORS[elem.category] || {};
                  return (
                    <button
                      key={elem.number}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveElement(elem);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all hover:scale-105 shadow-md ${catColor.bg || 'bg-slate-900'} ${catColor.border || 'border-cyan-400'} text-white group`}
                    >
                      <span className="text-[10px] font-mono text-slate-400">#{elem.number}</span>
                      <span className="text-cyan-300 font-mono font-black">{elem.symbol}</span>
                      <span>{elem.name}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Touch Scroll Hint for Mobile */}
      <div className="flex items-center justify-between px-2 text-[10px] font-mono text-cyan-300 font-bold sm:hidden">
        <span>👈 Swipe table horizontally to view all 18 Groups 👉</span>
        <span className="text-slate-400">118 Elements</span>
      </div>

      {/* Unified 18-Column Grid Periodic Table Board */}
      <div className="w-full glass-panel p-2 sm:p-4 rounded-2xl sm:rounded-3xl border border-cyan-500/20 overflow-x-auto touch-pan-x scrollbar-thin">
        <div className="min-w-[840px] space-y-1.5 sm:space-y-2">

          {/* Group Column Headers (1-18) */}
          <div className="grid grid-cols-18 gap-1 text-center font-mono text-[10px] text-slate-400 font-bold">
            {groupLabels.map(g => (
              <div key={g.num} className="py-1 rounded bg-slate-900/80 border border-white/5 truncate">
                {g.num}
              </div>
            ))}
          </div>

          {/* 18-Column Unified Grid for ALL 118 Elements + Detached Rows */}
          <div className="grid grid-cols-18 gap-1.5">

            {/* Elements 1 through 118 */}
            {ELEMENTS.map(elem => {
              const highlighted = checkElementMatch(elem, searchQuery, selectedCategory);

              let targetRow = elem.period;
              let targetCol = elem.group;

              if (elem.category === 'lanthanide') {
                targetRow = 9;
                targetCol = elem.number - 57 + 4;
              } else if (elem.category === 'actinide') {
                targetRow = 10;
                targetCol = elem.number - 89 + 4;
              }

              return (
                <div
                  key={elem.number}
                  style={{
                    gridRowStart: targetRow,
                    gridColumnStart: targetCol
                  }}
                  className={`w-full aspect-square transition-all duration-300 ${!highlighted ? 'opacity-[0.06] grayscale blur-[1px] scale-90 pointer-events-none' : 'opacity-100 scale-100 ring-2 ring-cyan-400/70 rounded-xl shadow-[0_0_12px_rgba(0,240,255,0.35)]'}`}
                >
                  <ElementCard
                    element={elem}
                    onSelect={(el) => setActiveElement(el)}
                    isSelected={activeElement?.number === elem.number}
                  />
                </div>
              );
            })}

            {/* Lanthanides 57-71 Marker Box in Period 6, Group 3 */}
            <div
              style={{ gridRowStart: 6, gridColumnStart: 3 }}
              className={`w-full aspect-square p-1 rounded-xl bg-sky-950/50 border border-sky-400/50 text-center flex flex-col items-center justify-center text-[9px] text-sky-300 font-mono transition-all duration-300 ${!isLanthanideHighlighted ? 'opacity-[0.06] grayscale blur-[1px] scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              <span className="font-bold">57-71</span>
              <span className="text-[7.5px] opacity-80 truncate">Lanthanides</span>
            </div>

            {/* Actinides 89-103 Marker Box in Period 7, Group 3 */}
            <div
              style={{ gridRowStart: 7, gridColumnStart: 3 }}
              className={`w-full aspect-square p-1 rounded-xl bg-teal-950/50 border border-teal-400/50 text-center flex flex-col items-center justify-center text-[9px] text-teal-300 font-mono transition-all duration-300 ${!isActinideHighlighted ? 'opacity-[0.06] grayscale blur-[1px] scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              <span className="font-bold">89-103</span>
              <span className="text-[7.5px] opacity-80 truncate">Actinides</span>
            </div>

            {/* Row 9 Spacer / Label: Lanthanides (Cols 1-3) */}
            <div
              style={{ gridRowStart: 9, gridColumnStart: 1, gridColumnEnd: 4 }}
              className={`flex items-center justify-start px-2 font-mono text-xs font-bold text-sky-300 tracking-wider transition-all duration-300 ${!isLanthanideHighlighted ? 'opacity-[0.06] grayscale blur-[1px]' : 'opacity-100'}`}
            >
              Lanthanides:
            </div>

            {/* Row 10 Spacer / Label: Actinides (Cols 1-3) */}
            <div
              style={{ gridRowStart: 10, gridColumnStart: 1, gridColumnEnd: 4 }}
              className={`flex items-center justify-start px-2 font-mono text-xs font-bold text-teal-300 tracking-wider transition-all duration-300 ${!isActinideHighlighted ? 'opacity-[0.06] grayscale blur-[1px]' : 'opacity-100'}`}
            >
              Actinides:
            </div>

          </div>

        </div>
      </div>

      {/* Deep Inspection Modal */}
      {activeElement && (
        <ElementDetailModal
          element={activeElement}
          onClose={() => setActiveElement(null)}
          onSpawnElement={onSpawnElement}
          onViewMolecules={onViewMolecules}
        />
      )}
    </div>
  );
}
