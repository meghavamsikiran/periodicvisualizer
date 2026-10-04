import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PeriodicTable from './components/PeriodicTable';
import SpatialLabAR from './components/SpatialLabAR';
import MoleculeViewer3D from './components/MoleculeViewer3D';
import CameraAROverlay from './components/CameraAROverlay';
import ElementSelectorModal from './components/ElementSelectorModal';
import { PRESET_MOLECULES, getFilteredMolecules } from './data/moleculesData';
import { Sparkles, Atom, BookOpen, ShieldCheck, Grid } from 'lucide-react';
import { soundFx } from './utils/AudioController';

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [cameraFacingMode, setCameraFacingMode] = useState('user'); // 'user' (front) vs 'environment' (rear room camera)
  const [isInvertHandX, setIsInvertHandX] = useState(false); // Hand tracking horizontal direction toggle
  const [isInvertHandY, setIsInvertHandY] = useState(false); // Hand tracking vertical direction toggle
  const [isMuted, setIsMuted] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState(PRESET_MOLECULES[0]);
  const [selectedElementFilter, setSelectedElementFilter] = useState('all');
  const [spawnElementSymbol, setSpawnElementSymbol] = useState(null);
  const [isElementSelectorOpen, setIsElementSelectorOpen] = useState(false);

  // Real-time Hand Tracking State
  const [handState, setHandState] = useState({
    x: 0,
    y: 0,
    isPinching: false,
    isActive: false,
    isTwoHanded: false,
    twoHandDistance: null,
    pinchDistance: null,
    palmSize: null,
    handCount: 0
  });

  // Camera Room AR passthrough is AUTOMATICALLY active when on the Spatial AR Workbench tab
  const showCameraFeed = activeTab === 'ar-lab';

  const handleHandMove = (pos) => {
    if (!pos || pos.hasHand === false || pos.isActive === false) {
      setHandState({
        x: 0,
        y: 0,
        isPinching: false,
        isActive: false,
        isTwoHanded: false,
        twoHandDistance: null,
        pinchDistance: null,
        palmSize: null,
        handCount: 0
      });
      return;
    }

    setHandState({
      x: pos.x,
      y: pos.y,
      isPinching: !!pos.isPinching,
      isActive: true,
      isTwoHanded: pos.isTwoHanded || false,
      twoHandDistance: pos.twoHandDistance || null,
      pinchDistance: pos.pinchDistance || null,
      palmSize: pos.palmSize || null,
      handCount: pos.handCount || 1
    });
  };

  const handleHandPinchStart = (pos) => {
    if (!pos || pos.hasHand === false) return;
    setHandState({
      x: pos.x,
      y: pos.y,
      isPinching: true,
      isActive: true,
      isTwoHanded: pos.isTwoHanded || false,
      twoHandDistance: pos.twoHandDistance || null,
      pinchDistance: pos.pinchDistance || null,
      palmSize: pos.palmSize || null,
      handCount: pos.handCount || 1
    });
  };

  const handleHandPinchEnd = (pos) => {
    if (!pos || pos.hasHand === false) {
      setHandState({
        x: 0,
        y: 0,
        isPinching: false,
        isActive: false,
        isTwoHanded: false,
        twoHandDistance: null,
        pinchDistance: null,
        palmSize: null,
        handCount: 0
      });
      return;
    }
    setHandState({
      x: pos.x,
      y: pos.y,
      isPinching: false,
      isActive: true,
      isTwoHanded: pos.isTwoHanded || false,
      twoHandDistance: pos.twoHandDistance || null,
      pinchDistance: pos.pinchDistance || null,
      palmSize: pos.palmSize || null,
      handCount: pos.handCount || 1
    });
  };

  const handleSpawnElementToAR = (symbol) => {
    setSpawnElementSymbol(symbol);
    setActiveTab('ar-lab');
  };

  const handleViewMoleculesForElement = (symbol) => {
    setSelectedElementFilter(symbol);
    setActiveTab('molecules');
  };

  const filteredMolecules = getFilteredMolecules(selectedElementFilter);

  useEffect(() => {
    if (filteredMolecules && filteredMolecules.length > 0) {
      const isStillPresent = filteredMolecules.some((m) => m.id === selectedMolecule?.id);
      if (!isStillPresent) {
        setSelectedMolecule(filteredMolecules[0]);
      }
    }
  }, [selectedElementFilter]);

  const quickElementFilters = [
    { symbol: 'all', name: 'All Compounds' },
    { symbol: 'H', name: 'H (Hydrogen)' },
    { symbol: 'O', name: 'O (Oxygen)' },
    { symbol: 'C', name: 'C (Carbon)' },
    { symbol: 'Na', name: 'Na (Sodium)' },
    { symbol: 'Cl', name: 'Cl (Chlorine)' },
    { symbol: 'N', name: 'N (Nitrogen)' },
    { symbol: 'Mg', name: 'Mg (Magnesium)' },
    { symbol: 'Fe', name: 'Fe (Iron)' },
    { symbol: 'Au', name: 'Au (Gold)' },
    { symbol: 'Ca', name: 'Ca (Calcium)' },
    { symbol: 'Cu', name: 'Cu (Copper)' }
  ];

  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const [dismissedRotatePrompt, setDismissedRotatePrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isMobile && isPortrait && !dismissedRotatePrompt) {
        setShowRotatePrompt(true);
      } else {
        setShowRotatePrompt(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [dismissedRotatePrompt]);

  return (
    <div className="h-screen w-screen bg-[#050811] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Mobile Landscape Recommendation Banner */}
      {showRotatePrompt && (
        <div className="z-50 bg-gradient-to-r from-cyan-950 via-purple-950 to-slate-950 border-b border-cyan-400/50 px-3 py-1.5 text-white text-xs font-mono flex items-center justify-between gap-2 shadow-xl animate-fade-in shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-base animate-bounce">📱</span>
            <span className="text-cyan-300 font-bold truncate text-[11px]">
              Rotate phone to <strong>Landscape Mode</strong> for full 3D AR space! 🔄
            </span>
          </div>
          <button
            onClick={() => {
              setDismissedRotatePrompt(true);
              setShowRotatePrompt(false);
            }}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold shrink-0"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* 118-Element Selector Modal */}
      <ElementSelectorModal
        isOpen={isElementSelectorOpen}
        onClose={() => setIsElementSelectorOpen(false)}
        onSelectElement={(symbol) => setSelectedElementFilter(symbol)}
        selectedSymbol={selectedElementFilter}
      />

      {/* Room AR Video Passthrough Background & Hand Tracking */}
      <CameraAROverlay
        isCameraOn={showCameraFeed}
        facingMode={cameraFacingMode}
        isInvertHandX={isInvertHandX}
        isInvertHandY={isInvertHandY}
        onHandPinchMove={handleHandMove}
        onHandPinchStart={handleHandPinchStart}
        onHandPinchEnd={handleHandPinchEnd}
      />

      {/* Main Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Content Area */}
      <main className="flex-1 w-full max-w-[99vw] mx-auto px-2 sm:px-4 py-2 z-10 overflow-y-auto flex flex-col">
        {/* Tab 1: 3D Periodic Table */}
        {activeTab === 'table' && (
          <PeriodicTable
            onSpawnElement={handleSpawnElementToAR}
            onViewMolecules={handleViewMoleculesForElement}
          />
        )}

        {/* Tab 2: Spatial AR Workbench */}
        {activeTab === 'ar-lab' && (
          <SpatialLabAR
            isCameraActive={showCameraFeed}
            cameraFacingMode={cameraFacingMode}
            onToggleCameraFacing={() => setCameraFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            isInvertHandX={isInvertHandX}
            onToggleInvertHandX={() => setIsInvertHandX((prev) => !prev)}
            isInvertHandY={isInvertHandY}
            onToggleInvertHandY={() => setIsInvertHandY((prev) => !prev)}
            handState={handState}
            spawnElementSymbol={spawnElementSymbol}
            onClearSpawnElement={() => setSpawnElementSymbol(null)}
          />
        )}

        {/* Tab 3: 3D Molecule Library */}
        {activeTab === 'molecules' && (
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Header & Element Filter Selector Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shrink-0 glass-panel p-3.5 rounded-3xl border border-cyan-500/25 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                  <Atom className="w-6 h-6 text-cyan-400 animate-spin-slow" /> 3D Chemical Bond & Molecule Library
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Select any chemical compound or filter by periodic element ($1-118$) to inspect 3D ball-and-stick structures and properties.
                </p>
              </div>

              {/* Element Filter Pills & All 118 Elements Modal Launcher */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full lg:w-auto">
                <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Filter:
                </span>

                {/* All 118 Elements Modal Trigger Button */}
                <button
                  onClick={() => {
                    soundFx.playPop();
                    setIsElementSelectorOpen(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 border ${
                    selectedElementFilter !== 'all' && !quickElementFilters.some((f) => f.symbol === selectedElementFilter)
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#00f0ff]'
                      : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  {selectedElementFilter !== 'all' && !quickElementFilters.some((f) => f.symbol === selectedElementFilter)
                    ? `Element: ${selectedElementFilter}`
                    : 'All 118 Elements'}
                </button>

                {quickElementFilters.map((ef) => (
                  <button
                    key={ef.symbol}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedElementFilter(ef.symbol);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      selectedElementFilter === ef.symbol
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#00f0ff] font-extrabold'
                        : 'bg-slate-900/90 text-slate-300 border-white/10 hover:border-cyan-400/60 hover:text-white'
                    }`}
                  >
                    {ef.name}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Molecule Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 shrink-0">
              {filteredMolecules.map((mol) => (
                <button
                  key={mol.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedMolecule(mol);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedMolecule?.id === mol.id
                      ? 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400/60 shadow-[0_0_22px_rgba(0,240,255,0.35)] scale-[1.03]'
                      : 'bg-slate-950/80 border-white/10 hover:border-cyan-400/50 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <span className="text-xs font-mono font-extrabold text-cyan-300 block tracking-wide">{mol.formula}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5 truncate leading-snug">{mol.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-2 px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/5 w-fit truncate">
                    {mol.bondType}
                  </span>
                </button>
              ))}
            </div>

            {/* Interactive 3D Viewer & Details Panel Split */}
            {selectedMolecule && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
                <div className="lg:col-span-2 flex flex-col h-full">
                  <MoleculeViewer3D molecule={selectedMolecule} />
                </div>

                {/* Right Specifications Panel */}
                <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/25 shadow-[0_0_25px_rgba(0,240,255,0.1)] space-y-4 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{selectedMolecule.name}</h3>
                        <span className="text-xs text-cyan-400 font-mono font-bold">{selectedMolecule.formula}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {selectedMolecule.bondType}
                      </span>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-cyan-950/20 p-3 rounded-2xl border border-cyan-500/30">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Molecular Mass</span>
                        <span className="text-sm font-extrabold text-cyan-300 font-mono mt-0.5 block">{selectedMolecule.molecularMass}</span>
                      </div>
                      <div className="bg-purple-950/20 p-3 rounded-2xl border border-purple-500/30">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Bond Angle</span>
                        <span className="text-sm font-extrabold text-purple-300 font-mono mt-0.5 block">{selectedMolecule.bondAngle}</span>
                      </div>
                      <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/30">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">3D Geometry</span>
                        <span className="text-xs font-bold text-emerald-300 mt-0.5 block">{selectedMolecule.shape}</span>
                      </div>
                      <div className="bg-amber-950/20 p-3 rounded-2xl border border-amber-500/30">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Dipole Moment</span>
                        <span className="text-xs font-bold text-amber-300 mt-0.5 block">{selectedMolecule.dipole}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed font-normal">
                      {selectedMolecule.description}
                    </div>

                    <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/30 text-xs text-cyan-200">
                      <strong className="block font-mono text-cyan-400 mb-1 flex items-center gap-1.5 font-bold">
                        <BookOpen className="w-3.5 h-3.5" /> Chemical Structure Note:
                      </strong>
                      {selectedMolecule.classNote}
                    </div>
                  </div>

                  {/* Real World Applications */}
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">Real-World Uses:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMolecule.uses.map((use, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/10 py-1.5 px-4 text-center text-[10px] text-slate-400 z-10 shrink-0">
        <p className="flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Laxman's Periodic Visualizer • 3D & AR Interactive Element & Molecular Chemistry Lab
        </p>
      </footer>
    </div>
  );
}

