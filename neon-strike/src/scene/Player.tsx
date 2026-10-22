import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  position: [number, number, number];
  yaw: number;
  pitch: number;
  isMoving: boolean;
  isAiming: boolean;
  isShooting: boolean;
}

export const Player: React.FC<PlayerProps> = ({
  position,
  yaw,
  isMoving,
  isAiming,
  isShooting,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const weaponGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Position feet at floor (position[1] - 1)
    groupRef.current.position.set(position[0], position[1] - 1, position[2]);
    groupRef.current.rotation.y = yaw;

    const t = clock.getElapsedTime() * 8;

    // Slight bobbing when moving
    if (isMoving) {
      groupRef.current.position.y += Math.sin(t) * 0.04;
    }

    // Weapon positioning and recoil
    if (weaponGroupRef.current) {
      if (isAiming) {
        weaponGroupRef.current.position.set(0.12, 1.15, -0.45);
      } else {
        weaponGroupRef.current.position.set(0.28, 0.95, -0.4);
      }
      if (isShooting) {
        weaponGroupRef.current.position.z += 0.08;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Procedural player silhouette keeps the shooter playable without external models. */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <capsuleGeometry args={[0.34, 0.95, 8, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#075985" emissiveIntensity={0.35} metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh castShadow position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.27, 16, 12]} />
        <meshStandardMaterial color="#dbeafe" emissive="#0e7490" emissiveIntensity={0.25} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 1.32, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.46, 0.12, 0.12]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Simple energy rifle built from primitive meshes. */}
      <group ref={weaponGroupRef} position={[0.28, 0.95, -0.4]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.85, 0.12, 0.14]} />
          <meshStandardMaterial color="#334155" emissive="#0f172a" metalness={0.85} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, -0.48]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.28, 12]} />
          <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={2} />
        </mesh>
        {isShooting && (
          <pointLight color="#ffbb33" intensity={8} distance={5} position={[0, 0, -0.6]} />
        )}
      </group>
    </group>
  );
};
