import { useGLTF, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createPCBTraceGeometry } from "@/components/pcb/createPCBTraceGeometry";

const DESKTOP_MODEL_PATH = "/models/green-circuit-board-web.glb?v=5";
const MOBILE_MODEL_PATH = "/models/green-circuit-board-mobile.glb?v=2";
const CONTAINER_MODEL_PATH = "/models/problem/shipping-container-20ft.glb";
const BOARD_LOGO_PATH = "/logo1-web.webp";
const PROCESS_CYCLE_SECONDS = 20;
const MODEL_WORLD_SIZE = 3.2;
const STORY_PRODUCT_START = 0.3;
const PROBLEM_PCB_COUNT = 18;
const PROBLEM_PILE_TOWER_COUNT = 3;
const EXCLUDED_MESH_NAMES = new Set(["Box100", "Box129", "Line388"]);

const CLEAR_WATER = new THREE.Color("#bdebdc");
const PROCESS_WATER = new THREE.Color("#d8c46a");
const ORGANIC_BOARD = new THREE.Color("#2f754b");
const TECHNICAL_BOARD = new THREE.Color("#0b5b36");
const DATA_ERROR_RED = new THREE.Color("#ff3434");
const STRUCTURE_DETAIL = new THREE.Color("#6b9877");
const STRUCTURE_EMISSIVE = new THREE.Color("#173b25");
const COPPER_DETAIL = new THREE.Color("#d7ac52");
const COPPER_EMISSIVE = new THREE.Color("#80551a");

type NavigatorPerformanceHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
};

interface DevicePerformanceProfile {
  compactViewport: boolean;
  constrainedConnection: boolean;
  lowPower: boolean;
  reducedMotion: boolean;
}

interface AdaptiveSceneSettings {
  antialias: boolean;
  dpr: number;
  maxFps: number;
}

declare global {
  interface Window {
    __LEAFTRONICS_PCB_MODEL__?: string;
  }
}

function getDevicePerformanceProfile(): DevicePerformanceProfile {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      compactViewport: false,
      constrainedConnection: false,
      lowPower: false,
      reducedMotion: false,
    };
  }

  const hints = navigator as NavigatorPerformanceHints;
  const effectiveType = hints.connection?.effectiveType ?? "";
  const constrainedConnection = Boolean(hints.connection?.saveData || /(^|-)2g|3g/.test(effectiveType));
  const constrainedHardware =
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
  const compactViewport = window.matchMedia("(max-width: 1024px)").matches;

  return {
    compactViewport,
    constrainedConnection,
    lowPower: constrainedConnection || constrainedHardware,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function getPreferredModelPath() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return DESKTOP_MODEL_PATH;
  if (window.__LEAFTRONICS_PCB_MODEL__) return window.__LEAFTRONICS_PCB_MODEL__;
  const profile = getDevicePerformanceProfile();
  return profile.compactViewport || profile.lowPower ? MOBILE_MODEL_PATH : DESKTOP_MODEL_PATH;
}

const DEFAULT_MODEL_PATH = getPreferredModelPath();

interface InteractivePCBModelSceneProps {
  modelPath?: string;
  onReady?: () => void;
  scrollProgress?: number;
}

interface PointerState {
  x: number;
  y: number;
  hasInput: boolean;
}

interface TimelineState {
  beakerAmount: number;
  blankBoardAmount: number;
  blankBoardOpacity: number;
  boardDipAmount: number;
  boardPitchAmount: number;
  fluidImpactAmount: number;
  originalBoardOpacity: number;
  phase: number;
  waterYellowAmount: number;
}

interface ModelLayout {
  beakerScale: number;
  isCompact: boolean;
  scale: number;
  x: number;
  y: number;
}

interface MaterialOpacityState {
  color: THREE.Color | null;
  material: THREE.Material;
  opacity: number;
}

interface AnimatedPart {
  delay: number;
  floatPhase: number;
  floatStrength: number;
  mesh: THREE.Mesh;
  offset: THREE.Vector3;
  origin: THREE.Vector3;
  originRotation: THREE.Euler;
  revealOrder: number;
  spin: THREE.Vector3;
}

interface BaseBoardPart {
  materials: MaterialOpacityState[];
  mesh: THREE.Mesh;
  origin: THREE.Vector3;
  rotation: THREE.Euler;
  startOffset: THREE.Vector3;
}

interface BoardFlexState {
  attribute: THREE.BufferAttribute;
  axis: "x" | "z";
  halfExtent: number;
  lastAmount: number;
  originalPositions: Float32Array;
}

interface BoardLogoPart {
  heroOffset: THREE.Vector3;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
  origin: THREE.Vector3;
  rotation: THREE.Euler;
}

interface BoardDetailPart {
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;
  origin: THREE.Vector3;
  rotation: THREE.Euler;
}

interface GeometryDescriptor {
  attributeSignature: string;
  center: THREE.Vector3;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  materialSignature: string;
  name: string;
}

interface GeometryBucket {
  geometries: THREE.BufferGeometry[];
  material: THREE.Material;
}

interface ModelMaterialState {
  emissive: THREE.Color;
  emissiveIntensity: number;
  material: THREE.MeshStandardMaterial;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / Math.max(edge1 - edge0, 0.0001));
  return t * t * (3 - 2 * t);
}

function hash01(value: number) {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}

function getTimelineState(time: number, controlledPhase?: number): TimelineState {
  const phase = controlledPhase ?? (time % PROCESS_CYCLE_SECONDS) / PROCESS_CYCLE_SECONDS;
  const dissolveAmount = smoothstep(0.36, 0.47, phase);
  const finalSwapAmount = smoothstep(0.968, 0.995, phase);

  return {
    beakerAmount: smoothstep(0.18, 0.29, phase) * (1 - smoothstep(0.49, 0.61, phase)),
    blankBoardAmount: smoothstep(0.7, 0.82, phase),
    blankBoardOpacity: smoothstep(0.68, 0.72, phase) * (1 - finalSwapAmount),
    boardDipAmount: smoothstep(0.27, 0.37, phase) * (1 - smoothstep(0.47, 0.59, phase)),
    boardPitchAmount: smoothstep(0.13, 0.23, phase) * (1 - smoothstep(0.49, 0.61, phase)),
    fluidImpactAmount: smoothstep(0.27, 0.34, phase) * (1 - smoothstep(0.43, 0.52, phase)),
    originalBoardOpacity: phase < 0.36 ? 1 : phase < 0.49 ? 1 - dissolveAmount : finalSwapAmount,
    phase,
    waterYellowAmount: smoothstep(0.35, 0.44, phase) * (1 - smoothstep(0.49, 0.59, phase)),
  };
}

function getStoryProcessPhase(scrollProgress?: number) {
  if (scrollProgress === undefined) return undefined;

  const productProgress = getStoryProductProgress(scrollProgress);
  if (productProgress === undefined) return 0.055;
  if (productProgress <= 0.58) return 0.055;
  if (productProgress < 0.73) {
    return THREE.MathUtils.lerp(0.13, 0.47, smoothstep(0.58, 0.73, productProgress));
  }
  if (productProgress < 0.88) {
    return THREE.MathUtils.lerp(0.47, 0.7, smoothstep(0.73, 0.88, productProgress));
  }

  return THREE.MathUtils.lerp(0.7, 0.995, smoothstep(0.88, 1, productProgress));
}

function getStoryProductProgress(scrollProgress?: number) {
  if (scrollProgress === undefined || scrollProgress < STORY_PRODUCT_START) return undefined;
  return clamp01((scrollProgress - STORY_PRODUCT_START) / (1 - STORY_PRODUCT_START));
}

function getStoryProblemProgress(scrollProgress?: number) {
  if (scrollProgress === undefined || scrollProgress >= STORY_PRODUCT_START) return undefined;
  return clamp01(scrollProgress / STORY_PRODUCT_START);
}

function getProductBoardFlex(productProgress?: number) {
  if (productProgress === undefined) return 0;

  const substrateTest =
    smoothstep(0.075, 0.125, productProgress) * (1 - smoothstep(0.205, 0.27, productProgress));
  const assembledTest =
    smoothstep(0.355, 0.405, productProgress) * (1 - smoothstep(0.515, 0.585, productProgress));

  return Math.max(substrateTest * 0.9, assembledTest * 1.28);
}

function getProductStepWeight(productProgress: number | undefined, index: number) {
  if (productProgress === undefined) return 0;
  const distance = Math.abs(productProgress * 7 - index);
  return 1 - smoothstep(0.2, 0.58, distance);
}

function sampleKeyframes(progress: number, values: number[]) {
  const scaled = clamp01(progress) * (values.length - 1);
  const index = Math.min(values.length - 2, Math.floor(scaled));
  const amount = smoothstep(0, 1, scaled - index);
  return THREE.MathUtils.lerp(values[index], values[index + 1], amount);
}

