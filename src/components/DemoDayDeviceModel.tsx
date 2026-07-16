import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Group, MeshStandardMaterial } from "three";
import type { DemoDeviceKind } from "@/data/demoDayDevices";

const COLORS = {
  accent: "#2bc487",
  accentDark: "#156b4c",
  aluminum: "#aeb9b3",
  black: "#0c1512",
  copper: "#bd7449",
  graphite: "#26322e",
  glass: "#07110e",
  gold: "#d5b365",
  light: "#e8eee9",
  rubber: "#111916",
  screen: "#0b211a",
  white: "#f4f7f3",
};

const devicePresentation: Record<
  DemoDeviceKind,
  {
    rotation: [number, number, number];
    scale: number;
    positionY: number;
    phase: number;
    yaw: number;
  }
> = {
  phone: { rotation: [-0.14, 0.48, 0.05], scale: 1.25, positionY: 0.24, phase: 0.2, yaw: 0.07 },
  laptop: { rotation: [0.04, 0.34, 0], scale: 0.98, positionY: -0.2, phase: 0.8, yaw: 0.045 },
  tablet: { rotation: [-0.2, 0.4, -0.04], scale: 0.94, positionY: 0, phase: 1.3, yaw: 0.05 },
  watch: { rotation: [-0.12, 0.35, 0.05], scale: 0.9, positionY: 0, phase: 1.9, yaw: 0.05 },
  console: { rotation: [-0.15, 0.33, 0.02], scale: 0.9, positionY: 0, phase: 2.4, yaw: 0.045 },
  headphones: { rotation: [-0.04, 0.28, 0], scale: 1, positionY: -0.05, phase: 2.9, yaw: 0.055 },
  network: { rotation: [-0.06, 0.34, 0], scale: 0.97, positionY: -0.28, phase: 3.4, yaw: 0.045 },
  desktop: { rotation: [-0.08, 0.38, 0], scale: 0.95, positionY: 0, phase: 4, yaw: 0.045 },
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

const useRenderProfile = () => {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const compactScreen = window.matchMedia("(max-width: 640px)");
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const update = () => {
      setLowPower(compactScreen.matches || navigator.hardwareConcurrency <= 4 || deviceMemory <= 4);
    };

    update();
    compactScreen.addEventListener("change", update);
    return () => compactScreen.removeEventListener("change", update);
  }, []);

  return lowPower;
};

const useCanvasActivity = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewportRef = useRef(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const syncActivity = () => setActive(inViewportRef.current && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewportRef.current = entry.isIntersecting;
        syncActivity();
      },
      { rootMargin: "160px" },
    );

    observer.observe(container);
    document.addEventListener("visibilitychange", syncActivity);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
    };
  }, []);

  return { active, containerRef };
};

function StatusLight({
  color = COLORS.accent,
  phase = 0,
  position,
  reducedMotion,
  size = 0.035,
}: {
  color?: string;
  phase?: number;
  position: [number, number, number];
  reducedMotion: boolean;
  size?: number;
}) {
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current || reducedMotion) return;
    materialRef.current.emissiveIntensity = 0.9 + Math.sin(clock.elapsedTime * 2.3 + phase) * 0.45;
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.1}
        roughness={0.3}
      />
    </mesh>
  );
}

