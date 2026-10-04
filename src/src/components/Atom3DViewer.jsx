import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Ring, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D Nucleus Cluster component
function NucleusCluster({ protons, neutrons }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  const totalParticles = Math.min(protons + neutrons, 35);
  const particles = [];

  for (let i = 0; i < totalParticles; i++) {
    const phi = Math.acos(-1 + (2 * i) / totalParticles);
    const theta = Math.sqrt(totalParticles * Math.PI) * phi;

    const radius = 0.45 + Math.random() * 0.15;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const isProton = i < protons;

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

// 3D Orbiting Electron Ring component
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
      {/* Orbital Ring Wireframe */}
      <Ring args={[radius - 0.02, radius + 0.02, 64]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#00f0ff" opacity={0.3} transparent side={THREE.DoubleSide} />
      </Ring>

      {/* Electrons */}
      {Array.from({ length: electronCount }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => (electronsRef.current[i] = el)}
          args={[0.12, 16, 16]}
        >
          <meshStandardMaterial
            color="#ffe600"
            emissive="#ffe600"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </Sphere>
      ))}

      {/* Shell Name Label */}
      <Text
        position={[radius + 0.3, 0, 0]}
        fontSize={0.25}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        {shellName}
      </Text>
    </group>
  );
}

export default function Atom3DViewer({ element }) {
  const protons = element ? element.number : 1;
  const neutrons = element ? Math.round(element.mass - element.number) : 0;
  const shells = element ? element.shells : [1];
  const shellLabels = ['K', 'L', 'M', 'N'];

  return (
    <div className="w-full h-[380px] md:h-[450px] relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/30">
      {/* Top HUD badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
        <span className="text-2xl font-bold text-cyan-400">{element?.symbol || 'H'}</span>
        <div>
          <h4 className="text-sm font-semibold text-white">{element?.name || 'Hydrogen'}</h4>
          <p className="text-xs text-slate-400 font-mono">Z = {protons} | A = {element?.mass}</p>
        </div>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md">
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_8px_#ef4444]"></span> Protons ({protons})
        </span>
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#00f0ff]"></span> Neutrons ({neutrons})
        </span>
        <span className="flex items-center gap-1.5 text-yellow-300">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shadow-[0_0_8px_#ffe600]"></span> Electrons ({protons})
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00f0ff" />

        {/* Nucleus */}
        <NucleusCluster protons={protons} neutrons={neutrons} />

        {/* Electron Shell Orbits */}
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
              shellName={`${shellLabels[index]} (${count}e⁻)`}
            />
          );
        })}

        <OrbitControls enableZoom={true} minDistance={3} maxDistance={15} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