function getStoryBoardTransform(scrollProgress: number | undefined, isCompact: boolean) {
  if (scrollProgress === undefined) {
    return { pitch: 0, scale: 1, x: 0, yaw: 0, z: 0 };
  }

  if (scrollProgress >= STORY_PRODUCT_START) {
    const productProgress = (scrollProgress - STORY_PRODUCT_START) / (1 - STORY_PRODUCT_START);
    const productScale = sampleKeyframes(productProgress, [1.38, 1.95, 1.78, 1.2, 2.02, 0.78, 0.84, 0.94]);
    const compactScale = productScale > 1.75 ? 0.64 : productScale > 1.3 ? 0.72 : 0.86;
    return {
      pitch: sampleKeyframes(productProgress, [0.04, 0.66, 0.16, -1.42, 0.26, 0.04, 0, 0]),
      scale: productScale * (isCompact ? compactScale : 1),
      x: isCompact
        ? 0
        : sampleKeyframes(productProgress, [1.58, -1.3, 1.5, -1.48, 1.42, -1.22, 1.22, -1.12]),
      yaw: sampleKeyframes(productProgress, [-0.34, -0.58, -1.02, 1.45, -1.58, -0.12, -2.38, -2.68]),
      z: 0,
    };
  }

  const progress = scrollProgress / STORY_PRODUCT_START;
  const travel = isCompact ? 0.58 : 1;
  const compactScale = isCompact ? 0.84 : 1;
  const dataX = isCompact ? 0.28 : 1.62;
  const productX = isCompact ? 0 : 1.7;

  if (progress < 0.2) {
    const approach = smoothstep(0.02, 0.105, progress);
    const insertion = smoothstep(0.105, 0.185, progress);
    const loadingBayX = isCompact ? -0.2 * travel : -0.02;
    const insideContainerX = isCompact ? 0.38 * travel : 0.68;
    const startX = isCompact ? 0 : 0.82;
    const approachX = THREE.MathUtils.lerp(startX, loadingBayX, approach);
    const approachScale = THREE.MathUtils.lerp(isCompact ? 1.08 : 0.78, 0.34, approach);
    return {
      pitch: THREE.MathUtils.lerp(0.03, 0.1, approach),
      scale: THREE.MathUtils.lerp(approachScale, 0.24, insertion) * compactScale,
      x: THREE.MathUtils.lerp(approachX, insideContainerX, insertion),
      yaw: THREE.MathUtils.lerp(-0.22, Math.PI * 0.46, approach),
      z: THREE.MathUtils.lerp(0.42, -0.08, insertion),
    };
  }

  if (progress < 0.46) {
    const collectionHold = smoothstep(0.2, 0.34, progress);
    const insideContainerX = isCompact ? 0.38 * travel : 0.68;
    return {
      pitch: THREE.MathUtils.lerp(0.1, 0.04, collectionHold),
      scale: THREE.MathUtils.lerp(0.24, 0.38, collectionHold) * compactScale,
      x: THREE.MathUtils.lerp(insideContainerX, 5.4 * travel, collectionHold),
      yaw: THREE.MathUtils.lerp(Math.PI * 0.46, Math.PI * 0.52, collectionHold),
      z: -0.08,
    };
  }

  if (progress < 0.66) {
    const dataTransition = smoothstep(0.46, 0.56, progress);
    return {
      pitch: THREE.MathUtils.lerp(0.04, -0.08, dataTransition),
      scale: THREE.MathUtils.lerp(0.38, 1.34, dataTransition) * compactScale,
      x: THREE.MathUtils.lerp(-3.4 * travel, dataX, dataTransition),
      yaw: THREE.MathUtils.lerp(-0.86, -0.55, dataTransition),
      z: THREE.MathUtils.lerp(-0.08, 0, dataTransition),
    };
  }

  const productTransition = smoothstep(0.8, 1, progress);

  return {
    pitch: THREE.MathUtils.lerp(-0.08, 0.04, productTransition),
    scale: THREE.MathUtils.lerp(1.34, 1.38, productTransition) * compactScale,
    x: THREE.MathUtils.lerp(dataX, productX, productTransition),
    yaw: THREE.MathUtils.lerp(-0.55, -0.34, productTransition),
    z: 0,
  };
}

function getPartSeparation(phase: number, delay: number) {
  const departure = smoothstep(0.52 + delay * 0.04, 0.66 + delay * 0.04, phase);
  const reunion = smoothstep(0.81 + delay * 0.02, 0.94 + delay * 0.045, phase);
  return departure * (1 - reunion);
}

function getModelLayout(viewportWidth: number, viewportHeight: number, shortLandscape = false): ModelLayout {
  const aspect = viewportWidth / Math.max(viewportHeight, 0.001);
  const isCompact = aspect < 1.08 || viewportWidth < 4.2;
  const widthScale = THREE.MathUtils.clamp(viewportWidth / (isCompact ? 3.8 : 6.8), 0.78, 1.25);
  const heightScale = THREE.MathUtils.clamp(viewportHeight / 5, 0.8, 1.2);
  const aspectBoost = THREE.MathUtils.clamp(aspect / 1.55, 1, 1.14);
  const scale = Math.min(widthScale, heightScale) * aspectBoost * (shortLandscape ? 0.72 : 1);

  return {
    beakerScale: 3.8 * scale,
    isCompact,
    scale,
    x: 0,
    y: shortLandscape ? 0.16 : isCompact ? 0.78 : 0.36,
  };
}

function getAdaptiveSceneSettings(mode: "full" | "pilot"): AdaptiveSceneSettings {
  if (typeof window === "undefined") return { antialias: true, dpr: 1, maxFps: 60 };
  const width = window.innerWidth;
  const nativeDpr = window.devicePixelRatio || 1;
  const profile = getDevicePerformanceProfile();
  let dpr: number;

  if (profile.lowPower) {
    dpr = Math.min(nativeDpr, mode === "pilot" ? 0.82 : 0.88);
  } else if (mode === "pilot") {
    if (width >= 2200) dpr = 0.9;
    else if (width >= 1800) dpr = 0.95;
    else dpr = Math.min(nativeDpr, profile.compactViewport ? 1 : 1.25);
  } else if (width >= 2200) {
    dpr = 0.72;
  } else if (width >= 1800) {
    dpr = 0.82;
  } else if (width >= 1500) {
    dpr = 0.92;
  } else {
    dpr = Math.min(nativeDpr, profile.compactViewport ? 1 : 1.15);
  }

  return {
    antialias: !profile.lowPower,
    dpr,
    maxFps: profile.reducedMotion ? 24 : profile.lowPower ? 30 : profile.compactViewport ? 45 : 60,
  };
}

function useAdaptiveSceneSettings(mode: "full" | "pilot") {
  const [settings, setSettings] = useState(() => getAdaptiveSceneSettings(mode));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSettings(getAdaptiveSceneSettings(mode)));
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", update);
    motionQuery.addEventListener("change", update);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      motionQuery.removeEventListener("change", update);
    };
  }, [mode]);

  return settings;
}

function getBeakerY(amount: number, viewportHeight: number, targetY: number) {
  return THREE.MathUtils.lerp(-viewportHeight * 0.75 - 2.6, targetY - 0.22, amount);
}

function useWindowPointer() {
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, hasInput: false });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = THREE.MathUtils.clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      pointerRef.current.hasInput = true;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return pointerRef;
}

function CameraLookAt() {
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    camera.lookAt(0, 0.14, 0);
  });

  return null;
}

function AdaptiveFrameLoop({ maxFps }: { maxFps: number }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (maxFps >= 60) return;

    let frame = 0;
    let lastFrameAt = window.performance.now();
    const frameDuration = 1000 / maxFps;
    const tick = (now: number) => {
      const elapsed = now - lastFrameAt;
      if (elapsed >= frameDuration) {
        lastFrameAt = now - (elapsed % frameDuration);
        invalidate();
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [invalidate, maxFps]);

  return null;
}

function LocalStudioEnvironment({ intensity }: { intensity: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(room, 0.04);

    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    room.dispose();
    generator.dispose();

    return () => {
      if (scene.environment === target.texture) {
        scene.environment = previousEnvironment;
        scene.environmentIntensity = previousIntensity;
      }
      target.dispose();
    };
  }, [gl, intensity, scene]);

  return null;
}

function getMaterialSignature(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return material.type;
  }

  return [
    material.type,
    material.color.getHexString(),
    material.emissive.getHexString(),
    material.metalness.toFixed(3),
    material.roughness.toFixed(3),
    material.map?.uuid ?? "none",
    material.normalMap?.uuid ?? "none",
    material.metalnessMap?.uuid ?? "none",
    material.roughnessMap?.uuid ?? "none",
  ].join(":");
}