function ScreenInterface({
  height,
  reducedMotion,
  width,
  z,
}: {
  height: number;
  reducedMotion: boolean;
  width: number;
  z: number;
}) {
  const activityRef = useRef<MeshStandardMaterial>(null);
  const rows = useMemo(() => [0.48, 0.72, 0.58], []);

  useFrame(({ clock }) => {
    if (!activityRef.current || reducedMotion) return;
    activityRef.current.emissiveIntensity = 0.42 + Math.sin(clock.elapsedTime * 1.35) * 0.16;
  });

  return (
    <group position={[0, 0, z]}>
      <RoundedBox args={[width, height, 0.035]} radius={Math.min(width, height) * 0.045} smoothness={5}>
        <meshPhysicalMaterial
          color={COLORS.screen}
          metalness={0.18}
          roughness={0.23}
          clearcoat={0.8}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>
      <group position={[-width * 0.32, height * 0.3, 0.026]}>
        <mesh>
          <circleGeometry args={[Math.min(width, height) * 0.055, 28]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accentDark} emissiveIntensity={0.8} />
        </mesh>
        <RoundedBox
          args={[width * 0.34, height * 0.045, 0.012]}
          position={[width * 0.25, 0, 0]}
          radius={height * 0.018}
          smoothness={3}
        >
          <meshStandardMaterial color="#b9d8ca" emissive="#3b8063" emissiveIntensity={0.25} />
        </RoundedBox>
      </group>
      <group position={[-width * 0.34, height * 0.04, 0.028]}>
        {rows.map((rowWidth, index) => (
          <RoundedBox
            key={rowWidth}
            args={[width * rowWidth, height * 0.055, 0.012]}
            position={[width * rowWidth * 0.5, -index * height * 0.13, 0]}
            radius={height * 0.02}
            smoothness={3}
          >
            <meshStandardMaterial
              ref={index === 0 ? activityRef : undefined}
              color={index === 0 ? COLORS.accent : "#5b7c6e"}
              emissive={index === 0 ? COLORS.accentDark : "#14271f"}
              emissiveIntensity={index === 0 ? 0.45 : 0.16}
            />
          </RoundedBox>
        ))}
      </group>
      <RoundedBox
        args={[width * 0.23, height * 0.18, 0.014]}
        position={[width * 0.28, -height * 0.27, 0.028]}
        radius={height * 0.035}
        smoothness={3}
      >
        <meshStandardMaterial color="#173e31" emissive="#1a6549" emissiveIntensity={0.24} />
      </RoundedBox>
    </group>
  );
}

function PhoneScreen({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<MeshStandardMaterial>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1440;
    const context = canvas.getContext("2d");

    if (context) {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, "#10271f");
      background.addColorStop(0.58, "#103126");
      background.addColorStop(1, "#07130f");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const halo = context.createRadialGradient(500, 400, 20, 500, 400, 500);
      halo.addColorStop(0, "rgba(67, 212, 154, 0.34)");
      halo.addColorStop(0.55, "rgba(32, 125, 89, 0.1)");
      halo.addColorStop(1, "rgba(4, 15, 11, 0)");
      context.fillStyle = halo;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "rgba(239, 248, 242, 0.88)";
      context.font = "600 25px Arial, sans-serif";
      context.fillText("09:41", 48, 68);
      context.fillStyle = "rgba(218, 237, 227, 0.45)";
      context.fillRect(598, 44, 74, 26);
      context.fillStyle = "#8fe0b9";
      context.fillRect(606, 50, 52, 14);

      context.strokeStyle = "#e7c873";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(66, 141);
      context.quadraticCurveTo(91, 94, 117, 141);
      context.quadraticCurveTo(137, 178, 91, 211);
      context.quadraticCurveTo(45, 178, 66, 141);
      context.stroke();
      context.beginPath();
      context.moveTo(91, 112);
      context.lineTo(91, 198);
      context.moveTo(91, 145);
      context.lineTo(67, 159);
      context.moveTo(91, 166);
      context.lineTo(118, 150);
      context.stroke();

      context.fillStyle = "#f0f5f1";
      context.font = "700 29px Arial, sans-serif";
      context.fillText("LEAFTRONICS", 151, 163);
      context.fillStyle = "rgba(219, 235, 226, 0.62)";
      context.font = "500 21px Arial, sans-serif";
      context.fillText("DIGITALER GERÄTEPASS", 151, 198);

      context.lineWidth = 24;
      context.strokeStyle = "rgba(229, 241, 234, 0.11)";
      context.beginPath();
      context.arc(360, 620, 176, -Math.PI * 0.76, Math.PI * 0.76);
      context.stroke();
      context.strokeStyle = "#43d49a";
      context.beginPath();
      context.arc(360, 620, 176, -Math.PI * 0.76, Math.PI * 0.53);
      context.stroke();

      context.fillStyle = "rgba(219, 238, 228, 0.68)";
      context.font = "600 24px Arial, sans-serif";
      context.textAlign = "center";
      context.fillText("RÜCKGEWINNBAR", 360, 558);
      context.fillStyle = "#f5f8f5";
      context.font = "700 132px Arial, sans-serif";
      context.fillText("84", 360, 693);
      context.fillStyle = "#e7c873";
      context.font = "700 36px Arial, sans-serif";
      context.fillText("%", 480, 667);

      context.fillStyle = "rgba(240, 247, 243, 0.08)";
      context.fillRect(54, 930, 612, 292);
      context.strokeStyle = "rgba(183, 226, 205, 0.2)";
      context.lineWidth = 2;
      context.strokeRect(54, 930, 612, 292);
      context.textAlign = "left";
      context.fillStyle = "rgba(211, 232, 221, 0.62)";
      context.font = "600 22px Arial, sans-serif";
      context.fillText("MATERIALPROFIL", 92, 992);

      const materialRows = [
        { color: "#d18350", label: "KUPFER", value: "16,4 g" },
        { color: "#c9d2cd", label: "ALUMINIUM", value: "25,1 g" },
        { color: "#e8ca78", label: "EDELMETALLE", value: "0,3 g" },
      ];
      materialRows.forEach((row, index) => {
        const y = 1052 + index * 64;
        context.fillStyle = row.color;
        context.beginPath();
        context.arc(104, y, 9, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "rgba(236, 245, 240, 0.78)";
        context.font = "600 22px Arial, sans-serif";
        context.fillText(row.label, 130, y + 8);
        context.fillStyle = "#f5f8f5";
        context.font = "700 24px Arial, sans-serif";
        context.textAlign = "right";
        context.fillText(row.value, 620, y + 8);
        context.textAlign = "left";
      });

      context.fillStyle = "rgba(232, 244, 237, 0.5)";
      context.font = "500 21px Arial, sans-serif";
      context.textAlign = "center";
      context.fillText("SERIE  LT-S25-0726-18", 360, 1332);
    }

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = 8;
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (!materialRef.current || reducedMotion) return;
    materialRef.current.emissiveIntensity = 0.22 + Math.sin(clock.elapsedTime * 0.9) * 0.035;
  });

  return (
    <RoundedBox args={[1.015, 2.105, 0.018]} radius={0.13} smoothness={8} position={[0, 0, 0.129]}>
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        color="#ffffff"
        emissive="#10382a"
        emissiveIntensity={0.22}
        metalness={0.04}
        roughness={0.28}
      />
    </RoundedBox>
  );
}

