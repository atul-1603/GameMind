import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EnemyInstance } from '../ai/enemyController';

interface EnemyProps {
  enemy: EnemyInstance;
}

const ARCHETYPE_CONFIG = {
  scout: { tint: '#ff3300', lightColor: '#ff3300', size: 0.82 },
  guardian: { tint: '#eab308', lightColor: '#eab308', size: 1.05 },
  hunter: { tint: '#a855f7', lightColor: '#a855f7', size: 0.92 },
};

export const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const isDead = enemy.health <= 0 || enemy.state === 'DEAD';
  const healthPercent = Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100));
  const config = ARCHETYPE_CONFIG[enemy.archetype] || ARCHETYPE_CONFIG.scout;

  useFrame(({ clock }) => {
    if (!groupRef.current || isDead) return;

    // Position enemy on ground
    groupRef.current.position.set(enemy.position.x, enemy.position.y - 1, enemy.position.z);
    groupRef.current.rotation.y = enemy.yaw;

    // Subtle breathing or movement bobbing
    const t = clock.getElapsedTime() * 4;
    const isMoving = enemy.state === 'CHASE' || enemy.state === 'PATROL' || enemy.state === 'FLANK' || enemy.state === 'RETREAT';
    if (isMoving) {
      groupRef.current.position.y += Math.sin(t * 2) * 0.03;
    }
  });

  if (isDead) return null;

  const stateColor =
    enemy.state === 'ATTACK'
      ? '#ef4444'
      : enemy.state === 'CHASE' || enemy.state === 'FLANK'
        ? '#f97316'
        : enemy.state === 'TAKE_COVER'
          ? '#eab308'
          : '#06b6d4';

  const healthBarY = config.size * 2.15 + 0.25;

  return (
    <group ref={groupRef}>
      {/* Procedural opponents are visible, lightweight, and require no model downloads. */}
      <mesh castShadow position={[0, config.size * 0.75, 0]} scale={[config.size, config.size, config.size]}>
        <octahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color={config.tint} emissive={config.tint} emissiveIntensity={0.4} metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, config.size * 1.58, 0]} scale={[config.size, config.size, config.size]}>
        <sphereGeometry args={[0.34, 16, 12]} />
        <meshStandardMaterial color="#111827" emissive={stateColor} emissiveIntensity={0.8} metalness={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[0, config.size * 1.58, -config.size * 0.3]} scale={[config.size, config.size, config.size]}>
        <boxGeometry args={[0.5, 0.08, 0.08]} />
        <meshBasicMaterial color={stateColor} />
      </mesh>
      {/* Bright target ring makes the opponent's aim point readable at gameplay distance. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <torusGeometry args={[config.size * 0.9, 0.035, 8, 32]} />
        <meshBasicMaterial color={stateColor} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, config.size * 2.05, 0]}>
        <coneGeometry args={[0.11, 0.22, 4]} />
        <meshBasicMaterial color={stateColor} />
      </mesh>

      {/* Subtle archetype light */}
      <pointLight color={config.lightColor} intensity={1.5} distance={3.5} position={[0, 1.2, 0]} />

      {/* Floating 3D Health Bar */}
      <group position={[0, healthBarY, 0]}>
        {/* Dark background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.08]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
        {/* Health fill */}
        <mesh position={[(healthPercent / 100 - 1) * 0.5, 0, 0.005]}>
          <planeGeometry args={[(healthPercent / 100) * 1.0, 0.08]} />
          <meshBasicMaterial
            color={healthPercent < 30 ? '#ef4444' : healthPercent < 60 ? '#f97316' : '#22c55e'}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* State indicator strip */}
        <mesh position={[0, 0.12, 0]}>
          <planeGeometry args={[0.9, 0.05]} />
          <meshBasicMaterial color={stateColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
