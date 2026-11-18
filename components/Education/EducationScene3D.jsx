"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { bleedCanvasProps, pagePointer, ZOOM } from "@/components/three/canvasProps";

const NAVY = "#1f1b45";
const GOLD = "#f5b942";
const TEAL = "#14b8a6";
const ACCENT = "#6247e8";

function Tassel() {
  const swing = useRef();
  const cord = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.255, 0),
      new THREE.Vector3(0.6, 0.25, 0),
      new THREE.Vector3(1.22, 0.235, 0),
      new THREE.Vector3(1.3, 0.05, 0),
      new THREE.Vector3(1.3, -0.3, 0),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.014, 8, false);
  }, []);
  useFrame((state) => {
    if (swing.current) swing.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.6) * 0.08;
  });
  return (
    <group ref={swing}>
      <mesh geometry={cord}>
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[1.3, -0.42, 0]}>
        <coneGeometry args={[0.07, 0.24, 20]} />
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Cap() {
  return (
    <group rotation={[0.35, 0, 0]}>
      {/* skull cap */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.48, 48]} />
        <meshPhysicalMaterial color={NAVY} roughness={0.5} clearcoat={0.4} />
      </mesh>
      {/* board */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <RoundedBox args={[1.85, 0.07, 1.85]} radius={0.025} smoothness={4} position={[0, 0.17, 0]}>
          <meshPhysicalMaterial color={NAVY} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
        </RoundedBox>
      </group>
      {/* button */}
      <mesh position={[0, 0.225, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
      </mesh>
      <Tassel />
    </group>
  );
}

function Diploma() {
  return (
    <group rotation={[0.2, 0.5, Math.PI / 2 - 0.25]}>
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 1.25, 32]} />
        <meshPhysicalMaterial color="#fbf7ee" roughness={0.6} clearcoat={0.2} />
      </mesh>
      {[-0.63, 0.63].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.13, 32]} />
          <meshStandardMaterial color="#e8dfc9" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.028, 12, 40]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Books() {
  return (
    <group>
      <RoundedBox args={[1.1, 0.18, 0.75]} radius={0.03} position={[0, 0, 0]}>
        <meshPhysicalMaterial color={ACCENT} roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[0.02, 0, 0.001]}>
        <boxGeometry args={[1.04, 0.14, 0.75]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <group position={[0.05, 0.19, 0]} rotation={[0, 0.25, 0]}>
        <RoundedBox args={[0.95, 0.16, 0.66]} radius={0.03}>
          <meshPhysicalMaterial color={TEAL} roughness={0.35} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[0.02, 0, 0.001]}>
          <boxGeometry args={[0.89, 0.12, 0.66]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  const rig = useRef();
  useFrame((state) => {
    if (!rig.current) return;
    const t = state.clock.elapsedTime;
    const { x, y } = pagePointer;
    rig.current.rotation.y += (Math.sin(t * 0.35) * 0.4 + x * 0.3 - rig.current.rotation.y) * 0.04;
    rig.current.rotation.x += (-y * 0.15 - rig.current.rotation.x) * 0.04;
  });
  return (
    <group ref={rig}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.7}>
        <group position={[0, 0.55, 0]}>
          <Cap />
        </group>
      </Float>
      <Float speed={2.4} rotationIntensity={0.3} floatIntensity={0.9}>
        <group position={[-1.05, -0.75, 0.6]} scale={0.95}>
          <Diploma />
        </group>
      </Float>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
        <group position={[0.75, -1.05, 0.2]} rotation={[0.35, -0.5, 0]} scale={0.95}>
          <Books />
        </group>
      </Float>
    </group>
  );
}

export default function EducationScene3D() {
  const canvasProps = useMemo(() => bleedCanvasProps(), []);
  return (
    <Canvas camera={{ position: [0, 0.1, 5.2 * ZOOM], fov: 45 }} {...canvasProps}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <pointLight position={[-3, -1, 3]} intensity={14} color={TEAL} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#99f6e4" position={[5, 0, 2]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1} color="#c4b5fd" position={[-5, 1, 2]} scale={[3, 6, 1]} />
      </Environment>
      <Scene />
      <Sparkles count={24} scale={[4.5, 4.5, 2]} size={2} speed={0.3} opacity={0.6} color={GOLD} />
    </Canvas>
  );
}
