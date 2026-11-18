"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { bleedCanvasProps, pagePointer, ZOOM } from "@/components/three/canvasProps";

const CARD_W = 1.1;
const CARD_H = 1.55;
const TEX_W = 512;
const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);

const PALETTES = [
  { a: "#7c66f5", b: "#5135dc", strap: "#6247e8" },
  { a: "#f554a1", b: "#df2b80", strap: "#ec3f91" },
  { a: "#2dd4bf", b: "#0d9488", strap: "#14b8a6" },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxW, size, weight = 800) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px Inter, 'Segoe UI', sans-serif`;
    s -= 2;
  } while (ctx.measureText(text).width > maxW && s > 18);
}

function drawBadge(ctx, card, pal, photo, logo) {
  const W = TEX_W;
  const H = TEX_H;
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // header band with company
  const BAND = 200;
  const g = ctx.createLinearGradient(0, 0, W, BAND);
  g.addColorStop(0, pal.a);
  g.addColorStop(1, pal.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, BAND);
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  for (let i = -BAND; i < W; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + BAND, BAND);
    ctx.stroke();
  }
  ctx.restore();

  // lanyard slot
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(ctx, W / 2 - 55, 22, 110, 18, 9);
  ctx.fill();

  // company logo tile + name
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  roundRect(ctx, 28, 50, 80, 80, 18);
  ctx.fill();
  ctx.textBaseline = "middle";
  if (logo) {
    ctx.save();
    roundRect(ctx, 28, 50, 80, 80, 18);
    ctx.clip();
    ctx.drawImage(logo, 33, 55, 70, 70);
    ctx.restore();
  } else {
    ctx.fillStyle = pal.b;
    ctx.font = "800 24px Inter, 'Segoe UI', sans-serif";
    ctx.fillText(card.initials, 68, 90);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  fitText(ctx, card.company, W - 262, 30);
  ctx.fillText(card.company, 122, 80);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "700 15px Inter, 'Segoe UI', sans-serif";
  ctx.fillText("EMPLOYEE ID", 122, 110);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (card.current) {
    ctx.fillStyle = "#10b981";
    roundRect(ctx, W - 126, 70, 100, 38, 19);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "800 18px Inter, 'Segoe UI', sans-serif";
    ctx.fillText("● NOW", W - 76, 95);
  }

  // round photo overlapping the band
  const cx = W / 2;
  const cy = 245;
  const R = 100;
  ctx.save();
  ctx.shadowColor = "rgba(30,27,58,0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, R + 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const ring = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  ring.addColorStop(0, pal.a);
  ring.addColorStop(1, pal.b);
  ctx.strokeStyle = ring;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // square source; zoom slightly on the face
    const sw = photo.width * 0.72;
    const sx = (photo.width - sw) / 2;
    const sy = photo.height * 0.1;
    ctx.drawImage(photo, sx, sy, sw, sw, cx - R, cy - R, R * 2, R * 2);
  } else {
    ctx.fillStyle = "#ede9fe";
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  }
  ctx.restore();

  // name + role
  ctx.fillStyle = "#1e1b3a";
  fitText(ctx, card.name, W - 60, 40);
  ctx.fillText(card.name, W / 2, 400);
  ctx.fillStyle = pal.b;
  fitText(ctx, card.role, W - 80, 26, 700);
  ctx.fillText(card.role, W / 2, 440);

  // years pill
  ctx.font = "700 22px Inter, 'Segoe UI', sans-serif";
  const yw = ctx.measureText(card.years).width + 44;
  ctx.fillStyle = card.current ? "#ecfdf5" : "#f1f5f9";
  roundRect(ctx, W / 2 - yw / 2, 466, yw, 42, 21);
  ctx.fill();
  ctx.fillStyle = card.current ? "#047857" : "#475569";
  ctx.fillText(card.years, W / 2, 495);

  // divider + barcode
  ctx.fillStyle = "#eef0f4";
  ctx.fillRect(40, H - 175, W - 80, 2);
  ctx.fillStyle = "#1e1b3a";
  let x = 110;
  let seed = card.initials.charCodeAt(0) * 7;
  while (x < W - 110) {
    seed = (seed * 9301 + 49297) % 233280;
    const w = 2 + (seed % 5);
    ctx.fillRect(x, H - 145, w, 54);
    x += w + 3 + (seed % 4);
  }
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 17px Menlo, Consolas, monospace";
  ctx.fillText(`ID · ${card.initials}-${card.idNo}`, W / 2, H - 60);
}

/** Badge texture: draws immediately, redraws once the photo has loaded. */
function useBadgeTexture(card, pal) {
  const { ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { ctx: c.getContext("2d"), texture: t };
  }, []);

  useEffect(() => {
    let alive = true;
    const imgs = { photo: null, logo: null };
    const redraw = () => {
      if (!alive) return;
      drawBadge(ctx, card, pal, imgs.photo, imgs.logo);
      texture.needsUpdate = true;
    };
    redraw();
    ["photo", "logo"].forEach((k) => {
      if (!card[k]) return;
      const img = new Image();
      img.onload = () => {
        imgs[k] = img;
        redraw();
      };
      img.src = card[k];
    });
    return () => {
      alive = false;
    };
  }, [ctx, texture, card, pal]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function useFadeTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

const STRAP_W = 0.15;

function useStrapTexture(color, label, logoSrc, length) {
  const { ctx, texture, W, H } = useMemo(() => {
    const w = 96;
    const h = Math.round((w * length) / STRAP_W);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { ctx: c.getContext("2d"), texture: t, W: w, H: h };
  }, [length]);

  useEffect(() => {
    let alive = true;
    const draw = (logo) => {
      if (!alive) return;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);
      // woven edge stitching
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let y = 0; y < H; y += 14) {
        ctx.fillRect(6, y, 2, 7);
        ctx.fillRect(W - 8, y, 2, 7);
      }
      const text = label.toUpperCase();
      ctx.font = "800 38px Inter, 'Segoe UI', sans-serif";
      const textW = ctx.measureText(text).width;
      const unit = 64 + 24 + textW + 70; // logo + gap + text + spacing
      for (let y = 30; y < H; y += unit) {
        // logo disc
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(W / 2, y + 32, 32, 0, Math.PI * 2);
        ctx.fill();
        if (logo) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(W / 2, y + 32, 29, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logo, W / 2 - 27, y + 5, 54, 54);
          ctx.restore();
        }
        // company name running along the strap
        ctx.save();
        ctx.translate(W / 2, y + 64 + 24);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 2);
        ctx.restore();
      }
      texture.needsUpdate = true;
    };
    draw(null);
    if (logoSrc) {
      const img = new Image();
      img.onload = () => draw(img);
      img.src = logoSrc;
    }
    return () => {
      alive = false;
    };
  }, [ctx, texture, W, H, color, label, logoSrc]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Strap({ color, length, label, logo }) {
  const fade = useFadeTexture();
  const map = useStrapTexture(color, label, logo, length);
  // two ribbons forming a V, fading out toward the top
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.1, length / 2, -0.01]} rotation={[0, 0, side * -0.07]}>
          <planeGeometry args={[STRAP_W, length]} />
          <meshStandardMaterial map={map} side={THREE.DoubleSide} roughness={0.6} alphaMap={fade} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Badge({ card, pal, position, rotation, phase, scale = 1 }) {
  const swing = useRef();
  const tex = useBadgeTexture(card, pal);
  const STRAP = 1.6;

  useFrame((state) => {
    if (!swing.current) return;
    const t = state.clock.elapsedTime;
    swing.current.rotation.z = Math.sin(t * 1.1 + phase) * 0.05;
    swing.current.rotation.y = rotation[1] + Math.sin(t * 0.7 + phase) * 0.12;
  });

  // pivot at the top of the strap; card hangs below it
  return (
    <group position={[position[0], position[1] + STRAP, position[2]]} scale={scale}>
      <group ref={swing} rotation={rotation}>
        <group position={[0, -STRAP, 0]}>
          <Strap color={pal.strap} length={STRAP} label={card.company} logo={card.logo} />
          {/* metal clip */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.2, 0.12, 0.05]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.05, 0.012, 10, 24]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* card */}
          <group position={[0, -0.12 - CARD_H / 2, 0]}>
            <RoundedBox args={[CARD_W, CARD_H, 0.025]} radius={0.06} smoothness={4}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
            </RoundedBox>
            <mesh position={[0, 0, 0.0135]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshBasicMaterial map={tex} toneMapped={false} />
            </mesh>
            {/* glossy laminate */}
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshPhysicalMaterial transparent opacity={0.08} roughness={0.05} clearcoat={1} color="#ffffff" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function Scene({ cards }) {
  const rig = useRef();
  useFrame(() => {
    if (!rig.current) return;
    const { x, y } = pagePointer;
    rig.current.rotation.y += (x * 0.25 - rig.current.rotation.y) * 0.05;
    rig.current.rotation.x += (-y * 0.1 - rig.current.rotation.x) * 0.05;
  });

  // newest card in front, older ones fan out behind
  const layout = [
    { position: [0.35, 0.45, 0.5], rotation: [0, -0.2, 0.03], scale: 1.2 },
    { position: [-0.7, 0.75, -0.5], rotation: [0, 0.32, -0.06], scale: 1.08 },
    { position: [1.1, 0.85, -1.1], rotation: [0, -0.38, 0.05], scale: 0.96 },
  ];

  return (
    <group ref={rig}>
      {cards.slice(0, 3).map((card, i) => (
        <Badge key={card.company + i} card={card} pal={PALETTES[i % PALETTES.length]} phase={i * 1.7} {...layout[i]} />
      ))}
    </group>
  );
}

/** cards: newest first [{ initials, company, role, years, current, idNo }] */
export default function ExperienceScene3D({ cards }) {
  const canvasProps = useMemo(() => bleedCanvasProps(), []);
  return (
    <Canvas camera={{ position: [0, 0, 4.6 * ZOOM], fov: 45 }} {...canvasProps}>
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <pointLight position={[-3, 0, 3]} intensity={10} color="#a78bfa" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#c4b5fd" position={[-5, 1, 2]} scale={[3, 6, 1]} />
      </Environment>
      <Scene cards={cards} />
      <Sparkles count={20} scale={[4.5, 4.5, 2]} size={2} speed={0.3} opacity={0.5} color="#a78bfa" />
    </Canvas>
  );
}
