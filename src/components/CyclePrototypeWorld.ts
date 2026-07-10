import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { selectCycleRenderProfile } from "@/components/cycleRenderProfile";
import type { GraphPoint } from "@/pages/Landing";

export type CycleWorldScreenPoint = {
  x: number;
  y: number;
  visible: boolean;
};

export type CycleWorldScreenPoints = Record<GraphPoint, CycleWorldScreenPoint>;

export type CycleWorldRuntime = {
  dispose: () => void;
  setHighlighted: (point: GraphPoint) => void;
  setPointer: (x: number, y: number) => void;
};

type CycleWorldOptions = {
  reducedMotion: boolean;
  onFrame: (points: CycleWorldScreenPoints) => void;
};

type MaterialSet = ReturnType<typeof createMaterials>;

type RouteRuntime = {
  arrow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  core: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  curve: THREE.Curve<THREE.Vector3>;
  delay: number;
  duration: number;
  glow: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  packet: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
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
  points: GraphPoint[];
  start: THREE.Vector3Tuple;
}> = [
  {
    start: [-5.3, 0.22, 0.08],
    control: [-4.75, 0.22, -2.15],
    end: [-3.62, 0.22, -2.58],
    color: 0x43d78c,
    duration: 5.8,
    delay: 0,
    points: ["oem", "customer"],
  },
  {
    start: [-2.72, 0.22, -2.58],
    control: [-1.66, 0.22, -1.32],
    end: [-0.58, 0.22, 0.08],
    color: 0x43d78c,
    duration: 6.2,
    delay: 0.4,
    points: ["customer", "consulting"],
  },
  {
    start: [0.58, 0.22, 0.08],
    control: [1.68, 0.22, -1.42],
    end: [2.72, 0.22, -2.58],
    color: 0x70e4bd,
    duration: 5.9,
    delay: 0.8,
    points: ["consulting", "disassembly"],
  },
  {
    start: [3.72, 0.22, -2.58],
    control: [5.42, 0.22, -2.02],
    end: [5.42, 0.22, 0.02],
    color: 0x70e4bd,
    duration: 6.4,
    delay: 1.2,
    points: ["disassembly", "smelter"],
  },
  {
    start: [-0.7, 0.24, 0.61],
    control: [-2.92, 0.24, 0.61],
    end: [-4.98, 0.24, 0.61],
    color: 0xd9a25b,
    duration: 6.8,
    delay: 0.2,
    points: ["consulting", "oem"],
  },
  {
    start: [0.7, 0.24, 0.61],
    control: [2.94, 0.24, 0.61],
    end: [4.98, 0.24, 0.61],
    color: 0x43d78c,
    duration: 6,
    delay: 1.1,
    points: ["consulting", "smelter"],
  },
  {
    start: [0.7, 0.24, 1.16],
    control: [2.94, 0.24, 1.16],
    end: [4.98, 0.24, 1.16],
    color: 0xd9a25b,
    duration: 6.6,
    delay: 1.7,
    points: ["consulting", "smelter"],
  },
  {
    start: [5.32, 0.22, 1.38],
    control: [3.62, 0.22, 4.02],
    end: [0.72, 0.22, 3.9],
    color: 0xd8c47e,
    duration: 7,
    delay: 2.1,
    points: ["smelter", "materials"],
  },
  {
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
        0, 0, 0.36, -0.29, 0, -0.22, -0.1, 0, -0.12,
        0, 0, 0.36, -0.1, 0, -0.12, 0, 0, 0.03,
        0, 0, 0.36, 0, 0, 0.03, 0.1, 0, -0.12,
        0, 0, 0.36, 0.1, 0, -0.12, 0.29, 0, -0.22,
      ],
      3,
    ),
  );
  return geometry;
};

