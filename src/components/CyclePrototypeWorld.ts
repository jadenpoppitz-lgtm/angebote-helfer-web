import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  getCycleRouteEnvelope,
  getCycleRoutePhase,
  getCycleRouteTravelProgress,
  getCycleSegmentProgress,
  getCycleWindowEnvelope,
} from "@/components/cycleAnimation";
import { selectCycleRenderProfile } from "@/components/cycleRenderProfile";
import type { GraphPoint } from "@/pages/Landing";

export type CycleWorldScreenPoint = {
  x: number;
  y: number;
  visible: boolean;
};

export type CycleWorldScreenPoints = Record<GraphPoint, CycleWorldScreenPoint>;

export const cycleRouteIds = [
  "product-outbound",
  "customer-return",
  "routing-disassembly",
  "pcb-to-smelter",
  "pcb-sale",
  "direct-pcb",
  "process-solution",
  "recovered-material",
  "material-return",
] as const;

export type CycleRouteId = (typeof cycleRouteIds)[number];
export type CycleWorldRouteScreenPoints = Record<CycleRouteId, CycleWorldScreenPoint>;

export type CycleWorldRuntime = {
  dispose: () => void;
  setHighlighted: (point: GraphPoint) => void;
  setPointer: (x: number, y: number) => void;
};

type CycleWorldOptions = {
  reducedMotion: boolean;
  onFrame: (points: CycleWorldScreenPoints, routes?: CycleWorldRouteScreenPoints) => void;
};

type MaterialSet = ReturnType<typeof createMaterials>;

type RouteRuntime = {
  arrow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  core: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  curve: THREE.Curve<THREE.Vector3>;
  delay: number;
  duration: number;
  glow: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  id: CycleRouteId;
  labelT: number;
  packet: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  points: GraphPoint[];
  travelEnd: number;
};

const nodeOrder: GraphPoint[] = ["oem", "customer", "consulting", "disassembly", "smelter", "materials"];

const nodePositions: Record<GraphPoint, THREE.Vector3Tuple> = {
  oem: [-5.65, 0.2, 0.7],
  customer: [-3.25, 0.2, -3.05],
  consulting: [0, 0.2, 0.7],
  disassembly: [3.25, 0.2, -3.05],
  smelter: [5.65, 0.2, 0.7],
  materials: [0, 0.2, 3.9],
};

const routeSpecs: Array<{
  color: number;
  control: THREE.Vector3Tuple;
  delay: number;
  duration: number;
  end: THREE.Vector3Tuple;
  id: CycleRouteId;
  labelT: number;
  packetKind: "material" | "product" | "signal";
  points: GraphPoint[];
  start: THREE.Vector3Tuple;
}> = [
  {
    id: "product-outbound",
    labelT: 0.5,
    packetKind: "product",
    start: [-5.3, 0.22, 0.08],
    control: [-4.75, 0.22, -2.15],
    end: [-3.62, 0.22, -2.58],
    color: 0x43d78c,
    duration: 5.8,
    delay: 0,
    points: ["oem", "customer"],
  },
  {
    id: "customer-return",
    labelT: 0.72,
    packetKind: "product",
    start: [-2.72, 0.22, -2.58],
    control: [-1.66, 0.22, -1.32],
    end: [-0.58, 0.22, 0.08],
    color: 0x43d78c,
    duration: 6.2,
    delay: 0.4,
    points: ["customer", "consulting"],
  },
  {
    id: "routing-disassembly",
    labelT: 0.28,
    packetKind: "product",
    start: [0.58, 0.22, 0.08],
    control: [1.68, 0.22, -1.42],
    end: [2.72, 0.22, -2.58],
    color: 0x70e4bd,
    duration: 5.9,
    delay: 0.8,
    points: ["consulting", "disassembly"],
  },
  {
    id: "pcb-to-smelter",
    labelT: 0.5,
    packetKind: "product",
    start: [3.72, 0.22, -2.58],
    control: [5.42, 0.22, -2.02],
    end: [5.42, 0.22, 0.02],
    color: 0x70e4bd,
    duration: 6.4,
    delay: 1.2,
    points: ["disassembly", "smelter"],
  },
  {
    id: "pcb-sale",
    labelT: 0.5,
    packetKind: "signal",
    start: [-0.7, 0.24, 0.61],
    control: [-2.92, 0.24, 0.61],
    end: [-4.98, 0.24, 0.61],
    color: 0xd9a25b,
    duration: 6.8,
    delay: 0.2,
    points: ["consulting", "oem"],
  },
  {
    id: "direct-pcb",
    labelT: 0.52,
    packetKind: "product",
    start: [0.7, 0.24, 0.61],
    control: [2.94, 0.24, 0.61],
    end: [4.98, 0.24, 0.61],
    color: 0x43d78c,
    duration: 6,
    delay: 1.1,
    points: ["consulting", "smelter"],
  },
  {
    id: "process-solution",
    labelT: 0.48,
    packetKind: "signal",
    start: [0.7, 0.24, 1.16],
    control: [2.94, 0.24, 1.16],
    end: [4.98, 0.24, 1.16],
    color: 0xd9a25b,
    duration: 6.6,
    delay: 1.7,
    points: ["consulting", "smelter"],
  },
  {
    id: "recovered-material",
    labelT: 0.48,
    packetKind: "material",
    start: [5.32, 0.22, 1.38],
    control: [3.62, 0.22, 4.02],
    end: [0.72, 0.22, 3.9],
    color: 0xd8c47e,
    duration: 7,
    delay: 2.1,
    points: ["smelter", "materials"],
  },
  {
    id: "material-return",
    labelT: 0.5,
    packetKind: "material",
    start: [-0.72, 0.22, 3.9],
    control: [-3.82, 0.22, 4.08],
    end: [-5.38, 0.22, 1.38],
    color: 0xd8c47e,
    duration: 7.4,
    delay: 0.9,
    points: ["materials", "oem"],
  },
];

const createMaterials = () => ({
  graphite: new THREE.MeshStandardMaterial({ color: 0x111b18, metalness: 0.78, roughness: 0.34 }),
  graphiteSoft: new THREE.MeshStandardMaterial({ color: 0x273832, metalness: 0.62, roughness: 0.46 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x86928d, metalness: 0.9, roughness: 0.28 }),
  steelDark: new THREE.MeshStandardMaterial({ color: 0x3c4844, metalness: 0.88, roughness: 0.32 }),
  shell: new THREE.MeshStandardMaterial({ color: 0xbfc9c3, metalness: 0.38, roughness: 0.48 }),
  oemShell: new THREE.MeshStandardMaterial({ color: 0x5f746c, metalness: 0.58, roughness: 0.42 }),
  smelterShell: new THREE.MeshStandardMaterial({ color: 0x283531, metalness: 0.78, roughness: 0.38 }),
  cardboard: new THREE.MeshStandardMaterial({ color: 0xb78652, metalness: 0.04, roughness: 0.84 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc59b5d, metalness: 0.76, roughness: 0.3 }),
  emerald: new THREE.MeshStandardMaterial({
    color: 0x176747,
    emissive: 0x18b86f,
    emissiveIntensity: 0.28,
    metalness: 0.58,
    roughness: 0.32,
  }),
  emeraldGlow: new THREE.MeshBasicMaterial({ color: 0x65efad, toneMapped: false }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87543, metalness: 0.82, roughness: 0.3 }),
  amber: new THREE.MeshStandardMaterial({
    color: 0xd68535,
    emissive: 0xff6f19,
    emissiveIntensity: 1.25,
    metalness: 0.24,
    roughness: 0.34,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x9ce9c8,
    metalness: 0.1,
    roughness: 0.14,
    transmission: 0.58,
    transparent: true,
    opacity: 0.72,
    thickness: 0.4,
  }),
  black: new THREE.MeshStandardMaterial({ color: 0x020605, metalness: 0.18, roughness: 0.72 }),
});

