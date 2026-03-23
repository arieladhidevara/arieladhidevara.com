"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshStandardMaterial, Box3, Vector3, Mesh, PerspectiveCamera } from "three";

function AutoCamera({ size }: { size: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.position.set(0, 0, size * 2.2);
    cam.near = size * 0.001;
    cam.far = size * 100;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

const defaultMaterial = new MeshStandardMaterial({
  color: "#c8cdd6",
  roughness: 0.6,
  metalness: 0.2,
});

function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);

  const box = new Box3().setFromObject(obj);
  const size = new Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  obj.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = defaultMaterial;
    }
  });

  return (
    <>
      <AutoCamera size={maxDim} />
      <Center>
        <primitive object={obj} />
      </Center>
    </>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="flex h-full w-full min-h-[320px] items-center justify-center">
      <p className="text-sm text-white/40 tracking-widest uppercase">Loading model…</p>
    </div>
  );
}

type Props = { url: string };

export function ObjModelViewer({ url }: Props) {
  return (
    <div className="w-full h-full min-h-[320px]">
      <Suspense fallback={<LoadingPlaceholder />}>
        <Canvas
          gl={{ antialias: true }}
          camera={{ fov: 45 }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={2.0} />
          <directionalLight position={[-6, 4, -4]} intensity={0.8} />
          <directionalLight position={[0, -6, 3]} intensity={0.4} color="#a8b8d0" />
          <pointLight position={[3, 3, 3]} intensity={1.0} color="#ffffff" />
          <Suspense fallback={null}>
            <ObjModel url={url} />
          </Suspense>
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            autoRotate
            autoRotateSpeed={1.2}
            minDistance={0}
            maxDistance={Infinity}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
