import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MeshoptSimplifier } from "meshoptimizer";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "public/models/green-circuit-board.glb");
const mobileProfile = process.argv.includes("--mobile");
const outputPath = path.join(
  root,
  mobileProfile
    ? "public/models/green-circuit-board-mobile.glb"
    : "public/models/green-circuit-board-web.glb",
);
const excludedMeshNames = new Set(["Box100", "Box129", "Line388"]);

class NodeFileReader {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = result;
        this.onloadend?.();
      })
      .catch((error) => this.onerror?.(error));
  }

  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = `data:${blob.type};base64,${Buffer.from(result).toString("base64")}`;
        this.onloadend?.();
      })
      .catch((error) => this.onerror?.(error));
  }
}

globalThis.FileReader = NodeFileReader;

function parseGlb(buffer) {
  return new Promise((resolve, reject) => {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    new GLTFLoader().parse(arrayBuffer, "", resolve, reject);
  });
}

function getMaterialSignature(material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return material.type;
  }

  return [
    material.type,
    material.color.getHexString(),
    material.emissive.getHexString(),
    material.metalness.toFixed(3),
    material.roughness.toFixed(3),
  ].join(":");
}

function getAttributeSignature(geometry) {
  return Object.entries(geometry.attributes)
    .map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.normalized ? 1 : 0}`)
    .sort()
    .join("|");
}

function getTriangleCount(geometry) {
  return Math.floor((geometry.index?.count ?? geometry.attributes.position.count) / 3);
}

function getTargetRatio(triangleCount) {
  if (mobileProfile) {
    if (triangleCount > 5000) return 0.065;
    if (triangleCount > 1800) return 0.1;
    if (triangleCount > 650) return 0.15;
    if (triangleCount > 260) return 0.22;
    if (triangleCount > 80) return 0.38;
    return 0.6;
  }

  if (triangleCount > 5000) return 0.3;
  if (triangleCount > 1800) return 0.4;
  if (triangleCount > 650) return 0.52;
  if (triangleCount > 260) return 0.64;
  return 0.82;
}

function compactGeometry(geometry, simplifiedIndices) {
  const [remap, uniqueVertexCount] = MeshoptSimplifier.compactMesh(simplifiedIndices);
  const compacted = new THREE.BufferGeometry();

  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const AttributeArray = attribute.array.constructor;
    const array = new AttributeArray(uniqueVertexCount * attribute.itemSize);

    for (let oldIndex = 0; oldIndex < remap.length; oldIndex += 1) {
      const newIndex = remap[oldIndex];
      if (newIndex === 0xffffffff) continue;

      for (let component = 0; component < attribute.itemSize; component += 1) {
        array[newIndex * attribute.itemSize + component] = attribute.array[oldIndex * attribute.itemSize + component];
      }
    }

    compacted.setAttribute(name, new THREE.BufferAttribute(array, attribute.itemSize, attribute.normalized));
  }

  const IndexArray = uniqueVertexCount <= 65535 ? Uint16Array : Uint32Array;
  compacted.setIndex(new THREE.BufferAttribute(new IndexArray(simplifiedIndices), 1));
  compacted.computeBoundingBox();
  compacted.computeBoundingSphere();
  return compacted;
}

function simplifyGeometry(sourceGeometry, preserveExactly) {
  const geometry = sourceGeometry.clone();
  geometry.deleteAttribute("uv");
  geometry.deleteAttribute("uv1");
  geometry.deleteAttribute("tangent");

  if (preserveExactly) {
    return geometry;
  }

  const welded = mergeVertices(geometry, 0.0001);
  geometry.dispose();
  const position = welded.getAttribute("position");
  const index = welded.getIndex();

  if (!index || !(position.array instanceof Float32Array)) {
    return welded;
  }

  const triangleCount = getTriangleCount(welded);
  const targetIndexCount = Math.max(12, Math.floor((index.count * getTargetRatio(triangleCount)) / 3) * 3);

  if (targetIndexCount >= index.count) {
    return welded;
  }

  const sourceIndices = new Uint32Array(index.array);
  const [simplifiedIndices] = MeshoptSimplifier.simplify(
    sourceIndices,
    position.array,
    position.itemSize,
    targetIndexCount,
    mobileProfile ? 0.028 : 0.012,
    ["Permissive"],
  );
  const compacted = compactGeometry(welded, simplifiedIndices);
  welded.dispose();
  return compacted;
}

await MeshoptSimplifier.ready;

const gltf = await parseGlb(fs.readFileSync(sourcePath));
const source = gltf.scene;
source.updateMatrixWorld(true);

const inverseRoot = source.matrixWorld.clone().invert();
const sourceBounds = new THREE.Box3().setFromObject(source);
const sourceSize = sourceBounds.getSize(new THREE.Vector3());
const buckets = new Map();
const materialCache = new Map();
let board = null;
let sourceTriangles = 0;

source.traverse((child) => {
  if (!(child instanceof THREE.Mesh) || excludedMeshNames.has(child.name)) return;

  const material = Array.isArray(child.material) ? child.material[0] : child.material;
  const geometry = simplifyGeometry(child.geometry, child.name === "Line001");
  const transform = inverseRoot.clone().multiply(child.matrixWorld);
  geometry.applyMatrix4(transform);
  geometry.computeBoundingBox();
  sourceTriangles += getTriangleCount(child.geometry);

  if (child.name === "Line001") {
    board = { geometry, material };
    return;
  }

  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  const tileX = THREE.MathUtils.clamp(
    Math.floor(((center.x - sourceBounds.min.x) / Math.max(sourceSize.x, 0.001)) * 4),
    0,
    3,
  );
  const tileZ = THREE.MathUtils.clamp(
    Math.floor(((center.z - sourceBounds.min.z) / Math.max(sourceSize.z, 0.001)) * 6),
    0,
    5,
  );
  const materialSignature = getMaterialSignature(material);
  const key = `${tileX}:${tileZ}:${materialSignature}:${getAttributeSignature(geometry)}`;
  const bucket = buckets.get(key);

  if (bucket) {
    bucket.geometries.push(geometry);
  } else {
    buckets.set(key, { geometries: [geometry], material, materialSignature });
  }
});

const optimized = new THREE.Group();
optimized.name = "GreenCircuitBoardWeb";

if (board) {
  const boardMaterial = board.material.clone();
  boardMaterial.name = "PCB_Green";
  const boardMesh = new THREE.Mesh(board.geometry, boardMaterial);
  boardMesh.name = "Line001";
  optimized.add(boardMesh);
}

let clusterIndex = 0;
for (const bucket of buckets.values()) {
  let material = materialCache.get(bucket.materialSignature);
  if (!material) {
    material = bucket.material.clone();
    material.name = `PCB_Material_${materialCache.size}`;
    materialCache.set(bucket.materialSignature, material);
  }

  const geometry =
    bucket.geometries.length === 1 ? bucket.geometries[0] : mergeGeometries(bucket.geometries, false);

  if (!geometry) {
    for (const sourceGeometry of bucket.geometries) sourceGeometry.dispose();
    continue;
  }

  if (bucket.geometries.length > 1) {
    for (const sourceGeometry of bucket.geometries) sourceGeometry.dispose();
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `ComponentCluster_${clusterIndex}`;
  optimized.add(mesh);
  clusterIndex += 1;
}

const exporter = new GLTFExporter();
const exported = await exporter.parseAsync(optimized, {
  binary: true,
  includeCustomExtensions: false,
  onlyVisible: false,
  trs: false,
});

fs.writeFileSync(outputPath, Buffer.from(exported));

let optimizedTriangles = 0;
optimized.traverse((child) => {
  if (child instanceof THREE.Mesh) optimizedTriangles += getTriangleCount(child.geometry);
});

const sourceMegabytes = fs.statSync(sourcePath).size / 1024 / 1024;
const outputMegabytes = fs.statSync(outputPath).size / 1024 / 1024;
console.log(
  JSON.stringify(
    {
      componentClusters: clusterIndex,
      profile: mobileProfile ? "mobile" : "desktop",
      output: path.relative(root, outputPath),
      sizeMegabytes: `${sourceMegabytes.toFixed(1)} -> ${outputMegabytes.toFixed(1)}`,
      triangles: `${sourceTriangles.toLocaleString()} -> ${optimizedTriangles.toLocaleString()}`,
    },
    null,
    2,
  ),
);
