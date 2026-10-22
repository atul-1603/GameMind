import React from 'react';
import type { Projectile, SparkParticle } from '../game/combatSystem';

interface EffectsProps {
  projectiles: Projectile[];
  sparks: SparkParticle[];
}

export const Effects: React.FC<EffectsProps> = ({ projectiles, sparks }) => {
  return (
    <group>
      {/* Projectiles */}
      {projectiles.map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={p.color} />
          </mesh>
          <pointLight color={p.color} intensity={2} distance={3} />
        </group>
      ))}

      {/* Impact Sparks */}
      {sparks.map((s) => (
        <mesh key={s.id} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[s.size, s.size, s.size]} />
          <meshBasicMaterial color={s.color} transparent opacity={s.life / s.maxLife} />
        </mesh>
      ))}
    </group>
  );
};