const setShadow = <T extends THREE.Mesh>(mesh: T, receive = true) => {
  mesh.castShadow = true;
  mesh.receiveShadow = receive;
  return mesh;
};

const addBox = (
  parent: THREE.Object3D,
  size: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
  material: THREE.Material,
  rotation: THREE.Vector3Tuple = [0, 0, 0],
) => {
  const bevel = Math.max(0.012, Math.min(...size) * 0.08);
  const mesh = setShadow(new THREE.Mesh(new RoundedBoxGeometry(...size, 2, bevel), material));
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
};

const addCylinder = (
  parent: THREE.Object3D,
  radius: number,
  height: number,
  position: THREE.Vector3Tuple,
  material: THREE.Material,
  radialSegments = 16,
  rotation: THREE.Vector3Tuple = [0, 0, 0],
) => {
  const mesh = setShadow(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material));
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
};

const addSphere = (
  parent: THREE.Object3D,
  radius: number,
  position: THREE.Vector3Tuple,
  material: THREE.Material,
) => {
  const mesh = setShadow(new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), material));
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const addBeam = (
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) => {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const mesh = setShadow(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 12), material));
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  parent.add(mesh);
  return mesh;
};

const addStationBase = (group: THREE.Group, materials: MaterialSet) => {
  const base = setShadow(new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.18, 0.18, 8), materials.graphiteSoft));
  base.scale.set(1.18, 1, 0.88);
  base.position.y = 0.09;
  group.add(base);

  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.025, 6, 8), materials.emerald);
  trim.rotation.x = Math.PI / 2;
  trim.scale.set(1.24, 0.9, 1);
  trim.position.y = 0.19;
  group.add(trim);
};

const createLeafEmblem = (materials: MaterialSet) => {
  const emblem = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.62);
  shape.bezierCurveTo(0.58, -0.38, 0.67, 0.28, 0, 0.72);
  shape.bezierCurveTo(-0.67, 0.28, -0.58, -0.38, 0, -0.62);

  const leaf = setShadow(new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), materials.emerald), false);
  emblem.add(leaf);
  addBeam(emblem, new THREE.Vector3(0, -0.52, 0.025), new THREE.Vector3(0, 0.52, 0.025), 0.022, materials.shell);
  addBeam(emblem, new THREE.Vector3(0, 0.08, 0.025), new THREE.Vector3(0.29, 0.32, 0.025), 0.016, materials.shell);
  addBeam(emblem, new THREE.Vector3(0, -0.12, 0.025), new THREE.Vector3(-0.3, 0.12, 0.025), 0.016, materials.shell);
  return emblem;
};

const createRouteArrowGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0, 0, 0.38, -0.27, 0, -0.18, -0.075, 0, -0.08,
        0, 0, 0.38, -0.075, 0, -0.08, 0.075, 0, -0.08,
        0, 0, 0.38, 0.075, 0, -0.08, 0.27, 0, -0.18,
      ],
      3,
    ),
  );
  geometry.computeVertexNormals();
  return geometry;
};

const createReturnEmblem = (materials: MaterialSet) => {
  const emblem = new THREE.Group();
  const sweep = new THREE.Group();
  emblem.add(sweep);
  const iconMaterial = materials.emeraldGlow.clone();
  iconMaterial.depthTest = true;
  iconMaterial.depthWrite = false;
  iconMaterial.transparent = true;

  const returnArc = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 36, Math.PI * 1.52), iconMaterial);
  returnArc.rotation.z = 0.28;
  returnArc.position.y = 0.025;
  returnArc.renderOrder = 30;
  sweep.add(returnArc);

  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0.225, -0.125);
  arrowShape.lineTo(0.035, -0.205);
  arrowShape.lineTo(0.085, -0.02);
  arrowShape.closePath();
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), iconMaterial);
  arrow.position.z = 0.014;
  arrow.renderOrder = 30;
  sweep.add(arrow);

  const parcel = addBox(emblem, [0.17, 0.14, 0.022], [0, -0.035, 0.008], materials.brass);
  parcel.renderOrder = 29;
  const parcelBand = addBox(emblem, [0.035, 0.145, 0.026], [0, -0.035, 0.022], iconMaterial);
  parcelBand.renderOrder = 30;
  emblem.userData.returnSweep = sweep;
  return emblem;
};

const addFurnaceArch = (
  parent: THREE.Object3D,
  width: number,
  height: number,
  position: THREE.Vector3Tuple,
  material: THREE.Material,
) => {
  const shape = new THREE.Shape();
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  shape.moveTo(-halfWidth, -halfHeight);
  shape.lineTo(halfWidth, -halfHeight);
  shape.lineTo(halfWidth, 0.03);
  shape.bezierCurveTo(halfWidth, halfHeight * 0.72, halfWidth * 0.48, halfHeight, 0, halfHeight);
  shape.bezierCurveTo(-halfWidth * 0.48, halfHeight, -halfWidth, halfHeight * 0.72, -halfWidth, 0.03);
  shape.closePath();
  const mesh = setShadow(new THREE.Mesh(new THREE.ShapeGeometry(shape), material), false);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const addModelSlot = (
  group: THREE.Group,
  key: string,
  position: THREE.Vector3Tuple = [0, 0, 0],
  rotation: THREE.Vector3Tuple = [0, 0, 0],
) => {
  const slot = new THREE.Group();
  slot.position.set(...position);
  slot.rotation.set(...rotation);
  group.add(slot);
  group.userData[key] = slot;
  return slot;
};

const prepareModel = (
  model: THREE.Object3D,
  maxDimension: number,
  material?: THREE.Material,
  rotation: THREE.Vector3Tuple = [0, 0, 0],
) => {
  model.position.set(0, 0, 0);
  model.rotation.set(...rotation);
  model.scale.setScalar(1);
  model.traverse((object) => {
    if (object instanceof THREE.Line) {
      object.visible = false;
      return;
    }
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (material) object.material = material;
  });

  model.updateMatrixWorld(true);
  const initialBounds = new THREE.Box3().setFromObject(model);
  const initialSize = initialBounds.getSize(new THREE.Vector3());
  const largestDimension = Math.max(initialSize.x, initialSize.y, initialSize.z, 0.001);
  model.scale.setScalar(maxDimension / largestDimension);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
  model.updateMatrixWorld(true);
  return model;
};

const disposeObjectResources = (root: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return;
    geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
};

const createOemStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [1.55, 0.7, 0.82], [0, 0.6, -0.12], materials.oemShell);
  addBox(group, [1.64, 0.12, 0.92], [0, 1.01, -0.12], materials.steelDark);
  addBox(group, [1.48, 0.08, 0.5], [0, 0.25, 0.36], materials.steelDark);
  const door = addBox(group, [0.58, 0.46, 0.045], [0.16, 0.51, 0.325], materials.graphite);
  const statusPanel = addBox(group, [0.24, 0.16, 0.04], [0.43, 0.67, 0.33], materials.emerald);
  [-0.56, 0.56].forEach((x) => addBox(group, [0.23, 0.2, 0.035], [x, 0.72, 0.325], materials.glass));
  addCylinder(group, 0.1, 0.58, [0.5, 1.36, -0.27], materials.steelDark, 18);
  addCylinder(group, 0.14, 0.07, [0.5, 1.68, -0.27], materials.brass, 18);

  const shipment = new THREE.Group();
  shipment.position.set(-0.68, 0.31, 0.44);
  group.add(shipment);
  addBox(shipment, [0.34, 0.3, 0.34], [0, 0.15, 0], materials.cardboard);
  addBox(shipment, [0.055, 0.31, 0.345], [0, 0.15, 0.008], materials.brass);
  addBox(shipment, [0.28, 0.22, 0.28], [0.52, 0.11, -0.04], materials.cardboard, [0, -0.08, 0]);
  addBox(shipment, [0.045, 0.23, 0.285], [0.52, 0.11, -0.032], materials.brass, [0, -0.08, 0]);

  const carrier = new THREE.Group();
  carrier.position.set(0.16, 0.34, 0.12);
  group.add(carrier);
  [0.01, 0.31].forEach((x) => addBox(group, [0.045, 0.035, 0.88], [x, 0.31, 0.48], materials.steel));
  addBox(group, [0.42, 0.055, 0.08], [0.16, 0.32, 0.89], materials.steelDark);
  addBox(carrier, [0.5, 0.055, 0.34], [0, 0, 0], materials.emerald);
  addBox(carrier, [0.26, 0.04, 0.2], [0, 0.052, 0], materials.graphite);
  [-0.15, 0, 0.15].forEach((x) => addBox(carrier, [0.055, 0.07, 0.055], [x, 0.06, 0], materials.brass));

  const beaconMaterial = materials.emeraldGlow.clone();
  beaconMaterial.transparent = true;
  const beacon = addSphere(group, 0.052, [0.4, 0.8, 0.36], beaconMaterial);
  group.userData.oemCarrier = carrier;
  group.userData.oemDoor = door;
  group.userData.oemStatusPanel = statusPanel;
  group.userData.oemBeacon = beacon;
  return group;
};

const createCustomerStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [1.52, 0.1, 0.8], [0, 0.28, 0.08], materials.steelDark);
  addBox(group, [1.3, 0.055, 0.64], [0, 0.37, 0.08], materials.graphite);
  [-0.48, -0.16, 0.16, 0.48].forEach((x) => addCylinder(group, 0.035, 0.64, [x, 0.42, 0.08], materials.steel, 10, [0, 0, Math.PI / 2]));
  [-0.62, 0.62].forEach((x) => addBox(group, [0.075, 1.06, 0.075], [x, 0.9, -0.3], materials.steel));
  addBox(group, [1.32, 0.08, 0.08], [0, 1.43, -0.3], materials.steel);
  addBox(group, [0.66, 0.48, 0.055], [0, 1.12, -0.27], materials.graphiteSoft);
  addBox(group, [0.56, 0.38, 0.025], [0, 1.12, -0.235], materials.glass);

  const parcel = new THREE.Group();
  parcel.position.set(0, 0.44, 0.08);
  group.add(parcel);
  addBox(parcel, [0.48, 0.28, 0.38], [0, 0.14, 0], materials.cardboard);
  addBox(parcel, [0.07, 0.29, 0.385], [0, 0.14, 0.008], materials.brass);
  addBox(parcel, [0.16, 0.07, 0.025], [0.13, 0.17, 0.205], materials.shell);

  [-0.5, 0.5].forEach((x) => addBox(group, [0.045, 0.48, 0.045], [x, 0.66, 0.34], materials.steel));
  addBox(group, [1.04, 0.045, 0.045], [0, 0.9, 0.34], materials.steel);
  const scanMaterial = materials.emeraldGlow.clone();
  scanMaterial.transparent = true;
  scanMaterial.opacity = 0;
  const scanLine = addBox(group, [0.94, 0.018, 0.025], [0, 0.72, 0.37], scanMaterial);
  const returnIndicator = createReturnEmblem(materials);
  returnIndicator.position.set(0, 1.12, -0.205);
  returnIndicator.scale.setScalar(1.08);
  group.add(returnIndicator);
  group.userData.customerParcel = parcel;
  group.userData.customerReturnIndicator = returnIndicator;
  group.userData.customerScanLine = scanLine;
  return group;
};

const createConsultingStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [1.48, 0.12, 0.92], [0, 0.31, 0], materials.steelDark);
  addBox(group, [1.26, 0.075, 0.74], [0, 0.41, 0], materials.emerald);
  addBox(group, [0.38, 0.08, 0.31], [0.08, 0.49, 0.02], materials.graphite);
  addBox(group, [0.2, 0.035, 0.17], [0.08, 0.55, 0.02], materials.steelDark);
  [-0.48, -0.31, 0.34, 0.51].forEach((x, index) => {
    addBox(group, [0.075, 0.055, 0.085], [x, 0.48, index % 2 === 0 ? -0.2 : 0.2], materials.brass);
  });
  addBox(group, [0.08, 0.96, 0.08], [-0.64, 0.88, -0.28], materials.steel);
  addBox(group, [0.08, 0.96, 0.08], [0.64, 0.88, -0.28], materials.steel);
  addBox(group, [1.36, 0.08, 0.08], [0, 1.34, -0.28], materials.steel);
  const scannerMaterial = materials.emeraldGlow.clone();
  scannerMaterial.transparent = true;
  scannerMaterial.opacity = 0;
  const scanner = addBox(group, [1.14, 0.025, 0.07], [0, 0.77, -0.22], scannerMaterial);
  scanner.userData.motion = "scan";

  const analysisSignals = [
    [-0.45, 0.57, -0.18],
    [-0.22, 0.57, 0.17],
    [0.04, 0.57, -0.18],
    [0.3, 0.57, 0.16],
    [0.49, 0.57, -0.08],
  ].map((position) => {
    const signalMaterial = materials.emeraldGlow.clone();
    signalMaterial.transparent = true;
    signalMaterial.opacity = 0;
    const signal = addSphere(group, 0.035, position as THREE.Vector3Tuple, signalMaterial);
    signal.scale.setScalar(0.001);
    return signal;
  });
  const resultMaterial = materials.emeraldGlow.clone();
  resultMaterial.transparent = true;
  resultMaterial.opacity = 0;
  const analysisResult = addBox(group, [0.26, 0.028, 0.075], [0.42, 0.58, 0.27], resultMaterial);

  const lensMaterial = materials.glass.clone();
  lensMaterial.opacity = 0.34;
  const lens = new THREE.Mesh(new THREE.RingGeometry(0.43, 0.46, 40), lensMaterial);
  lens.position.set(0, 1.15, -0.21);
  group.add(lens);
  addBox(group, [0.92, 0.86, 0.055], [0, 1.15, -0.255], materials.graphiteSoft);
  const logoSlot = addModelSlot(group, "consultingLogoSlot", [0, 1.15, -0.215]);
  const leaf = createLeafEmblem(materials);
  leaf.position.set(0, 1.15, -0.205);
  leaf.scale.set(0.44, 0.52, 0.44);
  leaf.rotation.z = -0.28;
  group.add(leaf);
  group.userData.scanner = scanner;
  group.userData.consultingSignals = analysisSignals;
  group.userData.consultingResult = analysisResult;
  group.userData.consultingLens = lens;
  group.userData.consultingLeafFallback = leaf;
  group.userData.consultingLogoSlot = logoSlot;
  return group;
};

const createDisassemblyStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [1.42, 0.12, 0.84], [0, 0.29, 0.02], materials.steelDark);
  const pickAngle = -1.3;
  const placeAngle = -2.05;
  const inputPosition = new THREE.Vector3(0.5, 0.553, 0.24);
  const outputPosition = new THREE.Vector3(0.09, 0.553, 0.65);
  addCylinder(group, 0.38, 0.07, [0.5, 0.4, 0.2], materials.graphite, 24);
  addBox(group, [0.5, 0.055, 0.36], [0.5, 0.46, 0.24], materials.emerald, [0, pickAngle, 0]);
  addBox(group, [0.25, 0.04, 0.21], [0.5, 0.507, 0.24], materials.steel, [0, pickAngle, 0]);
  addBox(group, [0.34, 0.055, 0.3], [0.09, 0.43, 0.65], materials.graphite, [0, placeAngle, 0]);
  addBox(group, [0.27, 0.07, 0.23], [0.09, 0.49, 0.65], materials.steel, [0, placeAngle, 0]);

  const rig = addModelSlot(group, "robotAssetSlot", [-0.23, 0.28, -0.08], [0, -1.65, 0]);
  const gripperLocal = new THREE.Vector3(0.5031155, 1.1083728, -0.6204557);
  const gripperTool = new THREE.Group();
  gripperTool.position.copy(gripperLocal);
  rig.add(gripperTool);
  const toolStem = addCylinder(gripperTool, 0.024, 0.32, [0, -0.16, 0], materials.steelDark, 12);
  const toolBridge = addBox(gripperTool, [0.2, 0.045, 0.09], [0, -0.32, 0], materials.steel);
  const toolJaws = [
    addBox(gripperTool, [0.035, 0.11, 0.08], [-0.105, -0.375, 0], materials.brass),
    addBox(gripperTool, [0.035, 0.11, 0.08], [0.105, -0.375, 0], materials.brass),
  ];
  const extractedPart = new THREE.Group();
  extractedPart.position.copy(inputPosition);
  extractedPart.rotation.y = pickAngle;
  group.add(extractedPart);
  addBox(extractedPart, [0.14, 0.055, 0.12], [0, 0, 0], materials.graphite);
  [-0.05, 0, 0.05].forEach((x) => addBox(extractedPart, [0.018, 0.028, 0.15], [x, -0.015, 0], materials.brass));
  const statusMaterial = materials.emeraldGlow.clone();
  statusMaterial.transparent = true;
  statusMaterial.opacity = 0.2;
  const status = addSphere(group, 0.045, [-0.1, 0.55, 0.56], statusMaterial);
  group.userData.rig = rig;
  group.userData.disassemblyPart = extractedPart;
  group.userData.disassemblyInput = inputPosition;
  group.userData.disassemblyOutput = outputPosition;
  group.userData.robotGripperLocal = gripperLocal;
  group.userData.robotPickAngle = pickAngle;
  group.userData.robotPlaceAngle = placeAngle;
  group.userData.robotTool = { bridge: toolBridge, jaws: toolJaws, stem: toolStem };
  group.userData.robotStatus = status;
  return group;
};

const createSmelterStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [0.94, 0.98, 0.62], [0.16, 0.75, 0.14], materials.smelterShell);
  addBox(group, [1.04, 0.12, 0.72], [0.16, 1.28, 0.14], materials.steelDark);
  addFurnaceArch(group, 0.72, 0.7, [0.16, 0.72, 0.48], materials.brass);
  addFurnaceArch(group, 0.58, 0.57, [0.16, 0.7, 0.515], materials.graphite);
  const furnaceMaterial = materials.amber.clone();
  const furnaceFace = addFurnaceArch(group, 0.44, 0.43, [0.16, 0.68, 0.55], furnaceMaterial);
  addBox(group, [0.42, 0.055, 0.25], [0.16, 0.425, 0.59], materials.steelDark);

  addBox(group, [0.5, 0.075, 0.28], [-0.58, 0.37, 0.59], materials.steelDark);
  [-0.14, 0, 0.14].forEach((x) =>
    addCylinder(group, 0.04, 0.22, [-0.58 + x, 0.41, 0.59], materials.steel, 12, [0, 0, Math.PI / 2]),
  );

  const feed = new THREE.Group();
  feed.position.set(-0.68, 0.485, 0.59);
  group.add(feed);
  addBox(feed, [0.28, 0.05, 0.2], [0, 0, 0], materials.emerald);
  [-0.075, 0.075].forEach((x) => addBox(feed, [0.04, 0.055, 0.045], [x, 0.052, 0.02], materials.brass));

  addBox(group, [0.4, 0.065, 0.28], [0.66, 0.41, 0.59], materials.steelDark);
  const ingot = new THREE.Group();
  ingot.position.set(0.43, 0.505, 0.59);
  group.add(ingot);
  addBox(ingot, [0.22, 0.09, 0.15], [0, 0, 0], materials.copper, [0, -0.05, 0]);
  addBox(ingot, [0.15, 0.03, 0.09], [0, 0.058, 0], materials.brass, [0, -0.05, 0]);
  ingot.scale.setScalar(0.001);

  addCylinder(group, 0.14, 0.75, [0.42, 1.5, -0.14], materials.steelDark, 18);
  addCylinder(group, 0.19, 0.08, [0.42, 1.91, -0.14], materials.brass, 18);
  const furnaceLight = new THREE.PointLight(0xff7d2d, 3.2, 3.8, 2);
  furnaceLight.position.set(0.18, 0.67, 0.76);
  group.add(furnaceLight);

  const heatRings = [0, 1].map(() => {
    const heatMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa45c,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const heatRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 6, 24), heatMaterial);
    heatRing.position.set(0.42, 1.52, -0.14);
    heatRing.rotation.x = Math.PI / 2;
    group.add(heatRing);
    return heatRing;
  });
  group.userData.furnaceLight = furnaceLight;
  group.userData.furnaceFace = furnaceFace;
  group.userData.smelterFeed = feed;
  group.userData.smelterHeatRings = heatRings;
  group.userData.smelterIngot = ingot;
  return group;
};

const createMaterialsStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addCylinder(group, 0.82, 0.13, [0, 0.29, 0], materials.steelDark, 24);
  const sorterRotor = new THREE.Group();
  sorterRotor.position.set(0, 0.39, 0.06);
  group.add(sorterRotor);
  addCylinder(sorterRotor, 0.61, 0.055, [0, 0, 0], materials.graphite, 24);
  [materials.copper, materials.steel, materials.emerald].forEach((material, index) => {
    const angle = index * (Math.PI * 2) / 3;
    addBox(sorterRotor, [0.14, 0.04, 0.08], [Math.cos(angle) * 0.43, 0.06, Math.sin(angle) * 0.43], material, [0, -angle, 0]);
  });

  const bins = new THREE.Group();
  bins.position.set(0, 0.36, -0.48);
  group.add(bins);
  const binSpecs = [
    { x: -0.48, material: materials.copper },
    { x: 0, material: materials.steel },
    { x: 0.48, material: materials.emerald },
  ];
  const binIndicators: Array<ReturnType<typeof addBox>> = [];
  binSpecs.forEach(({ x, material }) => {
    addBox(bins, [0.36, 0.055, 0.34], [x, 0.05, 0], materials.graphiteSoft);
    addBox(bins, [0.36, 0.28, 0.045], [x, 0.19, -0.15], materials.graphiteSoft);
    addBox(bins, [0.045, 0.28, 0.34], [x - 0.157, 0.19, 0], materials.graphiteSoft);
    addBox(bins, [0.045, 0.28, 0.34], [x + 0.157, 0.19, 0], materials.graphiteSoft);
    addBox(bins, [0.26, 0.022, 0.22], [x, 0.095, 0], material);
    const indicatorMaterial = materials.emeraldGlow.clone();
    indicatorMaterial.transparent = true;
    indicatorMaterial.opacity = 0.12;
    binIndicators.push(addBox(bins, [0.18, 0.025, 0.025], [x, 0.12, 0.18], indicatorMaterial));
  });

  const sorterItems = binSpecs.map(({ x, material }, index) => {
    const item = new THREE.Group();
    item.position.set(0, 0.56, 0.28);
    item.scale.setScalar(0.001);
    group.add(item);
    addBox(item, [0.26, 0.13 + index * 0.015, 0.22], [0, 0, 0], material, [0, index * 0.14 - 0.12, 0]);
    item.userData.targetPosition = new THREE.Vector3(x, 0.54, -0.48);
    return item;
  });
  group.userData.sorterItems = sorterItems;
  group.userData.sorterRotor = sorterRotor;
  group.userData.sorterBinIndicators = binIndicators;
  return group;
};

const stationFactories: Record<GraphPoint, (materials: MaterialSet) => THREE.Group> = {
  oem: createOemStation,
  customer: createCustomerStation,
  consulting: createConsultingStation,
  disassembly: createDisassemblyStation,
  smelter: createSmelterStation,
  materials: createMaterialsStation,
};

const addRoute = (world: THREE.Group, spec: (typeof routeSpecs)[number]): RouteRuntime => {
  const control = new THREE.Vector3(...spec.control);
  const fromCenter = new THREE.Vector3(...nodePositions[spec.points[0]]);
  const toCenter = new THREE.Vector3(...nodePositions[spec.points[1]]);
  const routeClearance = 1.68;
  const startDirection = control.clone().sub(fromCenter).setY(0).normalize();
  const endDirection = control.clone().sub(toCenter).setY(0).normalize();
  const start = fromCenter.clone().addScaledVector(startDirection, routeClearance).setY(control.y);
  const end = toCenter.clone().addScaledVector(endDirection, routeClearance).setY(control.y);
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const arrowT = 0.9;
  const travelEnd = Math.max(0.76, arrowT - 0.3 / Math.max(curve.getLength(), 0.001));
  const visibleCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 32 }, (_, index) => curve.getPoint((index / 31) * travelEnd)),
    false,
    "centripetal",
  );
  const coreGeometry = new THREE.TubeGeometry(visibleCurve, 54, 0.034, 8, false);
  const glowGeometry = new THREE.TubeGeometry(visibleCurve, 54, 0.1, 8, false);
  const coreMaterial = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.5, toneMapped: false });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: spec.color,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  core.renderOrder = 12;
  glow.renderOrder = 11;
  world.add(glow, core);

  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: spec.color,
    depthWrite: false,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.84,
    toneMapped: false,
  });
  const arrow = new THREE.Mesh(createRouteArrowGeometry(), arrowMaterial);
  const tangent = curve.getTangent(arrowT).normalize();
  arrow.position.copy(curve.getPoint(arrowT));
  arrow.position.y += 0.055;
  arrow.rotation.y = Math.atan2(tangent.x, tangent.z);
  arrow.renderOrder = 15;
  world.add(arrow);

  const packetMaterial = new THREE.MeshBasicMaterial({
    color: spec.color,
    depthWrite: false,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  });
  const packetGeometry =
    spec.packetKind === "signal"
      ? new THREE.OctahedronGeometry(0.082, 0)
      : spec.packetKind === "material"
        ? new RoundedBoxGeometry(0.14, 0.07, 0.1, 2, 0.018)
        : new RoundedBoxGeometry(0.17, 0.045, 0.11, 2, 0.012);
  const packet = new THREE.Mesh(packetGeometry, packetMaterial);
  packet.renderOrder = 14;
  world.add(packet);

  return {
    arrow,
    core,
    curve,
    delay: spec.delay,
    duration: spec.duration,
    glow,
    id: spec.id,
    labelT: spec.labelT,
    packet,
    points: spec.points,
    travelEnd,
  };
};

