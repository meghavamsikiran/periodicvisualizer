import React from 'react';
import Atom3DViewer from './Atom3DViewer';
import { X, BookOpen, Layers, Globe, Sparkles, FlaskConical, Palette } from 'lucide-react';
import { CATEGORY_COLORS } from '../data/periodicData';
import { soundFx } from '../utils/AudioController';

export default function ElementDetailModal({ element, onClose, onSpawnElement, onViewMolecules }) {
  if (!element) return null;

  const catStyle = CATEGORY_COLORS[element.category] || { text: 'text-cyan-400' };
  const protons = element.number;
  const neutrons = Math.round(element.mass - element.number);

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  const handleSpawn = () => {
    soundFx.playPop();
    if (onSpawnElement) onSpawnElement(element.symbol);
    onClose();
  };

  const handleViewCompounds = () => {
    soundFx.playClick();
    if (onViewMolecules) onViewMolecules(element.symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-[96vw] max-h-[95vh] glass-panel-glow rounded-3xl p-5 sm:p-7 text-white border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.3)] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/15 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex flex-wrap items-center gap-4 mb-4 shrink-0 pr-12">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl font-extrabold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            {element.symbol}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{element.name}</h2>
              <span className={`text-xs px-3 py-1 rounded-full font-mono border capitalize ${catStyle.text} border-current bg-slate-900/80 font-bold`}>
                {element.category.replace('-', ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Atomic Number (Z): <strong className="text-cyan-400">{element.number}</strong> | Mass (A): <strong className="text-purple-400">{element.mass} u</strong> | Period: {element.period} | Group: {element.group}
            </p>
          </div>
        </div>

        {/* Widescreen 12-Column Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto mb-4 pr-1">
          {/* Left Column (7 cols): Fullscreen 3D WebGL Atom Viewer */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[420px] lg:min-h-[500px]">
            <h4 className="text-xs sm:text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 font-mono uppercase tracking-wider shrink-0">
              <Layers className="w-4 h-4 text-cyan-400" /> Interactive 3D Bohr Atom Model
            </h4>
            <Atom3DViewer element={element} />
          </div>

          {/* Right Column (5 cols): Scientific Specs & Properties */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 overflow-y-auto pr-1">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs shrink-0">
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Valency</span>
                <span className="text-xl font-black text-cyan-300 font-mono mt-0.5 block">{element.valency}</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Electron Shells</span>
                <span className="text-lg font-black text-purple-300 font-mono mt-0.5 block">
                  [{element.shells?.join(', ')}]
                </span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">State (at 25 °C)</span>
                <span className="text-sm font-bold text-emerald-300 capitalize mt-0.5 block">{element.state}</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider font-bold">Element Category</span>
                <span className="text-xs font-bold text-yellow-300 capitalize mt-0.5 block">{element.category.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Atomic Color Code Guide (Cleanly placed in the Right Column Panel!) */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-cyan-400/40 shadow-xl shrink-0 space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <h4 className="text-xs font-extrabold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" /> Atomic Color Code Guide
                </h4>
                <span className="text-xs font-mono font-extrabold text-cyan-300">Z = {protons}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] inline-block shrink-0"></span>
                    <span className="text-red-300 font-bold">Red Spheres</span>
                  </div>
                  <span className="text-slate-200 font-bold">Protons (p+: {protons})</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] inline-block shrink-0"></span>
                    <span className="text-cyan-300 font-bold">Cyan Spheres</span>
                  </div>
                  <span className="text-slate-200 font-bold">Neutrons (n0: {neutrons})</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#ffe600] inline-block shrink-0"></span>
                    <span className="text-yellow-300 font-bold">Yellow Orbs</span>
                  </div>
                  <span className="text-slate-200 font-bold">Electrons (e-: {protons})</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] inline-block shrink-0"></span>
                    <span className="text-purple-300 font-bold">Purple Rings</span>
                  </div>
                  <span className="text-slate-200 font-bold">Bohr Shells ({element.shells?.length || 1})</span>
                </div>
              </div>
            </div>

            {/* General Overview */}
            <div className="bg-gradient-to-br from-cyan-950/40 to-purple-950/40 p-3.5 rounded-2xl border border-cyan-500/30 shrink-0">
              <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Atomic Summary & Properties
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {element.summary}
              </p>
            </div>

            {/* Real World Applications */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-white/10 shrink-0">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Real-World Applications & Uses
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {element.uses?.map((use, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    {use}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSpawn}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-extrabold text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 border border-cyan-300/50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 fill-cyan-200" /> Spawn {element.symbol} in 3D AR Workbench
            </button>
            <button
              onClick={handleViewCompounds}
              className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 border border-purple-400/60 text-purple-200 font-extrabold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105"
            >
              <FlaskConical className="w-4 h-4 text-purple-400" /> View {element.symbol} 3D Compounds
            </button>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all border border-white/15"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
