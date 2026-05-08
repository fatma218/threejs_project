// ═══════════════════════════════════════════════════════════════
//  models.js — Personnage FBX + Animations Mixamo
//  Morning Tale
// ═══════════════════════════════════════════════════════════════

import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const fbxLoader = new FBXLoader();

// ── État du personnage ────────────────────────────────────────
export let character = null;
let mixer = null;

const actions = {}; // { 'walk': AnimationAction, ... }
let currentAction = null;

// Position cible pour le walk
const walkState = {
  from: new THREE.Vector3(),
  to: new THREE.Vector3(),
  t: 1,
  duration: 2.0,
  active: false,
  onDone: null,
};

// ═══════════════════════════════════════════════════════════════
//  CHARGEMENT PERSONNAGE + ANIMATIONS
// ═══════════════════════════════════════════════════════════════
export async function loadCharacter(scene) {
  // 1. Charger le mesh du personnage
  character = await loadFBX("models/caracter3D/caracter.fbx");
  if (!character) return;

  character.scale.setScalar(0.012);
  character.position.set(-2.2, 0, -1.0);
  character.rotation.y = Math.PI * 0.3;
  character.castShadow = true;
  character.traverse((c) => {
    if (c.isMesh) c.castShadow = true;
  });

  mixer = new THREE.AnimationMixer(character);

  // Animer les clips inclus dans le fichier principal
  if (character.animations?.length) {
    const base = mixer.clipAction(character.animations[0]);
    base.play();
    actions["idle"] = base;
    currentAction = base;
  }

  scene.add(character);

  // 2. Charger les animations Mixamo séparées
  await Promise.all([
    loadAnimation("models/caracter3D/Walk.fbx", "walk"),
    loadAnimation("models/caracter3D/Stand Up.fbx", "standup"),
    loadAnimation("models/caracter3D/Sitting Idle.fbx", "sit"),
    loadAnimation("models/caracter3D/Picking Up Object.fbx", "pickup"),
    loadAnimation("models/caracter3D/Standing Torch Light Torch.fbx", "hold"),
  ]);

  console.log(
    "✅ models.js — Personnage + animations chargés",
    Object.keys(actions),
  );
}

// ── Helper charger FBX ────────────────────────────────────────
function loadFBX(path) {
  return new Promise((resolve) => {
    fbxLoader.load(path, resolve, undefined, (err) => {
      console.warn(`⚠️ FBX manquant: ${path}`, err);
      resolve(null);
    });
  });
}

// ── Charger une animation séparée ────────────────────────────
async function loadAnimation(path, key) {
  const anim = await loadFBX(path);
  if (!anim || !anim.animations?.length) return;
  const clip = anim.animations[0];
  const action = mixer.clipAction(clip);
  action.clampWhenFinished = true;
  actions[key] = action;
}

// ═══════════════════════════════════════════════════════════════
//  JOUER UNE ANIMATION
// ═══════════════════════════════════════════════════════════════
export function playAnimation(key, loop = true, fadeTime = 0.4) {
  const next = actions[key];
  if (!next || next === currentAction) return;

  next.reset();
  next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
  next.fadeIn(fadeTime);

  if (currentAction) currentAction.fadeOut(fadeTime);
  next.play();
  currentAction = next;
}

// ═══════════════════════════════════════════════════════════════
//  MARCHER VERS UNE POSITION
// ═══════════════════════════════════════════════════════════════
export function walkTo(pos, duration = 2.0, onDone = null) {
  if (!character) return;
  walkState.from.copy(character.position);
  walkState.to.set(...pos);
  walkState.t = 0;
  walkState.duration = duration;
  walkState.active = true;
  walkState.onDone = onDone;

  playAnimation("walk", true, 0.3);

  // Orienter vers la destination
  const dir = new THREE.Vector3(...pos).sub(character.position);
  if (dir.length() > 0.1) {
    character.rotation.y = Math.atan2(dir.x, dir.z);
  }
}

// ═══════════════════════════════════════════════════════════════
//  UPDATE (appelé chaque frame depuis main.js)
// ═══════════════════════════════════════════════════════════════
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function updateCharacter(dt) {
  if (!character) return;

  // Mixer animations
  mixer?.update(dt);

  // Walk tween
  if (walkState.active) {
    walkState.t += dt / walkState.duration;
    const e = easeInOut(Math.min(walkState.t, 1));

    character.position.lerpVectors(walkState.from, walkState.to, e);
    // Bob vertical (effet de marche)
    character.position.y =
      THREE.MathUtils.lerp(walkState.from.y, walkState.to.y, e) +
      Math.sin(walkState.t * walkState.duration * 5) *
        0.04 *
        Math.sin(Math.PI * Math.min(walkState.t, 1));

    if (walkState.t >= 1) {
      walkState.active = false;
      character.position.y = walkState.to.y;
      // Revenir à idle une fois arrivé
      playAnimation("idle", true, 0.4);
      walkState.onDone?.();
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  ACTIONS SPÉCIALES (déclenchées par story.js)
// ═══════════════════════════════════════════════════════════════

export function doStandUp(onDone) {
  playAnimation("standup", false, 0.3);
  // Après ~2s, revenir idle
  setTimeout(() => {
    playAnimation("idle", true, 0.4);
    onDone?.();
  }, 2000);
}

export function doPickup(onDone) {
  playAnimation("pickup", false, 0.3);
  setTimeout(() => {
    playAnimation("idle", true, 0.4);
    onDone?.();
  }, 2200);
}

export function doSit() {
  playAnimation("sit", true, 0.4);
}

export function doHold() {
  playAnimation("hold", true, 0.4);
}

// Tourner le personnage vers un point
export function lookAt(target) {
  if (!character) return;
  const dir = new THREE.Vector3(...target).sub(character.position);
  if (dir.length() > 0.05) {
    character.rotation.y = Math.atan2(dir.x, dir.z);
  }
}
