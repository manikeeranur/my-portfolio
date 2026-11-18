"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { bleedCanvasProps, pagePointer, ZOOM } from "@/components/three/canvasProps";

const ACCENT = "#6d5cd8";
const TEAL = "#2dd4bf";
const PINK = "#ec4899";

const BADGES = [
  { key: "exp", pos: [-1.2, 1.1, 0.6], icon: "fa-briefcase", from: ACCENT, to: "#a78bfa", title: "5+ Years", sub: "Experience" },
  { key: "react", pos: [1.15, 0.05, 0.7], icon: "fa-code", from: "#14b8a6", to: TEAL, title: "React · Next.js", sub: "Frontend" },
  { key: "proj", pos: [-1.05, -1.1, 0.65], icon: "fa-rocket", from: PINK, to: "#f472b6", title: "10+ Projects", sub: "Delivered" },
];

/* Portrait: photo masked by a gently breathing edge with a thin gradient rim. */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;

  vec3 rim(float a) {
    vec3 c1 = vec3(0.427, 0.361, 0.847); // accent
    vec3 c2 = vec3(0.545, 0.361, 0.965); // violet
    vec3 c3 = vec3(0.769, 0.710, 0.992); // lilac highlight
    float t = fract(a / 6.28318 + uTime * 0.04);
    vec3 c = mix(c1, c2, smoothstep(0.0, 0.33, t));
    c = mix(c, c3, smoothstep(0.33, 0.66, t));
    return mix(c, c1, smoothstep(0.66, 1.0, t));
  }

  void main() {
    vec2 p = vUv - 0.5;
    float a = atan(p.y, p.x);
    float r = length(p);

    float edge = 0.37
      + 0.010 * sin(3.0 * a + uTime * 0.6)
      + 0.006 * sin(5.0 * a - uTime * 0.8)
      + 0.003 * sin(7.0 * a + uTime * 1.1);

    float aa = 0.004;
    float inside = 1.0 - smoothstep(edge - aa, edge, r);
    float ring = smoothstep(edge - aa, edge, r) * (1.0 - smoothstep(edge + 0.016, edge + 0.016 + aa, r));
    float glow = (1.0 - smoothstep(edge, edge + 0.1, r)) * 0.3;

    // photo, zoomed on the face, with a little pointer parallax
    vec2 uv = vec2(0.5, 0.58) + p * 1.18 + uPointer * 0.025;
    vec3 photo = texture2D(uTex, uv).rgb;
    // soft inner vignette so the edge feels like depth
    photo *= mix(0.72, 1.0, 1.0 - smoothstep(edge - 0.12, edge, r));

    vec3 rc = rim(a);
    vec3 col = photo * inside + rc * ring + rc * glow * (1.0 - inside - ring);
    float alpha = inside + ring + glow * (1.0 - inside - ring);

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

function LiquidPortrait({ photo }) {
  const tex = useTexture(photo);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: tex },
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
      }),
    [tex]
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPointer.value.lerp(pagePointer, 0.06);
  });

  return (
    <mesh material={material} renderOrder={2}>
      <planeGeometry args={[3.6, 3.6]} />
    </mesh>
  );
}

function Badge({ b, i }) {
  return (
    <Float speed={2 + i * 0.5} floatIntensity={1.3} rotationIntensity={0.2}>
      <Html transform sprite position={b.pos} distanceFactor={3.6} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
        <div className="hero-badge">
          <span className="hero-badge-icon" style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}>
            <i className={`fa ${b.icon}`} aria-hidden="true" />
          </span>
          <span>
            <strong>{b.title}</strong>
            <small>{b.sub}</small>
          </span>
        </div>
      </Html>
    </Float>
  );
}

function useAuraTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d");
    const blob = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    };
    blob(300, 210, 230, "rgba(139,123,240,0.55)");
    blob(200, 320, 200, "rgba(45,212,191,0.28)");
    blob(256, 256, 170, "rgba(196,181,253,0.45)");
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function Scene({ photo }) {
  const rig = useRef();
  const halo = useRef();
  const aura = useAuraTexture();

  useFrame((state, d) => {
    const { x, y } = pagePointer;
    if (rig.current) {
      rig.current.rotation.x += (-y * 0.22 - rig.current.rotation.x) * 0.06;
      rig.current.rotation.y += (x * 0.35 - rig.current.rotation.y) * 0.06;
    }
    if (halo.current) halo.current.rotation.z += d * 0.08;
  });

  return (
    <group ref={rig}>
      {/* soft gradient aura behind the portrait */}
      <mesh ref={halo} position={[0, 0, -1.2]}>
        <planeGeometry args={[5.2, 5.2]} />
        <meshBasicMaterial map={aura} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <LiquidPortrait photo={photo} />
      </Float>

      {BADGES.map((b, i) => (
        <Badge key={b.key} b={b} i={i} />
      ))}
    </group>
  );
}

export default function HeroScene3D({ photo }) {
  const canvasProps = useMemo(() => bleedCanvasProps(), []);
  return (
    <Canvas camera={{ position: [0, 0, 5 * ZOOM], fov: 45 }} {...canvasProps}>
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, 1, 3]} intensity={0.9} color="#c4b5fd" />
      <pointLight position={[-3, -2, 2]} intensity={18} color={TEAL} />
      <pointLight position={[3, -2, 1]} intensity={18} color={PINK} />
      <Suspense fallback={null}>
        <Scene photo={photo} />
      </Suspense>
      <Sparkles count={18} scale={5} size={2} speed={0.25} opacity={0.6} color={ACCENT} />
    </Canvas>
  );
}
