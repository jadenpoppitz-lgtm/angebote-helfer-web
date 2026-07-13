export const waterfallPcbVertexShader = `
  attribute vec3 aWaterfallStart;
  attribute vec3 aPcbTarget;
  attribute float aSeed;
  attribute float aDelay;
  attribute float aKind;

  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;

  varying float vMorph;
  varying float vKind;
  varying float vProgress;
  varying float vPulse;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float ease(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    float streamLock = smoothstep(0.20, 0.52, uProgress);
    float guidedPhase = smoothstep(0.38, 0.72, uProgress);
    float morphAmount = smoothstep(0.25, 0.88, uProgress - aDelay * 0.12);
    float latePhase = smoothstep(0.70, 1.0, uProgress);

    vec3 water = aWaterfallStart;
    float fall = mod(uTime * (0.32 + hash(aSeed + 2.0) * 0.38) + hash(aSeed) * 7.0, 1.0);
    water.y -= fall * 6.3;
    if (water.y < -3.24) {
      water.y += 6.48;
    }

    float lower = smoothstep(0.25, 1.0, (1.35 - water.y) / 4.6);
    float sway = sin(uTime * (0.9 + hash(aSeed + 9.0)) + aSeed * 0.09) * 0.12;
    float ripple = sin((water.y + uTime * 1.4) * 7.0 + aSeed) * 0.045;

    water.x += (sway + ripple) * (1.0 - streamLock) * (1.0 - morphAmount);
    water.z += sin(uTime * 1.2 + aSeed * 0.07) * 0.08 * (1.0 - streamLock) * (1.0 - morphAmount);
    water.x *= mix(1.0, 0.32, streamLock);
    water.z *= mix(1.0, 0.22, streamLock);

    if (aKind > 0.5 && aKind < 1.5) {
      float mistLift = sin(uTime * 0.75 + aSeed) * 0.12;
      water.x += sin(uTime * 0.55 + aSeed * 0.17) * 0.36 * (1.0 - morphAmount);
      water.y += mistLift * (1.0 - morphAmount);
      water.z += cos(uTime * 0.4 + aSeed * 0.13) * 0.24 * (1.0 - morphAmount);
    }

    vec3 controlled = water;
    controlled.x = mix(controlled.x, aPcbTarget.x * 0.2, guidedPhase);
    controlled.z = mix(controlled.z, aPcbTarget.z, guidedPhase * 0.75);

    float verticalSnap = smoothstep(0.48, 0.78, uProgress - aDelay * 0.08);
    controlled.y = mix(controlled.y, aPcbTarget.y, verticalSnap);

    vec3 routed = controlled;
    float branchPull = smoothstep(0.52, 0.82, uProgress - aDelay * 0.08);
    routed.x = mix(controlled.x, aPcbTarget.x, branchPull);
    routed.y = mix(controlled.y, aPcbTarget.y, branchPull);

    vec3 position = mix(controlled, routed, ease(branchPull));
    position = mix(position, aPcbTarget, morphAmount);

    float electric = sin(uTime * 13.0 + aSeed * 1.37) * 0.012 * latePhase;
    position.xy += vec2(electric, -electric * 0.42) * (1.0 - smoothstep(0.92, 1.0, uProgress));

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float kindBoost = aKind > 2.5 ? 1.18 : 1.0;
    float mistBoost = aKind > 0.5 && aKind < 1.5 ? 2.15 : 1.0;
    float waterSize = mix(2.25, 1.65, streamLock) * mistBoost;
    float pcbSize = mix(1.22, 1.72, step(1.5, aKind)) * kindBoost;
    float pointSize = mix(waterSize, pcbSize, morphAmount);
    pointSize *= 32.0 / max(3.2, -mvPosition.z);

    gl_PointSize = pointSize * uPixelRatio;

    vMorph = morphAmount;
    vKind = aKind;
    vProgress = uProgress;
    vPulse = 0.5 + 0.5 * sin(uTime * 5.0 + aSeed * 0.43 + aPcbTarget.y * 3.0);
  }
`;

export const waterfallPcbFragmentShader = `
  precision highp float;

  varying float vMorph;
  varying float vKind;
  varying float vProgress;
  varying float vPulse;

  void main() {
    vec2 uv = gl_PointCoord.xy - vec2(0.5);
    float radius = length(uv);
    float softCircle = smoothstep(0.5, 0.08, radius);

    if (softCircle <= 0.01) discard;

    vec3 waterColor = mix(vec3(0.5, 0.69, 0.68), vec3(0.78, 0.92, 0.84), vPulse * 0.3);
    vec3 pcbColor = mix(vec3(0.05, 0.52, 0.18), vec3(0.48, 0.88, 0.28), vPulse);
    vec3 viaColor = vec3(0.74, 1.0, 0.55);
    vec3 chipColor = vec3(0.22, 0.78, 0.28);

    vec3 color = mix(waterColor, pcbColor, vMorph);
    if (vKind > 1.5 && vKind < 2.5) color = mix(color, viaColor, vMorph);
    if (vKind > 2.5 && vKind < 3.5) color = mix(color, chipColor, vMorph);

    float mist = step(0.5, vKind) * (1.0 - step(1.5, vKind));
    float alpha = mix(0.045, 0.3, vMorph) * softCircle;
    alpha *= mix(1.0, 0.42, mist * (1.0 - vMorph));
    alpha *= mix(0.78, 1.0, smoothstep(0.12, 0.94, vProgress));

    float glow = mix(0.58, 1.16 + vPulse * 0.34, vMorph);
    gl_FragColor = vec4(color * glow, alpha);
  }
`;