const createReturnEmblem = (materials: MaterialSet) => {
  const emblem = new THREE.Group();
  const iconMaterial = materials.emeraldGlow.clone();
  iconMaterial.depthTest = false;
  iconMaterial.depthWrite = false;
  iconMaterial.transparent = true;

  const returnCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.17, 0.055, 0),
    new THREE.Vector3(0.19, 0.25, 0),
    new THREE.Vector3(-0.08, 0.28, 0),
    new THREE.Vector3(-0.17, 0.12, 0),
  );
  const returnArc = new THREE.Mesh(new THREE.TubeGeometry(returnCurve, 28, 0.021, 8, false), iconMaterial);
  returnArc.renderOrder = 30;
  emblem.add(returnArc);

  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(-0.205, 0.105);
  arrowShape.lineTo(-0.11, 0.185);
  arrowShape.lineTo(-0.105, 0.055);
  arrowShape.closePath();
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), iconMaterial);
  arrow.position.z = 0.012;
  arrow.renderOrder = 30;
  emblem.add(arrow);

  const boxPoints: Array<[THREE.Vector3, THREE.Vector3]> = [
    [new THREE.Vector3(-0.13, -0.16, 0), new THREE.Vector3(0.13, -0.16, 0)],
    [new THREE.Vector3(0.13, -0.16, 0), new THREE.Vector3(0.13, 0.02, 0)],
    [new THREE.Vector3(0.13, 0.02, 0), new THREE.Vector3(-0.13, 0.02, 0)],
    [new THREE.Vector3(-0.13, 0.02, 0), new THREE.Vector3(-0.13, -0.16, 0)],
    [new THREE.Vector3(-0.13, 0.02, 0), new THREE.Vector3(0, -0.05, 0)],
    [new THREE.Vector3(0.13, 0.02, 0), new THREE.Vector3(0, -0.05, 0)],
    [new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, -0.16, 0)],
  ];
  boxPoints.forEach(([start, end]) => {
    const edge = addBeam(emblem, start, end, 0.012, iconMaterial);
    edge.renderOrder = 30;
  });
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
  addModelSlot(group, "oemFactorySlot", [0.02, 0.93, -0.2], [0, -0.12, 0]);
  addModelSlot(group, "oemCratesSlot", [-0.68, 0.23, 0.4], [0, 0.18, 0]);

  addBox(group, [1.5, 0.68, 0.82], [0, 0.59, -0.1], materials.oemShell);
  addBox(group, [1.58, 0.1, 0.9], [0, 0.96, -0.1], materials.steelDark);
  addBox(group, [1.42, 0.08, 0.48], [0.08, 0.25, 0.38], materials.steelDark);
  const door = addBox(group, [0.5, 0.46, 0.045], [-0.2, 0.5, 0.325], materials.graphite);
  const statusPanel = addBox(group, [0.26, 0.15, 0.04], [0.4, 0.67, 0.33], materials.emerald);
  addBox(group, [0.76, 0.055, 0.08], [0.16, 0.84, 0.33], materials.brass);
  [-0.55, 0.55].forEach((x) => addBox(group, [0.22, 0.18, 0.035], [x, 0.69, 0.325], materials.glass));
  addCylinder(group, 0.09, 0.52, [0.5, 1.31, -0.24], materials.steelDark, 16);
  addCylinder(group, 0.13, 0.07, [0.5, 1.6, -0.24], materials.brass, 16);
  addCylinder(group, 0.065, 0.36, [-0.38, 1.22, -0.25], materials.steel, 14);
  addCylinder(group, 0.095, 0.055, [-0.38, 1.43, -0.25], materials.copper, 14);

  const carrier = new THREE.Group();
  carrier.position.set(0.5, 0.33, 0.4);
  group.add(carrier);
  addBox(carrier, [0.48, 0.055, 0.32], [0, 0, 0], materials.emerald);
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
  addBox(group, [1.48, 0.1, 0.78], [0, 0.28, 0.08], materials.steelDark);
  addBox(group, [1.28, 0.055, 0.62], [0, 0.37, 0.08], materials.graphite);
  [-0.62, 0.62].forEach((x) => addBox(group, [0.075, 1.06, 0.075], [x, 0.9, -0.3], materials.steel));
  addBox(group, [1.32, 0.08, 0.08], [0, 1.43, -0.3], materials.steel);
  addBox(group, [0.66, 0.48, 0.055], [0, 1.12, -0.27], materials.graphiteSoft);
  addBox(group, [0.56, 0.38, 0.025], [0, 1.12, -0.235], materials.glass);

  const parcel = addModelSlot(group, "customerBoxesSlot", [0, 0.39, 0.08], [0, -0.12, 0]);
  const scanLine = addBox(group, [1.06, 0.025, 0.045], [0, 0.54, 0.43], materials.emeraldGlow);
  const returnIndicator = createReturnEmblem(materials);
  returnIndicator.position.set(0, 1.12, -0.205);
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
  addBox(group, [0.34, 0.09, 0.3], [0.08, 0.49, 0.02], materials.graphite);
  [-0.48, -0.31, 0.34, 0.51].forEach((x, index) => {
    addBox(group, [0.075, 0.055, 0.085], [x, 0.48, index % 2 === 0 ? -0.2 : 0.2], materials.brass);
  });
  addBox(group, [0.08, 0.96, 0.08], [-0.64, 0.88, -0.28], materials.steel);
  addBox(group, [0.08, 0.96, 0.08], [0.64, 0.88, -0.28], materials.steel);
  addBox(group, [1.36, 0.08, 0.08], [0, 1.34, -0.28], materials.steel);
  const scanner = addBox(group, [1.14, 0.025, 0.07], [0, 0.77, 0.11], materials.emeraldGlow);
  scanner.userData.motion = "scan";

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
  addBox(group, [0.62, 0.055, 0.13], [0, 0.57, 0.34], materials.shell);
  group.userData.scanner = scanner;
  group.userData.consultingLens = lens;
  group.userData.consultingLeafFallback = leaf;
  group.userData.consultingLogoSlot = logoSlot;
  return group;
};

const createDisassemblyStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addBox(group, [1.42, 0.12, 0.84], [0, 0.29, 0.02], materials.steelDark);
  addCylinder(group, 0.4, 0.07, [0.34, 0.4, 0.13], materials.graphite, 24);
  addBox(group, [0.58, 0.055, 0.4], [0.34, 0.46, 0.17], materials.emerald);
  addBox(group, [0.22, 0.06, 0.18], [0.32, 0.51, 0.18], materials.graphite);
  [-0.66, 0.66].forEach((x) => addBox(group, [0.05, 0.64, 0.05], [x, 0.68, -0.35], materials.steel));
  addBox(group, [1.38, 0.05, 0.05], [0, 0.99, -0.35], materials.steel);

  const rig = addModelSlot(group, "robotAssetSlot", [-0.22, 0.28, -0.06], [0, 0.18, 0]);
  const sweep = addBox(group, [0.03, 0.42, 0.03], [0.34, 0.65, 0.42], materials.emeraldGlow);
  group.userData.rig = rig;
  group.userData.robotSweep = sweep;
  return group;
};

const createSmelterStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addModelSlot(group, "smelterFactorySlot", [0.06, 0.23, -0.2], [0, 0.1, 0]);
  addBox(group, [0.96, 0.96, 0.56], [0.17, 0.73, 0.26], materials.smelterShell);
  addBox(group, [1.06, 0.12, 0.66], [0.17, 1.25, 0.25], materials.steelDark);
  addFurnaceArch(group, 0.76, 0.7, [0.17, 0.7, 0.56], materials.brass);
  addFurnaceArch(group, 0.62, 0.57, [0.17, 0.68, 0.59], materials.graphite);
  const furnaceFace = addFurnaceArch(group, 0.49, 0.46, [0.17, 0.66, 0.62], materials.amber);
  addBox(group, [0.46, 0.055, 0.34], [0.17, 0.39, 0.66], materials.steelDark, [-0.1, 0, 0]);
  addBox(group, [0.16, 0.025, 0.28], [0.17, 0.44, 0.72], materials.amber, [-0.1, 0, 0]);
  addBox(group, [0.58, 0.08, 0.62], [-0.62, 0.3, 0.36], materials.steelDark, [-0.08, 0, 0]);
  [-0.2, 0, 0.2].forEach((x) => addCylinder(group, 0.05, 0.52, [-0.62 + x, 0.34, 0.36], materials.steel, 12, [0, 0, Math.PI / 2]));

  const feed = new THREE.Group();
  feed.position.set(-0.62, 0.38, 0.37);
  group.add(feed);
  addBox(feed, [0.38, 0.055, 0.42], [0, 0, 0], materials.emerald);
  [-0.1, 0.1].forEach((x) => addBox(feed, [0.055, 0.065, 0.07], [x, 0.06, 0.04], materials.brass));

  addCylinder(group, 0.15, 0.82, [0.48, 1.45, -0.18], materials.steelDark, 18);
  addCylinder(group, 0.2, 0.08, [0.48, 1.9, -0.18], materials.brass, 18);
  [-0.18, 0, 0.18].forEach((x) => addBox(group, [0.06, 0.24, 0.035], [0.74 + x * 0.25, 0.75, 0.57], materials.emerald));
  const furnaceLight = new THREE.PointLight(0xff7d2d, 3.2, 3.8, 2);
  furnaceLight.position.set(0.17, 0.65, 0.84);
  group.add(furnaceLight);

  const heatMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa45c,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const heatRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 6, 24), heatMaterial);
  heatRing.position.set(0.48, 1.58, -0.18);
  heatRing.rotation.x = Math.PI / 2;
  group.add(heatRing);
  group.userData.furnaceLight = furnaceLight;
  group.userData.furnaceFace = furnaceFace;
  group.userData.smelterFeed = feed;
  group.userData.smelterHeatRing = heatRing;
  return group;
};

