export type Vec3Tuple = [number, number, number];

export type PCBTracePath = {
  id: string;
  points: Vec3Tuple[];
  radius: number;
  delay: number;
  weight: number;
};

export type PCBVia = {
  id: string;
  position: Vec3Tuple;
  radius: number;
  delay: number;
};

export type PCBChip = {
  id: string;
  position: Vec3Tuple;
  size: [number, number];
  delay: number;
  pins: Vec3Tuple[];
};

export type PCBParticleAttributes = {
  waterfallStart: Float32Array;
  pcbTarget: Float32Array;
  seed: Float32Array;
  delay: Float32Array;
  kind: Float32Array;
};

export type PCBLayout = {
  particles: PCBParticleAttributes;
  traces: PCBTracePath[];
  vias: PCBVia[];
  chips: PCBChip[];
  boardSize: [number, number];
};

const BOARD_WIDTH = 7.2;
const BOARD_HEIGHT = 6.25;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  let total = 0;
  for (let index = 0; index < 6; index += 1) total += rand();
  return total / 6 - 0.5;
}

function distance(a: Vec3Tuple, b: Vec3Tuple) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function pathLength(points: Vec3Tuple[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index]);
  }
  return total;
}

function samplePath(points: Vec3Tuple[], progress: number): Vec3Tuple {
  const totalLength = pathLength(points);
  let remaining = clamp(progress, 0, 1) * totalLength;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segmentLength = distance(start, end);

    if (remaining <= segmentLength || index === points.length - 1) {
      const t = segmentLength === 0 ? 0 : remaining / segmentLength;
      return [lerp(start[0], end[0], t), lerp(start[1], end[1], t), lerp(start[2], end[2], t)];
    }

    remaining -= segmentLength;
  }

  return points[points.length - 1];
}

function createTracePaths(): PCBTracePath[] {
  return [
    {
      id: "central-spine",
      points: [
        [0, 2.9, 0.03],
        [0, 1.78, 0.03],
        [0.16, 1.42, 0.03],
        [0.16, 0.88, 0.03],
        [0, 0.52, 0.03],
        [0, -2.82, 0.03],
      ],
      radius: 0.031,
      delay: 0.08,
      weight: 7,
    },
    {
      id: "upper-left-branch",
      points: [
        [0, 2.22, 0.04],
        [-0.62, 2.22, 0.04],
        [-1.05, 1.79, 0.04],
        [-2.48, 1.79, 0.04],
        [-2.85, 1.42, 0.04],
      ],
      radius: 0.024,
      delay: 0.36,
      weight: 1.7,
    },
    {
      id: "upper-right-branch",
      points: [
        [0, 1.54, 0.04],
        [0.82, 1.54, 0.04],
        [1.2, 1.91, 0.04],
        [2.72, 1.91, 0.04],
      ],
      radius: 0.024,
      delay: 0.4,
      weight: 1.6,
    },
    {
      id: "middle-right-branch",
      points: [
        [0.16, 0.72, 0.04],
        [0.62, 0.72, 0.04],
        [1.08, 0.26, 0.04],
        [2.58, 0.26, 0.04],
        [2.98, -0.14, 0.04],
      ],
      radius: 0.022,
      delay: 0.45,
      weight: 1.45,
    },
    {
      id: "middle-left-branch",
      points: [
        [0, 0.02, 0.04],
        [-0.56, 0.02, 0.04],
        [-1.04, -0.46, 0.04],
        [-2.82, -0.46, 0.04],
      ],
      radius: 0.022,
      delay: 0.48,
      weight: 1.45,
    },
    {
      id: "lower-right-branch",
      points: [
        [0, -0.78, 0.04],
        [0.78, -0.78, 0.04],
        [1.22, -1.22, 0.04],
        [2.78, -1.22, 0.04],
      ],
      radius: 0.024,
      delay: 0.54,
      weight: 1.7,
    },
    {
      id: "lower-left-branch",
      points: [
        [0, -1.48, 0.04],
        [-0.72, -1.48, 0.04],
        [-1.1, -1.86, 0.04],
        [-2.55, -1.86, 0.04],
      ],
      radius: 0.024,
      delay: 0.58,
      weight: 1.55,
    },
    {
      id: "bottom-route",
      points: [
        [0, -2.34, 0.04],
        [0.48, -2.34, 0.04],
        [0.82, -2.68, 0.04],
        [2.22, -2.68, 0.04],
      ],
      radius: 0.02,
      delay: 0.62,
      weight: 1.1,
    },
  ];
}