export const createCyclePrototypeWorld = (
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  options: CycleWorldOptions,
): CycleWorldRuntime => {
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const hardwareConcurrency = navigator.hardwareConcurrency || 8;
  const renderProfile = selectCycleRenderProfile({
    compactScreen: window.matchMedia("(max-width: 767px)").matches,
    deviceMemory,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency,
    reducedMotion: options.reducedMotion,
  });
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: renderProfile.antialias,
    powerPreference: renderProfile.efficient ? "default" : "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = renderProfile.shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, renderProfile.pixelRatioCap));
  canvas.dataset.renderProfile = renderProfile.efficient ? "efficient" : "quality";
  canvas.dataset.targetFps = String(renderProfile.targetFps);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf4faf4, 0.033);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const world = new THREE.Group();
  world.position.y = 0.34;
  scene.add(world);

  const materials = createMaterials();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 30),
    new THREE.MeshStandardMaterial({
      color: 0xe3efe5,
      metalness: 0.05,
      opacity: 0.82,
      roughness: 0.88,
      transparent: true,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  world.add(floor);

  const grid = new THREE.GridHelper(17, 34, 0x4b8f6c, 0xabcab8);
  grid.position.y = 0.008;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach((material) => {
    material.transparent = true;
    material.opacity = 0.3;
  });
  world.add(grid);

  [2.65, 4.55, 6.8].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + 0.018, 96),
      new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xb9844d : 0x2ca975,
        transparent: true,
        opacity: index === 1 ? 0.2 : 0.16,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    ring.scale.z = 0.68;
    world.add(ring);
  });

  const routes = routeSpecs.map((spec) => addRoute(world, spec));
  const stationGroups = {} as Record<GraphPoint, THREE.Group>;
  const stationAnchors = {} as Record<GraphPoint, THREE.Object3D>;

  nodeOrder.forEach((point) => {
    const station = stationFactories[point](materials);
    station.position.set(...nodePositions[point]);
    station.userData.restY = station.position.y;
    world.add(station);
    stationGroups[point] = station;

    const anchor = new THREE.Object3D();
    anchor.position.set(0, point === "smelter" ? 0.78 : 0.62, 0);
    station.add(anchor);
    stationAnchors[point] = anchor;
  });

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0x86a58f, 2.15);
  scene.add(hemisphere);
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
  keyLight.position.set(-5, 11, 8);
  keyLight.castShadow = renderProfile.shadows;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x35bd80, 1.35);
  rimLight.position.set(7, 5, -8);
  scene.add(rimLight);
  const copperLight = new THREE.PointLight(0xc9894f, 1.45, 16, 2);
  copperLight.position.set(-5, 4, 5);
  scene.add(copperLight);

  const screenPoints = {} as CycleWorldScreenPoints;
  nodeOrder.forEach((point) => {
    screenPoints[point] = { x: 0, y: 0, visible: true };
  });
  const routeScreenPoints = {} as CycleWorldRouteScreenPoints;
  cycleRouteIds.forEach((routeId) => {
    routeScreenPoints[routeId] = { x: 0, y: 0, visible: true };
  });

  let highlighted: GraphPoint = "consulting";
  let pointerX = 0;
  let pointerY = 0;
  let width = 1;
  let height = 1;
  let layoutScaleX = 1;
  let stationLayoutScale = 1;
  let animationFrame = 0;
  let disposed = false;
  let sceneVisible = true;
  let lastRenderedAt = Number.NEGATIVE_INFINITY;
  const frameInterval = renderProfile.targetFps >= 60 ? 0 : 1000 / renderProfile.targetFps;
  const timer = new THREE.Timer();
  timer.connect(document);
  const projection = new THREE.Vector3();
  const worldPosition = new THREE.Vector3();
  const stationTargetScale = new THREE.Vector3();
  const routeTangent = new THREE.Vector3();
  const rotationAxisY = new THREE.Vector3(0, 1, 0);
  const robotGripPosition = new THREE.Vector3();
  const robotGripRadial = new THREE.Vector3();

  const modelLoader = new GLTFLoader();
  const attachModel = async (
    point: GraphPoint,
    slotKey: string,
    url: string,
    maxDimension: number,
    material?: THREE.Material,
    rotation: THREE.Vector3Tuple = [0, 0, 0],
    stretch: THREE.Vector3Tuple = [1, 1, 1],
  ) => {
    try {
      const gltf = await modelLoader.loadAsync(url);
      if (disposed) {
        disposeObjectResources(gltf.scene);
        return;
      }
      const slot = stationGroups[point].userData[slotKey] as THREE.Group;
      const model = prepareModel(gltf.scene, maxDimension, material, rotation);
      model.scale.multiply(new THREE.Vector3(...stretch));
      slot.add(model);
    } catch (error) {
      console.warn(`Unable to load cycle model: ${url}`, error);
    }
  };

  void attachModel("disassembly", "robotAssetSlot", "/zyklus-prototype/models/robot-arm.glb", 1.56, undefined, [0, -0.72, 0]);

  const logoTextureLoader = new THREE.TextureLoader();
  void logoTextureLoader
    .loadAsync("/leaftronics-logo-color.webp")
    .then((texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const logoMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
      });
      const logo = new THREE.Mesh(new THREE.CircleGeometry(0.36, 48), logoMaterial);
      logo.renderOrder = 4;
      const station = stationGroups.consulting;
      (station.userData.consultingLogoSlot as THREE.Group).add(logo);
      (station.userData.consultingLeafFallback as THREE.Group).visible = false;
    })
    .catch((error) => console.warn("Unable to load the Leaftronics logo", error));

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    layoutScaleX = camera.aspect < 1.62 ? THREE.MathUtils.clamp(camera.aspect / 1.72, 0.38, 1) : 1;
    const compactProgress = THREE.MathUtils.smoothstep(camera.aspect, 0.56, 1.12);
    stationLayoutScale = THREE.MathUtils.lerp(0.74, 1, compactProgress);
    world.scale.x = layoutScaleX;
    const aspectDistance = camera.aspect < 1.08 ? 15.2 + (1.08 - camera.aspect) * 7.5 : 15.2;
    camera.position.set(0, aspectDistance * 0.62, aspectDistance * 0.75);
    camera.lookAt(0, 0.28, 0.42);
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const animate = (timestamp: number) => {
    animationFrame = 0;
    if (disposed || !sceneVisible || document.hidden) return;
    if (frameInterval > 0 && timestamp - lastRenderedAt < frameInterval) {
      animationFrame = window.requestAnimationFrame(animate);
      return;
    }
    lastRenderedAt = timestamp;
    timer.update(timestamp);
    const elapsed = timer.getElapsed();
    const rotationLerp = options.reducedMotion ? 1 : 0.045;
    world.rotation.y = THREE.MathUtils.lerp(world.rotation.y, pointerX * 0.065, rotationLerp);
    world.rotation.x = THREE.MathUtils.lerp(world.rotation.x, pointerY * 0.025, rotationLerp);

    nodeOrder.forEach((point, index) => {
      const station = stationGroups[point];
      const active = point === highlighted;
      const activeScale = active ? (stationLayoutScale < 0.86 ? 1.055 : 1.095) : 1;
      const targetScale = stationLayoutScale * activeScale;
      const targetY = station.userData.restY + (active ? 0.2 : 0);
      const ease = options.reducedMotion ? 1 : 0.09;
      station.scale.lerp(stationTargetScale.set(targetScale / layoutScaleX, targetScale, targetScale), ease);
      station.position.y = THREE.MathUtils.lerp(station.position.y, targetY, ease);
      station.userData.activity = THREE.MathUtils.lerp(station.userData.activity ?? 0, active ? 1 : 0, ease);

      if (!options.reducedMotion) {
        const activity = station.userData.activity as number;

        const sequenceElapsed = elapsed + index * 1.17;

        if (point === "oem") {
          const carrier = station.userData.oemCarrier as THREE.Group;
          const door = station.userData.oemDoor as THREE.Mesh;
          const statusPanel = station.userData.oemStatusPanel as THREE.Mesh;
          const beacon = station.userData.oemBeacon as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
          const phase = getCycleRoutePhase(sequenceElapsed, 7.8, 0);
          const doorOpen = getCycleWindowEnvelope(phase, 0.04, 0.16, 0.8, 0.92);
          const carrierDeploy = getCycleSegmentProgress(phase, 0.18, 0.38);
          const carrierRetract = getCycleSegmentProgress(phase, 0.62, 0.8);
          const carrierOut = carrierDeploy * (1 - carrierRetract);
          const confirmation = getCycleWindowEnvelope(phase, 0.38, 0.46, 0.62, 0.72);
          const doorScale = 1 - doorOpen * 0.78;
          door.scale.y = doorScale;
          door.position.y = 0.51 + (1 - doorScale) * 0.22;
          carrier.position.x = 0.16;
          carrier.position.z = 0.12 + carrierOut * 0.58;
          carrier.position.y = 0.34 + Math.sin(carrierOut * Math.PI) * 0.012;
          carrier.rotation.y = 0;
          statusPanel.scale.set(1 + confirmation * 0.08, 1 + confirmation * 0.08, 1);
          const beaconScale = 0.72 + confirmation * (0.42 + activity * 0.12);
          beacon.scale.setScalar(beaconScale);
          beacon.material.opacity = 0.12 + confirmation * 0.76;
        }

        if (point === "customer") {
          const parcel = station.userData.customerParcel as THREE.Group;
          const indicator = station.userData.customerReturnIndicator as THREE.Group;
          const returnSweep = indicator.userData.returnSweep as THREE.Group;
          const scanLine = station.userData.customerScanLine as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
          const phase = getCycleRoutePhase(sequenceElapsed, 7.2, 0);
          const arrival = getCycleSegmentProgress(phase, 0.05, 0.24);
          const exit = getCycleSegmentProgress(phase, 0.62, 0.84);
          const parcelEnvelope = getCycleWindowEnvelope(phase, 0.01, 0.06, 0.88, 0.96);
          const scanProgress = getCycleSegmentProgress(phase, 0.26, 0.5);
          const scanWindow = getCycleWindowEnvelope(phase, 0.22, 0.28, 0.52, 0.59);
          const confirmation = getCycleWindowEnvelope(phase, 0.5, 0.58, 0.8, 0.9);
          parcel.position.x = THREE.MathUtils.lerp(-0.52, 0, arrival) + exit * 0.52;
          parcel.position.y =
            0.44 + Math.sin(arrival * Math.PI) * 0.014 + Math.sin(exit * Math.PI) * 0.014;
          parcel.position.z = 0.08;
          parcel.rotation.y = (arrival + exit) * 0.035;
          parcel.scale.setScalar(Math.max(0.001, parcelEnvelope * (1 + activity * 0.04 + confirmation * 0.012)));
          scanLine.position.x = -0.32 + scanProgress * 0.64;
          scanLine.material.opacity = scanWindow * (0.72 + activity * 0.25);
          scanLine.scale.x = 0.86 + scanWindow * 0.14;
          returnSweep.rotation.z = -0.1 + confirmation * 0.3;
          indicator.scale.setScalar(1.08 + confirmation * 0.045 + activity * 0.025);
        }

        if (point === "consulting") {
          const scanner = station.userData.scanner as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
          const lens = station.userData.consultingLens as THREE.Mesh;
          const signals = station.userData.consultingSignals as Array<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>>;
          const result = station.userData.consultingResult as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
          const phase = getCycleRoutePhase(sequenceElapsed, 6.4, 0);
          const scanProgress = getCycleSegmentProgress(phase, 0.08, 0.5);
          const scanWindow = getCycleWindowEnvelope(phase, 0.02, 0.08, 0.54, 0.64);
          const resultWindow = getCycleWindowEnvelope(phase, 0.52, 0.62, 0.82, 0.94);
          scanner.position.z = -0.22 + scanProgress * 0.5;
          scanner.material.opacity = scanWindow * (0.7 + activity * 0.28);
          scanner.scale.x = 0.88 + scanWindow * 0.12;
          signals.forEach((signal, signalIndex) => {
            const signalStart = 0.18 + signalIndex * 0.065;
            const signalWindow = getCycleWindowEnvelope(phase, signalStart, signalStart + 0.05, 0.76, 0.88);
            signal.scale.setScalar(Math.max(0.001, signalWindow * (0.9 + activity * 0.2)));
            signal.material.opacity = signalWindow;
          });
          result.scale.x = 0.45 + resultWindow * 0.55;
          result.material.opacity = resultWindow;
          lens.rotation.z = -0.2 + phase * Math.PI * 2;
          lens.scale.setScalar(1 + resultWindow * 0.08);
        }

        if (point === "disassembly") {
          const rig = station.userData.rig as THREE.Group;
          const part = station.userData.disassemblyPart as THREE.Group;
          const inputPosition = station.userData.disassemblyInput as THREE.Vector3;
          const outputPosition = station.userData.disassemblyOutput as THREE.Vector3;
          const gripperLocal = station.userData.robotGripperLocal as THREE.Vector3;
          const pickAngle = station.userData.robotPickAngle as number;
          const placeAngle = station.userData.robotPlaceAngle as number;
          const tool = station.userData.robotTool as {
            bridge: THREE.Mesh;
            jaws: THREE.Mesh[];
            stem: THREE.Mesh;
          };
          const status = station.userData.robotStatus as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
          const phase = getCycleRoutePhase(sequenceElapsed, 7.6, 0);
          const homeAngle = -1.65;
          const approach = getCycleSegmentProgress(phase, 0.05, 0.17);
          const transfer = getCycleSegmentProgress(phase, 0.36, 0.57);
          const returnProgress = getCycleSegmentProgress(phase, 0.85, 0.98);
          const pickReach = getCycleWindowEnvelope(phase, 0.1, 0.17, 0.27, 0.35);
          const placeReach = getCycleWindowEnvelope(phase, 0.57, 0.65, 0.76, 0.84);
          const gripClosed = getCycleWindowEnvelope(phase, 0.19, 0.23, 0.72, 0.78);
          const partEnvelope = getCycleWindowEnvelope(phase, 0.02, 0.07, 0.9, 0.98);
          const arrival = getCycleWindowEnvelope(phase, 0.73, 0.8, 0.9, 0.97);

          if (phase < 0.36) {
            rig.rotation.y = THREE.MathUtils.lerp(homeAngle, pickAngle, approach);
          } else if (phase < 0.85) {
            rig.rotation.y = THREE.MathUtils.lerp(pickAngle, placeAngle, transfer);
          } else {
            rig.rotation.y = THREE.MathUtils.lerp(placeAngle, homeAngle, returnProgress);
          }
          rig.position.y = 0.28;

          const extension = 0.32 + Math.max(pickReach, placeReach) * 0.44;
          tool.stem.scale.y = extension / 0.32;
          tool.stem.position.y = -extension * 0.5;
          tool.bridge.position.y = -extension;
          tool.jaws[0].position.set(-0.105 + gripClosed * 0.035, -extension - 0.055, 0);
          tool.jaws[1].position.set(0.105 - gripClosed * 0.035, -extension - 0.055, 0);

          robotGripRadial.set(gripperLocal.x, 0, gripperLocal.z).applyAxisAngle(rotationAxisY, rig.rotation.y);
          robotGripPosition.set(
            rig.position.x + robotGripRadial.x,
            rig.position.y + gripperLocal.y - extension - 0.075,
            rig.position.z + robotGripRadial.z,
          );
          if (phase < 0.23) {
            part.position.copy(inputPosition);
            part.rotation.y = pickAngle;
          } else if (phase < 0.76) {
            part.position.copy(robotGripPosition);
            part.rotation.y = rig.rotation.y;
          } else {
            part.position.copy(outputPosition);
            part.rotation.y = placeAngle;
          }
          part.scale.setScalar(Math.max(0.001, partEnvelope * (1 + activity * 0.08)));
          status.scale.setScalar(0.72 + arrival * (0.7 + activity * 0.18));
          status.material.opacity = 0.16 + arrival * 0.82;
        }

        if (point === "smelter") {
          const furnaceLight = station.userData.furnaceLight as THREE.PointLight;
          const furnaceFace = station.userData.furnaceFace as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
          const feed = station.userData.smelterFeed as THREE.Group;
          const heatRings = station.userData.smelterHeatRings as Array<THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>>;
          const ingot = station.userData.smelterIngot as THREE.Group;
          const phase = getCycleRoutePhase(sequenceElapsed, 8.2, 0);
          const feedProgress = getCycleSegmentProgress(phase, 0.05, 0.32);
          const feedEnvelope = getCycleWindowEnvelope(phase, 0.01, 0.06, 0.34, 0.42);
          const heatWindow = getCycleWindowEnvelope(phase, 0.3, 0.38, 0.68, 0.8);
          const ingotProgress = getCycleSegmentProgress(phase, 0.72, 0.9);
          const ingotEnvelope = getCycleWindowEnvelope(phase, 0.66, 0.73, 0.94, 0.99);
          feed.position.x = THREE.MathUtils.lerp(-0.68, 0.16, feedProgress);
          feed.position.y = 0.485;
          feed.position.z = 0.59;
          feed.scale.setScalar(Math.max(0.001, feedEnvelope));
          furnaceLight.intensity = 1.8 + heatWindow * (3.1 + activity * 0.8);
          furnaceFace.material.emissiveIntensity = 0.8 + heatWindow * (1.6 + activity * 0.5);
          furnaceFace.scale.y = 1;
          heatRings.forEach((heatRing, ringIndex) => {
            const ringOffset = ringIndex * 0.12;
            const ringProgress = getCycleSegmentProgress(phase, 0.32 + ringOffset, 0.58 + ringOffset);
            const ringEnvelope = getCycleWindowEnvelope(
              phase,
              0.29 + ringOffset,
              0.35 + ringOffset,
              0.57 + ringOffset,
              0.69 + ringOffset,
            );
            heatRing.position.y = 1.52 + ringProgress * 0.48;
            heatRing.scale.setScalar(0.6 + ringProgress * 0.72);
            heatRing.material.opacity = ringEnvelope * (0.22 + activity * 0.14);
          });
          ingot.position.x = THREE.MathUtils.lerp(0.49, 0.69, ingotProgress);
          ingot.position.y = 0.505;
          ingot.position.z = 0.59;
          ingot.scale.setScalar(Math.max(0.001, ingotEnvelope * (1 + activity * 0.08)));
        }

        if (point === "materials") {
          const sorterItems = station.userData.sorterItems as THREE.Group[];
          const sorterRotor = station.userData.sorterRotor as THREE.Group;
          const binIndicators = station.userData.sorterBinIndicators as Array<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>;
          const phase = getCycleRoutePhase(sequenceElapsed, 8.4, 0);
          const sortWindows = [
            [0.02, 0.3],
            [0.35, 0.63],
            [0.68, 0.96],
          ] as const;
          const rotorSteps =
            getCycleSegmentProgress(phase, 0.3, 0.34) +
            getCycleSegmentProgress(phase, 0.63, 0.67) +
            getCycleSegmentProgress(phase, 0.96, 0.995);
          sorterRotor.rotation.y = -rotorSteps * ((Math.PI * 2) / 3);
          sorterItems.forEach((item, itemIndex) => {
            const [windowStart, windowEnd] = sortWindows[itemIndex];
            const travelEnd = windowEnd - 0.14;
            const progress = getCycleSegmentProgress(phase, windowStart + 0.045, travelEnd);
            const settle = getCycleSegmentProgress(phase, travelEnd, windowEnd - 0.06);
            const envelope = getCycleWindowEnvelope(
              phase,
              windowStart,
              windowStart + 0.035,
              windowEnd - 0.035,
              windowEnd,
            );
            const arrival = getCycleWindowEnvelope(
              phase,
              travelEnd,
              windowEnd - 0.06,
              windowEnd - 0.025,
              windowEnd,
            );
            const target = item.userData.targetPosition as THREE.Vector3;
            item.position.x = THREE.MathUtils.lerp(0, target.x, progress);
            const travelY =
              THREE.MathUtils.lerp(0.56, target.y + 0.18, progress) + Math.sin(progress * Math.PI) * 0.14;
            item.position.y = THREE.MathUtils.lerp(travelY, target.y, settle);
            item.position.z = THREE.MathUtils.lerp(0.28, target.z, progress);
            item.scale.setScalar(Math.max(0.001, envelope * (1 + activity * 0.07)));
            item.rotation.y = Math.sin(progress * Math.PI) * 0.24 * (1 - settle);
            const indicator = binIndicators[itemIndex];
            indicator.material.opacity = 0.1 + arrival * 0.9;
            indicator.scale.x = 0.8 + arrival * 0.4;
          });
        }

        station.rotation.y = 0;
      }
    });

    routes.forEach((route) => {
      const active = route.points.includes(highlighted);
      route.core.material.opacity = THREE.MathUtils.lerp(route.core.material.opacity, active ? 0.96 : 0.34, 0.08);
      route.glow.material.opacity = THREE.MathUtils.lerp(route.glow.material.opacity, active ? 0.24 : 0.07, 0.08);
      route.arrow.material.opacity = THREE.MathUtils.lerp(route.arrow.material.opacity, active ? 1 : 0.58, 0.08);
      const phase = options.reducedMotion ? 0.68 : getCycleRoutePhase(elapsed, route.duration, route.delay);
      const envelope = getCycleRouteEnvelope(phase);
      const visibility = THREE.MathUtils.lerp(route.packet.userData.visibility ?? 0.6, active ? 1 : 0.58, 0.08);
      route.packet.userData.visibility = visibility;
      route.packet.material.opacity = envelope * visibility;
      const travelProgress = getCycleRouteTravelProgress(phase);
      const progress = travelProgress * route.travelEnd;
      route.curve.getPoint(progress, route.packet.position);
      route.packet.position.y += 0.055 + Math.sin(travelProgress * Math.PI) * 0.025;
      route.curve.getTangent(progress, routeTangent).normalize();
      route.packet.rotation.y = Math.atan2(routeTangent.x, routeTangent.z);
      const packetScale = (0.84 + envelope * 0.16 + Math.sin(travelProgress * Math.PI) * 0.06) * (active ? 1.14 : 1);
      route.packet.scale.setScalar(packetScale);
      const arrivalPulse = getCycleWindowEnvelope(phase, 0.78, 0.86, 0.92, 0.98);
      const arrowScale = 1 + arrivalPulse * (active ? 0.035 : 0.02);
      route.arrow.scale.set(arrowScale, 1, arrowScale);
    });

    renderer.render(scene, camera);

    nodeOrder.forEach((point) => {
      stationAnchors[point].getWorldPosition(worldPosition);
      projection.copy(worldPosition).project(camera);
      const screenPoint = screenPoints[point];
      screenPoint.x = (projection.x * 0.5 + 0.5) * width;
      screenPoint.y = (-projection.y * 0.5 + 0.5) * height;
      screenPoint.visible = projection.z > -1 && projection.z < 1;
    });
    routes.forEach((route) => {
      route.curve.getPoint(route.labelT, worldPosition);
      world.localToWorld(worldPosition);
      projection.copy(worldPosition).project(camera);
      const screenPoint = routeScreenPoints[route.id];
      screenPoint.x = (projection.x * 0.5 + 0.5) * width;
      screenPoint.y = (-projection.y * 0.5 + 0.5) * height;
      screenPoint.visible = projection.z > -1 && projection.z < 1;
    });
    options.onFrame(screenPoints, routeScreenPoints);

    animationFrame = window.requestAnimationFrame(animate);
  };

  const requestRenderLoop = () => {
    if (!disposed && sceneVisible && !document.hidden && animationFrame === 0) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };
  const visibilityObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            sceneVisible = entry?.isIntersecting ?? true;
            if (!sceneVisible && animationFrame !== 0) {
              window.cancelAnimationFrame(animationFrame);
              animationFrame = 0;
              return;
            }
            requestRenderLoop();
          },
          { rootMargin: "160px 0px" },
        );
  visibilityObserver?.observe(container);
  const handleDocumentVisibility = () => {
    if (document.hidden && animationFrame !== 0) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      return;
    }
    requestRenderLoop();
  };
  document.addEventListener("visibilitychange", handleDocumentVisibility);
  requestRenderLoop();

  return {
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleDocumentVisibility);
      timer.dispose();
      disposeObjectResources(scene);
      renderer.dispose();
    },
    setHighlighted: (point) => {
      highlighted = point;
    },
    setPointer: (x, y) => {
      pointerX = THREE.MathUtils.clamp(x, -1, 1);
      pointerY = THREE.MathUtils.clamp(y, -1, 1);
    },
  };
};
