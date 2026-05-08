// ═══════════════════════════════════════════════════════════════
//  room.js — Chargement chambre GLB + objets interactifs
//  Morning Tale
// ═══════════════════════════════════════════════════════════════

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { setInteractiveObjects } from "./main.js";

// ── Loader setup ──────────────────────────────────────────────
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://unpkg.com/three@0.161.0/examples/jsm/libs/draco/",
);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// ── Références aux objets (utilisées par story.js) ───────────
export const roomObjects = {
  bed: null, // lit
  wardrobe: null, // armoire
  desk: null, // bureau
  plant: null, // plante
  sink: null, // lavabo
  lamp: null, // lampe
  chair: null, // chaise
  door: null, // porte (créée procéduralement)
  mirror: null, // miroir (créé procéduralement)
  glass: null, // verre d'eau
};

// ── Couleurs personnalisables (Phase 1 designer) ─────────────
export const roomConfig = {
  wallColor: 0x2a2240,
  floorColor: 0x1e140a,
  rugColor: 0x3d1f3a,
};

// ═══════════════════════════════════════════════════════════════
//  CHARGEMENT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export async function loadRoom(scene) {
  // Créer le sol, murs, plafond procéduralement
  // (la chambre GLB peut ne pas avoir de sol/murs adaptés)
  buildRoomShell(scene);

  // Charger les modèles GLB en parallèle
  await Promise.all([
    loadModel(
      scene,
      "models/bed2.glb",
      [-2.2, 0, -1.5],
      [0, 0, 0],
      0.012,
      "bed",
    ),
    loadModel(
      scene,
      "models/wardrobe1.glb",
      [-3.4, 0, -3.5],
      [0, Math.PI / 2, 0],
      0.013,
      "wardrobe",
    ),
    loadModel(
      scene,
      "models/Desk.glb",
      [2.2, 0, 1.8],
      [0, -Math.PI / 2, 0],
      0.011,
      "desk",
    ),
    loadModel(
      scene,
      "models/plant2.glb",
      [3.2, 0, -3.2],
      [0, 0, 0],
      0.01,
      "plant",
    ),
    loadModel(
      scene,
      "models/Countertop Sink.glb",
      [3.6, 0, -1.2],
      [0, -Math.PI / 2, 0],
      0.01,
      "sink",
    ),
    loadModel(
      scene,
      "models/lamp1.glb",
      [-3.7, 0, 1.4],
      [0, 0, 0],
      0.01,
      "lamp",
    ),
    loadModel(
      scene,
      "models/chair4.glb",
      [2.2, 0, 2.8],
      [0, Math.PI, 0],
      0.011,
      "chair",
    ),
  ]);

  // Construire miroir + verre d'eau procéduralement
  buildMirror(scene);
  buildGlass(scene);

  // Enregistrer les objets interactifs pour le raycaster
  const interactives = Object.values(roomObjects).filter(Boolean);
  setInteractiveObjects(interactives);

  console.log("✅ room.js — Chambre chargée");
}

// ═══════════════════════════════════════════════════════════════
//  COQUE DE LA CHAMBRE (sol, murs, plafond)
// ═══════════════════════════════════════════════════════════════
function buildRoomShell(scene) {
  const W = 9,
    H = 3.8,
    D = 9;

  const floorMat = new THREE.MeshStandardMaterial({
    color: roomConfig.floorColor,
    roughness: 0.85,
    metalness: 0.02,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: roomConfig.wallColor,
    roughness: 0.9,
  });
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0x110e1e,
    roughness: 1,
  });
  const rugMat = new THREE.MeshStandardMaterial({
    color: roomConfig.rugColor,
    roughness: 1,
  });

  function mk(geo, mat, x, y, z, rx = 0, ry = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  // Sol
  mk(new THREE.PlaneGeometry(W, D), floorMat, 0, 0, 0, -Math.PI / 2);
  // Plafond
  mk(new THREE.PlaneGeometry(W, D), ceilMat, 0, H, 0, Math.PI / 2);
  // Mur arrière
  mk(new THREE.PlaneGeometry(W, H), wallMat, 0, H / 2, -D / 2);
  // Mur gauche
  mk(new THREE.PlaneGeometry(D, H), wallMat, -W / 2, H / 2, 0, 0, Math.PI / 2);
  // Mur droit
  mk(new THREE.PlaneGeometry(D, H), wallMat, W / 2, H / 2, 0, 0, -Math.PI / 2);
  // Mur avant
  mk(new THREE.PlaneGeometry(W, H), wallMat, 0, H / 2, D / 2, 0, Math.PI);
  // Tapis
  mk(new THREE.BoxGeometry(4.5, 0.02, 3.5), rugMat, -0.5, 0.01, 0.5);

  // Fenêtre (mur arrière)
  buildWindow(scene, W, H, D);

  // Porte (mur avant)
  buildDoor(scene, D);

  // Exposer les matériaux pour le designer (Phase 1)
  scene._wallMat = wallMat;
  scene._floorMat = floorMat;
  scene._rugMat = rugMat;
}

