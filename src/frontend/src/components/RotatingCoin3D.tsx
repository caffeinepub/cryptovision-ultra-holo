import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

function CoinMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 1.2;
    meshRef.current.rotation.x =
      Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[1, 1, 0.18, 48]} />
      <meshStandardMaterial
        color="#F7931A"
        emissive="#F7931A"
        emissiveIntensity={0.35}
        metalness={0.95}
        roughness={0.05}
      />
    </mesh>
  );
}

export default function RotatingCoin3D({ size = 150 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.2, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} color="#ffffff" />
        <pointLight position={[3, 3, 3]} intensity={2} color="#F7931A" />
        <pointLight position={[-3, -1, 2]} intensity={1} color="#00e5ff" />
        <pointLight position={[0, -3, 1]} intensity={0.8} color="#a855f7" />
        <CoinMesh />
      </Canvas>
    </div>
  );
}
