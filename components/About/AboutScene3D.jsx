"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, Lightformer, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import OrbitItems from "@/components/three/OrbitItems";
import MacLaptop from "./MacLaptop";
import { bleedCanvasProps, pagePointer, ZOOM } from "@/components/three/canvasProps";

const ACCENT = "#6d5cd8";
const BLOB = "#8b7bf0";
const TEAL = "#2dd4bf";
const PINK = "#ec4899";

const SKILLS = ["html", "css", "javascript", "typescript", "reactjs", "nextjs", "tailwind", "git"].map(
  (name) => ({ key: name, src: `/images/skills/${name}.svg` })
);

function Laptop() {
  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.5}>
      <MacLaptop position={[-0.1, -0.6, 0.85]} rotation={[0.24, -0.42, 0]} scale={0.86} />
    </Float>
  );
}

function Steam({ delay }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime + delay) % 2.4) / 2.4;
    ref.current.position.y = 0.2 + t * 0.55;
    ref.current.position.x = Math.sin((t + delay) * 6) * 0.04;
    ref.current.scale.setScalar(0.05 + t * 0.07);
    ref.current.material.opacity = Math.sin(t * Math.PI) * 0.5;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
    </mesh>
  );
}

function Mug() {
  return (
    <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group position={[1.35, -0.75, 1.0]} rotation={[0.25, -0.5, 0]} scale={0.85}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.15, 0.36, 40]} />
          <meshPhysicalMaterial color={PINK} roughness={0.25} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#4a2c1d" roughness={0.4} />
        </mesh>
        <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.09, 0.03, 16, 32, Math.PI]} />
          <meshPhysicalMaterial color={PINK} roughness={0.25} clearcoat={1} />
        </mesh>
        <Steam delay={0} />
        <Steam delay={0.8} />
        <Steam delay={1.6} />
      </group>
    </Float>
  );
}

function Pill({ position, children, speed }) {
  return (
    <Float speed={speed} floatIntensity={1.2} rotationIntensity={0.15}>
      <Html transform sprite position={position} distanceFactor={4} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div className="about-pill">{children}</div>
      </Html>
    </Float>
  );
}

function Scene() {
  const group = useRef();
  const halo = useRef();

  useFrame((state, d) => {
    if (group.current) {
      const { x, y } = pagePointer;
      group.current.rotation.x += (-y * 0.15 - group.current.rotation.x) * 0.05;
      group.current.rotation.y += (x * 0.3 - group.current.rotation.y) * 0.05;
    }
    if (halo.current) halo.current.rotation.z += d * 0.3;
  });

  return (
    <group ref={group}>
      {/* backdrop */}
      <group position={[0, 0.45, -0.9]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
          <mesh scale={1.15}>
            <icosahedronGeometry args={[1, 64]} />
            <MeshDistortMaterial
              color={BLOB}
              distort={0.38}
              speed={1.8}
              roughness={0.15}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
        </Float>
        <mesh ref={halo} rotation={[0.25, 0.3, 0]}>
          <torusGeometry args={[1.6, 0.02, 16, 160, Math.PI * 1.6]} />
          <meshBasicMaterial color={TEAL} toneMapped={false} />
        </mesh>
      </group>

      <Laptop />
      <Mug />

      <Pill position={[-1.45, 1.25, 0.4]} speed={2.2}>
        <span className="about-pill-ok">✓</span> Build passed
      </Pill>
      <Pill position={[1.35, 1.35, 0.2]} speed={2.8}>
        <span style={{ color: "#c084fc" }}>$</span> git push 🚀
      </Pill>

      <OrbitItems
        items={SKILLS}
        radius={2.05}
        speed={0.35}
        y={0.1}
        renderItem={(s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.src} alt="" className="orbit-skill" />
        )}
      />
    </group>
  );
}

export default function AboutScene3D() {
  const canvasProps = useMemo(() => bleedCanvasProps(), []);
  return (
    <Canvas camera={{ position: [0, 0.2, 5.6 * ZOOM], fov: 45 }} {...canvasProps}>
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-3, 2, 4]} intensity={0.8} color="#c4b5fd" />
      <pointLight position={[-4, -2, 2]} intensity={20} color={TEAL} />
      <pointLight position={[4, -3, -2]} intensity={20} color={PINK} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#c4b5fd" position={[-5, 1, 2]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#99f6e4" position={[5, 0, 1]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[0, -3, 4]} scale={[6, 1, 1]} />
      </Environment>
      <Scene />
      <Sparkles count={40} scale={5} size={2.5} speed={0.4} color={ACCENT} />
    </Canvas>
  );
}
