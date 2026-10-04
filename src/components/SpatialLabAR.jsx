import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Float, Cylinder, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { PRESET_MOLECULES } from '../data/moleculesData';
import { ELEMENTS, CATEGORY_COLORS } from '../data/periodicData';
import { parseChemicalFormula } from '../utils/formulaParser';
import { generate3DSpatialMolecule, formatAtomCounts } from '../utils/moleculeBuilder3D';
import { soundFx } from '../utils/AudioController';
import { filterElements } from '../utils/elementSearch';
import { Sparkles, RefreshCw, Zap, CheckCircle2, Plus, Trash2, FlaskConical, Play, Pause, Search, X, Atom, Wand2, Hand, Move, RotateCw, Target, ZoomIn, ZoomOut, Maximize2, Pin } from 'lucide-react';
import confetti from 'canvas-confetti';

// Unified Natural Gesture AR Group Controller (Zero Mode Buttons!)
function SpatialHandControlledGroup({ children, handState, resetTrigger, isRoomAnchored }) {
  const groupRef = useRef();
  const currentScaleRef = useRef(1.0);
  const baselineTwoHandDistRef = useRef(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, -0.1, 0);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1.0, 1.0, 1.0);
      currentScaleRef.current = 1.0;
      baselineTwoHandDistRef.current = null;
    }
  }, [resetTrigger]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (handState && handState.isActive) {
      // Direct 3D AR viewport target coordinates from HandTrackingEngine
      const targetX = handState.x;
      const targetY = handState.y;

      // 1. DUAL HAND AUTOMATIC SPATIAL ZOOM IN / ZOOM OUT
      if (handState.isTwoHanded && handState.twoHandDistance) {
        if (baselineTwoHandDistRef.current === null) {
          baselineTwoHandDistRef.current = handState.twoHandDistance;
        } else {
          const delta = handState.twoHandDistance - baselineTwoHandDistRef.current;
          const targetScale = Math.max(0.35, Math.min(3.5, currentScaleRef.current + delta * 2.5));
          currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.2;
          baselineTwoHandDistRef.current = handState.twoHandDistance;
        }
      } else {
        baselineTwoHandDistRef.current = null;
      }

      // 2. SINGLE HAND PINCH (Thumb + Index 👌): GRAB & MOVE (Smooth 1:1 Hand Translation)
      if (handState.isPinching && !isRoomAnchored) {
        const deltaX = targetX - groupRef.current.position.x;
        const deltaY = targetY - groupRef.current.position.y;

        // Smooth position tracking following hand movement
        groupRef.current.position.x += deltaX * 0.20;
        groupRef.current.position.y += deltaY * 0.20;

        // Subtle, natural horizontal rotation adjustment
        groupRef.current.rotation.y += deltaX * 0.03;
      }
    }

    // Apply continuous lerped scale to the 3D group
    groupRef.current.scale.set(currentScaleRef.current, currentScaleRef.current, currentScaleRef.current);
  });

  return (
    <group ref={groupRef}>
      {children}
      {isRoomAnchored && (
        <group position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Ring args={[1.5, 1.58, 64]}>
            <meshBasicMaterial color="#10b981" opacity={0.7} transparent side={THREE.DoubleSide} />
          </Ring>
          <Ring args={[1.7, 1.72, 64]}>
            <meshBasicMaterial color="#00f0ff" opacity={0.4} transparent side={THREE.DoubleSide} />
          </Ring>
        </group>
      )}
    </group>
  );
}

// 3D Atom Node in Spatial Workbench
function SpatialAtomNode({ atom, onSelectAtom }) {
  const meshRef = useRef();
  const ringGroupRef = useRef();

  const hexColor = CATEGORY_COLORS[atom.category]?.hex || '#00f0ff';
  const elemData = ELEMENTS.find(e => e.symbol === atom.symbol) || {};

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + atom.index * 0.2;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z = t * 0.8;
      ringGroupRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3} position={atom.position}>
      <group onClick={(e) => {
        e.stopPropagation();
        onSelectAtom(elemData);
      }}>
        {/* Core Nucleus Sphere */}
        <Sphere ref={meshRef} args={[atom.radius, 32, 32]}>
          <meshStandardMaterial
            color={hexColor}
            emissive={hexColor}
            emissiveIntensity={0.7}
            roughness={0.15}
            metalness={0.85}
          />
        </Sphere>

        {/* Orbiting Electron Shell Ring */}
        <group ref={ringGroupRef}>
          <Ring args={[atom.radius * 1.35, atom.radius * 1.42, 32]}>
            <meshBasicMaterial color="#ffffff" opacity={0.4} transparent side={THREE.DoubleSide} />
          </Ring>
          <mesh position={[atom.radius * 1.4, 0, 0]}>
            <sphereGeometry args={[atom.radius * 0.15, 12, 12]} />
            <meshBasicMaterial color="#ffe600" />
          </mesh>
        </group>

        {/* 3D Symbol Label */}
        <Text
          position={[0, 0, atom.radius + 0.05]}
          fontSize={atom.radius * 0.75}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {atom.symbol}
        </Text>
      </group>
    </Float>
  );
}

