"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type ThreeSceneCanvasProps = {
  conceptLabel: string;
};

function MorphObject() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const ring = ringRef.current;
    if (!mesh || !ring) return;

    mesh.rotation.y += delta * 0.18;
    mesh.rotation.x += delta * 0.11;

    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, mouse.x * 0.25, 0.06);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, -mouse.y * 0.2, 0.06);

    const scalePulse = 1 + Math.sin(state.clock.elapsedTime * 0.7) * 0.03;
    mesh.scale.setScalar(scalePulse);

    ring.rotation.z += delta * 0.09;
  });

  return (
    <group>
      <Float speed={1.1} rotationIntensity={0.32} floatIntensity={0.55}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.1, 3]} />
          <meshStandardMaterial color="#fdfefe" roughness={0.36} metalness={0.08} />
        </mesh>
      </Float>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0.3, 0]}>
        <torusGeometry args={[1.7, 0.022, 14, 180]} />
        <meshStandardMaterial color="#9da5b2" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function ThreeSceneCanvas({ conceptLabel }: ThreeSceneCanvasProps) {
  return (
    <div className="media-integrated relative h-[360px] overflow-hidden rounded-card">
      <div className="absolute left-4 top-4 z-10 rounded-full bg-black/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#4c5360]">
        {conceptLabel}
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2.4, 2.4, 1.2]} intensity={0.62} color="#eef1f7" />
        <pointLight position={[-2.2, 0.8, 2]} intensity={0.45} color="#d8dde7" />
        <MorphObject />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_38%_8%,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_40%),radial-gradient(circle_at_50%_88%,rgba(188,196,210,0.24)_0%,rgba(188,196,210,0)_52%)]" />
    </div>
  );
}