const createMaterialsStation = (materials: MaterialSet) => {
  const group = new THREE.Group();
  addStationBase(group, materials);
  addCylinder(group, 0.8, 0.13, [0, 0.29, 0], materials.steelDark, 24);
  addCylinder(group, 0.63, 0.06, [0, 0.39, 0], materials.graphite, 24);
  const sorterItems = [
    addBox(group, [0.38, 0.28, 0.42], [-0.47, 0.56, 0.02], materials.copper),
    addBox(group, [0.38, 0.34, 0.42], [0, 0.59, 0.02], materials.steel),
    addBox(group, [0.38, 0.24, 0.42], [0.47, 0.54, 0.02], materials.emerald),
  ];
  addCylinder(group, 0.22, 0.54, [-0.38, 0.66, -0.43], materials.shell, 18);
  addCylinder(group, 0.17, 0.72, [0.3, 0.75, -0.43], materials.graphiteSoft, 18);
  addCylinder(group, 0.2, 0.055, [-0.38, 0.95, -0.43], materials.brass, 18);
  addCylinder(group, 0.2, 0.055, [0.3, 1.13, -0.43], materials.emerald, 18);
  sorterItems.push(
    addBox(group, [0.42, 0.12, 0.32], [-0.38, 0.48, 0.46], materials.copper, [0, 0.12, 0]),
    addBox(group, [0.42, 0.12, 0.32], [0.08, 0.5, 0.48], materials.steel, [0, -0.1, 0]),
    addBox(group, [0.42, 0.12, 0.32], [0.5, 0.48, 0.43], materials.brass, [0, 0.08, 0]),
  );

  sorterItems.forEach((item) => {
    item.userData.restPosition = item.position.clone();
    item.userData.restRotation = item.rotation.clone();
  });
  addCylinder(group, 0.075, 0.52, [0, 1.02, -0.18], materials.copper, 12);
  const sorterArm = new THREE.Group();
  sorterArm.position.set(0, 1.28, -0.18);
  group.add(sorterArm);
  addBox(sorterArm, [0.9, 0.06, 0.07], [0, 0, 0], materials.steel);
  addBox(sorterArm, [0.14, 0.14, 0.14], [0.4, -0.08, 0], materials.emerald);
  group.userData.sorterItems = sorterItems;
  group.userData.sorterArm = sorterArm;
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
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  });
  const packet = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), packetMaterial);
  packet.renderOrder = 14;
  world.add(packet);

  return {
    arrow,
    core,
    curve,
    delay: spec.delay,
    duration: spec.duration,
    glow,
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

  let highlighted: GraphPoint = "consulting";
  let pointerX = 0;
  let pointerY = 0;
  let width = 1;
  let height = 1;
  let layoutScaleX = 1;
  let animationFrame = 0;
  let disposed = false;
  let sceneVisible = true;
  let lastRenderedAt = Number.NEGATIVE_INFINITY;
  const frameInterval = renderProfile.targetFps >= 60 ? 0 : 1000 / renderProfile.targetFps;
  const timer = new THREE.Timer();
  timer.connect(document);
  const projection = new THREE.Vector3();
  const worldPosition = new THREE.Vector3();

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

  void Promise.allSettled([
    attachModel(
      "oem",
      "oemFactorySlot",
      "/zyklus-prototype/models/factory.glb",
      1.34,
      materials.oemShell,
      [0, Math.PI, 0],
      [1, 0.82, 1],
    ),
    attachModel(
      "oem",
      "oemCratesSlot",
      "/zyklus-prototype/models/crates.glb",
      0.68,
      materials.copper,
      [0, -0.2, 0],
      [1, 1.2, 1],
    ),
    attachModel(
      "customer",
      "customerBoxesSlot",
      "/zyklus-prototype/models/cardboard-pack.glb",
      1.62,
      materials.cardboard,
      [0, 0.12, 0],
      [1, 1.8, 1],
    ),
    attachModel("disassembly", "robotAssetSlot", "/zyklus-prototype/models/robot-arm.glb", 1.56, undefined, [0, -0.72, 0]),
    attachModel(
      "smelter",
      "smelterFactorySlot",
      "/zyklus-prototype/models/factory.glb",
      1.68,
      materials.smelterShell,
      [0, Math.PI, 0],
      [1, 1.28, 1],
    ),
  ]);

  const logoTextureLoader = new THREE.TextureLoader();
  void logoTextureLoader
    .loadAsync("/logo1-web.webp")
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
      const targetScale = active ? 1.095 : 1;
      const targetY = station.userData.restY + (active ? 0.2 : 0);
      const ease = options.reducedMotion ? 1 : 0.09;
      station.scale.lerp(new THREE.Vector3(targetScale / layoutScaleX, targetScale, targetScale), ease);
      station.position.y = THREE.MathUtils.lerp(station.position.y, targetY, ease);
      station.userData.activity = THREE.MathUtils.lerp(station.userData.activity ?? 0, active ? 1 : 0, ease);

      if (!options.reducedMotion) {
        const activity = station.userData.activity as number;
        const boost = 1 + activity * 0.55;

        if (point === "oem") {
          const carrier = station.userData.oemCarrier as THREE.Group;
          const door = station.userData.oemDoor as THREE.Mesh;
          const statusPanel = station.userData.oemStatusPanel as THREE.Mesh;
          const beacon = station.userData.oemBeacon as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
          const doorScale = 0.68 + (Math.sin(elapsed * 0.78) * 0.5 + 0.5) * 0.32;
          carrier.position.x = 0.5 + Math.sin(elapsed * 1.35) * 0.15 * boost;
          carrier.rotation.y = Math.sin(elapsed * 0.9) * 0.055 * boost;
          door.scale.y = doorScale;
          door.position.y = 0.27 + 0.23 * doorScale;
          statusPanel.scale.x = 0.9 + (Math.sin(elapsed * 2.5) * 0.5 + 0.5) * 0.1 * boost;
          const beaconPulse = 0.8 + (Math.sin(elapsed * 4.2) * 0.5 + 0.5) * 0.45 * boost;
          beacon.scale.setScalar(beaconPulse);
          beacon.material.opacity = 0.45 + activity * 0.4;
        }

        if (point === "customer") {
          const parcel = station.userData.customerParcel as THREE.Group;
          const indicator = station.userData.customerReturnIndicator as THREE.Group;
          const scanLine = station.userData.customerScanLine as THREE.Mesh;
          const returnPhase = Math.sin(elapsed * 0.86) * 0.5 + 0.5;
          parcel.position.x = -0.12 + returnPhase * 0.24 * boost;
          parcel.position.y = 0.39 + Math.sin(elapsed * 1.72) * 0.025 * boost;
          parcel.position.z = 0.08 - returnPhase * 0.08;
          parcel.rotation.y = Math.sin(elapsed * 0.86) * 0.08 * boost;
          indicator.rotation.z = Math.sin(elapsed * 1.15) * 0.035 * boost;
          indicator.scale.setScalar(1.12 + Math.sin(elapsed * 2.3) * 0.04 * boost);
          scanLine.position.x = 0.02 + Math.sin(elapsed * 2.2) * 0.22;
          scanLine.scale.x = 0.8 + (Math.sin(elapsed * 4.4) * 0.5 + 0.5) * 0.55;
        }

        if (point === "consulting") {
          const scanner = station.userData.scanner as THREE.Mesh;
          const lens = station.userData.consultingLens as THREE.Mesh;
          scanner.position.z = 0.1 + Math.sin(elapsed * 1.8) * 0.25 * boost;
          scanner.scale.x = 0.84 + (Math.sin(elapsed * 3.6) * 0.5 + 0.5) * 0.2 * boost;
          lens.rotation.z = elapsed * 0.34;
          lens.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.07 * boost);
        }

        if (point === "disassembly") {
          const rig = station.userData.rig as THREE.Group;
          const sweep = station.userData.robotSweep as THREE.Mesh;
          rig.rotation.y = 0.18 + Math.sin(elapsed * 0.72) * 0.13 * boost;
          rig.rotation.z = Math.sin(elapsed * 0.94 + 0.8) * 0.018 * boost;
          rig.position.y = 0.28 + Math.sin(elapsed * 1.05) * 0.018 * boost;
          sweep.position.y = 0.65 + Math.sin(elapsed * 1.8) * 0.2;
          sweep.scale.y = 0.76 + (Math.sin(elapsed * 3.6) * 0.5 + 0.5) * 0.34;
        }

        if (point === "smelter") {
          const furnaceLight = station.userData.furnaceLight as THREE.PointLight;
          const furnaceFace = station.userData.furnaceFace as THREE.Mesh;
          const feed = station.userData.smelterFeed as THREE.Group;
          const heatRing = station.userData.smelterHeatRing as THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
          const heatPhase = (elapsed * (0.3 + activity * 0.08)) % 1;
          furnaceLight.intensity = 2.9 + Math.sin(elapsed * 4.1) * 0.42 * boost;
          materials.amber.emissiveIntensity = 1.12 + (Math.sin(elapsed * 5.2) * 0.5 + 0.5) * 0.42 * boost;
          furnaceFace.scale.y = 0.96 + Math.sin(elapsed * 3.1) * 0.035 * boost;
          feed.position.x = -0.62 + (Math.sin(elapsed * 0.92) * 0.5 + 0.5) * 0.28 * boost;
          feed.position.y = 0.38 + Math.sin(elapsed * 1.84) * 0.02;
          heatRing.position.y = 1.52 + heatPhase * 0.54;
          heatRing.scale.setScalar(0.62 + heatPhase * 0.82);
          heatRing.material.opacity = Math.sin(heatPhase * Math.PI) * (0.2 + activity * 0.16);
        }

        if (point === "materials") {
          const sorterItems = station.userData.sorterItems as THREE.Mesh[];
          const sorterArm = station.userData.sorterArm as THREE.Group;
          sorterArm.rotation.y = Math.sin(elapsed * 0.76) * 0.62 * boost;
          sorterItems.forEach((item, itemIndex) => {
            const restPosition = item.userData.restPosition as THREE.Vector3;
            const restRotation = item.userData.restRotation as THREE.Euler;
            const itemWave = Math.sin(elapsed * 1.12 + itemIndex * 0.9);
            item.position.x = restPosition.x + itemWave * 0.045 * boost;
            item.position.y = restPosition.y + Math.max(0, itemWave) * 0.035 * boost;
            item.position.z = restPosition.z + Math.cos(elapsed * 0.82 + itemIndex) * 0.025 * boost;
            item.rotation.y = restRotation.y + itemWave * 0.035 * boost;
          });
        }

        station.rotation.y = Math.sin(elapsed * 0.42 + index) * 0.008;
      }
    });

    routes.forEach((route) => {
      const active = route.points.includes(highlighted);
      route.core.material.opacity = THREE.MathUtils.lerp(route.core.material.opacity, active ? 0.96 : 0.34, 0.08);
      route.glow.material.opacity = THREE.MathUtils.lerp(route.glow.material.opacity, active ? 0.24 : 0.07, 0.08);
      route.arrow.material.opacity = THREE.MathUtils.lerp(route.arrow.material.opacity, active ? 1 : 0.58, 0.08);
      route.packet.material.opacity = THREE.MathUtils.lerp(route.packet.material.opacity, active ? 1 : 0.55, 0.08);
      const progress =
        (options.reducedMotion ? 0.68 : (elapsed / route.duration + route.delay / route.duration) % 1) * route.travelEnd;
      route.packet.position.copy(route.curve.getPoint(progress));
      const packetScale = active ? 1.35 : 1;
      route.packet.scale.setScalar(THREE.MathUtils.lerp(route.packet.scale.x, packetScale, 0.08));
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
    options.onFrame(screenPoints);

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
