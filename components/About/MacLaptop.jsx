"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const ALU = "#d9dbe0";
const ALU_DARK = "#c4c7cd";
const KEY = "#141416";

/* ---------- screen: an editor drawn into a canvas texture ---------- */

const CODE_LINES = [
  [["import", "#c792ea"], [" { useState } ", "#e2e8f0"], ["from", "#c792ea"], [" 'react'", "#c3e88d"], [";", "#e2e8f0"]],
  [],
  [["export default function", "#c792ea"], [" Dev", "#82aaff"], ["() {", "#e2e8f0"]],
  [["  const", "#c792ea"], [" [coffee, setCoffee] = ", "#e2e8f0"], ["useState", "#82aaff"], ["(", "#e2e8f0"], ["true", "#f78c6c"], [");", "#e2e8f0"]],
  [["  return", "#c792ea"], [" (", "#e2e8f0"]],
  [["    <", "#89ddff"], ["Portfolio", "#f07178"]],
  [["      skills", "#ffcb6b"], ["={[", "#89ddff"], ["'React'", "#c3e88d"], [", ", "#e2e8f0"], ["'Next.js'", "#c3e88d"], ["]}", "#89ddff"]],
  [["    />", "#89ddff"]],
  [["  );", "#e2e8f0"]],
  [["}", "#e2e8f0"]],
];
const TOTAL_CHARS = CODE_LINES.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1, 0);

const TEX_W = 1024;
const TEX_H = 632;