function RearCameraLens({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.112, 0.112, 0.046, 48]} />
        <meshPhysicalMaterial color="#89918d" metalness={0.94} roughness={0.16} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0, -0.028]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.083, 48]} />
        <meshPhysicalMaterial color="#0b151d" metalness={0.15} roughness={0.08} clearcoat={1} />
      </mesh>
      <mesh position={[-0.022, 0.024, -0.031]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.022, 32]} />
        <meshStandardMaterial color="#567e91" emissive="#1a3442" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function PremiumPhone({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.15, 2.27, 0.205]} radius={0.19} smoothness={10} castShadow>
        <meshPhysicalMaterial
          color="#858d89"
          metalness={0.94}
          roughness={0.17}
          clearcoat={0.82}
          clearcoatRoughness={0.16}
        />
      </RoundedBox>
      <RoundedBox args={[1.105, 2.225, 0.036]} radius={0.17} smoothness={9} position={[0, 0, 0.108]}>
        <meshPhysicalMaterial
          color="#030706"
          metalness={0.15}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
      <PhoneScreen reducedMotion={reducedMotion} />
      <RoundedBox args={[0.31, 0.09, 0.026]} radius={0.045} smoothness={6} position={[0, 0.94, 0.154]}>
        <meshPhysicalMaterial color="#020504" roughness={0.16} clearcoat={0.8} />
      </RoundedBox>
      <mesh position={[0.084, 0.94, 0.17]}>
        <circleGeometry args={[0.022, 28]} />
        <meshPhysicalMaterial color="#152c38" roughness={0.1} clearcoat={1} />
      </mesh>
      <RoundedBox args={[0.035, 0.34, 0.085]} radius={0.014} smoothness={4} position={[0.59, 0.25, 0.005]} castShadow>
        <meshPhysicalMaterial color="#a3aaa6" metalness={0.96} roughness={0.15} clearcoat={0.7} />
      </RoundedBox>
      {[
        { height: 0.22, y: 0.42 },
        { height: 0.22, y: 0.12 },
      ].map((button) => (
        <RoundedBox
          key={button.y}
          args={[0.035, button.height, 0.085]}
          radius={0.014}
          smoothness={4}
          position={[-0.59, button.y, 0.005]}
          castShadow
        >
          <meshPhysicalMaterial color="#a3aaa6" metalness={0.96} roughness={0.15} clearcoat={0.7} />
        </RoundedBox>
      ))}
      {[
        [0.578, 0.82, 0],
        [0.578, -0.8, 0],
        [-0.578, 0.82, 0],
        [-0.578, -0.8, 0],
      ].map(([x, y, z]) => (
        <RoundedBox key={`${x}-${y}`} args={[0.018, 0.075, 0.18]} radius={0.006} smoothness={2} position={[x, y, z]}>
          <meshStandardMaterial color="#3e4743" metalness={0.5} roughness={0.35} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.075, 2.195, 0.025]} radius={0.17} smoothness={8} position={[0, 0, -0.113]}>
        <meshPhysicalMaterial
          color="#263a33"
          metalness={0.28}
          roughness={0.24}
          clearcoat={0.82}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.62, 0.055]} radius={0.12} smoothness={7} position={[-0.25, 0.69, -0.145]} castShadow>
        <meshPhysicalMaterial color="#30433c" metalness={0.42} roughness={0.2} clearcoat={0.75} />
      </RoundedBox>
      <RearCameraLens position={[-0.34, 0.82, -0.174]} />
      <RearCameraLens position={[-0.16, 0.59, -0.174]} />
      <mesh position={[-0.12, 0.84, -0.178]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.052, 32]} />
        <meshStandardMaterial color="#e9dba4" emissive="#d8a953" emissiveIntensity={0.18} roughness={0.42} />
      </mesh>
    </group>
  );
}