// ── Fenêtre ──────────────────────────────────────────────────
function buildWindow(scene, W, H, D) {
  const darkWood = new THREE.MeshStandardMaterial({
    color: 0x100c06,
    roughness: 0.7,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x80ccff,
    roughness: 0.04,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35,
  });

  const win = new THREE.Group();
  scene.add(win);
  win.position.set(0, 2.0, -D / 2 + 0.02);

  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    win.add(m);
  };

  // Cadre
  add(new THREE.BoxGeometry(2.0, 0.1, 0.1), darkWood, 0, 0.9, 0);
  add(new THREE.BoxGeometry(2.0, 0.1, 0.1), darkWood, 0, -0.9, 0);
  add(new THREE.BoxGeometry(0.1, 1.9, 0.1), darkWood, -0.95, 0, 0);
  add(new THREE.BoxGeometry(0.1, 1.9, 0.1), darkWood, 0.95, 0, 0);
  // Croisillons
  add(new THREE.BoxGeometry(0.06, 1.8, 0.05), darkWood, 0, 0, 0);
  add(new THREE.BoxGeometry(1.8, 0.06, 0.05), darkWood, 0, 0, 0);
  // Vitre
  add(new THREE.BoxGeometry(1.85, 1.85, 0.03), glassMat, 0, 0, 0);
}

// ── Porte ─────────────────────────────────────────────────────
function buildDoor(scene, D) {
  const darkWood = new THREE.MeshStandardMaterial({
    color: 0x130f1c,
    roughness: 0.7,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1828,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Cadre porte
  const frame = new THREE.Group();
  scene.add(frame);
  frame.position.set(0, 0, D / 2 - 0.02);

  const addF = (geo, mat, x, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, 0);
    frame.add(m);
  };
  addF(new THREE.BoxGeometry(1.2, 0.1, 0.15), darkWood, 0, 2.15);
  addF(new THREE.BoxGeometry(0.1, 2.2, 0.15), darkWood, -0.6, 1.05);
  addF(new THREE.BoxGeometry(0.1, 2.2, 0.15), darkWood, 0.6, 1.05);

  // Panneau porte (pivote pour s'ouvrir)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.5, 0, D / 2 - 0.02);
  scene.add(doorPivot);

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 2.1, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x141022, roughness: 0.7 }),
  );
  panel.position.set(0.5, 1.05, 0);
  panel.castShadow = true;
  doorPivot.add(panel);

  // Poignée
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), metalMat);
  knob.position.set(0.9, 1.05, -0.06);
  doorPivot.add(knob);

  roomObjects.door = doorPivot;
}

// ── Miroir ────────────────────────────────────────────────────
function buildMirror(scene) {
  const darkWood = new THREE.MeshStandardMaterial({
    color: 0x100c06,
    roughness: 0.3,
    metalness: 0.5,
  });
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xccddee,
    roughness: 0.01,
    metalness: 0.98,
  });

  const g = new THREE.Group();
  g.position.set(3.94, 1.85, -2.2);
  g.rotation.y = -Math.PI / 2;

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.07), darkWood);
  frame.castShadow = true;
  g.add(frame);

  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.28, 0.02),
    mirrorMat,
  );
  mirror.position.z = 0.04;
  g.add(mirror);

  scene.add(g);
  roomObjects.mirror = g;

  // Tag interactif
  g.userData.interactable = true;
  g.userData.onInteract = () => {
    window.dispatchEvent(
      new CustomEvent("story:interact", { detail: "mirror" }),
    );
  };
}

// ── Verre d'eau ───────────────────────────────────────────────
function buildGlass(scene) {
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x80ccff,
    roughness: 0.04,
    metalness: 0.1,
    transparent: true,
    opacity: 0.45,
  });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x60aaff,
    transparent: true,
    opacity: 0.6,
  });

  const g = new THREE.Group();
  g.position.set(-3.75, 0.68, 1.4);
  scene.add(g);

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.052, 0.2, 14),
    glassMat,
  );
  cup.position.y = 0.1;
  g.add(cup);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.048, 0.13, 14),
    waterMat,
  );
  water.position.y = 0.065;
  g.add(water);

  roomObjects.glass = g;

  // Tag interactif
  g.userData.interactable = true;
  g.userData.onInteract = () => {
    window.dispatchEvent(
      new CustomEvent("story:interact", { detail: "glass" }),
    );
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPER — Charger un GLB et le placer dans la scène
// ═══════════════════════════════════════════════════════════════
function loadModel(scene, path, position, rotation, scale, key) {
  return new Promise((resolve) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.rotation.set(...rotation);
        model.scale.setScalar(scale);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Améliorer les matériaux
            if (child.material) {
              child.material.envMapIntensity = 0.6;
            }
          }
        });

        // Tag interactif
        model.userData.interactable = true;
        model.userData.onInteract = () => {
          window.dispatchEvent(
            new CustomEvent("story:interact", { detail: key }),
          );
        };

        scene.add(model);
        roomObjects[key] = model;
        resolve(model);
      },
      undefined,
      (err) => {
        console.warn(`⚠️ Impossible de charger ${path}:`, err);
        resolve(null); // Ne pas bloquer si un modèle manque
      },
    );
  });
}

// ═══════════════════════════════════════════════════════════════
//  DESIGNER — Modifier les couleurs (Phase 1)
// ═══════════════════════════════════════════════════════════════
export function setWallColor(color, scene) {
  if (scene._wallMat) scene._wallMat.color.set(color);
  roomConfig.wallColor = color;
}

export function setFloorColor(color, scene) {
  if (scene._floorMat) scene._floorMat.color.set(color);
  roomConfig.floorColor = color;
}

export function setRugColor(color, scene) {
  if (scene._rugMat) scene._rugMat.color.set(color);
  roomConfig.rugColor = color;
}
