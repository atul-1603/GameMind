import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface PlayerProps {
  position: [number, number, number];
  yaw: number;
  pitch: number;
  isMoving: boolean;
  isAiming: boolean;
  isShooting: boolean;
}

// Pre-load GLB assets
useGLTF.preload('/models/warrior.glb');
useGLTF.preload('/models/ak47.glb');

export const Player: React.FC<PlayerProps> = ({
  position,
  yaw,
  isMoving,
  isAiming,
  isShooting,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const weaponGroupRef = useRef<THREE.Group>(null);

  const { scene: warriorScene } = useGLTF('/models/warrior.glb');
  const { scene: ak47Scene } = useGLTF('/models/ak47.glb');

  // Clone models safely using SkeletonUtils
  const warriorClone = useMemo(() => {
    const clone = SkeletonUtils.clone(warriorScene);
    // Warrior height in GLB is 1.0 unit -> scale to 1.8m tall
    clone.scale.set(1.8, 1.8, 1.8);
    // Orient model to face forward
    clone.rotation.y = Math.PI;
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });
    return clone;
  }, [warriorScene]);

  const ak47Clone = useMemo(() => {
    const clone = SkeletonUtils.clone(ak47Scene);
    // AK-47 is ~938 units in GLB -> scale to ~1.0m length
    clone.scale.set(0.0012, 0.0012, 0.0012);
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });
    return clone;
  }, [ak47Scene]);

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
      {/* 3D Warrior Fighter Model */}
      <primitive object={warriorClone} />

      {/* AK47 Weapon in hands */}
      <group ref={weaponGroupRef} position={[0.28, 0.95, -0.4]}>
        <primitive object={ak47Clone} />
        {isShooting && (
          <pointLight color="#ffbb33" intensity={8} distance={5} position={[0, 0, -0.6]} />
        )}
      </group>
    </group>
  );
};