function LaptopKeyboard() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 240;
    const context = canvas.getContext("2d");

    if (context) {
      context.fillStyle = "#26342f";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const rowLengths = [12, 12, 11, 7];
      const keyHeight = 34;
      const keyWidth = 42;
      const gap = 10;

      rowLengths.forEach((rowLength, row) => {
        const rowWidth = rowLength * keyWidth + (rowLength - 1) * gap;
        const offsetX = (canvas.width - rowWidth) / 2;
        const y = 22 + row * 51;

        for (let column = 0; column < rowLength; column += 1) {
          const isSpacebar = row === 3 && column === 2;
          const width = isSpacebar ? 196 : keyWidth;
          const x = offsetX + column * (keyWidth + gap);
          context.fillStyle = "#aeb9b3";
          context.fillRect(x, y, width, keyHeight);
          context.fillStyle = "rgba(255, 255, 255, 0.22)";
          context.fillRect(x + 3, y + 3, Math.max(1, width - 6), 3);
        }
      });
    }

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = 4;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.235, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.68, 0.58]} />
      <meshBasicMaterial
        map={texture}
        polygonOffset
        polygonOffsetFactor={-2}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function PremiumLaptop({ reducedMotion }: { reducedMotion: boolean }) {
  const lidRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!lidRef.current || reducedMotion) return;
    lidRef.current.rotation.x = -0.055 + Math.sin(clock.elapsedTime * 0.42) * 0.012;
  });

  return (
    <group>
      <RoundedBox args={[2.35, 0.14, 1.42]} radius={0.11} smoothness={6} position={[0, -0.42, 0.15]} castShadow>
        <meshPhysicalMaterial color="#b9c3be" metalness={0.7} roughness={0.27} clearcoat={0.42} />
      </RoundedBox>
      <RoundedBox args={[1.78, 0.03, 0.64]} radius={0.045} smoothness={4} position={[0, -0.304, 0.12]}>
        <meshStandardMaterial color="#899790" roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <LaptopKeyboard />
      <RoundedBox args={[0.7, 0.022, 0.42]} radius={0.04} smoothness={4} position={[0, -0.294, 0.55]}>
        <meshStandardMaterial color="#8f9b95" metalness={0.62} roughness={0.32} />
      </RoundedBox>
      <group ref={lidRef} position={[0, 0.24, -0.51]} rotation={[-0.055, 0, 0]}>
        <RoundedBox args={[2.34, 1.48, 0.09]} radius={0.1} smoothness={6} position={[0, 0.44, 0]} castShadow>
          <meshPhysicalMaterial color="#aab5b0" metalness={0.74} roughness={0.25} clearcoat={0.42} />
        </RoundedBox>
        <group position={[0, 0.44, 0.057]}>
          <ScreenInterface width={2.13} height={1.26} z={0} reducedMotion={reducedMotion} />
          <mesh position={[0, 0.56, 0.032]}>
            <circleGeometry args={[0.024, 20]} />
            <meshStandardMaterial color="#1f302a" />
          </mesh>
        </group>
      </group>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.77, -0.33, -0.52]}>
        <cylinderGeometry args={[0.055, 0.055, 0.65, 24]} />
        <meshStandardMaterial color="#33413b" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.77, -0.33, -0.52]}>
        <cylinderGeometry args={[0.055, 0.055, 0.65, 24]} />
        <meshStandardMaterial color="#33413b" metalness={0.72} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PremiumTablet({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.65, 2.25, 0.15]} radius={0.15} smoothness={7} castShadow>
        <meshPhysicalMaterial color="#9aa59f" metalness={0.8} roughness={0.2} clearcoat={0.5} />
      </RoundedBox>
      <ScreenInterface width={1.5} height={2.04} z={0.092} reducedMotion={reducedMotion} />
      <mesh position={[0, 1.02, 0.113]}>
        <circleGeometry args={[0.026, 24]} />
        <meshPhysicalMaterial color="#101b2a" roughness={0.18} clearcoat={1} />
      </mesh>
      <RoundedBox args={[0.065, 1.72, 0.065]} radius={0.028} smoothness={4} position={[0.91, 0, -0.01]}>
        <meshPhysicalMaterial color={COLORS.white} roughness={0.24} clearcoat={0.45} />
      </RoundedBox>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.91, -0.88, -0.01]}>
        <coneGeometry args={[0.032, 0.12, 24]} />
        <meshStandardMaterial color="#5b6862" metalness={0.72} roughness={0.25} />
      </mesh>
    </group>
  );
}

