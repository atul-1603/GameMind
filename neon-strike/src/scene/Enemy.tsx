import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { EnemyInstance } from '../ai/enemyController';

interface EnemyProps {
  enemy: EnemyInstance;
}

// Pre-load enemy GLB
useGLTF.preload('/models/enemy.glb');

const ARCHETYPE_CONFIG = {
  scout: { scale: 0.009, tint: '#ff3300', lightColor: '#ff3300' },
  guardian: { scale: 0.014, tint: '#eab308', lightColor: '#eab308' },
  hunter: { scale: 0.011, tint: '#a855f7', lightColor: '#a855f7' },
};

export const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: enemyScene } = useGLTF('/models/enemy.glb');

  const isDead = enemy.health <= 0 || enemy.state === 'DEAD';
  const healthPercent = Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100));
  const config = ARCHETYPE_CONFIG[enemy.archetype] || ARCHETYPE_CONFIG.scout;

  // Clone enemy scene uniquely for this enemy instance
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(enemyScene);
    clone.scale.set(config.scale, config.scale, config.scale);
    clone.rotation.y = Math.PI;

    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });

    return clone;
  }, [enemyScene, config.scale]);

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

  const healthBarY = config.scale * 190 + 0.3;

  return (
    <group ref={groupRef}>
      {/* 3D Cloned Enemy Model */}
      <primitive object={clonedScene} />

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
