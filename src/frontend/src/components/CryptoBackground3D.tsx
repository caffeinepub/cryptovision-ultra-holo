import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

// Floating 3D coin mesh
function FloatingCoin({
  position,
  color,
  speed,
  rotSpeed,
  floatOffset,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  rotSpeed: number;
  floatOffset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y += rotSpeed;
    meshRef.current.rotation.x += rotSpeed * 0.3;
    meshRef.current.position.y =
      initialY + Math.sin(t * speed + floatOffset) * 0.4;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.75}
        wireframe={false}
      />
    </mesh>
  );
}

// Particle field
function ParticleField() {
  const count = 500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00e5ff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// Coin data for the scene
const COINS = [
  {
    position: [-4, 1.5, -3] as [number, number, number],
    color: "#F7931A",
    speed: 0.8,
    rotSpeed: 0.008,
    floatOffset: 0,
  },
  {
    position: [4, -1, -4] as [number, number, number],
    color: "#627EEA",
    speed: 0.6,
    rotSpeed: 0.006,
    floatOffset: 1.2,
  },
  {
    position: [-3, -2, -5] as [number, number, number],
    color: "#9945FF",
    speed: 1.0,
    rotSpeed: 0.01,
    floatOffset: 2.4,
  },
  {
    position: [5, 2, -6] as [number, number, number],
    color: "#F3BA2F",
    speed: 0.7,
    rotSpeed: 0.007,
    floatOffset: 0.8,
  },
  {
    position: [0, 3, -7] as [number, number, number],
    color: "#00e5ff",
    speed: 0.9,
    rotSpeed: 0.009,
    floatOffset: 3.5,
  },
  {
    position: [-5, 0, -6] as [number, number, number],
    color: "#C2A633",
    speed: 0.5,
    rotSpeed: 0.005,
    floatOffset: 1.8,
  },
  {
    position: [3, -3, -5] as [number, number, number],
    color: "#346AA9",
    speed: 0.75,
    rotSpeed: 0.008,
    floatOffset: 2.9,
  },
  {
    position: [-2, 2.5, -8] as [number, number, number],
    color: "#8247E5",
    speed: 0.85,
    rotSpeed: 0.007,
    floatOffset: 0.4,
  },
];

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} color="#001833" />
      <pointLight
        position={[0, 0, 2]}
        intensity={1.2}
        color="#00e5ff"
        distance={12}
      />
      <pointLight
        position={[-6, 3, 1]}
        intensity={0.8}
        color="#a855f7"
        distance={10}
      />
      <pointLight
        position={[6, -3, 1]}
        intensity={0.6}
        color="#00e5ff"
        distance={8}
      />
      <ParticleField />
      {COINS.map((coin) => (
        <FloatingCoin
          key={`${coin.color}-${coin.floatOffset}`}
          position={coin.position}
          color={coin.color}
          speed={coin.speed}
          rotSpeed={coin.rotSpeed}
          floatOffset={coin.floatOffset}
        />
      ))}
    </>
  );
}

export default function CryptoBackground3D() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