function WatchFace({ reducedMotion }: { reducedMotion: boolean }) {
  const minuteRef = useRef<Group>(null);
  const secondRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    if (minuteRef.current) minuteRef.current.rotation.z = -clock.elapsedTime * 0.08;
    if (secondRef.current) secondRef.current.rotation.z = -clock.elapsedTime * 0.65;
  });

  return (
    <group position={[0, 0, 0.148]}>
      <mesh>
        <circleGeometry args={[0.43, 48]} />
        <meshPhysicalMaterial color={COLORS.screen} roughness={0.16} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.34, 0.365, 48]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accentDark} emissiveIntensity={0.75} />
      </mesh>
      <group ref={minuteRef}>
        <RoundedBox args={[0.035, 0.25, 0.012]} radius={0.016} smoothness={3} position={[0, 0.11, 0.014]}>
          <meshBasicMaterial color={COLORS.white} />
        </RoundedBox>
      </group>
      <group ref={secondRef}>
        <RoundedBox args={[0.018, 0.32, 0.014]} radius={0.009} smoothness={3} position={[0, 0.14, 0.018]}>
          <meshBasicMaterial color={COLORS.gold} />
        </RoundedBox>
      </group>
      <mesh position={[0, 0, 0.025]}>
        <circleGeometry args={[0.045, 24]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.65} roughness={0.24} />
      </mesh>
    </group>
  );
}

function PremiumWatch({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoundedBox args={[0.62, 1.12, 0.12]} radius={0.23} smoothness={7} position={[0, 0.98, -0.06]}>
        <meshPhysicalMaterial color="#27463b" roughness={0.52} clearcoat={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.62, 1.12, 0.12]} radius={0.23} smoothness={7} position={[0, -0.98, -0.06]}>
        <meshPhysicalMaterial color="#27463b" roughness={0.52} clearcoat={0.2} />
      </RoundedBox>
      {[0.72, 1, 1.28, -0.72, -1, -1.28].map((position) => (
        <RoundedBox key={position} args={[0.25, 0.07, 0.03]} radius={0.025} smoothness={3} position={[0, position, 0.012]}>
          <meshStandardMaterial color="#0f231c" roughness={0.62} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.08, 1.05, 0.22]} radius={0.22} smoothness={8} castShadow>
        <meshPhysicalMaterial color="#89948f" metalness={0.86} roughness={0.2} clearcoat={0.5} />
      </RoundedBox>
      <WatchFace reducedMotion={reducedMotion} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.59, 0.05, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.12, 32]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.78} roughness={0.25} />
      </mesh>
    </group>
  );
}

function ControllerButton({ position, color = COLORS.graphite }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.065, 24, 16]} />
      <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.45} />
    </mesh>
  );
}

