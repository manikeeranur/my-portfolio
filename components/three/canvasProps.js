import * as THREE from "three";

// The canvas bleeds past its layout box so 3D shapes never get cut off at a
// square edge. Vertical bleed is fixed (18% each side) so camera framing stays
// identical across breakpoints; horizontal bleed is set per breakpoint via
// --scene-bleed-x in globals.css. The canvas ignores pointer events so the
// oversized area never blocks clicks; tilt uses the page-level pagePointer.
export const BLEED_Y = 0.18;
export const ZOOM = 1 + BLEED_Y * 2; // multiply camera distance by this

export function bleedCanvasProps() {
  return {
    dpr: [1, 1.75],
    gl: { antialias: true, alpha: true },
    resize: { offsetSize: true },
    style: {
      position: "absolute",
      top: `-${BLEED_Y * 100}%`,
      bottom: `-${BLEED_Y * 100}%`,
      left: "calc(var(--scene-bleed-x, 18%) * -1)",
      right: "calc(var(--scene-bleed-x, 18%) * -1)",
      width: "auto",
      height: "auto",
      overflow: "visible",
      pointerEvents: "none",
    },
  };
}

/** Mouse position across the whole window, normalised to -1..1 (y up). */
export const pagePointer = new THREE.Vector2();

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pagePointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    },
    { passive: true }
  );
}