function getAttributeSignature(geometry: THREE.BufferGeometry) {
  const attributes = Object.entries(geometry.attributes)
    .map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.normalized ? 1 : 0}`)
    .sort()
    .join("|");

  return `${geometry.index ? "indexed" : "plain"}|${attributes}`;
}

function prepareMaterial(material: THREE.Material) {
  const clone = material.clone();
  clone.side = THREE.DoubleSide;

  if (clone instanceof THREE.MeshStandardMaterial) {
    clone.envMapIntensity = 0.55;
    clone.roughness = THREE.MathUtils.clamp(clone.roughness, 0.35, 0.8);
  }

  clone.needsUpdate = true;
  return clone;
}

function createOptimizedModel(source: THREE.Group, logoTexture?: THREE.Texture) {
  source.updateMatrixWorld(true);
  const inverseRoot = source.matrixWorld.clone().invert();
  const descriptors: GeometryDescriptor[] = [];
  const bounds = new THREE.Box3();

  source.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || EXCLUDED_MESH_NAMES.has(child.name)) {
      return;
    }

    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    const geometry = child.geometry.clone();
    const transform = inverseRoot.clone().multiply(child.matrixWorld);
    geometry.applyMatrix4(transform);
    geometry.computeBoundingBox();

    if (!geometry.boundingBox) {
      geometry.dispose();
      return;
    }

    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    bounds.union(geometry.boundingBox);
    descriptors.push({
      attributeSignature: getAttributeSignature(geometry),
      center,
      geometry,
      material,
      materialSignature: getMaterialSignature(material),
      name: child.name,
    });
  });

  const model = new THREE.Group();
  const modelCenter = bounds.getCenter(new THREE.Vector3());
  const modelSize = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;
  const rawToWorldScale = MODEL_WORLD_SIZE / maxDimension;
  const boardDescriptor = descriptors.find((descriptor) => descriptor.name === "Line001");
  const componentDescriptors = descriptors.filter((descriptor) => descriptor !== boardDescriptor);
  const materialCache = new Map<string, THREE.Material>();
  const buckets = new Map<string, GeometryBucket>();

  for (const descriptor of componentDescriptors) {
    const tileX = THREE.MathUtils.clamp(
      Math.floor(((descriptor.center.x - bounds.min.x) / Math.max(modelSize.x, 0.001)) * 4),
      0,
      3,
    );
    const tileZ = THREE.MathUtils.clamp(
      Math.floor(((descriptor.center.z - bounds.min.z) / Math.max(modelSize.z, 0.001)) * 6),
      0,
      5,
    );
    const key = `${tileX}:${tileZ}:${descriptor.materialSignature}:${descriptor.attributeSignature}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.geometries.push(descriptor.geometry);
    } else {
      buckets.set(key, { geometries: [descriptor.geometry], material: descriptor.material });
    }
  }

  let partIndex = 0;
  for (const bucket of buckets.values()) {
    const materialSignature = getMaterialSignature(bucket.material);
    let material = materialCache.get(materialSignature);

    if (!material) {
      material = prepareMaterial(bucket.material);
      materialCache.set(materialSignature, material);
    }

    const mergedGeometry =
      bucket.geometries.length === 1 ? bucket.geometries[0] : mergeGeometries(bucket.geometries, false);

    if (!mergedGeometry) {
      for (const geometry of bucket.geometries) {
        geometry.dispose();
      }
      continue;
    }

    if (bucket.geometries.length > 1) {
      for (const geometry of bucket.geometries) {
        geometry.dispose();
      }
    }

    mergedGeometry.computeBoundingBox();
    const partBounds = mergedGeometry.boundingBox;
    if (!partBounds) {
      mergedGeometry.dispose();
      continue;
    }

    const partCenter = partBounds.getCenter(new THREE.Vector3());
    const partSize = partBounds.getSize(new THREE.Vector3());
    mergedGeometry.translate(-partCenter.x, -partCenter.y, -partCenter.z);

    const normalizedX = THREE.MathUtils.clamp(
      (partCenter.x - modelCenter.x) / Math.max(modelSize.x * 0.5, 0.001),
      -1,
      1,
    );
    const normalizedZ = THREE.MathUtils.clamp(
      (partCenter.z - modelCenter.z) / Math.max(modelSize.z * 0.5, 0.001),
      -1,
      1,
    );
    const seed = partCenter.x * 0.73 + partCenter.z * 1.17 + partSize.length() * 2.31 + partIndex * 0.19;
    const randomA = hash01(seed);
    const randomB = hash01(seed + 7.41);
    const randomC = hash01(seed + 19.17);
    const side = Math.abs(normalizedX) > 0.08 ? Math.sign(normalizedX) : randomA > 0.5 ? 1 : -1;
    const edgeBias = Math.max(Math.abs(normalizedX), Math.abs(normalizedZ));
    const mesh = new THREE.Mesh(mergedGeometry, material);

    mesh.name = `PCBComponentCluster_${partIndex}`;
    mesh.position.copy(partCenter);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    mesh.userData.pcbPartOrigin = partCenter.clone();
    mesh.userData.pcbPartOffset = new THREE.Vector3(
      side * maxDimension * (0.86 + Math.abs(normalizedX) * 0.26 + randomA * 0.15),
      maxDimension * (0.16 + edgeBias * 0.16 + randomB * 0.18),
      maxDimension * (normalizedZ * 0.26 + (randomC - 0.5) * 0.22),
    );
    mesh.userData.pcbPartDelay = randomA;
    mesh.userData.pcbPartFloatPhase = randomB * Math.PI * 2;
    mesh.userData.pcbPartFloatStrength = maxDimension * (0.012 + randomC * 0.014);
    mesh.userData.pcbPartRevealOrder = clamp01(
      (partSize.y / Math.max(modelSize.y, 0.001)) * 1.8 + randomC * 0.12,
    );
    mesh.userData.pcbPartSpin = new THREE.Vector3(
      (randomB - 0.5) * 1.5,
      (randomC - 0.5) * 2.2,
      (randomA - 0.5) * 1.35,
    );
    model.add(mesh);
    partIndex += 1;
  }

  if (boardDescriptor) {
    const boardGeometry = boardDescriptor.geometry;
    boardGeometry.computeBoundingBox();
    const boardBounds = boardGeometry.boundingBox?.clone();
    const boardSize = boardBounds?.getSize(new THREE.Vector3()) ?? modelSize.clone();
    const boardCenter = boardGeometry.boundingBox?.getCenter(new THREE.Vector3()) ?? modelCenter.clone();
    boardGeometry.translate(-boardCenter.x, -boardCenter.y, -boardCenter.z);

    const originalMaterial = prepareMaterial(boardDescriptor.material);
    originalMaterial.transparent = true;
    if (originalMaterial instanceof THREE.MeshStandardMaterial) {
      originalMaterial.color.copy(TECHNICAL_BOARD);
      originalMaterial.envMapIntensity = 0.42;
      originalMaterial.metalness = Math.min(originalMaterial.metalness, 0.1);
      originalMaterial.roughness = Math.max(originalMaterial.roughness, 0.68);
    }
    const originalBoard = new THREE.Mesh(boardGeometry, originalMaterial);
    originalBoard.name = "PCBBoardOriginal";
    originalBoard.position.copy(boardCenter);
    originalBoard.frustumCulled = false;
    originalBoard.renderOrder = 1;
    originalBoard.userData.pcbBoardOrigin = boardCenter.clone();
    model.add(originalBoard);

    const blankMaterial = new THREE.MeshStandardMaterial({
      color: "#0a6b39",
      emissive: "#21a85d",
      emissiveIntensity: 0.16,
      metalness: 0.08,
      opacity: 1,
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const blankBoard = new THREE.Mesh(boardGeometry, blankMaterial);
    blankBoard.name = "PCBBoardBlank";
    blankBoard.position.copy(boardCenter);
    blankBoard.frustumCulled = false;
    blankBoard.renderOrder = 1;
    blankBoard.visible = false;
    blankBoard.userData.pcbBlankBoardOrigin = boardCenter.clone();
    blankBoard.userData.pcbBlankBoardStartOffset = new THREE.Vector3(
      -maxDimension * 0.08,
      maxDimension * 0.95,
      -maxDimension * 0.26,
    );
    model.add(blankBoard);

    if (boardBounds) {
      const traceGeometry = createPCBTraceGeometry(boardSize);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: "#d7ac52",
        emissive: "#80551a",
        emissiveIntensity: 0.28,
        metalness: 0.74,
        opacity: 1,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
        roughness: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const traces = new THREE.Mesh(traceGeometry, traceMaterial);
      traces.name = "PCBBoardCopperTraces";
      traces.position.set(boardCenter.x, boardBounds.max.y + maxDimension * 0.0035, boardCenter.z);
      traces.frustumCulled = false;
      traces.renderOrder = 3;
      traces.userData.pcbDetailOrigin = traces.position.clone();
      model.add(traces);
    }

    if (logoTexture && boardBounds) {
      logoTexture.colorSpace = THREE.SRGBColorSpace;
      logoTexture.anisotropy = Math.max(logoTexture.anisotropy, 4);
      logoTexture.needsUpdate = true;

      const logoSize = Math.min(boardSize.x, boardSize.z) * 0.32;
      const logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize);
      const logoMaterial = new THREE.MeshBasicMaterial({
        alphaTest: 0.08,
        depthTest: true,
        depthWrite: false,
        map: logoTexture,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
      });
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.name = "PCBBoardLogo";
      logo.position.set(boardCenter.x, boardBounds.max.y + maxDimension * 0.0045, boardCenter.z);
      logo.rotation.x = -Math.PI * 0.5;
      logo.frustumCulled = false;
      logo.renderOrder = 4;
      logo.visible = false;
      logo.userData.pcbLogoOrigin = logo.position.clone();
      logo.userData.pcbHeroLogoOffset = new THREE.Vector3();
      model.add(logo);
    }
  }

  model.position.set(-modelCenter.x * rawToWorldScale, -modelCenter.y * rawToWorldScale, -modelCenter.z * rawToWorldScale);
  model.scale.setScalar(rawToWorldScale);

  return model;
}

function collectAnimatedParts(model: THREE.Group) {
  const parts: AnimatedPart[] = [];

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const origin = child.userData.pcbPartOrigin as THREE.Vector3 | undefined;
    const offset = child.userData.pcbPartOffset as THREE.Vector3 | undefined;
    const spin = child.userData.pcbPartSpin as THREE.Vector3 | undefined;

    if (!origin || !offset || !spin) {
      return;
    }

    parts.push({
      delay: (child.userData.pcbPartDelay as number | undefined) ?? 0,
      floatPhase: (child.userData.pcbPartFloatPhase as number | undefined) ?? 0,
      floatStrength: (child.userData.pcbPartFloatStrength as number | undefined) ?? 1,
      mesh: child,
      offset,
      origin,
      originRotation: child.rotation.clone(),
      revealOrder: (child.userData.pcbPartRevealOrder as number | undefined) ?? 1,
      spin,
    });
  });

  return parts;
}