function PremiumConsole({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.72, 1.14, 0.17]} radius={0.1} smoothness={6} castShadow>
        <meshPhysicalMaterial color="#1c2824" metalness={0.48} roughness={0.28} clearcoat={0.45} />
      </RoundedBox>
      <ScreenInterface width={1.5} height={0.94} z={0.105} reducedMotion={reducedMotion} />
      <RoundedBox args={[0.48, 1.22, 0.2]} radius={0.18} smoothness={7} position={[-1.08, 0, 0]} castShadow>
        <meshPhysicalMaterial color="#d6dfdc" metalness={0.28} roughness={0.27} clearcoat={0.65} />
      </RoundedBox>
      <RoundedBox args={[0.48, 1.22, 0.2]} radius={0.18} smoothness={7} position={[1.08, 0, 0]} castShadow>
        <meshPhysicalMaterial color="#d6dfdc" metalness={0.28} roughness={0.27} clearcoat={0.65} />
      </RoundedBox>
      <ControllerButton position={[-1.08, 0.28, 0.135]} color="#111a17" />
      <ControllerButton position={[1.08, 0.28, 0.135]} color="#111a17" />
      <ControllerButton position={[-1.08, -0.14, 0.135]} color={COLORS.accentDark} />
      {[
        [0, 0.01],
        [0.1, -0.08],
        [-0.1, -0.08],
        [0, -0.17],
      ].map(([x, y], index) => (
        <ControllerButton key={index} position={[1.08 + x, y - 0.12, 0.135]} color={index === 0 ? COLORS.copper : COLORS.graphite} />
      ))}
      <RoundedBox args={[0.16, 0.045, 0.03]} radius={0.02} smoothness={3} position={[-0.95, 0.5, 0.13]}>
        <meshStandardMaterial color={COLORS.graphite} />
      </RoundedBox>
      <StatusLight position={[0.96, 0.51, 0.135]} phase={1.1} reducedMotion={reducedMotion} size={0.025} />
    </group>
  );
}

function PremiumHeadphones({ reducedMotion }: { reducedMotion: boolean }) {
  const earRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!earRef.current || reducedMotion) return;
    earRef.current.position.y = -0.43 + Math.sin(clock.elapsedTime * 0.7) * 0.018;
  });

  return (
    <group>
      <mesh rotation={[0, 0, -Math.PI * 0.175]} castShadow>
        <torusGeometry args={[0.92, 0.12, 24, 72, Math.PI * 1.35]} />
        <meshPhysicalMaterial color="#3a4842" metalness={0.44} roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI * 0.175]}>
        <torusGeometry args={[0.92, 0.067, 20, 64, Math.PI * 1.35]} />
        <meshStandardMaterial color="#78857f" metalness={0.62} roughness={0.3} />
      </mesh>
      <group ref={earRef} position={[0, -0.43, 0]}>
        {[-0.88, 0.88].map((x, index) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.39, 0.42, 0.24, 48]} />
              <meshPhysicalMaterial color={index === 0 ? "#31423b" : "#273630"} metalness={0.46} roughness={0.24} clearcoat={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.135]}>
              <ringGeometry args={[0.24, 0.36, 48]} />
              <meshStandardMaterial color={COLORS.rubber} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.138]}>
              <circleGeometry args={[0.235, 40]} />
              <meshStandardMaterial color="#17241f" roughness={0.82} />
            </mesh>
            {index === 1 ? <StatusLight position={[0.28, -0.18, 0.145]} phase={2.3} reducedMotion={reducedMotion} size={0.027} /> : null}
          </group>
        ))}
      </group>
      {[-0.79, 0.79].map((x) => (
        <RoundedBox key={x} args={[0.13, 0.52, 0.13]} radius={0.055} smoothness={4} position={[x, -0.08, 0]}>
          <meshStandardMaterial color="#717d77" metalness={0.74} roughness={0.26} />
        </RoundedBox>
      ))}
    </group>
  );
}

function RouterAntenna({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshStandardMaterial color="#293730" metalness={0.36} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.12, 1.05, 0.1]} radius={0.05} smoothness={4} position={[0, 0.52, 0]} castShadow>
        <meshPhysicalMaterial color="#65716b" metalness={0.65} roughness={0.27} clearcoat={0.3} />
      </RoundedBox>
    </group>
  );
}

