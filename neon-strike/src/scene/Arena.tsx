import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ArenaMissionConfig } from '../game/arenaDefinitions';

interface ArenaProps {
  mission: ArenaMissionConfig;
  collectedPickups?: Set<string>;
}

export const Arena: React.FC<ArenaProps> = ({ mission, collectedPickups }) => {
  const pickupsRef = useRef<THREE.Group>(null);
  const extractionRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Pickups rotation & bobbing
    if (pickupsRef.current) {
      pickupsRef.current.children.forEach((child, idx) => {
        child.rotation.y += delta * 1.5;
        child.position.y = 0.8 + Math.sin(Date.now() * 0.003 + idx) * 0.15;
      });
    }

    // Extraction beacon pulse
    if (extractionRef.current) {
      const mat = extractionRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(Date.now() * 0.005) * 0.2;
      }
    }
  });

  return (
    <group>
      {/* Modular arena shell replaces the external map asset. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.1} />
      </mesh>
      {[
        [0, 1.5, -22, 45, 3, 1],
        [0, 1.5, 22, 45, 3, 1],
        [-22, 1.5, 0, 1, 3, 45],
        [22, 1.5, 0, 1, 3, 45],
      ].map(([x, y, z, width, height, depth], index) => (
        <mesh key={index} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#1e293b" emissive="#0f172a" emissiveIntensity={0.35} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Pickups (Floating Health & Ammo Packs) */}
      <group ref={pickupsRef}>
        {mission.pickups
          .filter((p) => !collectedPickups?.has(p.id))
          .map((p) => {
            const isHealth = p.type === 'health';
            const pColor = isHealth ? '#00e676' : '#ffd600';

            return (
              <group key={p.id} position={[p.x, 0.8, p.z]}>
                <mesh castShadow>
                  {isHealth ? (
                    <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
                  ) : (
                    <boxGeometry args={[0.5, 0.6, 0.35]} />
                  )}
                  <meshStandardMaterial
                    color={pColor}
                    emissive={pColor}
                    emissiveIntensity={0.6}
                    roughness={0.3}
                  />
                </mesh>
                <pointLight color={pColor} intensity={1.5} distance={4} />
              </group>
            );
          })}
      </group>

      {/* Extraction Zone Beacon */}
      <group position={[mission.extractionZone.x, 0, mission.extractionZone.z]}>
        {/* Floor ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[mission.extractionZone.radius - 0.3, mission.extractionZone.radius, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
        </mesh>
        {/* Hologram beacon cylinder */}
        <mesh ref={extractionRef} position={[0, 4, 0]}>
          <cylinderGeometry args={[mission.extractionZone.radius, mission.extractionZone.radius, 8, 32, 1, true]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color="#00e5ff" intensity={2.5} distance={10} position={[0, 2, 0]} />
      </group>
    </group>
  );
};