// 3D Bond Cylinder connecting two atom positions
function SpatialBondCylinder({ start, end, type = 'single' }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const distance = startVec.distanceTo(endVec);
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const orientation = new THREE.Matrix4();
  orientation.lookAt(startVec, endVec, new THREE.Vector3(0, 1, 0));
  const rotation = new THREE.Euler().setFromRotationMatrix(orientation);

  const isDouble = type === 'double';
  const isIonic = type === 'ionic';

  if (isDouble) {
    return (
      <group>
        <group position={[midPoint.x + 0.08, midPoint.y, midPoint.z]} rotation={rotation}>
          <Cylinder args={[0.04, 0.04, distance, 16]}>
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
          </Cylinder>
        </group>
        <group position={[midPoint.x - 0.08, midPoint.y, midPoint.z]} rotation={rotation}>
          <Cylinder args={[0.04, 0.04, distance, 16]}>
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
          </Cylinder>
        </group>
      </group>
    );
  }

  return (
    <group position={midPoint} rotation={rotation}>
      <Cylinder args={[isIonic ? 0.03 : 0.05, isIonic ? 0.03 : 0.05, distance, 16]}>
        <meshStandardMaterial
          color={isIonic ? '#10b981' : '#00f0ff'}
          emissive={isIonic ? '#10b981' : '#005f66'}
          emissiveIntensity={0.9}
        />
      </Cylinder>
    </group>
  );
}

// Render Synthesized 3D Molecule
function SynthesizedMolecule3D({ molecule, isAutoRotate = true }) {
  const groupRef = useRef();

  const autoScale = useMemo(() => {
    if (!molecule || !molecule.atoms || molecule.atoms.length === 0) return 1.0;
    let maxR = 0.1;
    molecule.atoms.forEach(atom => {
      const dist = Math.sqrt(atom.position[0] ** 2 + atom.position[1] ** 2 + atom.position[2] ** 2) + (atom.radius || 0.4);
      if (dist > maxR) maxR = dist;
    });
    return maxR > 2.2 ? 2.2 / maxR : 1.0;
  }, [molecule]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (isAutoRotate) {
        groupRef.current.rotation.y += delta * 0.4;
      }
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]} scale={[autoScale, autoScale, autoScale]}>
      {molecule.atoms.map((atom, idx) => (
        <group key={idx} position={atom.position}>
          <Sphere args={[atom.radius * 0.95, 32, 32]}>
            <meshStandardMaterial
              color={atom.color}
              emissive={atom.color}
              emissiveIntensity={0.6}
              roughness={0.15}
              metalness={0.8}
            />
          </Sphere>
          <Text
            position={[0, atom.radius + 0.35, 0]}
            fontSize={0.32}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {atom.symbol}
          </Text>
        </group>
      ))}

      {molecule.bonds.map((bond, idx) => {
        const start = molecule.atoms[bond.from].position;
        const end = molecule.atoms[bond.to].position;
        return (
          <SpatialBondCylinder
            key={idx}
            start={start}
            end={end}
            type={bond.type || 'single'}
          />
        );
      })}
    </group>
  );
}

// Render Dynamic 3D Spatial Lattice / Custom Atoms
function DynamicSpatialMolecule3D({ dynamicSpatialMolecule, onSelectAtom, isAutoRotate = true }) {
  const groupRef = useRef();

  const autoScale = useMemo(() => {
    if (!dynamicSpatialMolecule || !dynamicSpatialMolecule.atoms || dynamicSpatialMolecule.atoms.length === 0) return 1.0;
    let maxR = 0.1;
    dynamicSpatialMolecule.atoms.forEach(atom => {
      const dist = Math.sqrt(atom.position[0] ** 2 + atom.position[1] ** 2 + atom.position[2] ** 2) + (atom.radius || 0.4);
      if (dist > maxR) maxR = dist;
    });
    return maxR > 2.2 ? 2.2 / maxR : 1.0;
  }, [dynamicSpatialMolecule]);

  useFrame((state, delta) => {
    if (groupRef.current && isAutoRotate) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[autoScale, autoScale, autoScale]}>
      {dynamicSpatialMolecule?.atoms.map((atom) => (
        <SpatialAtomNode
          key={atom.index}
          atom={atom}
          onSelectAtom={onSelectAtom}
        />
      ))}

      {dynamicSpatialMolecule?.bonds.map((bond, idx) => {
        const start = dynamicSpatialMolecule.atoms[bond.from].position;
        const end = dynamicSpatialMolecule.atoms[bond.to].position;
        return (
          <SpatialBondCylinder
            key={idx}
            start={start}
            end={end}
            type="single"
          />
        );
      })}
    </group>
  );
}

