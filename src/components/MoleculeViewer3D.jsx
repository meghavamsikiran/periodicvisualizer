import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/AudioController';
import { RotateCcw, Play, Pause } from 'lucide-react';

// 3D Bond Cylinder connecting two atom positions
function Bond({ start, end, type = 'single' }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const distance = startVec.distanceTo(endVec);

  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const orientation = new THREE.Matrix4();
  orientation.lookAt(startVec, endVec, new THREE.Vector3(0, 1, 0));
  const rotation = new THREE.Euler().setFromRotationMatrix(orientation);

  if (type === 'double') {
    const offset = 0.12;
    return (
      <group>
        <group position={[midPoint.x + offset, midPoint.y, midPoint.z]} rotation={rotation}>
          <Cylinder args={[0.06, 0.06, distance, 16]}>
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} metalness={0.8} />
          </Cylinder>
        </group>
        <group position={[midPoint.x - offset, midPoint.y, midPoint.z]} rotation={rotation}>
          <Cylinder args={[0.06, 0.06, distance, 16]}>
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} metalness={0.8} />
          </Cylinder>
        </group>
      </group>
    );
  }

  const isIonic = type === 'ionic';

  return (
    <group position={midPoint} rotation={rotation}>
      <Cylinder args={[isIonic ? 0.04 : 0.08, isIonic ? 0.04 : 0.08, distance, 16]}>
        <meshStandardMaterial
          color={isIonic ? '#10b981' : '#00f0ff'}
          emissive={isIonic ? '#10b981' : '#005f66'}
          emissiveIntensity={0.9}
          wireframe={isIonic}
        />
      </Cylinder>
    </group>
  );
}

// 3D Atom Sphere with optional Space-Filling or Electron Cloud Glow
function MoleculeAtom({ atom, viewMode, onAtomClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  const displayRadius = viewMode === 'spacefill' ? atom.vdwRadius : atom.radius;

  return (
    <group
      position={atom.position}
      onClick={(e) => {
        e.stopPropagation();
        onAtomClick(atom);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Primary Atom Sphere */}
      <Sphere ref={meshRef} args={[displayRadius, 32, 32]}>
        <meshStandardMaterial
          color={hovered ? '#ffffff' : atom.color}
          emissive={atom.color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.7}
        />
      </Sphere>

      {/* Translucent Electron Cloud Glow */}
      {viewMode === 'cloud' && (
        <Sphere args={[displayRadius * 1.5, 32, 32]}>
          <meshBasicMaterial
            color={atom.color}
            opacity={0.25}
            transparent
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}

      {/* 3D Label */}
      {viewMode !== 'spacefill' && (
        <Text
          position={[0, displayRadius + 0.35, 0]}
          fontSize={0.32}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {atom.symbol}
        </Text>
      )}
    </group>
  );
}

// Floating Molecule Group (Only rotates Y axis when isAutoRotate is true!)
function Molecule3DGroup({ molecule, viewMode, onAtomClick, isAutoRotate }) {
  const groupRef = useRef();

  const autoScale = React.useMemo(() => {
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
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={[autoScale, autoScale, autoScale]}>
      {/* Render 3D Atoms */}
      {molecule.atoms.map((atom, idx) => (
        <MoleculeAtom
          key={idx}
          atom={atom}
          viewMode={viewMode}
          onAtomClick={onAtomClick}
        />
      ))}

      {/* Render 3D Bonds (only if not spacefill) */}
      {viewMode !== 'spacefill' &&
        molecule.bonds.map((bond, idx) => {
          const start = molecule.atoms[bond.from].position;
          const end = molecule.atoms[bond.to].position;
          return (
            <Bond
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

export default function MoleculeViewer3D({ molecule }) {
  const [viewMode, setViewMode] = useState('ballstick'); // 'ballstick', 'spacefill', 'cloud'
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const orbitRef = useRef();

  if (!molecule) return null;

  const handleAtomClick = (atom) => {
    soundFx.playClick();
    setSelectedAtom(atom);
  };

  const handleResetCamera = () => {
    soundFx.playClick();
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  const handleToggleRotate = () => {
    soundFx.playClick();
    setIsAutoRotate((prev) => !prev);
  };

  return (
    <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] short:h-[calc(100vh-60px)] max-h-[82vh] relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.15)] flex flex-col">
      {/* Top HUD Toolbar - Clean Non-Overlapping Mobile & Desktop Layout */}
      <div className="absolute top-1.5 sm:top-4 left-1.5 sm:left-4 right-1.5 sm:right-4 z-10 flex flex-col sm:flex-row short:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Title Badge */}
        <div className="bg-slate-950/90 p-1.5 sm:p-2.5 short-compact-py px-2.5 sm:px-4 rounded-2xl border border-cyan-500/30 backdrop-blur-xl pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-full">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-xl font-black font-mono text-cyan-400">{molecule.formula}</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate">{molecule.name}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Mass: <strong className="text-cyan-300">{molecule.molecularMass}</strong></span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span>Bond: <strong className="text-purple-300">{molecule.bondType}</strong></span>
          </p>
        </div>


        {/* View Mode Switcher Segment Pills */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-xl pointer-events-auto shadow-lg max-w-full overflow-x-auto scrollbar-none">
          {[
            { id: 'ballstick', label: 'Ball & Stick' },
            { id: 'spacefill', label: 'Space-Fill' },
            { id: 'cloud', label: 'Electron Cloud' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                soundFx.playClick();
                setViewMode(mode.id);
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleRotate}
          className={`px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 ${
            isAutoRotate
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#00f0ff] font-extrabold'
              : 'bg-slate-950/90 border-white/20 text-slate-300 hover:text-white hover:border-cyan-400'
          }`}
          title="Toggle 3D Auto Rotation"
        >
          {isAutoRotate ? <Pause className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isAutoRotate ? 'Rotating' : 'Rotate'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="px-3 py-2 rounded-xl bg-slate-950/90 border border-white/20 text-slate-300 hover:text-white hover:border-cyan-400/60 backdrop-blur-md text-xs font-bold transition-all flex items-center gap-1.5"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Selected Atom Inspection Toast */}
      {selectedAtom && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/95 px-4 py-2.5 rounded-2xl border border-cyan-400/80 text-xs text-slate-200 backdrop-blur-xl animate-fade-in shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center gap-3">
          <span className="w-4 h-4 rounded-full inline-block ring-2 ring-white/20" style={{ backgroundColor: selectedAtom.color }} />
          <div>
            <strong className="text-cyan-300 font-mono text-sm">{selectedAtom.name} ({selectedAtom.symbol})</strong>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Valency: <span className="text-white font-bold">{selectedAtom.valency}</span> | VdW Radius: <span className="text-purple-300 font-bold">{selectedAtom.vdwRadius} Å</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedAtom(null)}
            className="text-slate-400 hover:text-white font-bold ml-3 text-sm px-1.5 py-0.5 rounded-md hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 0, 5.5], fov: 48 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.9} color="#a855f7" />

        <Molecule3DGroup
          molecule={molecule}
          viewMode={viewMode}
          onAtomClick={handleAtomClick}
          isAutoRotate={isAutoRotate}
        />

        <OrbitControls
          ref={orbitRef}
          enableZoom={true}
          autoRotate={isAutoRotate}
          autoRotateSpeed={0.8}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
