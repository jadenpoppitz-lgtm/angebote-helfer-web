import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { generatePCBLayout } from "@/components/pcb/generatePCBLayout";
import type { PCBChip, PCBLayout, PCBTracePath, PCBVia } from "@/components/pcb/generatePCBLayout";
import {
  waterfallPcbFragmentShader,
  waterfallPcbVertexShader,
} from "@/components/shaders/waterfallPcbParticles";

interface WaterfallPCBSceneProps {
  progress: number;
}

const traceVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const traceFragmentShader = `
  precision highp float;

  uniform float uReveal;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHotColor;

  varying vec2 vUv;

  void main() {
    if (vUv.x > uReveal) discard;

    float head = smoothstep(uReveal - 0.09, uReveal, vUv.x);
    float pulse = pow(0.5 + 0.5 * sin((vUv.x * 9.0 - uTime * 0.85) * 6.2831853), 18.0);
    float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    vec3 color = mix(uColor, uHotColor, clamp(pulse + head * 0.25, 0.0, 1.0));
    float alpha = uOpacity * edge * (0.58 + head * 0.36 + pulse * 0.54);

    gl_FragColor = vec4(color * (1.15 + pulse * 1.85), alpha);
  }
`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function useResponsiveParticleCount() {
  const [count, setCount] = useState(36000);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 640) {
        setCount(14000);
      } else if (width < 1024) {
        setCount(30000);
      } else {
        setCount(56000);
      }
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return { count, isMobile };
}

function WaterfallParticles({ layout, progress }: { layout: PCBLayout; progress: number }) {
  const smoothedProgress = useRef(progress);
  const geometry = useMemo(() => {
    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(layout.particles.waterfallStart, 3));
    nextGeometry.setAttribute("aWaterfallStart", new THREE.BufferAttribute(layout.particles.waterfallStart, 3));
    nextGeometry.setAttribute("aPcbTarget", new THREE.BufferAttribute(layout.particles.pcbTarget, 3));
    nextGeometry.setAttribute("aSeed", new THREE.BufferAttribute(layout.particles.seed, 1));
    nextGeometry.setAttribute("aDelay", new THREE.BufferAttribute(layout.particles.delay, 1));
    nextGeometry.setAttribute("aKind", new THREE.BufferAttribute(layout.particles.kind, 1));
    nextGeometry.computeBoundingSphere();
    return nextGeometry;
  }, [layout]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: 1 },
        },
        vertexShader: waterfallPcbVertexShader,
        fragmentShader: waterfallPcbFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, progress, 0.09);
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uProgress.value = smoothedProgress.current;
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.8);
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

function BoardPlane({ layout, progress }: { layout: PCBLayout; progress: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const boardReveal = smoothstep(0.5, 0.82, progress);

    if (materialRef.current) {
      materialRef.current.opacity = boardReveal * 0.92;
      materialRef.current.emissiveIntensity = boardReveal * 0.16;
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity = boardReveal * 0.14;
    }
  });

  return (
    <group position={[0, 0, -0.08]}>
      <mesh>
        <boxGeometry args={[layout.boardSize[0], layout.boardSize[1], 0.08]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#07371f"
          emissive="#0e5a2d"
          metalness={0.18}
          roughness={0.86}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[layout.boardSize[0] * 0.94, layout.boardSize[1] * 0.93]} />
        <meshBasicMaterial ref={glowMaterialRef} color="#2ec967" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function pathToCurve(trace: PCBTracePath) {
  const curve = new THREE.CurvePath<THREE.Vector3>();

  for (let index = 1; index < trace.points.length; index += 1) {
    const start = trace.points[index - 1];
    const end = trace.points[index];
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(start[0], start[1], start[2]),
        new THREE.Vector3(end[0], end[1], end[2]),
      ),
    );
  }

  return curve;
}

function RevealTrace({ trace, progress }: { trace: PCBTracePath; progress: number }) {
  const geometry = useMemo(() => {
    const curve = pathToCurve(trace);
    return new THREE.TubeGeometry(curve, Math.max(48, trace.points.length * 28), trace.radius, 8, false);
  }, [trace]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uReveal: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#3fe07a") },
          uHotColor: { value: new THREE.Color("#c7ff88") },
        },
        vertexShader: traceVertexShader,
        fragmentShader: traceFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const reveal = smoothstep(trace.delay, trace.delay + 0.3, progress);
    material.uniforms.uReveal.value = reveal;
      material.uniforms.uOpacity.value = smoothstep(trace.delay - 0.04, trace.delay + 0.18, progress) * 0.76;
    material.uniforms.uTime.value = clock.elapsedTime + trace.delay * 3.7;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

function AnimatedVia({ via, progress }: { via: PCBVia; progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#b7ff91",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const reveal = smoothstep(via.delay, via.delay + 0.22, progress);
    const pulse = 0.72 + Math.sin(clock.elapsedTime * 2.8 + via.position[0] * 1.7) * 0.18;
    material.opacity = reveal * pulse;

    if (meshRef.current) {
      const scale = 0.72 + reveal * 0.28;
      meshRef.current.scale.setScalar(scale);
    }
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh ref={meshRef} position={via.position} material={material}>
      <torusGeometry args={[via.radius, 0.012, 8, 34]} />
    </mesh>
  );
}

function AnimatedChip({ chip, progress }: { chip: PCBChip; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const chipMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#06170f",
        emissive: "#0d3f22",
        metalness: 0.35,
        roughness: 0.74,
        transparent: true,
        opacity: 0,
      }),
    [],
  );
  const pinMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#b7ff91",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const reveal = smoothstep(chip.delay, chip.delay + 0.22, progress);
    chipMaterial.opacity = reveal * 0.96;
    chipMaterial.emissiveIntensity = reveal * 0.22;
    pinMaterial.opacity = reveal * (0.62 + Math.sin(clock.elapsedTime * 3.2 + chip.position[0]) * 0.12);

    if (groupRef.current) {
      groupRef.current.position.z = chip.position[2] + reveal * 0.07;
      groupRef.current.scale.setScalar(0.94 + reveal * 0.06);
    }
  });

  useEffect(
    () => () => {
      chipMaterial.dispose();
      pinMaterial.dispose();
    },
    [chipMaterial, pinMaterial],
  );

  return (
    <group ref={groupRef} position={chip.position}>
      <mesh material={chipMaterial}>
        <boxGeometry args={[chip.size[0], chip.size[1], 0.1]} />
      </mesh>
      {chip.pins.map((pin, index) => (
        <mesh
          key={`${chip.id}-pin-${index}`}
          material={pinMaterial}
          position={[pin[0] - chip.position[0], pin[1] - chip.position[1], pin[2] - chip.position[2]]}
        >
          <boxGeometry args={[0.05, 0.034, 0.025]} />
        </mesh>
      ))}
    </group>
  );
}