export default function SpatialLabAR({ isCameraActive, cameraFacingMode, onToggleCameraFacing, isInvertHandX, onToggleInvertHandX, isInvertHandY, onToggleInvertHandY, handState, spawnElementSymbol, onClearSpawnElement }) {
  const [workbenchElements, setWorkbenchElements] = useState([]);
  const [synthesizedMolecule, setSynthesizedMolecule] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [isElementPickerOpen, setIsElementPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [selectedAtomInspect, setSelectedAtomInspect] = useState(null);
  const [isRoomAnchored, setIsRoomAnchored] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Auto-clear active toast notification after 3 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  // Auto-spawn element if triggered from Periodic Table modal or element selection
  useEffect(() => {
    if (spawnElementSymbol) {
      soundFx.playPop();
      setWorkbenchElements(prev => {
        const nextList = [...prev, spawnElementSymbol];
        checkMoleculeMatch(nextList);
        return nextList;
      });
      setActiveNotification(`Spawned ${spawnElementSymbol} in 3D AR Space!`);
      if (onClearSpawnElement) onClearSpawnElement();
    }
  }, [spawnElementSymbol]);

  // Hand Control & Zoom Scale States
  const [controlMode, setControlMode] = useState('pinch-grab');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [spatialScale, setSpatialScale] = useState(1.0);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Popular Quick-Spawn Elements
  const popularElements = ELEMENTS.filter(e => [1, 2, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 19, 20, 26, 29, 30, 47, 79].includes(e.number));

  // Chamber element counts for quick spawn badges
  const elementCounts = useMemo(() => {
    return workbenchElements.reduce((acc, sym) => {
      acc[sym] = (acc[sym] || 0) + 1;
      return acc;
    }, {});
  }, [workbenchElements]);

  // Dynamic Building Hint Helper
  const getBuildingHint = (elements) => {
    if (!elements || elements.length === 0) {
      return "💡 Click +Element buttons below to build molecules atom-by-atom!";
    }
    const h = elements.filter(s => s === 'H').length;
    const o = elements.filter(s => s === 'O').length;
    const c = elements.filter(s => s === 'C').length;
    const n = elements.filter(s => s === 'N').length;
    const na = elements.filter(s => s === 'Na').length;
    const cl = elements.filter(s => s === 'Cl').length;

    if (h === 1 && elements.length === 1) {
      return "💡 Add +H for H₂, +H+O for H₂O, +H+O+O for H₂O₂";
    }
    if (h === 2 && o === 0 && elements.length === 2) {
      return "💡 Matched H₂! Add +O for H₂O (Water), or +O+O for H₂O₂ (Hydrogen Peroxide)";
    }
    if (h === 2 && o === 1 && elements.length === 3) {
      return "💡 Matched H₂O (Water)! Add +O to form H₂O₂ (Hydrogen Peroxide)";
    }
    if (h === 2 && o === 2 && elements.length === 4) {
      return "🎉 Matched H₂O₂ (Hydrogen Peroxide)!";
    }
    if (c === 1 && o === 0 && elements.length === 1) {
      return "💡 Add +O+O for CO₂, or +H+H+H+H for CH₄ (Methane)";
    }
    if (c === 1 && o === 1 && elements.length === 2) {
      return "💡 Add +O for CO₂ (Carbon Dioxide)";
    }
    if (c === 1 && o === 2 && elements.length === 3) {
      return "🎉 Matched CO₂ (Carbon Dioxide)!";
    }
    if (c === 1 && h === 4 && elements.length === 5) {
      return "🎉 Matched CH₄ (Methane)!";
    }
    if (na === 1 && cl === 0 && elements.length === 1) {
      return "💡 Add +Cl for NaCl (Table Salt)";
    }
    if (na === 1 && cl === 1 && elements.length === 2) {
      return "🎉 Matched NaCl (Table Salt)!";
    }
    if (n === 1 && h === 3 && elements.length === 4) {
      return "🎉 Matched NH₃ (Ammonia)!";
    }

    return `💡 Chamber has ${elements.length} atom${elements.length > 1 ? 's' : ''}. Keep clicking elements to expand!`;
  };

  // Preset Recipes
  const experimentRecipes = [
    { id: 'h2o', name: 'Water (H₂O)', formula: 'H2O' },
    { id: 'h2o2', name: 'Hydrogen Peroxide (H₂O₂)', formula: 'H2O2' },
    { id: 'co2', name: 'Carbon Dioxide (CO₂)', formula: 'CO2' },
    { id: 'nacl', name: 'Table Salt (NaCl)', formula: 'NaCl' },
    { id: 'ch4', name: 'Methane (CH₄)', formula: 'CH4' },
    { id: 'nh3', name: 'Ammonia (NH₃)', formula: 'NH3' },
    { id: 'c17h35coona', name: 'Soap (C17H35COONa)', formula: 'C17H35COONa' }
  ];

  // Dynamic 3D Molecule spatial generation
  const dynamicSpatialMolecule = useMemo(() => {
    if (synthesizedMolecule) return null;
    return generate3DSpatialMolecule(workbenchElements);
  }, [workbenchElements, synthesizedMolecule]);

  // Element category filter for spawner modal
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');

  const categoriesList = [
    { id: 'all', label: 'All 118' },
    { id: 'reactive-nonmetal', label: 'Nonmetals' },
    { id: 'noble-gas', label: 'Noble Gases' },
    { id: 'alkali-metal', label: 'Alkali Metals' },
    { id: 'alkaline-earth', label: 'Alkaline Earth' },
    { id: 'transition-metal', label: 'Transition Metals' },
    { id: 'post-transition', label: 'Post-Transition' },
    { id: 'metalloid', label: 'Metalloids' },
    { id: 'halogen', label: 'Halogens' },
    { id: 'lanthanide', label: 'Lanthanides' },
    { id: 'actinide', label: 'Actinides' }
  ];

  // Count elements per category for spawner drawer filter badges
  const drawerCategoryCounts = useMemo(() => {
    const counts = { all: ELEMENTS.length };
    ELEMENTS.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredPickerElements = filterElements(ELEMENTS, searchQuery, modalCategoryFilter);

  const handleAddElement = (symbol) => {
    soundFx.playPop();
    const updatedList = [...workbenchElements, symbol];
    setWorkbenchElements(updatedList);
    checkMoleculeMatch(updatedList);
    setActiveNotification(`Added +${symbol} (${updatedList.length} Atoms total)`);
  };

  const handleRemoveLastAtom = () => {
    if (workbenchElements.length === 0) return;
    soundFx.playClick();
    const updatedList = workbenchElements.slice(0, -1);
    setWorkbenchElements(updatedList);
    checkMoleculeMatch(updatedList);
    setActiveNotification(updatedList.length > 0 ? `Removed Atom (${updatedList.length} Atoms remaining)` : 'Chamber Emptied!');
  };

  const handleFormulaSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formulaInput.trim()) return;

    soundFx.playClick();
    const parsed = parseChemicalFormula(formulaInput);

    if (parsed && parsed.symbolsList.length > 0) {
      setWorkbenchElements(parsed.symbolsList);
      checkMoleculeMatch(parsed.symbolsList);
      setActiveNotification(`Loaded Formula: ${formulaInput.toUpperCase()} (${parsed.symbolsList.length} Atoms)`);
    } else {
      setActiveNotification(`Invalid Formula format! Try H2O, H2O2, CO2, NaCl, C17H35COONa...`);
    }
  };

  const handleLoadRecipe = (recipe) => {
    soundFx.playClick();
    setFormulaInput(recipe.formula);
    const parsed = parseChemicalFormula(recipe.formula);
    if (parsed) {
      setWorkbenchElements(parsed.symbolsList);
      checkMoleculeMatch(parsed.symbolsList);
    }
  };

  const checkMoleculeMatch = (elementArray) => {
    const counts = elementArray.reduce((acc, sym) => {
      acc[sym] = (acc[sym] || 0) + 1;
      return acc;
    }, {});

    const matched = PRESET_MOLECULES.find(mol => {
      const keys = Object.keys(mol.requiredElements);
      const matchRequired = keys.every(k => counts[k] === mol.requiredElements[k]);
      const noExtra = Object.keys(counts).every(k => mol.requiredElements[k] === counts[k]);
      return matchRequired && noExtra;
    });

    if (matched) {
      soundFx.playBondSnap();
      soundFx.playSuccess();
      setSynthesizedMolecule(matched);
      setActiveNotification(`🎉 Synthesis Match: ${matched.name} (${matched.formula})!`);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 }
      });
    } else {
      setSynthesizedMolecule(null);
    }
  };

  const handleRecycle = () => {
    soundFx.playRecycleVortex();
    setWorkbenchElements([]);
    setSynthesizedMolecule(null);
    setSelectedAtomInspect(null);
    setFormulaInput('');
    setSpatialScale(1.0);
    setResetTrigger(prev => prev + 1);
    setActiveNotification('✨ Spatial Workbench Reset!');
  };

  const handleCenterMolecule = () => {
    soundFx.playClick();
    setSpatialScale(1.0);
    setResetTrigger(prev => prev + 1);
    setActiveNotification('🎯 Molecule Position & Scale Reset!');
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-1 sm:space-y-1.5 overflow-hidden h-[calc(100vh-42px)] sm:h-[calc(100vh-68px)] short:h-[calc(100vh-36px)]">
      {/* Top HUD Toolbar: Formula Builder + Experiment Recipes */}
      <div className={`px-1.5 py-1 sm:p-2 short-compact-py rounded-xl sm:rounded-2xl border flex flex-row items-center justify-between gap-1.5 sm:gap-2 shrink-0 transition-all ${
        isCameraActive ? 'bg-slate-950/80 border-cyan-400/40 backdrop-blur-md' : 'glass-panel border-cyan-500/30'
      }`}>
        {/* Row 1: Formula Input + Build + Reset */}
        <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-0">
          <form onSubmit={handleFormulaSubmit} className="flex items-center gap-1 flex-1 sm:flex-initial min-w-0">
            <div className="relative flex-1 min-w-0">
              <Wand2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-400" />
              <input
                type="text"
                placeholder="Formula (e.g. H2O, CaCO3)..."
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                className="pl-6 pr-1.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900/90 border border-cyan-400/60 text-cyan-300 font-mono text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-bold placeholder-slate-400 w-full sm:w-64 truncate shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-[10px] sm:text-xs hover:brightness-110 transition-all shadow-md shrink-0"
            >
              Build
            </button>
          </form>

          {/* Reset button compact */}
          <button
            onClick={handleRecycle}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[9px] sm:text-xs font-bold transition-all shadow-md shrink-0"
            title="Reset spatial chamber"
          >
            <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Desktop-only +118 Elements button in top toolbar */}
          <button
            onClick={() => setIsElementPickerOpen(true)}
            className="hidden sm:flex short-hide items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:brightness-125 border border-cyan-400 text-cyan-200 text-xs font-extrabold transition-all shadow-md shrink-0"
          >
            <Atom className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" /> + 118 Elements
          </button>
        </div>

        {/* Experiment Recipes Bar - Compact scrollable line (hidden on short height viewports to save vertical 3D space) */}
        <div className="hidden xs:flex short-hide items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[9px] sm:text-xs shrink-0 max-w-[45vw] sm:max-w-none">
          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0 hidden sm:inline">Recipes:</span>
          {experimentRecipes.map((rec) => (
            <button
              key={rec.id}
              onClick={() => handleLoadRecipe(rec)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md sm:rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 border border-white/10 hover:border-cyan-400/60 text-slate-200 font-medium transition-all shrink-0 hover:scale-105 whitespace-nowrap text-[9px] sm:text-xs"
            >
              <Play className="w-2 h-2 text-cyan-400 fill-cyan-400" /> {rec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Spatial Canvas Area */}
      <div className={`relative flex-1 w-full rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between transition-all min-h-0 ${
        isCameraActive ? 'bg-transparent border-cyan-400/30' : 'glass-panel border-cyan-500/20'
      }`}>
        {/* Toast Notification */}
        {activeNotification && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-cyan-400 text-slate-950 px-4 py-1.5 rounded-full font-extrabold text-[11px] sm:text-sm shadow-[0_0_25px_rgba(0,240,255,0.8)] backdrop-blur-md flex items-center gap-1.5 animate-bounce max-w-[90vw] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {activeNotification}
          </div>
        )}

        {/* Sleek Minimal AR Control Panel (Ultra-Compact 28px height on mobile portrait and mobile landscape, full dashboard on desktop height) */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-20 bg-slate-950/90 border border-cyan-400/40 backdrop-blur-xl p-1.5 sm:p-2.5 short-compact-py rounded-xl sm:rounded-3xl shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all">
          {/* Mobile Single-Line Compact Bar (< 640px OR short viewport height < 540px) */}
          <div className="flex sm:hidden short-show-compact items-center justify-between gap-1 text-[10px] font-mono">

            {/* Left: Atom Count + Chemical Match */}
            <div className="flex items-center gap-1 overflow-hidden truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-bold text-white shrink-0">Chamber ({workbenchElements.length})</span>
              <span className="text-slate-400">•</span>
              {synthesizedMolecule ? (
                <span className="font-bold text-emerald-300 truncate">Matched: {synthesizedMolecule.formula}</span>
              ) : (
                <span className="text-cyan-300 font-medium truncate">{formatAtomCounts(workbenchElements) || 'Empty'}</span>
              )}
            </div>

            {/* Right: Camera Flip + Controls Toggle */}
            <div className="flex items-center gap-1 shrink-0">
              {onToggleCameraFacing && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onToggleCameraFacing();
                  }}
                  className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/50 text-cyan-200 text-[9px] font-bold flex items-center gap-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-cyan-300 animate-spin-slow" />
                  <span>{cameraFacingMode === 'environment' ? 'Rear' : 'Front'}</span>
                </button>
              )}

              <button
                onClick={() => setShowMobileControls((prev) => !prev)}
                className={`px-1.5 py-0.5 rounded border text-[9px] font-bold flex items-center gap-0.5 transition-all ${
                  showMobileControls
                    ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_10px_#a855f7]'
                    : 'bg-slate-900 text-cyan-300 border-cyan-400/40'
                }`}
              >
                <span>⚙️ {showMobileControls ? 'Hide ▲' : 'Controls ▼'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Mobile Controls Tray (Only visible on mobile when toggled!) */}
          {showMobileControls && (
            <div className="flex sm:hidden items-center justify-between gap-1 pt-1.5 mt-1 border-t border-white/10 overflow-x-auto scrollbar-none animate-fade-in text-[9px] font-mono font-bold">
              {onToggleInvertHandX && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onToggleInvertHandX();
                  }}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 shrink-0 ${
                    isInvertHandX
                      ? 'bg-purple-600 text-white border-purple-300 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-white/15'
                  }`}
                >
                  <Move className="w-2.5 h-2.5 text-purple-300" />
                  <span>{isInvertHandX ? 'X: Inverted' : 'X: Normal'}</span>
                </button>
              )}

              {onToggleInvertHandY && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onToggleInvertHandY();
                  }}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 shrink-0 ${
                    isInvertHandY
                      ? 'bg-purple-600 text-white border-purple-300 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-white/15'
                  }`}
                >
                  <Move className="w-2.5 h-2.5 text-purple-300" />
                  <span>{isInvertHandY ? 'Y: Inverted' : 'Y: Normal'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsRoomAnchored((prev) => !prev);
                }}
                className={`px-2 py-1 rounded-lg border flex items-center gap-1 shrink-0 ${
                  isRoomAnchored
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-white/15'
                }`}
              >
                <Pin className="w-2.5 h-2.5" />
                <span>{isRoomAnchored ? 'Placed' : 'Place'}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAutoRotate((prev) => !prev);
                }}
                className={`px-2 py-1 rounded-lg border flex items-center gap-1 shrink-0 ${
                  isAutoRotate
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-white/15'
                }`}
              >
                {isAutoRotate ? <Pause className="w-2.5 h-2.5 fill-slate-950 text-slate-950" /> : <Play className="w-2.5 h-2.5 text-cyan-400" />}
                <span>{isAutoRotate ? 'Rotate' : 'Off'}</span>
              </button>
            </div>
          )}

          {/* Full Integrated Desktop Dashboard Layout (Visible on screens >= 640px AND height >= 540px) */}
          <div className="hidden sm:flex short-hide flex-col gap-1.5">
            {/* Top Row: Chamber Title & Primary Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff] shrink-0" />
                <span className="text-xs font-mono font-extrabold text-white uppercase tracking-wider whitespace-nowrap">
                  Atom Chamber
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                  {workbenchElements.length} Atom{workbenchElements.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono font-bold text-cyan-300">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    handState?.isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'
                  }`} />
                  <span>
                    {handState?.isActive && handState?.isTwoHanded
                      ? '🖐️🖐️ Zoom'
                      : handState?.isActive && handState?.isPinching
                      ? '👌 Pinch'
                      : handState?.isActive
                      ? '🖐️ Active'
                      : isCameraActive
                      ? 'Feed On'
                      : 'Feed Off'}
                  </span>
                </div>

                {onToggleCameraFacing && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleCameraFacing();
                    }}
                    className="px-2 py-0.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold transition-all flex items-center gap-1 hover:scale-105 shadow-md"
                    title="Switch between front camera and back room camera"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-300 animate-spin-slow" />
                    <span>{cameraFacingMode === 'environment' ? 'Rear' : 'Front'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Chemical Reaction State & Interactive AR Action Buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                <span className="font-extrabold text-cyan-200 font-mono max-w-[45vw] sm:max-w-md truncate">
                  {workbenchElements.length === 0 ? 'Chamber Empty' : formatAtomCounts(workbenchElements)}
                </span>

                {synthesizedMolecule ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Matched: {synthesizedMolecule.name}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300/90 border border-cyan-400/20 text-xs truncate">
                    {getBuildingHint(workbenchElements)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 shrink-0 overflow-x-auto scrollbar-none">
                {onToggleInvertHandX && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleInvertHandX();
                    }}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      isInvertHandX
                        ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_#a855f7] font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-300'
                    }`}
                    title="Toggle left/right motion direction (Normal vs Inverted)"
                  >
                    <Move className="w-3 h-3 text-purple-300" />
                    <span>{isInvertHandX ? 'X: Inverted' : 'X: Normal'}</span>
                  </button>
                )}

                {onToggleInvertHandY && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleInvertHandY();
                    }}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      isInvertHandY
                        ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_#a855f7] font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-300'
                    }`}
                    title="Toggle up/down motion direction (Normal vs Inverted)"
                  >
                    <Move className="w-3 h-3 text-purple-300" />
                    <span>{isInvertHandY ? 'Y: Inverted' : 'Y: Normal'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsRoomAnchored((prev) => !prev);
                  }}
                  className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    isRoomAnchored
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_#10b981] font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-300'
                  }`}
                  title="Place and lock 3D molecule position anywhere in your physical room"
                >
                  <Pin className="w-3 h-3" />
                  <span>{isRoomAnchored ? 'Placed' : 'Place'}</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsAutoRotate((prev) => !prev);
                  }}
                  className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    isAutoRotate
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#00f0ff] font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-300'
                  }`}
                  title="Toggle 3D Auto Rotation"
                >
                  {isAutoRotate ? <Pause className="w-3 h-3 text-slate-950 fill-slate-950" /> : <Play className="w-3 h-3 text-cyan-400" />}
                  <span>{isAutoRotate ? 'Rotate' : 'Off'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Spawn Bottom Palette Bar */}
        <div className={`absolute z-20 flex items-center justify-between gap-2 transition-all ${
          synthesizedMolecule
            ? (isSpecsExpanded ? 'bottom-20 sm:bottom-28' : 'bottom-9 sm:bottom-12')
            : 'bottom-1.5 sm:bottom-3'
        } left-1.5 sm:left-3 right-1.5 sm:right-3 py-1 sm:py-2 px-2 sm:px-3 short-compact-py bg-slate-950/90 rounded-2xl border border-cyan-400/30 backdrop-blur-xl overflow-x-auto shadow-2xl`}>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-xs font-mono text-slate-400 font-bold shrink-0 mr-1 hidden md:inline">Quick Spawn:</span>
            {popularElements.map(elem => {
              const catStyle = CATEGORY_COLORS[elem.category] || {};
              const countInChamber = elementCounts[elem.symbol] || 0;
              return (
                <button
                  key={elem.symbol}
                  onClick={() => handleAddElement(elem.symbol)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-extrabold transition-all hover:scale-110 shrink-0 ${catStyle.bg || 'bg-slate-800'} ${catStyle.border || 'border-cyan-400'} text-white shadow-md relative group`}
                >
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300">{elem.symbol}</span>
                  {countInChamber > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[9px] rounded-full bg-cyan-400 text-slate-950 font-black shadow-[0_0_8px_#00f0ff]">
                      {countInChamber}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-normal hidden xl:inline">({elem.name})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {workbenchElements.length > 0 && (
              <button
                onClick={handleRemoveLastAtom}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-extrabold transition-all flex items-center gap-1 shadow-md shrink-0 hover:scale-105"
                title="Remove last added atom from chamber"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Undo Atom</span>
              </button>
            )}
            <button
              onClick={() => setIsElementPickerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-black text-xs shrink-0 hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg border border-cyan-300"
            >
              <Atom className="w-4 h-4 text-slate-950" /> + All 118 Elements
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <Canvas
          gl={{ alpha: true }}
          camera={{ position: [0, 0, workbenchElements.length > 20 ? 8 : 5.5], fov: 48 }}
        >
          <ambientLight intensity={0.9} />
          <pointLight position={[10, 10, 10]} intensity={1.6} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.9} color="#00f0ff" />

          {/* 3D Hand Control Group (Driven by WebCam Hand Tracking) */}
          <SpatialHandControlledGroup
            handState={handState}
            controlMode={controlMode}
            resetTrigger={resetTrigger}
            spatialScale={spatialScale}
            setSpatialScale={setSpatialScale}
            isRoomAnchored={isRoomAnchored}
          >
            {/* Render Preset 3D Molecule OR Dynamic 3D Spatial Lattice */}
            {synthesizedMolecule ? (
              <SynthesizedMolecule3D molecule={synthesizedMolecule} isAutoRotate={isAutoRotate} />
            ) : (
              <DynamicSpatialMolecule3D
                dynamicSpatialMolecule={dynamicSpatialMolecule}
                onSelectAtom={(el) => setSelectedAtomInspect(el)}
                isAutoRotate={isAutoRotate}
              />
            )}
          </SpatialHandControlledGroup>

          <OrbitControls enableZoom={true} minDistance={3} maxDistance={15} />
        </Canvas>

        {/* Reaction Synthesis Details Footer - Collapsible on Mobile to leave 3D Canvas 100% Unobstructed! */}
        {synthesizedMolecule && (
          <div className="p-1.5 sm:p-3 short-compact-py bg-slate-950/95 border-t border-purple-500/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-xs z-20 shrink-0 shadow-2xl transition-all">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-cyan-300 text-xs sm:text-sm">
                  {synthesizedMolecule.name} ({synthesizedMolecule.formula})
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                  [{synthesizedMolecule.bondType} Bond • {synthesizedMolecule.shape}]
                </span>
                <div className="flex items-center gap-1 font-mono text-emerald-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-emerald-500/30 text-[10px] sm:text-xs">
                  <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span>Match ✅</span>
                </div>
              </div>

              {/* Mobile Specs Expand/Collapse Toggle Button */}
              <button
                onClick={() => setIsSpecsExpanded((prev) => !prev)}
                className="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 shadow-md"
              >
                <span>{isSpecsExpanded ? 'Hide ▲' : 'Details ▼'}</span>
              </button>
            </div>

            {/* Expanded Description Specs Note (Visible on desktop height, toggleable on short viewports!) */}
            <div className={`${isSpecsExpanded ? 'block' : 'hidden sm:block short-hide'} space-y-1 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10`}>
              <p className="text-[10.5px] sm:text-xs text-slate-300 leading-relaxed font-sans">{synthesizedMolecule.classNote}</p>
              <span className="inline-block text-[9.5px] sm:text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-400/40">
                ✨ Chamber Open: Click +Element to expand build!
              </span>
            </div>
          </div>
        )}
      </div>


      {/* Full 118 Element Spawner Drawer Modal */}
      {isElementPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-5xl h-[88vh] glass-panel-glow rounded-3xl p-4 sm:p-6 text-white border border-cyan-400/50 shadow-2xl flex flex-col space-y-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <Atom className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    Select Element to Spawn in 3D AR Space
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Browse all 118 Periodic Table Elements ({filteredPickerElements.length} displayed)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsElementPickerOpen(false)}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/10 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search + Category Filter Tabs */}
            <div className="space-y-2 shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search by name, symbol, or atomic number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-900 border border-white/20 text-cyan-300 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 font-medium shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-xs">
                {categoriesList.map(cat => {
                  const count = drawerCategoryCounts[cat.id] || 0;
                  const isActive = modalCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setModalCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1 ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#00f0ff]'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fully Scrollable 118 Elements Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 scrollbar-thin">
              {filteredPickerElements.map((elem) => {
                const catStyle = CATEGORY_COLORS[elem.category] || {};
                return (
                  <button
                    key={elem.number}
                    onClick={() => {
                      handleAddElement(elem.symbol);
                      setIsElementPickerOpen(false);
                    }}
                    className={`p-2 rounded-2xl border text-center transition-all hover:scale-105 flex flex-col justify-between items-center h-16 ${catStyle.bg || 'bg-slate-900'} ${catStyle.border || 'border-white/10'} hover:border-cyan-400 shadow-md group`}
                  >
                    <span className="text-[9px] font-mono text-slate-400 self-start leading-none">{elem.number}</span>
                    <span className={`text-base font-extrabold leading-none ${catStyle.text || 'text-cyan-300'} group-hover:scale-110 transition-transform`}>{elem.symbol}</span>
                    <span className="text-[9px] text-slate-300 truncate max-w-full leading-none font-medium">{elem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Atom Inspection Toast Modal */}
      {selectedAtomInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-5 text-white border border-cyan-400 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xl font-bold text-cyan-300">
                  {selectedAtomInspect.symbol}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedAtomInspect.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">Z = {selectedAtomInspect.number} | Mass = {selectedAtomInspect.mass} u</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAtomInspect(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px]">Valency</span>
                <span className="text-sm font-bold text-cyan-300">{selectedAtomInspect.valency}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-mono block text-[10px]">Electron Shells</span>
                <span className="text-sm font-bold text-purple-300 font-mono">[{selectedAtomInspect.shells?.join(', ')}]</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-white/10 leading-relaxed">
              {selectedAtomInspect.summary}
            </p>

            <button
              onClick={() => setSelectedAtomInspect(null)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