function createPins(position: Vec3Tuple, size: [number, number]): Vec3Tuple[] {
  const pins: Vec3Tuple[] = [];
  const [width, height] = size;
  const horizontalPins = Math.max(4, Math.floor(width / 0.14));
  const verticalPins = Math.max(3, Math.floor(height / 0.14));

  for (let index = 0; index < horizontalPins; index += 1) {
    const x = position[0] - width / 2 + ((index + 0.5) / horizontalPins) * width;
    pins.push([x, position[1] + height / 2 + 0.085, 0.09]);
    pins.push([x, position[1] - height / 2 - 0.085, 0.09]);
  }

  for (let index = 0; index < verticalPins; index += 1) {
    const y = position[1] - height / 2 + ((index + 0.5) / verticalPins) * height;
    pins.push([position[0] - width / 2 - 0.085, y, 0.09]);
    pins.push([position[0] + width / 2 + 0.085, y, 0.09]);
  }

  return pins;
}

function createChips(): PCBChip[] {
  const chipSpecs: Array<Omit<PCBChip, "pins">> = [
    { id: "left-processor", position: [-2.15, -0.12, 0.08], size: [0.82, 0.64], delay: 0.76 },
    { id: "right-controller", position: [2.08, -1.22, 0.08], size: [0.96, 0.72], delay: 0.79 },
    { id: "top-memory", position: [2.34, 1.92, 0.08], size: [0.7, 0.5], delay: 0.82 },
    { id: "left-module", position: [-2.55, 1.52, 0.08], size: [0.58, 0.42], delay: 0.84 },
  ];

  return chipSpecs.map((chip) => ({ ...chip, pins: createPins(chip.position, chip.size) }));
}

function createVias(): PCBVia[] {
  return [
    [-0.02, 2.25, 0.08],
    [-1.08, 1.79, 0.08],
    [-2.84, 1.42, 0.08],
    [0.82, 1.54, 0.08],
    [1.2, 1.91, 0.08],
    [2.72, 1.91, 0.08],
    [0.62, 0.72, 0.08],
    [1.08, 0.26, 0.08],
    [2.98, -0.14, 0.08],
    [-1.04, -0.46, 0.08],
    [-2.82, -0.46, 0.08],
    [0.78, -0.78, 0.08],
    [1.22, -1.22, 0.08],
    [2.78, -1.22, 0.08],
    [-1.1, -1.86, 0.08],
    [-2.55, -1.86, 0.08],
    [0.82, -2.68, 0.08],
    [2.22, -2.68, 0.08],
  ].map((position, index) => ({
    id: `via-${index}`,
    position: position as Vec3Tuple,
    radius: index % 3 === 0 ? 0.105 : 0.082,
    delay: 0.58 + index * 0.012,
  }));
}

function weightedTrace(traces: PCBTracePath[], rand: () => number) {
  const totalWeight = traces.reduce((total, trace) => total + trace.weight, 0);
  let value = rand() * totalWeight;

  for (const trace of traces) {
    value -= trace.weight;
    if (value <= 0) return trace;
  }

  return traces[0];
}

function targetFromTrace(traces: PCBTracePath[], rand: () => number) {
  const trace = weightedTrace(traces, rand);
  const along = rand();
  const target = samplePath(trace.points, along);
  const branchDistance = clamp(Math.abs(target[0]) / (BOARD_WIDTH / 2), 0, 1);
  const jitter = trace.id === "central-spine" ? 0.018 : 0.024;

  return {
    target: [target[0] + gaussian(rand) * jitter, target[1] + gaussian(rand) * jitter, target[2] + gaussian(rand) * 0.018] as Vec3Tuple,
    delay: clamp(trace.delay + along * 0.16 + branchDistance * 0.16 + rand() * 0.035, 0, 0.95),
  };
}

function targetFromVia(vias: PCBVia[], rand: () => number) {
  const via = vias[Math.floor(rand() * vias.length) % vias.length];
  const angle = rand() * Math.PI * 2;
  const ring = via.radius * (0.58 + rand() * 0.42);

  return {
    target: [via.position[0] + Math.cos(angle) * ring, via.position[1] + Math.sin(angle) * ring, via.position[2]] as Vec3Tuple,
    delay: clamp(via.delay + rand() * 0.08, 0, 0.98),
  };
}