function WifiSignal({ reducedMotion }: { reducedMotion: boolean }) {
  const refs = useRef<Array<MeshStandardMaterial | null>>([]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    refs.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = 0.24 + (Math.sin(clock.elapsedTime * 2.1 - index * 0.65) + 1) * 0.25;
    });
  });

  return (
    <group position={[0, 0.7, 0.2]} rotation={[0, 0, Math.PI * 0.17]}>
      {[0.28, 0.48, 0.68].map((radius, index) => (
        <mesh key={radius} rotation={[0, 0, -Math.PI * 0.5]}>
          <torusGeometry args={[radius, 0.025, 12, 42, Math.PI * 0.55]} />
          <meshStandardMaterial
            ref={(material) => {
              refs.current[index] = material;
            }}
            color={COLORS.accent}
            emissive={COLORS.accentDark}
            emissiveIntensity={0.8}
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

function PremiumRouter({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <RoundedBox args={[2.1, 0.42, 1.3]} radius={0.2} smoothness={7} position={[0, -0.18, 0]} castShadow>
        <meshPhysicalMaterial color="#c7d2cc" roughness={0.28} clearcoat={0.52} clearcoatRoughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1.82, 0.035, 0.93]} radius={0.14} smoothness={5} position={[0, 0.045, 0]}>
        <meshPhysicalMaterial color="#62756c" metalness={0.32} roughness={0.28} clearcoat={0.45} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.045, 0.56]} radius={0.1} smoothness={4} position={[0, 0.07, 0.02]}>
        <meshStandardMaterial color="#173e31" roughness={0.3} metalness={0.28} />
      </RoundedBox>
      {[-0.56, -0.28, 0, 0.28, 0.56].map((x, index) => (
        <StatusLight key={x} position={[x, 0.075, 0.52]} phase={index * 0.55} reducedMotion={reducedMotion} size={0.027} />
      ))}
      <RouterAntenna position={[-0.78, 0.05, -0.48]} rotation={-0.12} />
      <RouterAntenna position={[0.78, 0.05, -0.48]} rotation={0.12} />
      <group position={[0, -0.19, 0.66]}>
        {[-0.48, -0.16, 0.16, 0.48].map((x, index) => (
          <group key={x} position={[x, 0, 0]}>
            <RoundedBox args={[0.24, 0.12, 0.025]} radius={0.022} smoothness={3}>
              <meshStandardMaterial color="#20342c" metalness={0.28} roughness={0.4} />
            </RoundedBox>
            <RoundedBox args={[0.12, 0.018, 0.012]} radius={0.008} smoothness={2} position={[0, -0.02, 0.019]}>
              <meshStandardMaterial
                color={index === 0 ? COLORS.gold : COLORS.accent}
                emissive={index === 0 ? "#5d4618" : COLORS.accentDark}
                emissiveIntensity={0.32}
              />
            </RoundedBox>
          </group>
        ))}
      </group>
      <WifiSignal reducedMotion={reducedMotion} />
    </group>
  );
}

function VentRing({ radius }: { radius: number }) {
  return (
    <mesh>
      <ringGeometry args={[radius - 0.012, radius, 40]} />
      <meshStandardMaterial color="#67756f" metalness={0.5} roughness={0.42} />
    </mesh>
  );
}

function PremiumDesktop({ reducedMotion }: { reducedMotion: boolean }) {
  const ventRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ventRef.current || reducedMotion) return;
    ventRef.current.rotation.z = clock.elapsedTime * 0.22;
  });

  return (
    <group>
      <RoundedBox args={[1.42, 2.15, 0.62]} radius={0.13} smoothness={7} castShadow>
        <meshPhysicalMaterial color="#303b37" metalness={0.62} roughness={0.28} clearcoat={0.34} />
      </RoundedBox>
      <RoundedBox args={[1.2, 1.93, 0.035]} radius={0.08} smoothness={5} position={[0, 0, 0.33]}>
        <meshStandardMaterial color="#1c2723" metalness={0.42} roughness={0.38} />
      </RoundedBox>
      <group ref={ventRef} position={[0.08, 0.43, 0.356]}>
        {[0.13, 0.22, 0.31].map((radius) => <VentRing key={radius} radius={radius} />)}
        {Array.from({ length: 8 }, (_, index) => (
          <RoundedBox
            key={index}
            args={[0.045, 0.58, 0.012]}
            radius={0.02}
            smoothness={2}
            rotation={[0, 0, (index * Math.PI) / 4]}
          >
            <meshStandardMaterial color="#66736d" metalness={0.48} roughness={0.4} />
          </RoundedBox>
        ))}
      </group>
      <RoundedBox args={[0.55, 0.055, 0.025]} radius={0.02} smoothness={3} position={[0, -0.38, 0.36]}>
        <meshStandardMaterial color="#75837c" metalness={0.58} roughness={0.28} />
      </RoundedBox>
      {[-0.22, 0].map((x) => (
        <RoundedBox key={x} args={[0.15, 0.1, 0.025]} radius={0.025} smoothness={3} position={[x, -0.66, 0.36]}>
          <meshStandardMaterial color="#101815" roughness={0.42} />
        </RoundedBox>
      ))}
      <mesh position={[0.3, -0.65, 0.36]}>
        <ringGeometry args={[0.06, 0.08, 30]} />
        <meshStandardMaterial color="#92a09a" metalness={0.8} roughness={0.2} />
      </mesh>
      <StatusLight position={[0.47, -0.66, 0.368]} phase={3} reducedMotion={reducedMotion} size={0.032} />
      <RoundedBox args={[1.05, 0.08, 0.8]} radius={0.04} smoothness={4} position={[0, -1.12, -0.04]} castShadow>
        <meshStandardMaterial color="#77847e" metalness={0.67} roughness={0.3} />
      </RoundedBox>
    </group>
  );
}