function drawScreen(ctx, typed, caretOn) {
  const W = TEX_W;
  const H = TEX_H;
  // wallpaper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#3b2a7a");
  bg.addColorStop(1, "#0f766e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // top menu bar + notch
  ctx.fillStyle = "rgba(15,15,25,0.55)";
  ctx.fillRect(0, 0, W, 30);
  ctx.fillStyle = "#000";
  roundRect(ctx, W / 2 - 70, -12, 140, 38, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 17px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("Code", 22, 21);
  ctx.fillText("10:24", W - 70, 21);

  // editor window
  const x = 46;
  const y = 52;
  const w = W - 92;
  const h = H - 76;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#1e1e2e";
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, 16);
  ctx.clip();

  // title bar
  ctx.fillStyle = "#2a2a3d";
  ctx.fillRect(x, y, w, 40);
  [["#ff5f57", 0], ["#febc2e", 1], ["#28c840", 2]].forEach(([c, i]) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + 24 + i * 22, y + 20, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#1e1e2e";
  roundRect(ctx, x + 100, y + 6, 130, 34, 8);
  ctx.fill();
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "500 16px Menlo, Consolas, monospace";
  ctx.fillText("Dev.jsx", x + 126, y + 28);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(x + 112, y + 18, 8, 8);

  // code
  const lineH = 44;
  const top = y + 82;
  const gutter = x + 58;
  ctx.font = "500 25px Menlo, Consolas, monospace";
  let left = typed;
  let caret = null;
  CODE_LINES.forEach((line, li) => {
    const ly = top + li * lineH;
    ctx.fillStyle = "#4b5068";
    ctx.textAlign = "right";
    ctx.fillText(String(li + 1), gutter - 18, ly);
    ctx.textAlign = "left";
    let cx = gutter;
    for (const [t, c] of line) {
      if (left <= 0) break;
      const shown = t.slice(0, left);
      ctx.fillStyle = c;
      ctx.fillText(shown, cx, ly);
      cx += ctx.measureText(shown).width;
      left -= t.length;
    }
    if (left > 0) left -= 1; // newline
    else if (!caret) caret = [cx, ly];
  });
  if (!caret) caret = [gutter, top + CODE_LINES.length * lineH];
  if (caretOn) {
    ctx.fillStyle = "#2dd4bf";
    ctx.fillRect(caret[0] + 2, caret[1] - 22, 3, 28);
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function useScreenTexture() {
  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, ctx: c.getContext("2d"), texture: t };
  }, []);

  const typed = useRef(0);
  const last = useRef("");

  useEffect(() => {
    const id = setInterval(() => {
      typed.current = typed.current >= TOTAL_CHARS + 30 ? 0 : typed.current + 1;
    }, 55);
    return () => clearInterval(id);
  }, []);

  useFrame((state) => {
    const caretOn = Math.floor(state.clock.elapsedTime * 2) % 2 === 0;
    const key = `${typed.current}-${caretOn}`;
    if (key === last.current) return;
    last.current = key;
    drawScreen(ctx, Math.min(typed.current, TOTAL_CHARS), caretOn);
    texture.needsUpdate = true;
  });

  useEffect(() => () => texture.dispose(), [texture]);
  return { texture, canvas };
}

/* ---------- small helpers ---------- */

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function useGrilleTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = ALU;
    ctx.fillRect(0, 0, 64, 256);
    ctx.fillStyle = "#3a3c42";
    for (let yy = 4; yy < 256; yy += 8) {
      for (let xx = 4 + ((yy / 8) % 2) * 4; xx < 64; xx += 8) {
        ctx.beginPath();
        ctx.arc(xx, yy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function Keys() {
  const ref = useRef();
  const COLS = 13;
  const ROWS = 4;
  const PITCH = 0.148;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        m.makeTranslation((c - (COLS - 1) / 2) * PITCH, 0.006, 0.16 + r * 0.14);
        ref.current.setMatrixAt(i++, m);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  const bottomZ = 0.16 + ROWS * 0.14;
  return (
    <group>
      <instancedMesh ref={ref} args={[null, null, COLS * ROWS]}>
        <boxGeometry args={[0.128, 0.012, 0.118]} />
        <meshStandardMaterial color={KEY} roughness={0.55} />
      </instancedMesh>
      {/* bottom row: modifiers + space bar */}
      {[-5.5, -4.5, -3.5, 3.5, 4.5, 5.5].map((c) => (
        <mesh key={c} position={[c * PITCH * 1.0, 0.006, bottomZ]}>
          <boxGeometry args={[0.128, 0.012, 0.118]} />
          <meshStandardMaterial color={KEY} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.006, bottomZ]}>
        <boxGeometry args={[0.86, 0.012, 0.118]} />
        <meshStandardMaterial color={KEY} roughness={0.55} />
      </mesh>
    </group>
  );
}

/* ---------- the laptop ---------- */

export default function MacLaptop(props) {
  const lid = useRef();
  const glow = useRef();
  const { texture } = useScreenTexture();
  const grille = useGrilleTexture();

  const trackpad = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(0.98, 0.6, 0.05), 12), []);
  const bezel = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(2.44, 1.58, 0.07), 12), []);

  useFrame((state) => {
    if (!lid.current) return;
    const target = -0.18;
    lid.current.rotation.x += (target - lid.current.rotation.x) * 0.045;
    if (glow.current) {
      const open = THREE.MathUtils.clamp(1 - (lid.current.rotation.x - target) / 1.6, 0, 1);
      glow.current.intensity = open * (5 + Math.sin(state.clock.elapsedTime * 2) * 0.4);
    }
  });

  return (
    <group {...props}>
      {/* base */}
      <RoundedBox args={[2.5, 0.06, 1.72]} radius={0.028} smoothness={5} position={[0, -0.03, 0.61]}>
        <meshPhysicalMaterial color={ALU} metalness={0.85} roughness={0.32} clearcoat={0.3} />
      </RoundedBox>
      {/* front thumb notch */}
      <mesh position={[0, -0.03, 1.471]}>
        <boxGeometry args={[0.32, 0.03, 0.004]} />
        <meshStandardMaterial color={ALU_DARK} metalness={0.8} roughness={0.4} />
      </mesh>
      {/* keyboard well */}
      <mesh position={[0, 0.0008, 0.44]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 0.76]} />
        <meshStandardMaterial color="#9fa3ab" metalness={0.6} roughness={0.5} />
      </mesh>
      <Keys />
      {/* speaker grilles */}
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0.001, 0.44]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.17, 0.76]} />
          <meshStandardMaterial map={grille} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      {/* trackpad */}
      <mesh geometry={trackpad} position={[0, 0.0012, 1.13]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color={ALU_DARK} metalness={0.7} roughness={0.22} clearcoat={0.6} />
      </mesh>
      {/* hinge */}
      <mesh position={[0, 0.0, -0.24]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 24]} />
        <meshStandardMaterial color="#2b2d31" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* lid */}
      <group ref={lid} position={[0, 0.0, -0.25]} rotation={[1.5, 0, 0]}>
        <RoundedBox args={[2.5, 1.64, 0.035]} radius={0.016} smoothness={5} position={[0, 0.82, 0]}>
          <meshPhysicalMaterial color={ALU} metalness={0.85} roughness={0.3} clearcoat={0.3} />
        </RoundedBox>
        <mesh geometry={bezel} position={[0, 0.82, 0.0185]}>
          <meshStandardMaterial color="#050506" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.83, 0.019]}>
          <planeGeometry args={[2.3, 1.42]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <pointLight ref={glow} position={[0, 0.8, 0.7]} color="#8b5cf6" intensity={0} distance={3} />
      </group>
    </group>
  );
}
