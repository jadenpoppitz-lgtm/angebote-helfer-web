import * as THREE from "three";

type TracePoint = readonly [number, number];

const TRACE_ROUTES: readonly (readonly TracePoint[])[] = [
  [[-0.43, -0.42], [-0.32, -0.42], [-0.25, -0.35], [-0.25, -0.1], [-0.14, 0.01], [-0.04, 0.01]],
  [[-0.43, -0.35], [-0.35, -0.35], [-0.29, -0.29], [-0.29, 0.08], [-0.18, 0.19], [-0.03, 0.19]],
  [[-0.42, -0.27], [-0.37, -0.27], [-0.32, -0.22], [-0.32, 0.19], [-0.21, 0.3], [-0.08, 0.3]],
  [[-0.43, -0.18], [-0.38, -0.18], [-0.34, -0.14], [-0.34, 0.31], [-0.27, 0.38], [-0.12, 0.38]],
  [[-0.42, -0.08], [-0.37, -0.08], [-0.29, 0], [-0.29, 0.43], [-0.14, 0.43]],
  [[-0.42, 0.04], [-0.38, 0.04], [-0.22, 0.2], [-0.22, 0.45], [-0.07, 0.45]],
  [[-0.42, 0.17], [-0.35, 0.17], [-0.14, 0.38], [0.02, 0.38]],
  [[-0.4, 0.3], [-0.31, 0.3], [-0.18, 0.43], [-0.18, 0.47]],
  [[0.43, -0.42], [0.32, -0.42], [0.25, -0.35], [0.25, -0.1], [0.14, 0.01], [0.04, 0.01]],
  [[0.43, -0.35], [0.35, -0.35], [0.29, -0.29], [0.29, 0.08], [0.18, 0.19], [0.03, 0.19]],
  [[0.42, -0.27], [0.37, -0.27], [0.32, -0.22], [0.32, 0.19], [0.21, 0.3], [0.08, 0.3]],
  [[0.43, -0.18], [0.38, -0.18], [0.34, -0.14], [0.34, 0.31], [0.27, 0.38], [0.12, 0.38]],
  [[0.42, -0.08], [0.37, -0.08], [0.29, 0], [0.29, 0.43], [0.14, 0.43]],
  [[0.42, 0.04], [0.38, 0.04], [0.22, 0.2], [0.22, 0.45], [0.07, 0.45]],
  [[0.42, 0.17], [0.35, 0.17], [0.14, 0.38], [-0.02, 0.38]],
  [[0.4, 0.3], [0.31, 0.3], [0.18, 0.43], [0.18, 0.47]],
  [[-0.17, -0.45], [-0.17, -0.28], [-0.1, -0.21], [-0.1, 0.12]],
  [[-0.08, -0.45], [-0.08, -0.31], [-0.02, -0.25], [-0.02, 0.12]],
  [[0.01, -0.45], [0.01, -0.3], [0.07, -0.24], [0.07, 0.12]],
  [[0.1, -0.45], [0.1, -0.27], [0.16, -0.21], [0.16, 0.09]],
  [[-0.18, -0.05], [-0.08, -0.05], [-0.03, -0.1], [0.09, -0.1], [0.14, -0.05]],
  [[-0.16, 0.11], [-0.09, 0.11], [-0.04, 0.16], [0.11, 0.16], [0.17, 0.1]],
];

export function createPCBTraceGeometry(boardSize: THREE.Vector3) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const trackWidth = Math.min(boardSize.x, boardSize.z) * 0.0048;

  const toLocal = ([x, z]: TracePoint): TracePoint => [x * boardSize.x, z * boardSize.z];

  const addRibbon = (start: TracePoint, end: TracePoint, width: number) => {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.hypot(dx, dz);
    if (length < 0.0001) return;

    const px = (-dz / length) * width * 0.5;
    const pz = (dx / length) * width * 0.5;
    const base = positions.length / 3;
    positions.push(
      start[0] + px, 0, start[1] + pz,
      start[0] - px, 0, start[1] - pz,
      end[0] - px, 0, end[1] - pz,
      end[0] + px, 0, end[1] + pz,
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  const addVia = (point: TracePoint, radius: number) => {
    const segments = 18;
    const innerRadius = radius * 0.48;
    const base = positions.length / 3;

    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      positions.push(
        point[0] + cos * innerRadius, 0, point[1] + sin * innerRadius,
        point[0] + cos * radius, 0, point[1] + sin * radius,
      );
      normals.push(0, 1, 0, 0, 1, 0);
    }

    for (let segment = 0; segment < segments; segment += 1) {
      const current = base + segment * 2;
      const next = current + 2;
      indices.push(current, current + 1, next + 1, current, next + 1, next);
    }
  };

  TRACE_ROUTES.forEach((route, routeIndex) => {
    const points = route.map(toLocal);
    const width = routeIndex % 7 === 0 ? trackWidth * 1.45 : trackWidth;

    for (let index = 0; index < points.length - 1; index += 1) {
      addRibbon(points[index], points[index + 1], width);
    }

    addVia(points[0], width * 1.7);
    addVia(points[points.length - 1], width * 1.7);
    if (routeIndex % 3 === 1 && points.length > 3) {
      addVia(points[Math.floor(points.length * 0.55)], width * 1.45);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