function DeviceGeometry({ kind, reducedMotion }: { kind: DemoDeviceKind; reducedMotion: boolean }) {
  switch (kind) {
    case "phone":
      return <PremiumPhone reducedMotion={reducedMotion} />;
    case "laptop":
      return <PremiumLaptop reducedMotion={reducedMotion} />;
    case "tablet":
      return <PremiumTablet reducedMotion={reducedMotion} />;
    case "watch":
      return <PremiumWatch reducedMotion={reducedMotion} />;
    case "console":
      return <PremiumConsole reducedMotion={reducedMotion} />;
    case "headphones":
      return <PremiumHeadphones reducedMotion={reducedMotion} />;
    case "network":
      return <PremiumRouter reducedMotion={reducedMotion} />;
    case "desktop":
      return <PremiumDesktop reducedMotion={reducedMotion} />;
  }
}

function AnimatedProduct({ kind, reducedMotion }: { kind: DemoDeviceKind; reducedMotion: boolean }) {
  const rootRef = useRef<Group>(null);
  const presentation = devicePresentation[kind];

  useFrame(({ clock }) => {
    if (!rootRef.current || reducedMotion) return;
    const time = clock.elapsedTime;
    rootRef.current.rotation.x = presentation.rotation[0] + Math.sin(time * 0.36 + presentation.phase) * 0.018;
    rootRef.current.rotation.y = presentation.rotation[1] + Math.sin(time * 0.44 + presentation.phase) * presentation.yaw;
    rootRef.current.position.y = presentation.positionY + Math.sin(time * 0.68 + presentation.phase) * 0.025;
  });

  return (
    <group
      ref={rootRef}
      position={[0, presentation.positionY, 0]}
      rotation={presentation.rotation}
      scale={presentation.scale}
    >
      <DeviceGeometry kind={kind} reducedMotion={reducedMotion} />
    </group>
  );
}

export default function DemoDayDeviceModel({ kind }: { kind: DemoDeviceKind }) {
  const reducedMotion = useReducedMotion();
  const lowPower = useRenderProfile();
  const { active, containerRef } = useCanvasActivity();

  return (
    <div ref={containerRef} className="demo-day-device-canvas-layer" aria-hidden="true">
      <Canvas
        camera={{ position: [3.25, 2.25, 4.35], fov: 31, near: 0.01, far: 40 }}
        dpr={[1, lowPower ? 1.15 : 1.45]}
        frameloop={reducedMotion || !active ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "default" }}
        shadows
        onCreated={({ gl }) => {
          gl.setClearColor("#000000", 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <ambientLight intensity={0.82} />
        <hemisphereLight args={["#f8fff9", "#6c8177", 1.2]} />
        <directionalLight position={[4, 5, 5]} intensity={2.6} color="#fffaf0" castShadow shadow-mapSize={[512, 512]} />
        <directionalLight position={[-4, 2, 2]} intensity={1.25} color="#79d6ae" />
        <pointLight position={[0, -1, 3]} intensity={0.75} color="#e8c477" />
        <AnimatedProduct kind={kind} reducedMotion={reducedMotion} />
        <ContactShadows
          position={[0, -1.18, 0]}
          opacity={0.3}
          scale={4.2}
          blur={2.6}
          far={2.5}
          resolution={lowPower ? 128 : 256}
          frames={1}
          color="#17372d"
        />
      </Canvas>
    </div>
  );
}
