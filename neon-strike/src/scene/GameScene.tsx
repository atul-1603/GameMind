import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../game/gameStore';
import { MISSIONS } from '../game/arenaDefinitions';
import { Arena } from './Arena';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Effects } from './Effects';
import { GameHUD } from '../ui/GameHUD';
import { PauseMenu } from '../ui/PauseMenu';
import { MissionComplete } from '../ui/MissionComplete';
import { resolvePlayerCollisions, castRayAgainstObstacles } from '../game/collision';
import { soundEngine, type Projectile, type SparkParticle } from '../game/combatSystem';
import { createEnemyInstance, updateEnemy, type EnemyInstance } from '../ai/enemyController';
import { buildGridMapFromArena } from '../ai/navigation';

interface SceneContentProps {
  playerPos: [number, number, number];
  playerYaw: number;
  playerPitch: number;
  isMoving: boolean;
  isAiming: boolean;
  isShooting: boolean;
  projectiles: Projectile[];
  sparks: SparkParticle[];
  enemies: EnemyInstance[];
  currentMissionConfig: typeof MISSIONS[0];
  collectedPickups: Set<string>;
}

const SceneContent: React.FC<SceneContentProps> = ({
  playerPos,
  playerYaw,
  playerPitch,
  isMoving,
  isAiming,
  isShooting,
  projectiles,
  sparks,
  enemies,
  currentMissionConfig,
  collectedPickups,
}) => {
  const { camera } = useThree();

  useFrame(() => {
    // Over-the-shoulder camera positioning
    const cameraDist = isAiming ? 1.8 : 3.5;
    const cameraHeight = isAiming ? 1.6 : 1.9;
    const shoulderOffset = isAiming ? 0.35 : 0.6;

    const sinYaw = Math.sin(playerYaw);
    const cosYaw = Math.cos(playerYaw);
    const cosPitch = Math.cos(playerPitch);
    const sinPitch = Math.sin(playerPitch);

    const rightX = cosYaw * shoulderOffset;
    const rightZ = -sinYaw * shoulderOffset;

    const backX = sinYaw * cameraDist * cosPitch;
    const backZ = cosYaw * cameraDist * cosPitch;
    const backY = -sinPitch * cameraDist;

    const targetCamX = playerPos[0] + backX + rightX;
    const targetCamY = playerPos[1] + cameraHeight + backY;
    const targetCamZ = playerPos[2] + backZ + rightZ;

    camera.position.set(targetCamX, targetCamY, targetCamZ);

    const lookAheadDist = 20;
    const lookX = playerPos[0] - sinYaw * lookAheadDist * cosPitch + rightX * 0.5;
    const lookY = playerPos[1] + 1.4 + sinPitch * lookAheadDist;
    const lookZ = playerPos[2] - cosYaw * lookAheadDist * cosPitch + rightZ * 0.5;

    camera.lookAt(lookX, lookY, lookZ);
  });

  return (
    <>
      <ambientLight intensity={0.75} color="#ffffff" />
      <directionalLight
        position={[25, 45, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#fffdf5"
      />
      <directionalLight position={[-25, 25, -25]} intensity={0.5} color="#e2e8f0" />

      {/* Arena Environment with collected pickups filter */}
      <Arena mission={currentMissionConfig} collectedPickups={collectedPickups} />

      {/* 3D Player Character */}
      <Player
        position={playerPos}
        yaw={playerYaw}
        pitch={playerPitch}
        isMoving={isMoving}
        isAiming={isAiming}
        isShooting={isShooting}
      />

      {/* 3D Enemy Robots */}
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}

      {/* Plasma bolts & impact sparks */}
      <Effects projectiles={projectiles} sparks={sparks} />
    </>
  );
};

export const GameScene: React.FC = () => {
  const {
    currentMissionIndex,
    gameState,
    setGameState,
    playerAmmo,
    setPlayerAmmo,
    isReloading,
    setIsReloading,
    recordShot,
    recordKill,
    updatePlayerHealth,
    recordDamageReceived,
    updateTimeElapsed,
    settings,
    missionStats,
  } = useGameStore();

  const currentMission = MISSIONS.find((m) => m.id === currentMissionIndex) || MISSIONS[0];
  const navGrid = useMemo(() => buildGridMapFromArena(currentMission), [currentMission]);

  // Gameplay state
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([
    currentMission.playerSpawn.x,
    currentMission.playerSpawn.y,
    currentMission.playerSpawn.z,
  ]);
  const [playerVelY, setPlayerVelY] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [hitMarkerVisible, setHitMarkerVisible] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Active enemies in the arena
  const [enemies, setEnemies] = useState<EnemyInstance[]>(() =>
    currentMission.enemies.map((e) =>
      createEnemyInstance(e.id, e.type, e.position, e.patrolRoute)
    )
  );

  // Pickups collected in current run
  const [collectedPickups, setCollectedPickups] = useState<Set<string>>(new Set());

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);

  // Keys ref
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastFireTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);



  // Request pointer lock
  const requestPointerLock = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.requestPointerLock?.();
    }
  }, []);

  // Listen for pointer lock changes
  useEffect(() => {
    const handleLockChange = () => {
      const locked = document.pointerLockElement === containerRef.current;
      setIsPointerLocked(locked);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Exit pointer lock if mission completes or operative is defeated
  useEffect(() => {
    if (gameState === 'victory' || gameState === 'defeat') {
      document.exitPointerLock?.();
    }
  }, [gameState]);

  // Reload handler
  const startReload = useCallback(() => {
    setIsReloading(true);
    soundEngine.playReload(settings.soundVolume);
    setTimeout(() => {
      setPlayerAmmo(30);
      setIsReloading(false);
    }, 1200);
  }, [setIsReloading, setPlayerAmmo, settings.soundVolume]);

  // Plasma blaster fire mechanics
  const firePlasmaBlaster = useCallback(() => {
    const now = performance.now();
    if (now - lastFireTime.current < 160) return;
    if (isReloading) return;

    if (playerAmmo <= 0) {
      startReload();
      return;
    }

    lastFireTime.current = now;
    setPlayerAmmo(playerAmmo - 1);
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 80);

    soundEngine.playLaser(settings.soundVolume);

    const dirX = -Math.sin(yaw) * Math.cos(pitch);
    const dirY = Math.sin(pitch);
    const dirZ = -Math.cos(yaw) * Math.cos(pitch);

    const origin = {
      x: playerPos[0] + (isAiming ? 0.2 : 0.35) * Math.cos(yaw),
      y: playerPos[1] + 1.2,
      z: playerPos[2] - (isAiming ? 0.2 : 0.35) * Math.sin(yaw),
    };

    // 1. Raycast against physical obstacles
    const rayHit = castRayAgainstObstacles(origin, { x: dirX, y: dirY, z: dirZ }, 60, currentMission.obstacles);

    // 2. Raycast against living enemy robots
    let hitEnemy: EnemyInstance | null = null;
    let closestEnemyDist = rayHit.distance;

    for (const enemy of enemies) {
      if (enemy.health <= 0 || enemy.state === 'DEAD') continue;

      const toEnemyX = enemy.position.x - origin.x;
      const toEnemyY = enemy.position.y + 1.0 - origin.y;
      const toEnemyZ = enemy.position.z - origin.z;

      const projDist = toEnemyX * dirX + toEnemyY * dirY + toEnemyZ * dirZ;
      if (projDist > 0 && projDist < closestEnemyDist) {
        const perpX = toEnemyX - projDist * dirX;
        const perpY = toEnemyY - projDist * dirY;
        const perpZ = toEnemyZ - projDist * dirZ;
        const perpDist = Math.hypot(perpX, perpY, perpZ);

        if (perpDist <= 0.85) {
          closestEnemyDist = projDist;
          hitEnemy = enemy;
        }
      }
    }

    const hitDist = hitEnemy ? closestEnemyDist : rayHit.distance;
    const boltSpeed = 70;

    const newProj: Projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: dirX * boltSpeed,
      vy: dirY * boltSpeed,
      vz: dirZ * boltSpeed,
      life: hitDist / boltSpeed,
      maxLife: hitDist / boltSpeed,
      isEnemy: false,
      damage: 25,
      color: '#00f0ff',
    };

    setProjectiles((prev) => [...prev, newProj]);

    if (hitEnemy) {
      recordShot(true);
      const enemyTarget = hitEnemy;

      setTimeout(() => {
        soundEngine.playHitMarker(settings.soundVolume);
        setHitMarkerVisible(true);
        setTimeout(() => setHitMarkerVisible(false), 100);

        setEnemies((prev) =>
          prev.map((e) => {
            if (e.id === enemyTarget.id) {
              const newHp = Math.max(0, e.health - 25);
              if (newHp <= 0 && e.state !== 'DEAD') {
                recordKill();
                soundEngine.playImpact(settings.soundVolume);
              }
              return {
                ...e,
                health: newHp,
                state: newHp <= 0 ? 'DEAD' : e.state,
              };
            }
            return e;
          })
        );

        const hitPoint = {
          x: origin.x + dirX * hitDist,
          y: origin.y + dirY * hitDist,
          z: origin.z + dirZ * hitDist,
        };

        const enemySparks: SparkParticle[] = [];
        for (let i = 0; i < 8; i++) {
          enemySparks.push({
            id: `spark_enemy_${Date.now()}_${i}`,
            x: hitPoint.x,
            y: hitPoint.y,
            z: hitPoint.z,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 6,
            vz: (Math.random() - 0.5) * 8,
            life: 0.3,
            maxLife: 0.3,
            color: '#ff2a4b',
            size: 0.1,
          });
        }
        setSparks((prev) => [...prev, ...enemySparks]);
      }, (hitDist / boltSpeed) * 1000);
    } else {
      recordShot(false);

      if (rayHit.hit) {
        setTimeout(() => {
          soundEngine.playImpact(settings.soundVolume);

          const newSparks: SparkParticle[] = [];
          for (let i = 0; i < 6; i++) {
            newSparks.push({
              id: `spark_${Date.now()}_${i}`,
              x: rayHit.point.x,
              y: rayHit.point.y,
              z: rayHit.point.z,
              vx: (Math.random() - 0.5) * 6 + rayHit.normal.x * 2,
              vy: Math.random() * 5 + rayHit.normal.y * 2,
              vz: (Math.random() - 0.5) * 6 + rayHit.normal.z * 2,
              life: 0.25,
              maxLife: 0.25,
              color: '#00f0ff',
              size: 0.08,
            });
          }
          setSparks((prev) => [...prev, ...newSparks]);
        }, (rayHit.distance / boltSpeed) * 1000);
      }
    }
  }, [
    enemies,
    isAiming,
    isReloading,
    pitch,
    playerAmmo,
    playerPos,
    recordKill,
    recordShot,
    setPlayerAmmo,
    settings.soundVolume,
    startReload,
    yaw,
    currentMission.obstacles,
  ]);

  // Keyboard and mouse event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
          document.exitPointerLock?.();
        } else if (gameState === 'paused') {
          setGameState('playing');
          requestPointerLock();
        }
      }

      if (e.code === 'KeyR' && !isReloading && playerAmmo < 30) {
        startReload();
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        useGameStore.getState().toggleDiagnostics();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== containerRef.current || gameState !== 'playing') {
        return;
      }

      const sens = 0.0022 * settings.mouseSensitivity;
      setYaw((prev) => prev - e.movementX * sens);
      setPitch((prev) => Math.max(-0.6, Math.min(0.6, prev - e.movementY * sens)));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== containerRef.current || gameState !== 'playing') {
        return;
      }
      if (e.button === 0) {
        firePlasmaBlaster();
      } else if (e.button === 2) {
        setIsAiming(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsAiming(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    gameState,
    isReloading,
    playerAmmo,
    settings.mouseSensitivity,
    requestPointerLock,
    setGameState,
    startReload,
    firePlasmaBlaster,
  ]);

  // Main 60 FPS physics loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const arenaHalfW = (currentMission.gridWidth * currentMission.cellSize) / 2;
    const arenaHalfH = (currentMission.gridHeight * currentMission.cellSize) / 2;
    const arenaBounds = {
      minX: -arenaHalfW,
      maxX: arenaHalfW,
      minZ: -arenaHalfH,
      maxZ: arenaHalfH,
    };

    const updatePhysics = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (gameState === 'playing' && isPointerLocked) {
        updateTimeElapsed(dt);

        // 1. Player Locomotion
        const keys = keysPressed.current;
        let moveX = 0;
        let moveZ = 0;

        if (keys['KeyW']) moveZ -= 1;
        if (keys['KeyS']) moveZ += 1;
        if (keys['KeyA']) moveX -= 1;
        if (keys['KeyD']) moveX += 1;

        const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
        const baseSpeed = isSprinting ? 9.0 : 5.5;
        const currentSpeed = isAiming ? baseSpeed * 0.55 : baseSpeed;

        const len = Math.hypot(moveX, moveZ);
        const moving = len > 0;
        setIsMoving(moving);

        let newX = playerPos[0];
        let newZ = playerPos[2];

        if (moving) {
          const normX = moveX / len;
          const normZ = moveZ / len;

          const worldMoveX = (normX * Math.cos(yaw) - normZ * Math.sin(yaw)) * currentSpeed * dt;
          const worldMoveZ = (normX * Math.sin(yaw) + normZ * Math.cos(yaw)) * currentSpeed * dt;

          const resolved = resolvePlayerCollisions(
            playerPos[0],
            playerPos[2],
            playerPos[0] + worldMoveX,
            playerPos[2] + worldMoveZ,
            0.45,
            arenaBounds,
            currentMission.obstacles
          );

          newX = resolved.x;
          newZ = resolved.z;
        }

        // Jump & vertical gravity physics
        let newVelY = playerVelY;
        let newY = playerPos[1];

        if (keys['Space'] && newY <= 1.01) {
          newVelY = 7.5;
        }

        newVelY -= 20 * dt;
        newY += newVelY * dt;

        if (newY < 1.0) {
          newY = 1.0;
          newVelY = 0;
        }

        setPlayerPos([newX, newY, newZ]);
        setPlayerVelY(newVelY);

        // 2. Interactive Pickup Consumption
        for (const pickup of currentMission.pickups) {
          if (!collectedPickups.has(pickup.id)) {
            const distToPickup = Math.hypot(newX - pickup.x, newZ - pickup.z);
            if (distToPickup <= 1.3) {
              setCollectedPickups((prev) => new Set(prev).add(pickup.id));
              soundEngine.playHitMarker(settings.soundVolume);

              if (pickup.type === 'health') {
                updatePlayerHealth(pickup.amount);
              } else if (pickup.type === 'ammo') {
                setPlayerAmmo(Math.min(30, playerAmmo + pickup.amount));
              }
            }
          }
        }

        // 3. Check Extraction Zone Victory
        if (missionStats.extractionActive) {
          const distToExtraction = Math.hypot(
            newX - currentMission.extractionZone.x,
            newZ - currentMission.extractionZone.z
          );
          if (distToExtraction <= currentMission.extractionZone.radius) {
            setGameState('victory');
          }
        }

        // 4. Update Enemy AI Agents
        const newSpawnedBolts: Projectile[] = [];

        setEnemies((prevEnemies) =>
          prevEnemies.map((enemy) => {
            if (enemy.health <= 0 || enemy.state === 'DEAD') return enemy;

            const updateRes = updateEnemy(
              enemy,
              dt,
              { x: newX, y: newY, z: newZ },
              navGrid,
              currentMission.obstacles,
              currentMission.coverSpots,
              settings.activeAlgorithm,
              arenaBounds
            );

            if (updateRes.spawnedProjectiles.length > 0) {
              newSpawnedBolts.push(...updateRes.spawnedProjectiles);
              soundEngine.playLaser(settings.soundVolume * 0.7);
            }

            return enemy;
          })
        );

        // 5. Update Projectiles & Check Collisions with Player
        setProjectiles((prev) => {
          const combined = [...prev, ...newSpawnedBolts];
          const surviving: Projectile[] = [];

          for (const p of combined) {
            const nextX = p.x + p.vx * dt;
            const nextY = p.y + p.vy * dt;
            const nextZ = p.z + p.vz * dt;
            const nextLife = p.life - dt;

            // Check if enemy projectile hits the player
            if (p.isEnemy) {
              const distToPlayer = Math.hypot(nextX - newX, nextZ - newZ);
              if (distToPlayer <= 0.75 && nextY >= newY && nextY <= newY + 2.0) {
                updatePlayerHealth(-p.damage);
                recordDamageReceived(p.damage);
                soundEngine.playPlayerHurt(settings.soundVolume);

                setSparks((s) => [
                  ...s,
                  {
                    id: `spark_player_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    x: nextX,
                    y: nextY,
                    z: nextZ,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 4,
                    vz: (Math.random() - 0.5) * 4,
                    life: 0.25,
                    maxLife: 0.25,
                    color: '#ff2a4b',
                    size: 0.09,
                  },
                ]);
                continue;
              }
            }

            if (nextLife > 0) {
              surviving.push({
                ...p,
                x: nextX,
                y: nextY,
                z: nextZ,
                life: nextLife,
              });
            }
          }

          return surviving;
        });

        // 6. Update impact sparks
        setSparks((prev) =>
          prev
            .map((s) => ({
              ...s,
              x: s.x + s.vx * dt,
              y: s.y + s.vy * dt - 9.8 * dt * dt,
              z: s.z + s.vz * dt,
              life: s.life - dt,
            }))
            .filter((s) => s.life > 0)
        );
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    yaw,
    pitch,
    isAiming,
    playerPos,
    playerVelY,
    currentMission,
    navGrid,
    settings.activeAlgorithm,
    settings.soundVolume,
    missionStats.extractionActive,
    updatePlayerHealth,
    recordDamageReceived,
    updateTimeElapsed,
    setGameState,
    collectedPickups,
    playerAmmo,
    setPlayerAmmo,
    isPointerLocked,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <SceneContent
          playerPos={playerPos}
          playerYaw={yaw}
          playerPitch={pitch}
          isMoving={isMoving}
          isAiming={isAiming}
          isShooting={isShooting}
          projectiles={projectiles}
          sparks={sparks}
          enemies={enemies}
          currentMissionConfig={currentMission}
          collectedPickups={collectedPickups}
        />
      </Canvas>

      {/* Cyber Combat HUD */}
      <GameHUD
        isPointerLocked={isPointerLocked}
        onRequestPointerLock={requestPointerLock}
        isAiming={isAiming}
        isShooting={isShooting}
        hitMarkerVisible={hitMarkerVisible}
      />

      {/* Tactical Pause Menu Overlay */}
      {gameState === 'paused' && (
        <PauseMenu
          onResume={() => {
            setGameState('playing');
            requestPointerLock();
          }}
        />
      )}

      {/* Mission Victory / Defeat Modal */}
      {(gameState === 'victory' || gameState === 'defeat') && <MissionComplete />}
    </div>
  );
};