function CircuitBoard({ layout, progress }: { layout: PCBLayout; progress: number }) {
  return (
    <group>
      <BoardPlane layout={layout} progress={progress} />
      {layout.traces.map((trace) => (
        <RevealTrace key={trace.id} trace={trace} progress={progress} />
      ))}
      {layout.vias.map((via) => (
        <AnimatedVia key={via.id} via={via} progress={progress} />
      ))}
      {layout.chips.map((chip) => (
        <AnimatedChip key={chip.id} chip={chip} progress={progress} />
      ))}
    </group>
  );
}

function WaterColumn({ progress }: { progress: number }) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const fade = 1 - smoothstep(0.28, 0.62, progress);

    if (materialRef.current) {
      materialRef.current.opacity = fade * (0.018 + Math.sin(clock.elapsedTime * 2.6) * 0.006);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.32) * 0.08;
      meshRef.current.scale.x = 0.86 + Math.sin(clock.elapsedTime * 1.1) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.06, -0.24]}>
      <cylinderGeometry args={[0.11, 0.18, 6.4, 32, 1, true]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#d9fff0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RockWalls({ progress }: { progress: number }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#06120a",
        emissive: "#173b1f",
        metalness: 0.18,
        roughness: 0.42,
        transparent: true,
        opacity: 0.26,
      }),
    [],
  );
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(1, 1), []);
  const rocks = useMemo(() => {
    const values: Array<{ position: [number, number, number]; scale: [number, number, number]; rotation: [number, number, number] }> =
      [];

    for (let index = 0; index < 18; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);
      const y = 2.8 - row * 0.72;
      const x = side * (2.75 + (row % 3) * 0.24);
      values.push({
        position: [x, y, -0.2 + (row % 4) * 0.08],
        scale: [0.38 + (row % 4) * 0.08, 0.62 + (row % 3) * 0.13, 0.34],
        rotation: [row * 0.23, side * 0.55, row * 0.37],
      });
    }

    return values;
  }, []);

  useFrame(() => {
    material.opacity = (1 - smoothstep(0.36, 0.72, progress)) * 0.28;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <group>
      {rocks.map((rock, index) => (
        <mesh
          key={`rock-${index}`}
          geometry={geometry}
          material={material}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
        />
      ))}
    </group>
  );
}

function SceneContents({ progress, layout }: { progress: number; layout: PCBLayout }) {
  const smoothedProgress = useRef(progress);

  useFrame(({ camera }) => {
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, progress, 0.065);
    const p = smoothedProgress.current;
    camera.position.x = THREE.MathUtils.lerp(-0.18, 0.28, p);
    camera.position.y = THREE.MathUtils.lerp(0.12, -0.04, p);
    camera.position.z = THREE.MathUtils.lerp(7.9, 6.85, p);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.54} />
      <directionalLight position={[-2.8, 3.4, 4.2]} intensity={1.05} color="#d8ffe1" />
      <pointLight position={[0, -2.6, 2.8]} intensity={1.25} color="#a8ffd7" distance={7.2} />
      <pointLight position={[2.8, 2.2, 2.6]} intensity={0.75} color="#54e87d" distance={6} />
      <RockWalls progress={progress} />
      <WaterColumn progress={progress} />
      <CircuitBoard layout={layout} progress={progress} />
      <WaterfallParticles layout={layout} progress={progress} />
    </>
  );
}

export function WaterfallPCBScene({ progress }: WaterfallPCBSceneProps) {
  const { count, isMobile } = useResponsiveParticleCount();
  const layout = useMemo(() => generatePCBLayout(count), [count]);

  return (
    <Canvas
      className="h-full w-full"
      style={{ pointerEvents: "none" }}
      dpr={[1, isMobile ? 1.25 : 1.8]}
      camera={{ position: [0, 0.12, 7.9], fov: 44, near: 0.1, far: 40 }}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => gl.setClearColor("#000000", 0)}
    >
      <fog attach="fog" args={["#08200f", 7.6, 13]} />
      <SceneContents progress={progress} layout={layout} />
      {!isMobile ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.42} luminanceThreshold={0.18} luminanceSmoothing={0.34} mipmapBlur />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