function collectBaseBoard(
  model: THREE.Group,
  originKey: "pcbBoardOrigin" | "pcbBlankBoardOrigin",
  startOffsetKey?: "pcbBlankBoardStartOffset",
) {
  let board: BaseBoardPart | null = null;

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || board) {
      return;
    }

    const origin = child.userData[originKey] as THREE.Vector3 | undefined;
    if (!origin) {
      return;
    }

    const materials = (Array.isArray(child.material) ? child.material : [child.material]).map((material) => ({
      color: material instanceof THREE.MeshStandardMaterial ? material.color.clone() : null,
      material,
      opacity: material.opacity,
    }));
    const startOffset = startOffsetKey
      ? ((child.userData[startOffsetKey] as THREE.Vector3 | undefined) ?? new THREE.Vector3())
      : new THREE.Vector3();

    board = {
      materials,
      mesh: child,
      origin,
      rotation: child.rotation.clone(),
      startOffset,
    };
  });

  return board;
}

function collectBoardLogo(model: THREE.Group) {
  let logo: BoardLogoPart | null = null;

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || logo) return;
    const origin = child.userData.pcbLogoOrigin as THREE.Vector3 | undefined;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    if (!origin || !(material instanceof THREE.MeshBasicMaterial)) return;

    logo = {
      heroOffset:
        (child.userData.pcbHeroLogoOffset as THREE.Vector3 | undefined) ?? new THREE.Vector3(),
      material,
      mesh: child,
      origin,
      rotation: child.rotation.clone(),
    };
  });

  return logo;
}

function syncBoardLogo(logo: BoardLogoPart, board: BaseBoardPart) {
  logo.mesh.position.set(
    logo.origin.x + board.mesh.position.x - board.origin.x,
    logo.origin.y + board.mesh.position.y - board.origin.y,
    logo.origin.z + board.mesh.position.z - board.origin.z,
  );
  logo.mesh.rotation.set(
    logo.rotation.x + board.mesh.rotation.x - board.rotation.x,
    logo.rotation.y + board.mesh.rotation.y - board.rotation.y,
    logo.rotation.z + board.mesh.rotation.z - board.rotation.z,
  );
}

function collectBoardDetail(model: THREE.Group) {
  let detail: BoardDetailPart | null = null;

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || detail) return;
    const origin = child.userData.pcbDetailOrigin as THREE.Vector3 | undefined;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    if (!origin || !(material instanceof THREE.MeshStandardMaterial)) return;

    detail = {
      material,
      mesh: child,
      origin,
      rotation: child.rotation.clone(),
    };
  });

  return detail;
}

function createBoardFlexState(mesh: THREE.Mesh | null): BoardFlexState | null {
  if (!mesh) return null;
  const attribute = mesh.geometry.getAttribute("position");
  if (!(attribute instanceof THREE.BufferAttribute)) return null;

  mesh.geometry.computeBoundingBox();
  const bounds = mesh.geometry.boundingBox;
  const size = bounds?.getSize(new THREE.Vector3()) ?? new THREE.Vector3(1, 0, 0);
  const axis = size.z > size.x ? "z" : "x";
  const halfExtent = bounds
    ? Math.max(
        Math.abs(axis === "x" ? bounds.min.x : bounds.min.z),
        Math.abs(axis === "x" ? bounds.max.x : bounds.max.z),
        0.001,
      )
    : 1;

  return {
    attribute,
    axis,
    halfExtent,
    lastAmount: Number.NaN,
    originalPositions: Float32Array.from(attribute.array as ArrayLike<number>),
  };
}

function applyBoardFlex(state: BoardFlexState | null, amount: number) {
  if (!state || Math.abs(state.lastAmount - amount) < 0.00008) return;

  for (let index = 0; index < state.attribute.count; index += 1) {
    const offset = index * 3;
    const coordinate = state.originalPositions[offset + (state.axis === "x" ? 0 : 2)];
    const normalizedCoordinate = THREE.MathUtils.clamp(coordinate / state.halfExtent, -1, 1);
    const curve = normalizedCoordinate * normalizedCoordinate;
    state.attribute.setY(index, state.originalPositions[offset + 1] - amount * curve);
  }

  state.attribute.needsUpdate = true;
  state.lastAmount = amount;
}

function setBoardOpacity(board: BaseBoardPart, opacity: number) {
  board.mesh.visible = opacity > 0.005;
  for (const state of board.materials) {
    state.material.opacity = state.opacity * opacity;
    state.material.depthWrite = opacity > 0.98;
  }
}

function setBoardColor(board: BaseBoardPart, from: THREE.Color, to: THREE.Color, amount: number) {
  for (const state of board.materials) {
    if (state.material instanceof THREE.MeshStandardMaterial && state.color) {
      state.material.color.copy(from).lerp(to, amount);
    }
  }
}

function collectModelMaterialStates(model: THREE.Group) {
  const states = new Map<string, ModelMaterialState>();

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || states.has(material.uuid)) continue;
      states.set(material.uuid, {
        emissive: material.emissive.clone(),
        emissiveIntensity: material.emissiveIntensity,
        material,
      });
    }
  });

  return [...states.values()];
}

function normalizeProblemAsset(
  source: THREE.Group,
  targetSize: number,
  materialOptions: THREE.MeshStandardMaterialParameters,
) {
  const clone = source.clone(true);
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
    ...materialOptions,
  });

  clone.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = material;
    child.frustumCulled = false;
  });

  clone.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(clone);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  clone.position.sub(center);

  const group = new THREE.Group();
  group.add(clone);
  group.scale.setScalar(targetSize / maxDimension);
  return { group, material };
}

const BEAKER_PROFILE = [
  new THREE.Vector2(0.478, 0.5),
  new THREE.Vector2(0.472, 0.43),
  new THREE.Vector2(0.44, -0.4),
  new THREE.Vector2(0.418, -0.468),
  new THREE.Vector2(0.374, -0.505),
  new THREE.Vector2(0.338, -0.474),
  new THREE.Vector2(0.354, -0.41),
  new THREE.Vector2(0.424, 0.43),
  new THREE.Vector2(0.43, 0.492),
  new THREE.Vector2(0.478, 0.5),
];

const GLASS_VERTEX_SHADER = `
  varying float vHeight;
  varying vec3 vNormalView;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vHeight = position.y;
    vNormalView = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const GLASS_FRAGMENT_SHADER = `
  uniform float uLayerOpacity;
  uniform float uVisibility;
  varying float vHeight;
  varying vec3 vNormalView;
  varying vec3 vViewDirection;

  void main() {
    float facing = abs(dot(normalize(vNormalView), normalize(vViewDirection)));
    float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 2.35);
    float topEdge = smoothstep(0.39, 0.5, vHeight);
    float bottomEdge = 1.0 - smoothstep(-0.49, -0.37, vHeight);
    float edgeLight = topEdge * 0.16 + bottomEdge * 0.11;
    float alpha = (0.018 + fresnel * 0.42 + edgeLight) * uLayerOpacity * uVisibility;
    vec3 tint = mix(vec3(0.68, 0.84, 0.77), vec3(0.97, 1.0, 0.985), fresnel + edgeLight);
    gl_FragColor = vec4(tint, alpha);
  }
`;

function BeakerGlass({
  cycleOriginRef,
  scrollProgress,
}: {
  cycleOriginRef: React.RefObject<number | null>;
  scrollProgress?: number;
}) {
  const rimMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const baseMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const frontUniforms = useMemo(
    () => ({
      uLayerOpacity: { value: 0.88 },
      uVisibility: { value: 0 },
    }),
    [],
  );
  const backUniforms = useMemo(
    () => ({
      uLayerOpacity: { value: 0.34 },
      uVisibility: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const processTime = clock.elapsedTime - (cycleOriginRef.current ?? clock.elapsedTime);
    const timeline = getTimelineState(processTime, getStoryProcessPhase(scrollProgress));
    frontUniforms.uVisibility.value = timeline.beakerAmount;
    backUniforms.uVisibility.value = timeline.beakerAmount;
    if (rimMaterialRef.current) rimMaterialRef.current.opacity = timeline.beakerAmount * 0.34;
    if (baseMaterialRef.current) baseMaterialRef.current.opacity = timeline.beakerAmount * 0.18;
  });

  return (
    <>
      <mesh renderOrder={4}>
        <latheGeometry args={[BEAKER_PROFILE, 96]} />
        <shaderMaterial
          depthWrite={false}
          fragmentShader={GLASS_FRAGMENT_SHADER}
          side={THREE.BackSide}
          toneMapped={false}
          transparent
          uniforms={backUniforms}
          vertexShader={GLASS_VERTEX_SHADER}
        />
      </mesh>
      <mesh renderOrder={9}>
        <latheGeometry args={[BEAKER_PROFILE, 96]} />
        <shaderMaterial
          depthWrite={false}
          fragmentShader={GLASS_FRAGMENT_SHADER}
          side={THREE.FrontSide}
          toneMapped={false}
          transparent
          uniforms={frontUniforms}
          vertexShader={GLASS_VERTEX_SHADER}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={10}>
        <torusGeometry args={[0.459, 0.009, 10, 96]} />
        <meshBasicMaterial ref={rimMaterialRef} color="#c6e1d6" depthWrite={false} transparent />
      </mesh>
      <mesh position={[0, -0.493, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={8}>
        <torusGeometry args={[0.374, 0.009, 10, 80]} />
        <meshBasicMaterial ref={baseMaterialRef} color="#a9cfc0" depthWrite={false} transparent />
      </mesh>
    </>
  );
}

const WATER_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uImpact;
  varying float vRadius;
  varying float vWave;

  void main() {
    vec3 displaced = position;
    float radius = length(position.xy);
    float edgeFade = 1.0 - smoothstep(0.3, 0.405, radius);
    float ambientWave = sin(position.x * 15.0 + uTime * 2.1) * 0.006;
    ambientWave += cos(position.y * 18.0 - uTime * 1.7) * 0.004;
    ambientWave *= 0.42 + edgeFade * 0.58;
    float ripple = sin(radius * 43.0 - uTime * 6.0) * 0.019 * uImpact;
    ripple *= 1.0 - smoothstep(0.08, 0.405, radius);
    displaced.z += ambientWave + ripple;
    vRadius = radius;
    vWave = ambientWave + ripple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const WATER_FRAGMENT_SHADER = `
  uniform float uYellow;
  uniform float uVisibility;
  varying float vRadius;
  varying float vWave;

  void main() {
    vec3 clearColor = vec3(0.64, 0.93, 0.83);
    vec3 processColor = vec3(0.83, 0.75, 0.38);
    vec3 color = mix(clearColor, processColor, uYellow);
    float surfaceEdge = smoothstep(0.31, 0.407, vRadius);
    color += abs(vWave) * 4.4 + surfaceEdge * 0.06;
    float alpha = (0.23 + surfaceEdge * 0.1 + abs(vWave) * 1.45) * uVisibility;
    gl_FragColor = vec4(color, alpha);
  }