function targetFromChip(chips: PCBChip[], rand: () => number) {
  const chip = chips[Math.floor(rand() * chips.length) % chips.length];
  const pinBias = rand() < 0.62;

  if (pinBias) {
    const pin = chip.pins[Math.floor(rand() * chip.pins.length) % chip.pins.length];
    return {
      target: [pin[0] + gaussian(rand) * 0.026, pin[1] + gaussian(rand) * 0.026, pin[2]] as Vec3Tuple,
      delay: clamp(chip.delay + rand() * 0.1, 0, 1),
    };
  }

  const edge = rand();
  const x = chip.position[0] + (rand() - 0.5) * chip.size[0];
  const y = chip.position[1] + (rand() - 0.5) * chip.size[1];
  const edgeX = edge < 0.5 ? chip.position[0] + (rand() < 0.5 ? -chip.size[0] / 2 : chip.size[0] / 2) : x;
  const edgeY = edge >= 0.5 ? chip.position[1] + (rand() < 0.5 ? -chip.size[1] / 2 : chip.size[1] / 2) : y;

  return {
    target: [edgeX, edgeY, chip.position[2] + 0.02] as Vec3Tuple,
    delay: clamp(chip.delay + rand() * 0.12, 0, 1),
  };
}

function decorativeTarget(rand: () => number): Vec3Tuple {
  const x = (rand() - 0.5) * (BOARD_WIDTH - 0.65);
  const y = (rand() - 0.5) * (BOARD_HEIGHT - 0.65);
  const snappedX = Math.round(x * 6) / 6;
  const snappedY = Math.round(y * 6) / 6;

  return [snappedX + gaussian(rand) * 0.025, snappedY + gaussian(rand) * 0.025, 0.05];
}

function waterfallStart(rand: () => number, kind: number): Vec3Tuple {
  if (kind === 1) {
    return [gaussian(rand) * 2.2, -2.65 + rand() * 1.05, gaussian(rand) * 1.15 - 0.2];
  }

  const y = 3.12 - rand() * 6.45;
  const lowerSpread = clamp((1.3 - y) / 4.2, 0, 1);
  const xSpread = lerp(0.13, 0.42, lowerSpread);
  const zSpread = lerp(0.18, 0.6, lowerSpread);
  const splash = y < -2.35 && rand() < 0.24;

  if (splash) {
    return [gaussian(rand) * 1.4, -2.9 + rand() * 0.42, gaussian(rand) * 1.1];
  }

  return [gaussian(rand) * xSpread, y, gaussian(rand) * zSpread - 0.1];
}

export function generatePCBLayout(particleCount: number, seed = 5712): PCBLayout {
  const rand = mulberry32(seed + particleCount * 13);
  const traces = createTracePaths();
  const vias = createVias();
  const chips = createChips();

  const waterfallStartArray = new Float32Array(particleCount * 3);
  const pcbTargetArray = new Float32Array(particleCount * 3);
  const seedArray = new Float32Array(particleCount);
  const delayArray = new Float32Array(particleCount);
  const kindArray = new Float32Array(particleCount);

  for (let index = 0; index < particleCount; index += 1) {
    const selector = rand();
    let kind = 0;
    let target: Vec3Tuple;
    let delay = 0;

    if (selector < 0.1) {
      kind = 1;
      const traceTarget = targetFromTrace(traces, rand);
      target = traceTarget.target;
      delay = clamp(0.52 + rand() * 0.28, 0, 1);
    } else if (selector < 0.76) {
      const traceTarget = targetFromTrace(traces, rand);
      target = traceTarget.target;
      delay = traceTarget.delay;
    } else if (selector < 0.86) {
      kind = 2;
      const viaTarget = targetFromVia(vias, rand);
      target = viaTarget.target;
      delay = viaTarget.delay;
    } else if (selector < 0.96) {
      kind = 3;
      const chipTarget = targetFromChip(chips, rand);
      target = chipTarget.target;
      delay = chipTarget.delay;
    } else {
      kind = 4;
      target = decorativeTarget(rand);
      delay = clamp(0.65 + rand() * 0.26, 0, 1);
    }

    const start = waterfallStart(rand, kind);
    const offset = index * 3;
    waterfallStartArray[offset] = start[0];
    waterfallStartArray[offset + 1] = start[1];
    waterfallStartArray[offset + 2] = start[2];
    pcbTargetArray[offset] = target[0];
    pcbTargetArray[offset + 1] = target[1];
    pcbTargetArray[offset + 2] = target[2];
    seedArray[index] = rand() * 1000;
    delayArray[index] = delay;
    kindArray[index] = kind;
  }

  return {
    particles: {
      waterfallStart: waterfallStartArray,
      pcbTarget: pcbTargetArray,
      seed: seedArray,
      delay: delayArray,
      kind: kindArray,
    },
    traces,
    vias,
    chips,
    boardSize: [BOARD_WIDTH, BOARD_HEIGHT],
  };
}
