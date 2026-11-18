"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const tmp = new THREE.Vector3();

/**
 * Places DOM items (skill icons / code chips) on a tilted ring that spins.
 * Items behind the centre fade + shrink so the orbit reads as 3D.
 */
export default function OrbitItems({
  items,
  radius = 2,
  speed = 0.3,
  tilt = [0.35, 0, 0.12],
  y = 0,
  renderItem,
}) {
  const spin = useRef();
  const nodes = useRef([]);

  useFrame((_, delta) => {
    if (!spin.current) return;
    spin.current.rotation.y += delta * speed;
    nodes.current.forEach((el, i) => {
      const anchor = spin.current.children[i];
      if (!el || !anchor) return;
      anchor.getWorldPosition(tmp);
      const front = THREE.MathUtils.clamp((tmp.z + radius) / (radius * 2), 0, 1);
      el.style.opacity = String(0.35 + front * 0.65);
      el.style.transform = `scale(${0.7 + front * 0.35})`;
      el.style.filter = front < 0.4 ? "blur(0.6px)" : "none";
    });
  });

  return (
    <group rotation={tilt} position={[0, y, 0]}>
      <group ref={spin}>
        {items.map((item, i) => {
          const a = (i / items.length) * Math.PI * 2;
          return (
            <group key={item.key} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
              <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div ref={(el) => (nodes.current[i] = el)} className="orbit-item">
                  {renderItem(item)}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
}
