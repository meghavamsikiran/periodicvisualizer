import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere, Text, Ring } from '@react-three/drei';
import * as THREE from 'three';

export default function RecyclerVortex({ isActive, onRecycleClick }) {
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const coreRef = useRef();
  const particleGroupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 1.2;
      outerRingRef.current.rotation.x = Math.sin(t * 0.8) * 0.3;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 1.8;
      innerRingRef.current.rotation.y = Math.cos(t * 0.8) * 0.4;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.6;
    }
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.z = t * 2.5;
    }
  });

  return (
    <group position={[0, 2.3, 0]} onClick={onRecycleClick}>
      {/* Outer Cyan Ring */}
      <group ref={outerRingRef}>
        <Torus args={[0.9, 0.045, 16, 64]}>
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={isActive ? 2.5 : 1.2}
            wireframe
          />
        </Torus>
      </group>

      {/* Inner Neon Green Ring */}
      <group ref={innerRingRef}>
        <Torus args={[0.7, 0.035, 16, 48]}>
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={isActive ? 2.2 : 1.0}
          />
        </Torus>
      </group>

      {/* Swirling Particle Ring */}
      <group ref={particleGroupRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 0.55;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#00ff88" />
            </mesh>
          );
        })}
      </group>

      {/* Central Blackhole Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial
          color="#060c1a"
          emissive={isActive ? '#00ff88' : '#00f0ff'}
          emissiveIntensity={isActive ? 1.5 : 0.4}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 3D Label matching Image 2 in original prompt: MODEL RECYCLER */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.24}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.12}
      >
        MODEL RECYCLER
      </Text>
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.14}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Release or click to recycle
      </Text>
    </group>
  );
}
