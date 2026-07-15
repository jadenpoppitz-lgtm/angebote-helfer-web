import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { DemoDeviceKind } from "@/data/demoDayDevices";

type DeviceAsset = {
  path: string;
  source: string;
  creator: string;
  license: "CC0" | "CC BY 3.0";
  rotation: [number, number, number];
  targetSize?: number;
  yawAmplitude?: number;
  watchDisplay?: boolean;
  materialTint?: string;
  phase: number;
};

const deviceAssets: Record<DemoDeviceKind, DeviceAsset> = {
  phone: {
    path: "/models/demo-day/smartphone.glb",
    source: "https://poly.pizza/m/k2kgBepoMU",
    creator: "Quaternius",
    license: "CC0",
    rotation: [-0.35, 0.55, -0.08],
    targetSize: 2.15,
    yawAmplitude: 0.08,
    phase: 0.2,
  },
  laptop: {
    path: "/models/demo-day/laptop.glb",
    source: "https://poly.pizza/m/GnbwSUiVty",
    creator: "Kenney",
    license: "CC0",
    rotation: [-0.12, -0.45, 0],
    phase: 0.8,
  },
  tablet: {
    path: "/models/demo-day/tablet.glb",
    source: "https://poly.pizza/m/2LxocCCiDy-",
    creator: "Poly by Google",
    license: "CC BY 3.0",
    rotation: [0.65, 0, -0.55],
    targetSize: 2.3,
    yawAmplitude: 0.08,
    phase: 1.3,
  },
  watch: {
    path: "/models/demo-day/smartwatch.glb",
    source: "https://poly.pizza/m/6908NHM0OcR",
    creator: "Poly by Google",
    license: "CC BY 3.0",
    rotation: [-0.35, 0.55, 0.08],
    targetSize: 2.3,
    yawAmplitude: 0.08,
    watchDisplay: true,
    materialTint: "#25483d",
    phase: 1.9,
  },
  console: {
    path: "/models/demo-day/console.glb",
    source: "https://poly.pizza/m/600PeFCBopv",
    creator: "Jasmine Roberts",
    license: "CC BY 3.0",
    rotation: [-0.35, 0.55, -0.04],
    targetSize: 2.35,
    yawAmplitude: 0.08,
    phase: 2.4,
  },
  headphones: {
    path: "/models/demo-day/headphones.glb",
    source: "https://poly.pizza/m/PSsWSIAYIL",
    creator: "CreativeTrio",
    license: "CC0",
    rotation: [-0.15, -0.5, 0],
    phase: 2.9,
  },
  network: {
    path: "/models/demo-day/router.glb",
    source: "https://poly.pizza/m/OJffxxkMtZ",
    creator: "Kenney",
    license: "CC0",
    rotation: [-0.18, -0.6, 0],
    targetSize: 2.25,
    phase: 3.4,
  },
  desktop: {
    path: "/models/demo-day/desktop-micro.glb",
    source: "https://poly.pizza/m/3mANYC9YrZf",
    creator: "Gav Grant (Shaddam)",
    license: "CC BY 3.0",
    rotation: [-0.14, -0.52, 0],
    phase: 4,
  },
};

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
};

function AnimatedDevice({ asset, reducedMotion }: { asset: DeviceAsset; reducedMotion: boolean }) {
  const model = useGLTF(asset.path);
  const rootRef = useRef<Group>(null);
  const normalizedModel = useMemo(() => {
    const scene = model.scene.clone(true);

    if (asset.materialTint) {
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const tintedMaterials = materials.map((material) => {
          const tintedMaterial = material.clone();
          if ("color" in tintedMaterial && tintedMaterial.color instanceof THREE.Color) {
            tintedMaterial.color.set(asset.materialTint);
          }
          return tintedMaterial;
        });
        child.material = Array.isArray(child.material) ? tintedMaterials : tintedMaterials[0];
      });
    }

    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    return {
      scene,
      center: [-center.x, -center.y, -center.z] as [number, number, number],
      scale: (asset.targetSize ?? 2.05) / largestDimension,
    };
  }, [asset.materialTint, asset.targetSize, model.scene]);

  useFrame(({ clock }) => {
    if (!rootRef.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    rootRef.current.rotation.x = asset.rotation[0] + Math.sin(time * 0.36 + asset.phase) * 0.035;
    rootRef.current.rotation.y =
      asset.rotation[1] + Math.sin(time * 0.46 + asset.phase) * (asset.yawAmplitude ?? 0.28);
    rootRef.current.position.y = Math.sin(time * 0.72 + asset.phase) * 0.025;
  });

  return (
    <group ref={rootRef} rotation={asset.rotation}>
      <group scale={normalizedModel.scale}>
        <group position={normalizedModel.center}>
          <primitive object={normalizedModel.scene} />
        </group>
      </group>
      {asset.watchDisplay ? (
        <group position={[0, 0, 0.12]}>
          <RoundedBox args={[0.52, 0.6, 0.12]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#17372e" roughness={0.42} metalness={0.22} />
          </RoundedBox>
          <RoundedBox args={[0.4, 0.47, 0.022]} radius={0.05} smoothness={3} position={[0, 0, 0.068]}>
            <meshStandardMaterial color="#75dfad" emissive="#1d7d58" emissiveIntensity={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.04, 0.083]}>
            <ringGeometry args={[0.08, 0.105, 24]} />
            <meshBasicMaterial color="#f7faf6" />
          </mesh>
          <mesh position={[0, -0.12, 0.083]}>
            <planeGeometry args={[0.21, 0.026]} />
            <meshBasicMaterial color="#f7faf6" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

export default function DemoDayDeviceModel({ kind }: { kind: DemoDeviceKind }) {
  const asset = deviceAssets[kind];
  const reducedMotion = useReducedMotion();

  return (
    <>
      <div className="demo-day-device-canvas-layer" aria-hidden="true">
        <Canvas
          camera={{ position: [3.2, 2.35, 4.2], fov: 34, near: 0.01, far: 100 }}
          dpr={[1, 1.35]}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{ alpha: false, antialias: true, powerPreference: "low-power" }}
          onCreated={({ gl }) => gl.setClearColor("#f7faf6", 1)}
        >
          <ambientLight intensity={1.6} />
          <hemisphereLight args={["#ffffff", "#b9cbc1", 1.35]} />
          <directionalLight position={[4, 5, 5]} intensity={2.2} />
          <directionalLight position={[-3, 1, -2]} color="#9fd8bd" intensity={0.8} />
          <Suspense fallback={null}>
            <AnimatedDevice asset={asset} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </div>
      <a
        className="demo-day-device-model-credit"
        href={asset.source}
        target="_blank"
        rel="noreferrer"
        aria-label={`3D model by ${asset.creator}, ${asset.license}`}
      >
        3D: {asset.creator} · {asset.license}
      </a>
    </>
  );
}
