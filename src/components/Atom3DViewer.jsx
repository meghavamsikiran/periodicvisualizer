import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Ring, Text } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/AudioController';
import { Play, Pause } from 'lucide-react';

function NucleusCluster({ protons, neutrons }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  const totalParticles = Math.min(protons + neutrons, 38);
  const particles = [];

  for (let i = 0; i < totalParticles; i++) {
    const phi = Math.acos(-1 + (2 * i) / totalParticles);
    const theta = Math.sqrt(totalParticles * Math.PI) * phi;

    const radius = 0.42 + (i % 3) * 0.06;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    // Interleave protons (red) and neutrons (cyan) so both are clearly visible in 3D
    const isProton = i % 2 === 0;

    particles.push({
      id: i,
      position: [x, y, z],
      color: isProton ? '#ef4444' : '#00f0ff',
      emissive: isProton ? '#791d1d' : '#005f66'
    });
  }

  return (
    <group ref={groupRef}>
      {particles.map((p) => (
        <Sphere key={p.id} args={[0.22, 16, 16]} position={p.position}>
          <meshStandardMaterial
            color={p.color}
            emissive={p.emissive}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
}

function ElectronShell({ radius, electronCount, speed, tiltAngle, shellName }) {
  const electronsRef = useRef([]);
  const ringGroupRef = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speed;
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z = tiltAngle;
      ringGroupRef.current.rotation.x = tiltAngle * 0.5;
    }

    electronsRef.current.forEach((el, index) => {
      if (el) {
        const angle = time + (index * (Math.PI * 2 / electronCount));
        el.position.x = radius * Math.cos(angle);
        el.position.y = radius * Math.sin(angle);
      }
    });
  });

  return (
    <group ref={ringGroupRef}>
      {/* Orbit Ring */}
      <Ring args={[radius - 0.02, radius + 0.02, 64]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#00f0ff" opacity={0.35} transparent side={THREE.DoubleSide} />
      </Ring>

      {/* Orbiting Yellow Electron Spheres */}
      {Array.from({ length: electronCount }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => (electronsRef.current[i] = el)}
          args={[0.13, 16, 16]}
        >
          <meshStandardMaterial
            color="#ffe600"
            emissive="#ffe600"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </Sphere>
      ))}

      {/* 3D Shell Label */}
      <Text
        position={[0, radius + 0.25, 0]}
        fontSize={0.24}
        color="#c084fc"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {shellName}
      </Text>
    </group>
  );
}

export default function Atom3DViewer({ element }) {
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const protons = element ? element.number : 1;
  const neutrons = element ? Math.round(element.mass - element.number) : 0;
  const shells = element ? element.shells : [1];
  const shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[480px] flex-1 relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/30">
      {/* Top Left Element Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
        <span className="text-2xl font-black font-mono text-cyan-400">{element?.symbol || 'H'}</span>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">{element?.name || 'Hydrogen'}</h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Z = {protons} | A = {element?.mass} u</p>
        </div>
      </div>

      {/* Top Right Rotation Control */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            soundFx.playClick();
            setIsAutoRotate((prev) => !prev);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 ${
            isAutoRotate
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#00f0ff] font-extrabold'
              : 'bg-slate-950/90 border-white/20 text-slate-300 hover:text-white hover:border-cyan-400'
          }`}
          title="Toggle 3D Auto Rotation"
        >
          {isAutoRotate ? <Pause className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isAutoRotate ? '🔄 Rotating' : '⏸️ Rotate Off'}</span>
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00f0ff" />

        <NucleusCluster protons={protons} neutrons={neutrons} />

        {shells.map((count, index) => {
          const radius = 1.8 + index * 1.1;
          const speed = 1.5 / (index + 1);
          const tilt = (index * Math.PI) / 4;
          return (
            <ElectronShell
              key={index}
              radius={radius}
              electronCount={count}
              speed={speed}
              tiltAngle={tilt}
              shellName={`${shellLabels[index]} (${count}e-)`}
            />
          );
        })}

        <OrbitControls enableZoom={true} minDistance={3} maxDistance={15} autoRotate={isAutoRotate} autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
