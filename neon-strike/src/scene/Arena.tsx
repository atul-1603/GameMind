import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ArenaMissionConfig } from '../game/arenaDefinitions';

interface ArenaProps {
  mission: ArenaMissionConfig;
  collectedPickups?: Set<string>;
}

// Pre-load clocktower GLB
useGLTF.preload('/models/clocktower.glb');

export const Arena: React.FC<ArenaProps> = ({ mission, collectedPickups }) => {
  const pickupsRef = useRef<THREE.Group>(null);
  const extractionRef = useRef<THREE.Mesh>(null);

  // Load the clocktower 3D map
  const { scene: clocktowerScene } = useGLTF('/models/clocktower.glb');

  // Prepare clocktower mesh once: enable shadows, realistic materials
  const mapScene = useMemo(() => {
    const cloned = clocktowerScene.clone(true);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.roughness = 0.8;
              m.metalness = 0.15;
            });
          } else {
            child.material.roughness = 0.8;
            child.material.metalness = 0.15;
          }
        }
      }
    });
    return cloned;
  }, [clocktowerScene]);

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
      {/* Real 3D Clocktower Map - properly centered with floor at y=0 */}
      <primitive
        object={mapScene}
        position={[-18.97, -17.08, -5.06]}
        scale={[1, 1, 1]}
      />

      {/* Subtle foundational terrain underneath the clocktower */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1e2433" roughness={0.9} metalness={0.1} />
      </mesh>

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