`;

function FluidSurface({
  cycleOriginRef,
  scrollProgress,
}: {
  cycleOriginRef: React.RefObject<number | null>;
  scrollProgress?: number;
}) {
  const uniforms = useMemo(
    () => ({
      uImpact: { value: 0 },
      uTime: { value: 0 },
      uVisibility: { value: 0 },
      uYellow: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const processTime = clock.elapsedTime - (cycleOriginRef.current ?? clock.elapsedTime);
    const timeline = getTimelineState(processTime, getStoryProcessPhase(scrollProgress));
    uniforms.uTime.value = processTime;
    uniforms.uImpact.value = timeline.fluidImpactAmount;
    uniforms.uVisibility.value = timeline.beakerAmount;
    uniforms.uYellow.value = timeline.waterYellowAmount;
  });

  return (
    <mesh position={[0, 0.396, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
      <circleGeometry args={[0.408, 96]} />
      <shaderMaterial
        depthWrite={false}
        fragmentShader={WATER_FRAGMENT_SHADER}
        side={THREE.DoubleSide}
        transparent
        uniforms={uniforms}
        vertexShader={WATER_VERTEX_SHADER}
      />
    </mesh>
  );
}

function FluidRipple({
  cycleOriginRef,
  delay,
  scrollProgress,
}: {
  cycleOriginRef: React.RefObject<number | null>;
  delay: number;
  scrollProgress?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const processTime = clock.elapsedTime - (cycleOriginRef.current ?? clock.elapsedTime);
    const timeline = getTimelineState(processTime, getStoryProcessPhase(scrollProgress));
    const start = 0.285 + delay * 0.022;
    const progress = clamp01((timeline.phase - start) / 0.105);
    const envelope = Math.sin(progress * Math.PI) * timeline.beakerAmount;

    if (meshRef.current) {
      const scale = 0.4 + progress * 0.66;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.visible = envelope > 0.005;
    }

    if (materialRef.current) {
      materialRef.current.opacity = envelope * 0.48;
      materialRef.current.color.copy(CLEAR_WATER).lerp(PROCESS_WATER, timeline.waterYellowAmount);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.401, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      renderOrder={7}
    >
      <torusGeometry args={[0.36, 0.005, 8, 80]} />
      <meshBasicMaterial ref={materialRef} color="#c9ffeb" depthWrite={false} transparent />
    </mesh>
  );
}

function LabBeakerStage({
  cycleOriginRef,
  pointerRef,
  scrollProgress,
}: {
  cycleOriginRef: React.RefObject<number | null>;
  pointerRef: React.RefObject<PointerState>;
  scrollProgress?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const waterMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const viewport = useThree((state) => state.viewport);

  useFrame(({ clock, size }, delta) => {
    const processTime = clock.elapsedTime - (cycleOriginRef.current ?? clock.elapsedTime);
    const timeline = getTimelineState(processTime, getStoryProcessPhase(scrollProgress));
    const layout = getModelLayout(viewport.width, viewport.height, size.height <= 520 && size.width > size.height);
    const storyTransform = getStoryBoardTransform(scrollProgress, layout.isCompact);
    const productProgress = getStoryProductProgress(scrollProgress);
    const dissolutionShot = getProductStepWeight(productProgress, 5);
    const pointer = pointerRef.current;

    if (groupRef.current) {
      const targetY = getBeakerY(timeline.beakerAmount, viewport.height, layout.y);
      groupRef.current.visible = timeline.beakerAmount > 0.005;
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, storyTransform.x, 7, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 8, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, 0.08, 7, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -pointer.y * 0.025, 6, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.045, 6, delta);
      const beakerScale = THREE.MathUtils.damp(
        groupRef.current.scale.x,
        layout.beakerScale * THREE.MathUtils.lerp(storyTransform.scale, 0.62, dissolutionShot),
        8,
        delta,
      );
      groupRef.current.scale.setScalar(beakerScale);
    }

    if (waterMaterialRef.current) {
      waterMaterialRef.current.color.copy(CLEAR_WATER).lerp(PROCESS_WATER, timeline.waterYellowAmount);
      waterMaterialRef.current.opacity =
        timeline.beakerAmount * (0.24 + timeline.waterYellowAmount * 0.17);
    }
  });

  return (
    <group ref={groupRef} position={[0, -6, 0.08]} scale={[3.8, 3.8, 3.8]}>
      <BeakerGlass cycleOriginRef={cycleOriginRef} scrollProgress={scrollProgress} />
      <mesh position={[0, -0.004, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.408, 0.338, 0.8, 96, 1, true]} />
        <meshPhysicalMaterial
          ref={waterMaterialRef}
          color="#bdebdc"
          clearcoat={0.22}
          clearcoatRoughness={0.2}
          depthWrite={false}
          ior={1.33}
          opacity={0}
          roughness={0.1}
          side={THREE.DoubleSide}
          thickness={0}
          transmission={0}
          transparent
        />
      </mesh>
      <FluidSurface cycleOriginRef={cycleOriginRef} scrollProgress={scrollProgress} />
      <FluidRipple cycleOriginRef={cycleOriginRef} delay={0} scrollProgress={scrollProgress} />
      <FluidRipple cycleOriginRef={cycleOriginRef} delay={1} scrollProgress={scrollProgress} />
    </group>
  );
}

function ProblemSequenceStage({ scrollProgress }: { scrollProgress?: number }) {
  const containerRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const pileRef = useRef<THREE.Group>(null);
  const pileBoardsRef = useRef<THREE.InstancedMesh>(null);
  const pileChipsRef = useRef<THREE.InstancedMesh>(null);
  const pileContactsRef = useRef<THREE.InstancedMesh>(null);
  const containerGltf = useGLTF(CONTAINER_MODEL_PATH);
  const viewport = useThree((state) => state.viewport);
  const containerAsset = useMemo(
    () =>
      normalizeProblemAsset((containerGltf as { scene: THREE.Group }).scene, 3.15, {
        color: "#315449",
        emissive: "#102a20",
        emissiveIntensity: 0.08,
        metalness: 0.58,
        roughness: 0.42,
      }),
    [containerGltf],
  );
  const transform = useMemo(() => new THREE.Object3D(), []);
  const partOffset = useMemo(() => new THREE.Vector3(), []);
  const containerDoorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#517b6c",
        emissive: "#173b2d",
        emissiveIntensity: 0.16,
        metalness: 0.46,
        opacity: 0,
        roughness: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    [],
  );

  useEffect(() => {
    pileBoardsRef.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pileChipsRef.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pileContactsRef.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    return () => {
      containerAsset.material.dispose();
      containerDoorMaterial.dispose();
    };
  }, [containerAsset, containerDoorMaterial]);

  useFrame(({ clock, size }, delta) => {
    const problemProgress = getStoryProblemProgress(scrollProgress);
    const layout = getModelLayout(viewport.width, viewport.height, size.height <= 520 && size.width > size.height);
    const active = problemProgress !== undefined;
    const progress = problemProgress ?? 0;
    const horizontalTravel = layout.isCompact ? 0.58 : 1;

    if (containerRef.current) {
      const enter = smoothstep(-0.025, 0.04, progress);
      const shipping = smoothstep(0.17, 0.235, progress);
      const amount = active ? enter * (1 - smoothstep(0.205, 0.252, progress)) : 0;
      const doorOpen = active
        ? smoothstep(0.008, 0.05, progress) * (1 - smoothstep(0.155, 0.205, progress))
        : 0;
      const baseX = 1.08 * horizontalTravel;
      const targetX =
        baseX + THREE.MathUtils.lerp(2.9 * horizontalTravel, 0, enter) + shipping * 7.2 * horizontalTravel;
      containerRef.current.visible = amount > 0.005;
      containerRef.current.position.x = THREE.MathUtils.damp(containerRef.current.position.x, targetX, 9, delta);
      containerRef.current.position.y = THREE.MathUtils.damp(
        containerRef.current.position.y,
        layout.y + 0.04 + Math.sin(clock.elapsedTime * 1.1) * 0.02,
        8,
        delta,
      );
      containerRef.current.position.z = THREE.MathUtils.damp(containerRef.current.position.z, -0.18, 8, delta);
      containerRef.current.rotation.z = THREE.MathUtils.damp(
        containerRef.current.rotation.z,
        (1 - enter) * -0.08 + shipping * 0.035,
        8,
        delta,
      );
      const scale = THREE.MathUtils.damp(containerRef.current.scale.x, layout.scale * 0.58, 8, delta);
      containerRef.current.scale.setScalar(scale);
      containerAsset.material.opacity = amount;
      containerAsset.material.depthWrite = amount > 0.96;
      containerDoorMaterial.opacity = amount;
      containerDoorMaterial.depthWrite = amount > 0.96;
      if (leftDoorRef.current) {
        leftDoorRef.current.rotation.y = THREE.MathUtils.damp(
          leftDoorRef.current.rotation.y,
          Math.PI * 0.44 * doorOpen,
          10,
          delta,
        );
      }
      if (rightDoorRef.current) {
        rightDoorRef.current.rotation.y = THREE.MathUtils.damp(
          rightDoorRef.current.rotation.y,
          -Math.PI * 0.44 * doorOpen,
          10,
          delta,
        );
      }
    }

    const pileAmount = active
      ? smoothstep(0.17, 0.22, progress) * (1 - smoothstep(0.39, 0.485, progress))
      : 0;
    if (pileRef.current) {
      pileRef.current.visible = pileAmount > 0.005;
      pileRef.current.position.set(layout.isCompact ? 0 : -1.58, layout.y + 0.52, 0.18);
      pileRef.current.scale.setScalar(layout.scale * (layout.isCompact ? 0.76 : 0.9));
    }

    if (pileBoardsRef.current && pileChipsRef.current && pileContactsRef.current) {
      for (let index = 0; index < PROBLEM_PCB_COUNT; index += 1) {
        const start = 0.175 + index * 0.006;
        const impactAt = start + 0.078;
        const fall = smoothstep(start, impactAt, progress);
        const collision = clamp01((progress - impactAt) / 0.075);
        const appearance = smoothstep(start - 0.025, start + 0.015, progress);
        const exitTravel = smoothstep(0.385 + index * 0.0012, 0.475 + index * 0.0012, progress);
        const exit = 1 - smoothstep(0.41 + (PROBLEM_PCB_COUNT - index) * 0.0015, 0.49, progress);
        const amount = active ? appearance * exit : 0;
        const randomA = hash01(index * 2.17 + 0.4);
        const randomB = hash01(index * 3.11 + 2.6);
        const tower = index % PROBLEM_PILE_TOWER_COUNT;
        const layer = Math.floor(index / PROBLEM_PILE_TOWER_COUNT);
        const towerOffset = tower - 1;
        const targetX =
          towerOffset * 0.52 + (randomA - 0.5) * 0.16 + ((layer % 2) - 0.5) * 0.1;
        const targetY = -0.67 + layer * 0.085;
        const targetZ = towerOffset * 0.08 + (layer - 2.5) * 0.24 + (randomB - 0.5) * 0.16;
        const startX = (randomA - 0.5) * 2.2;
        const startY = viewport.height * 0.58 + index * 0.115;
        const startZ = (randomB - 0.5) * 1.45;
        const bounce = Math.abs(Math.sin(collision * Math.PI * 3)) * Math.exp(-4.2 * collision) * 0.13;
        const x =
          THREE.MathUtils.lerp(startX, targetX, fall) -
          exitTravel * (2.6 + randomA * 1.4 + tower * 0.32);
        const y = THREE.MathUtils.lerp(startY, targetY, fall) + bounce + exitTravel * (0.3 + randomB * 0.65);
        const z = THREE.MathUtils.lerp(startZ, targetZ, fall) + exitTravel * (randomB - 0.5) * 1.4;
        const boardScale = 0.46 * amount;
        const rotationX = THREE.MathUtils.lerp((randomB - 0.5) * 1.25, (randomA - 0.5) * 0.18, fall);
        const rotationY = THREE.MathUtils.lerp(randomA * Math.PI * 1.8, (randomB - 0.5) * 0.65, fall);
        const rotationZ = THREE.MathUtils.lerp((randomA - 0.5) * 1.5, (randomB - 0.5) * 0.24, fall);

        transform.position.set(x, y, z);
        transform.rotation.set(rotationX, rotationY, rotationZ);
        transform.scale.setScalar(boardScale);
        transform.updateMatrix();
        pileBoardsRef.current.setMatrixAt(index, transform.matrix);

        partOffset.set(-0.16, 0.075, 0.035).multiplyScalar(boardScale).applyEuler(transform.rotation);
        transform.position.set(x + partOffset.x, y + partOffset.y, z + partOffset.z);
        transform.scale.setScalar(boardScale);
        transform.updateMatrix();
        pileChipsRef.current.setMatrixAt(index, transform.matrix);

        partOffset.set(0.31, 0.055, -0.13).multiplyScalar(boardScale).applyEuler(transform.rotation);
        transform.position.set(x + partOffset.x, y + partOffset.y, z + partOffset.z);
        transform.scale.setScalar(boardScale);
        transform.updateMatrix();
        pileContactsRef.current.setMatrixAt(index, transform.matrix);
      }
      pileBoardsRef.current.instanceMatrix.needsUpdate = true;
      pileChipsRef.current.instanceMatrix.needsUpdate = true;
      pileContactsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={containerRef} visible={false}>
        <primitive object={containerAsset.group} rotation={[0, Math.PI / 2, 0]} />
        <mesh position={[-1.565, 0.02, 0]}>
          <boxGeometry args={[0.055, 0.72, 0.69]} />
          <meshStandardMaterial color="#06100b" emissive="#020705" emissiveIntensity={0.12} roughness={0.9} />
        </mesh>
        <group ref={leftDoorRef} position={[-1.54, 0.02, -0.35]}>
          <mesh position={[0, 0, 0.35]} material={containerDoorMaterial}>
            <boxGeometry args={[0.045, 0.76, 0.68]} />
          </mesh>
        </group>
        <group ref={rightDoorRef} position={[-1.54, 0.02, 0.35]}>
          <mesh position={[0, 0, -0.35]} material={containerDoorMaterial}>
            <boxGeometry args={[0.045, 0.76, 0.68]} />
          </mesh>
        </group>
      </group>
      <group ref={pileRef} visible={false}>
        <instancedMesh ref={pileBoardsRef} args={[undefined, undefined, PROBLEM_PCB_COUNT]} frustumCulled={false}>
          <boxGeometry args={[1.15, 0.075, 0.76]} />
          <meshStandardMaterial color="#0a6038" emissive="#0d7d48" emissiveIntensity={0.16} roughness={0.68} />
        </instancedMesh>
        <instancedMesh ref={pileChipsRef} args={[undefined, undefined, PROBLEM_PCB_COUNT]} frustumCulled={false}>
          <boxGeometry args={[0.3, 0.12, 0.24]} />
          <meshStandardMaterial color="#111713" metalness={0.24} roughness={0.52} />
        </instancedMesh>
        <instancedMesh ref={pileContactsRef} args={[undefined, undefined, PROBLEM_PCB_COUNT]} frustumCulled={false}>
          <boxGeometry args={[0.3, 0.08, 0.14]} />
          <meshStandardMaterial color="#b7b9ad" metalness={0.78} roughness={0.28} />
        </instancedMesh>
      </group>
    </>
  );
}

function PCBModel({
  cycleOriginRef,
  modelPath,
  onReady,
  pointerRef,
  scrollProgress,
}: {
  cycleOriginRef: React.RefObject<number | null>;
  modelPath: string;
  onReady?: () => void;
  pointerRef: React.RefObject<PointerState>;
  scrollProgress?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const logoOpacityRef = useRef(0);
  const gltf = useGLTF(modelPath);
  const logoTexture = useTexture(BOARD_LOGO_PATH);
  const viewport = useThree((state) => state.viewport);
  const model = useMemo(
    () => createOptimizedModel((gltf as { scene: THREE.Group }).scene, logoTexture),
    [gltf, logoTexture],
  );
  const animatedParts = useMemo(() => collectAnimatedParts(model), [model]);
  const modelMaterialStates = useMemo(() => collectModelMaterialStates(model), [model]);
  const originalBoard = useMemo(() => collectBaseBoard(model, "pcbBoardOrigin"), [model]);
  const boardFlexState = useMemo(() => createBoardFlexState(originalBoard?.mesh ?? null), [originalBoard]);
  const boardDetail = useMemo(() => collectBoardDetail(model), [model]);
  const detailFlexState = useMemo(() => createBoardFlexState(boardDetail?.mesh ?? null), [boardDetail]);
  const boardLogo = useMemo(() => collectBoardLogo(model), [model]);
  const blankBoard = useMemo(
    () => collectBaseBoard(model, "pcbBlankBoardOrigin", "pcbBlankBoardStartOffset"),
    [model],
  );

  useEffect(() => {
    onReady?.();
  }, [model, onReady]);

  useEffect(
    () => () => {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        geometries.add(child.geometry);
        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        childMaterials.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
    [model],
  );

  useFrame(({ clock, size }, delta) => {
    if (!groupRef.current) {
      return;
    }

    if (cycleOriginRef.current === null) cycleOriginRef.current = clock.elapsedTime;

    const processTime = clock.elapsedTime - cycleOriginRef.current;
    const timeline = getTimelineState(processTime, getStoryProcessPhase(scrollProgress));
    const productProgress = getStoryProductProgress(scrollProgress);
    const materialShot = getProductStepWeight(productProgress, 0);
    const layerShot = getProductStepWeight(productProgress, 1);
    const traceShot = getProductStepWeight(productProgress, 2);
    const assemblyShot = getProductStepWeight(productProgress, 3);
    const electronicsShot = getProductStepWeight(productProgress, 4);
    const productRoll =
      productProgress === undefined
        ? 0
        : sampleKeyframes(productProgress, [0.015, 0.09, -0.045, 0.055, -0.015, 0, 0, 0]);
    const shotPitchMotion =
      Math.sin(clock.elapsedTime * 0.42) *
      (materialShot * 0.018 + layerShot * 0.028 + traceShot * 0.012 + assemblyShot * 0.022 + electronicsShot * 0.018);
    const shotYawMotion =
      Math.cos(clock.elapsedTime * 0.31) *
      (materialShot * 0.045 + layerShot * 0.018 + traceShot * 0.034 + assemblyShot * 0.052 + electronicsShot * 0.026);
    const flexStrength = getProductBoardFlex(productProgress);
    const flexPulse = 0.78 + Math.sin(clock.elapsedTime * 1.05) * 0.22;
    const boardFlexAmount = boardFlexState ? boardFlexState.halfExtent * 0.18 * flexStrength * flexPulse : 0;
    applyBoardFlex(boardFlexState, boardFlexAmount);
    applyBoardFlex(detailFlexState, boardFlexAmount);
    const problemProgress = getStoryProblemProgress(scrollProgress);
    const cleanProductTransition =
      scrollProgress === undefined
        ? 0
        : smoothstep(STORY_PRODUCT_START - 0.014, STORY_PRODUCT_START + 0.004, scrollProgress);
    const collectionIsolation =
      problemProgress === undefined
        ? 0
        : smoothstep(0.145, 0.22, problemProgress) * (1 - smoothstep(0.41, 0.49, problemProgress));
    const problemBoardVisibility = 1 - collectionIsolation;
    const dataGlitch =
      problemProgress === undefined
        ? 0
        : smoothstep(0.52, 0.62, problemProgress) * (1 - smoothstep(0.76, 0.835, problemProgress));
    const glitchSeed = hash01(Math.floor(clock.elapsedTime * 22) + 18.4);
    const glitchOffset = (glitchSeed - 0.5) * 0.17 * dataGlitch;
    const glitchPulse = dataGlitch * (0.08 + Math.sin(clock.elapsedTime * 17) * 0.05);
    const layout = getModelLayout(viewport.width, viewport.height, size.height <= 520 && size.width > size.height);
    const storyTransform = getStoryBoardTransform(scrollProgress, layout.isCompact);
    const pointer = pointerRef.current;
    const interactionWeight = 1 - timeline.boardPitchAmount * 0.72;
    const idleYaw = Math.sin(clock.elapsedTime * 0.29) * 0.12;
    const idlePitch = Math.sin(clock.elapsedTime * 0.23) * 0.028;
    const pointerX = pointer.hasInput ? pointer.x : 0;
    const pointerY = pointer.hasInput ? pointer.y : 0;
    const targetRotationX =
      Math.PI * 0.5 * timeline.boardPitchAmount +
      storyTransform.pitch +
      shotPitchMotion +
      (-pointerY * 0.1 + idlePitch) * interactionWeight;
    const targetRotationY =
      -0.12 + storyTransform.yaw + shotYawMotion + (pointerX * 0.25 + idleYaw) * interactionWeight;
    const targetRotationZ =
      productRoll - pointerX * 0.025 * interactionWeight + glitchOffset * 0.45 + Math.sin(clock.elapsedTime * 0.36) * 0.012 * layerShot;
    const boardDipDistance = productProgress === undefined ? 0.72 : 1.16;
    const targetY =
      layout.y -
      timeline.boardDipAmount * boardDipDistance +
      Math.sin(clock.elapsedTime * 0.52) * 0.035 * interactionWeight +
      Math.sin(clock.elapsedTime * 29) * 0.035 * dataGlitch;
    const introZoom = scrollProgress === undefined ? 1 + (1 - smoothstep(0, 1, processTime / 2.8)) * 0.32 : 1;
    const targetScale =
      layout.scale *
      storyTransform.scale *
      introZoom *
      (1 + glitchOffset * 0.16 + Math.sin(clock.elapsedTime * 0.48) * (traceShot + electronicsShot) * 0.012);

    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotationX, 7, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotationY, 7, delta);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRotationZ, 7, delta);
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      layout.x + storyTransform.x + glitchOffset,
      7,
      delta,
    );
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 7, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, storyTransform.z, 7, delta);
    const dampedScale = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 7, delta);
    groupRef.current.scale.setScalar(dampedScale);

    for (const state of modelMaterialStates) {
      state.material.emissive.copy(state.emissive).lerp(DATA_ERROR_RED, glitchPulse);
      state.material.emissiveIntensity = state.emissiveIntensity + dataGlitch * (0.12 + glitchSeed * 0.25);
    }

    if (originalBoard) {
      originalBoard.mesh.position.copy(originalBoard.origin);
      originalBoard.mesh.rotation.copy(originalBoard.rotation);
      setBoardColor(
        originalBoard,
        ORGANIC_BOARD,
        TECHNICAL_BOARD,
        productProgress === undefined ? 1 - cleanProductTransition : smoothstep(0.07, 0.24, productProgress),
      );
      setBoardOpacity(originalBoard, timeline.originalBoardOpacity * problemBoardVisibility);
    }

    if (blankBoard) {
      const flight = timeline.blankBoardAmount;
      const inverseFlight = 1 - flight;
      const drift = Math.sin(clock.elapsedTime * 0.7) * blankBoard.startOffset.x * 0.18 * inverseFlight;
      blankBoard.mesh.position.set(
        blankBoard.origin.x + blankBoard.startOffset.x * inverseFlight + drift,
        blankBoard.origin.y + blankBoard.startOffset.y * inverseFlight,
        blankBoard.origin.z + blankBoard.startOffset.z * inverseFlight,
      );
      blankBoard.mesh.rotation.set(
        blankBoard.rotation.x - Math.PI * 0.42 * inverseFlight,
        blankBoard.rotation.y + Math.PI * 0.18 * inverseFlight,
        blankBoard.rotation.z + Math.sin(clock.elapsedTime * 0.6) * 0.05 * inverseFlight,
      );
      setBoardOpacity(blankBoard, timeline.blankBoardOpacity);
    }

    if (boardDetail) {
      const targetBoard =
        blankBoard && timeline.blankBoardOpacity > 0.01 ? blankBoard : originalBoard;
      const copperReveal = productProgress === undefined ? 1 : smoothstep(0.2, 0.31, productProgress);
      const structurePreview = productProgress === undefined ? 0 : layerShot * 0.36;
      const constructionOpacity =
        productProgress === undefined ? 1 - cleanProductTransition : Math.max(structurePreview, copperReveal);
      const targetOpacity =
        Math.max(timeline.originalBoardOpacity, timeline.blankBoardOpacity) * constructionOpacity * problemBoardVisibility;

      if (targetBoard) {
        boardDetail.mesh.position.set(
          boardDetail.origin.x + targetBoard.mesh.position.x - targetBoard.origin.x,
          boardDetail.origin.y + targetBoard.mesh.position.y - targetBoard.origin.y,
          boardDetail.origin.z + targetBoard.mesh.position.z - targetBoard.origin.z,
        );
        boardDetail.mesh.rotation.set(
          boardDetail.rotation.x + targetBoard.mesh.rotation.x - targetBoard.rotation.x,
          boardDetail.rotation.y + targetBoard.mesh.rotation.y - targetBoard.rotation.y,
          boardDetail.rotation.z + targetBoard.mesh.rotation.z - targetBoard.rotation.z,
        );
      }

      boardDetail.material.opacity = targetOpacity;
      boardDetail.material.depthWrite = targetOpacity > 0.98;
      boardDetail.material.color.copy(STRUCTURE_DETAIL).lerp(COPPER_DETAIL, copperReveal);
      boardDetail.material.emissive.copy(STRUCTURE_EMISSIVE).lerp(COPPER_EMISSIVE, copperReveal);
      boardDetail.material.emissiveIntensity = 0.16 + layerShot * 0.12 + traceShot * 0.48;
      boardDetail.mesh.visible = targetOpacity > 0.01;
    }

    if (boardLogo) {
      const targetBoard =
        blankBoard && timeline.blankBoardOpacity > 0.01 ? blankBoard : originalBoard;
      const logoVisibility =
        scrollProgress === undefined ? 1 : productProgress === undefined ? cleanProductTransition : 1;
      const targetLogoOpacity =
        Math.max(timeline.originalBoardOpacity, timeline.blankBoardOpacity) *
        logoVisibility *
        problemBoardVisibility;
      logoOpacityRef.current = THREE.MathUtils.damp(logoOpacityRef.current, targetLogoOpacity, 8, delta);

      if (targetBoard) {
        syncBoardLogo(boardLogo, targetBoard);
      }

      boardLogo.material.opacity = logoOpacityRef.current;
      boardLogo.mesh.visible = logoOpacityRef.current > 0.01;
    }

    const compactTravel = layout.isCompact ? 0.62 : 1;
    for (const part of animatedParts) {
      const amount = getPartSeparation(timeline.phase, part.delay);
      const travel = amount * compactTravel;
      const constructionReveal =
        productProgress === undefined
          ? 1 - cleanProductTransition
          : productProgress >= 0.56
            ? 1
          : smoothstep(0.17 + part.revealOrder * 0.11, 0.31 + part.revealOrder * 0.11, productProgress);
      const mainBoardVisibility = productProgress === undefined ? problemBoardVisibility : 1;
      const floatX = Math.sin(clock.elapsedTime * 0.68 + part.floatPhase) * part.floatStrength * amount;
      const floatY = Math.cos(clock.elapsedTime * 0.83 + part.floatPhase * 1.31) * part.floatStrength * amount;
      const floatZ = Math.sin(clock.elapsedTime * 0.57 + part.floatPhase * 0.77) * part.floatStrength * amount;

      part.mesh.position.set(
        part.origin.x + part.offset.x * travel + floatX,
        part.origin.y + part.offset.y * travel + floatY,
        part.origin.z + part.offset.z * travel + floatZ,
      );
      part.mesh.rotation.set(
        part.originRotation.x + part.spin.x * amount + floatY * 0.012,
        part.originRotation.y + part.spin.y * amount + floatX * 0.012,
        part.originRotation.z + part.spin.z * amount + floatZ * 0.012,
      );
      if (productProgress !== undefined && productProgress < 0.56) {
        const seatingLift =
          Math.sin(constructionReveal * Math.PI) * Math.abs(part.offset.y) * 0.16 * (traceShot + assemblyShot);
        part.mesh.position.y += seatingLift;
      }
      if (boardFlexState && originalBoard && boardFlexAmount > 0.00001) {
        const localCoordinate =
          boardFlexState.axis === "x"
            ? part.origin.x - originalBoard.origin.x
            : part.origin.z - originalBoard.origin.z;
        const normalizedCoordinate = THREE.MathUtils.clamp(
          localCoordinate / boardFlexState.halfExtent,
          -1,
          1,
        );
        const curve = normalizedCoordinate * normalizedCoordinate;
        const slope =
          (-2 * boardFlexAmount * localCoordinate) / (boardFlexState.halfExtent * boardFlexState.halfExtent);
        part.mesh.position.y -= boardFlexAmount * curve;
        if (boardFlexState.axis === "x") {
          part.mesh.rotation.z += Math.atan(slope);
        } else {
          part.mesh.rotation.x -= Math.atan(slope);
        }
      }
      const visibleScale = constructionReveal * mainBoardVisibility;
      part.mesh.scale.setScalar(visibleScale);
      part.mesh.visible = visibleScale > 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.36, 0]} rotation={[0, -0.12, 0]}>
      <primitive object={model} />
    </group>
  );
}

function PilotPCBModel({ modelPath }: { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelPath);
  const viewport = useThree((state) => state.viewport);
  const model = useMemo(() => createOptimizedModel((gltf as { scene: THREE.Group }).scene), [gltf]);

  useEffect(
    () => () => {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        geometries.add(child.geometry);
        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        childMaterials.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
    [model],
  );

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return;

    const scaleTarget = THREE.MathUtils.clamp(
      Math.min(viewport.width / 4.2, viewport.height / 3.8),
      0.86,
      1.3,
    );
    const targetRotationX = 0.08 - pointer.y * 0.16 + Math.sin(clock.elapsedTime * 0.42) * 0.035;
    const targetRotationY = clock.elapsedTime * 0.18 + pointer.x * 0.38;
    const targetRotationZ = -pointer.x * 0.035;
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotationX, 6, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotationY, 5, delta);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRotationZ, 6, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      0.22 + Math.sin(clock.elapsedTime * 0.7) * 0.07,
      5,
      delta,
    );
    const scale = THREE.MathUtils.damp(groupRef.current.scale.x, scaleTarget, 6, delta);
    groupRef.current.scale.setScalar(scale);

  });

  return (
    <group ref={groupRef} position={[0, 0.22, 0]} rotation={[0.08, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

function PilotSceneContents({ modelPath }: { modelPath: string }) {
  return (
    <>
      <CameraLookAt />
      <hemisphereLight args={["#ffffff", "#17211c", 0.62]} />
      <directionalLight position={[4, 6, 5]} intensity={1.12} color="#fffefb" />
      <directionalLight position={[-4, 2.5, -2]} intensity={0.48} color="#dfe8e2" />
      <pointLight position={[0, 2.4, 3.4]} intensity={0.24} color="#ffffff" distance={8} />
      <Suspense fallback={null}>
        <PilotPCBModel modelPath={modelPath} />
      </Suspense>
      <LocalStudioEnvironment intensity={0.22} />
    </>
  );
}

function FallbackBoard({ pointerRef }: { pointerRef: React.RefObject<PointerState> }) {
  const groupRef = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);

  useFrame(({ clock, size }, delta) => {
    if (!groupRef.current) {
      return;
    }

    const pointer = pointerRef.current;
    const layout = getModelLayout(viewport.width, viewport.height, size.height <= 520 && size.width > size.height);
    const autoTurn = Math.sin(clock.elapsedTime * 0.38) * 0.12;
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -pointer.y * 0.1, 7, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.24 + autoTurn, 7, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, layout.y, 7, delta);
    const scale = THREE.MathUtils.damp(groupRef.current.scale.x, layout.scale, 7, delta);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={[0, 0.36, 0]} rotation={[0, -0.15, 0]}>
      <mesh>
        <boxGeometry args={[2.2, 0.08, 3.2]} />
        <meshStandardMaterial color="#07542d" emissive="#118549" emissiveIntensity={0.14} roughness={0.72} />
      </mesh>
      {[-0.72, 0, 0.72].map((x, index) => (
        <mesh key={x} position={[x, 0.15, index % 2 === 0 ? -0.55 : 0.45]}>
          <boxGeometry args={[0.46, 0.22, 0.54]} />
          <meshStandardMaterial color="#101713" metalness={0.2} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("PCB model scene failed to load", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function SceneContents({
  modelPath,
  onReady,
  pointerRef,
  scrollProgress,
}: {
  modelPath: string;
  onReady?: () => void;
  pointerRef: React.RefObject<PointerState>;
  scrollProgress?: number;
}) {
  const cycleOriginRef = useRef<number | null>(null);

  return (
    <>
      <CameraLookAt />
      <hemisphereLight args={["#ffffff", "#26332d", 0.96]} />
      <directionalLight position={[4.5, 6.5, 5]} intensity={1.38} color="#fffdf8" />
      <directionalLight position={[-4, 3, -3]} intensity={0.78} color="#dceae2" />
      <directionalLight position={[0, -1, 5]} intensity={0.58} color="#ffffff" />
      <pointLight position={[2, 2.5, 4]} intensity={0.34} color="#effff4" distance={9} />
      {scrollProgress !== undefined ? (
        <Suspense fallback={null}>
          <ProblemSequenceStage scrollProgress={scrollProgress} />
        </Suspense>
      ) : null}
      <Suspense fallback={<FallbackBoard pointerRef={pointerRef} />}>
        <LabBeakerStage
          cycleOriginRef={cycleOriginRef}
          pointerRef={pointerRef}
          scrollProgress={scrollProgress}
        />
        <SceneErrorBoundary fallback={<FallbackBoard pointerRef={pointerRef} />}>
          <PCBModel
            cycleOriginRef={cycleOriginRef}
            modelPath={modelPath}
            onReady={onReady}
            pointerRef={pointerRef}
            scrollProgress={scrollProgress}
          />
        </SceneErrorBoundary>
      </Suspense>
      <LocalStudioEnvironment intensity={0.32} />
    </>
  );
}

export function InteractivePCBModelScene({
  modelPath = DEFAULT_MODEL_PATH,
  onReady,
  scrollProgress,
}: InteractivePCBModelSceneProps) {
  const pointerRef = useWindowPointer();
  const settings = useAdaptiveSceneSettings("full");

  return (
    <Canvas
      camera={{ position: [0, 5.8, 6.4], fov: 38, near: 0.1, far: 90 }}
      dpr={settings.dpr}
      frameloop={settings.maxFps < 60 ? "demand" : "always"}
      gl={{ alpha: true, antialias: settings.antialias, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
      }}
      shadows={false}
    >
      <AdaptiveFrameLoop maxFps={settings.maxFps} />
      <SceneContents modelPath={modelPath} onReady={onReady} pointerRef={pointerRef} scrollProgress={scrollProgress} />
    </Canvas>
  );
}

export function PilotPCBScene({
  modelPath = DEFAULT_MODEL_PATH,
}: {
  modelPath?: string;
  accentColor?: string;
}) {
  const settings = useAdaptiveSceneSettings("pilot");

  return (
    <Canvas
      camera={{ position: [0, 5.35, 6.1], fov: 36, near: 0.1, far: 70 }}
      dpr={settings.dpr}
      frameloop={settings.maxFps < 60 ? "demand" : "always"}
      gl={{ alpha: true, antialias: settings.antialias, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.82;
      }}
      shadows={false}
      style={{ height: "100%", width: "100%" }}
    >
      <AdaptiveFrameLoop maxFps={settings.maxFps} />
      <PilotSceneContents modelPath={modelPath} />
    </Canvas>
  );
}

useGLTF.preload(DEFAULT_MODEL_PATH);
useTexture.preload(BOARD_LOGO_PATH);

if (typeof window !== "undefined") {
  const hints = navigator as NavigatorPerformanceHints;
  const effectiveType = hints.connection?.effectiveType ?? "";
  const allowProblemAssetPrefetch =
    window.innerWidth > 1024 &&
    !hints.connection?.saveData &&
    !/(^|-)2g|3g/.test(effectiveType) &&
    (navigator.hardwareConcurrency ?? 8) > 4;
  const preloadProblemAssets = () => {
    useGLTF.preload(CONTAINER_MODEL_PATH);
  };

  if (allowProblemAssetPrefetch) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preloadProblemAssets, { timeout: 7000 });
    } else {
      window.setTimeout(preloadProblemAssets, 4500);
    }
  }
}
