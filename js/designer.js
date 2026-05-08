// ═══════════════════════════════════════════════════════════════
//  designer.js — Room Designer Guidé (scène isolée par meuble)
//  Morning Tale — v3 CORRIGÉ
// ═══════════════════════════════════════════════════════════════

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { walkTo } from "./models.js";
import { roomObjects } from "./room.js";
import { scene as mainScene, renderer, camera as mainCamera } from "./main.js";

// ═══════════════════════════════════════════════════════════════
//  ÉTAPES DU DESIGNER
// ═══════════════════════════════════════════════════════════════
const DESIGN_STEPS = [
  {
    key: "bed",
    label: "Le Lit",
    emoji: "🛏️",
    guide:
      "Choisis ton lit ! Sélectionne un modèle, ajuste sa taille et sa couleur.",
    walkPos: [-2.8, 0, -2.0],
    defaultModel: "models/bed2.glb",
    variants: [
      { id: "bed1", label: "Lit simple", path: "models/bed1.glb", emoji: "🛏️" },
      { id: "bed2", label: "Lit double", path: "models/bed2.glb", emoji: "🛏️" },
      { id: "bed3", label: "Lit king", path: "models/bed3.glb", emoji: "🛏️" },
    ],
    colors: ["#ffffff", "#c8a06a", "#4a3020", "#e8d0b0", "#2a3a5a", "#6a4050"],
    targetSize: 2.0,
    // Position finale dans la scène principale
    finalPos: [-2.2, 0, -1.8],
    finalRot: [0, Math.PI / 2, 0],
  },
  {
    key: "nighttable",
    label: "Table de Nuit",
    emoji: "🪵",
    guide: "La table de nuit — parfaite pour poser ta lampe et ton réveil !",
    walkPos: [-3.7, 0, 0.8],
    defaultModel: "models/table1.glb",
    variants: [
      {
        id: "table1",
        label: "Table ronde",
        path: "models/table1.glb",
        emoji: "🪵",
      },
      {
        id: "table2",
        label: "Table carrée",
        path: "models/table2.glb",
        emoji: "🪵",
      },
    ],
    colors: ["#9e7c5a", "#4a3020", "#c8b090", "#606060", "#2a4a3a"],
    targetSize: 0.7,
    finalPos: [-3.7, 0, 0.8],
    finalRot: [0, 0, 0],
  },
  {
    key: "wardrobe",
    label: "L'Armoire",
    emoji: "🚪",
    guide: "L'armoire — fais-la grande ou petite selon l'espace !",
    walkPos: [-3.4, 0, -3.4],
    defaultModel: "models/wardrobe1.glb",
    variants: [
      {
        id: "wardrobe",
        label: "Armoire simple",
        path: "models/wardrobe.glb",
        emoji: "🚪",
      },
      {
        id: "wardrobe1",
        label: "Grande armoire",
        path: "models/wardrobe1.glb",
        emoji: "🚪",
      },
    ],
    colors: ["#9e7c5a", "#4a3020", "#c8c0b0", "#3a3a3a", "#5a4a7a"],
    targetSize: 2.2,
    finalPos: [-3.3, 0, -3.4],
    finalRot: [0, Math.PI / 2, 0],
  },
  {
    key: "desk",
    label: "Le Bureau",
    emoji: "🖥️",
    guide:
      "Ton espace de travail — bien positionné près de la fenêtre c'est top !",
    walkPos: [2.4, 0, 1.6],
    defaultModel: "models/Desk.glb",
    variants: [
      {
        id: "desk",
        label: "Bureau standard",
        path: "models/Desk.glb",
        emoji: "🖥️",
      },
      {
        id: "tabledesk",
        label: "Grand bureau",
        path: "models/tabledesk.glb",
        emoji: "🖥️",
      },
    ],
    colors: ["#9e7c5a", "#4a3020", "#c8c0b0", "#3a3a3a", "#6a8090"],
    targetSize: 1.1,
    finalPos: [2.4, 0, 1.6],
    finalRot: [0, -Math.PI / 2, 0],
  },
  {
    key: "chair",
    label: "La Chaise",
    emoji: "🪑",
    guide: "La chaise de bureau — choisis celle qui te convient le mieux !",
    walkPos: [2.2, 0, 2.8],
    defaultModel: "models/chair4.glb",
    variants: [
      {
        id: "chair",
        label: "Chaise classique",
        path: "models/chair.glb",
        emoji: "🪑",
      },
      {
        id: "chair1",
        label: "Chaise moderne",
        path: "models/chair1.glb",
        emoji: "🪑",
      },
      {
        id: "chair4",
        label: "Fauteuil gaming",
        path: "models/chair4.glb",
        emoji: "🪑",
      },
    ],
    colors: ["#4a3020", "#9e7c5a", "#3a3a3a", "#2a3a5a", "#6a2a2a"],
    targetSize: 0.95,
    finalPos: [2.2, 0, 2.8],
    finalRot: [0, Math.PI, 0],
  },
  {
    key: "lamp",
    label: "La Lampe",
    emoji: "💡",
    guide: "La lampe donne l'ambiance ! Choisis le style qui te plaît.",
    walkPos: [-3.6, 0, 0.6],
    defaultModel: "models/lamp1.glb",
    variants: [
      {
        id: "lamp1",
        label: "Lampe arc",
        path: "models/lamp1.glb",
        emoji: "💡",
      },
      {
        id: "lampe",
        label: "Lampe classique",
        path: "models/lampe.glb",
        emoji: "💡",
      },
    ],
    colors: ["#c8b060", "#c0c0c0", "#4a3020", "#3a3a3a", "#d0d0d0"],
    targetSize: 1.6,
    finalPos: [-3.6, 0, 0.6],
    finalRot: [0, 0, 0],
  },
  {
    key: "plant",
    label: "La Plante",
    emoji: "🪴",
    guide: "Une touche de verdure ! Choisis ta plante préférée.",
    walkPos: [3.3, 0, -3.1],
    defaultModel: "models/plant2.glb",
    variants: [
      { id: "plant", label: "Palmier", path: "models/plant.glb", emoji: "🌴" },
      {
        id: "plant1",
        label: "Plante bureau",
        path: "models/plant1.glb",
        emoji: "🪴",
      },
      { id: "plant2", label: "Cactus", path: "models/plant2.glb", emoji: "🌵" },
    ],
    colors: ["#3a7a30", "#2a5a20", "#4a8a40", "#8a6a30", "#606060"],
    targetSize: 1.3,
    finalPos: [3.3, 0, -3.1],
    finalRot: [0, 0, 0],
  },
  {
    key: "sink",
    label: "Le Lavabo",
    emoji: "🚿",
    guide: "Dernier meuble ! Le lavabo pour bien commencer les matinées.",
    walkPos: [3.5, 0, -1.0],
    defaultModel: "models/Countertop Sink.glb",
    variants: [
      {
        id: "sink",
        label: "Lavabo standard",
        path: "models/Countertop Sink.glb",
        emoji: "🚿",
      },
    ],
    colors: ["#e0e0e0", "#c0c0c0", "#a0b0c0", "#d0c8b0", "#3a3a3a"],
    targetSize: 1.0,
    finalPos: [3.5, 0, -1.0],
    finalRot: [0, -Math.PI / 2, 0],
  },
];

const WALL_PRESETS = [
  { label: "Beige chaud", v: "#f2e8d8" },
  { label: "Bleu nuit", v: "#c8d4e8" },
  { label: "Rose poudré", v: "#f0d8d0" },
  { label: "Vert sauge", v: "#c8d8c0" },
  { label: "Blanc crème", v: "#faf6f0" },
  { label: "Lilas", v: "#dcd0ec" },
  { label: "Jaune doux", v: "#f0e8c0" },
  { label: "Gris perle", v: "#e0e0e8" },
];
const FLOOR_PRESETS = [
  { label: "Parquet chêne", v: "#d4a96a" },
  { label: "Parquet wengé", v: "#6a4a2a" },
  { label: "Carrelage", v: "#f0f0f0" },
  { label: "Béton", v: "#b0b0b0" },
  { label: "Teck", v: "#a06830" },
  { label: "Marbre crème", v: "#e8e0d8" },
];
const RUG_PRESETS = [
  { label: "Bordeaux", v: "#a06050" },
  { label: "Bleu marine", v: "#2a3a6a" },
  { label: "Crème", v: "#e8dcc8" },
  { label: "Vert forêt", v: "#3a6040" },
  { label: "Gris", v: "#808090" },
  { label: "Or", v: "#c0a040" },
];

// ═══════════════════════════════════════════════════════════════
//  ÉTAT GLOBAL
// ═══════════════════════════════════════════════════════════════
let designerActive = false;
let currentStepIndex = 0;
let isoRenderer = null;
let isoScene = null;
let isoCamera = null;
let isoOrbit = null;
let isoTransform = null;
let isoModel = null;
let isoLight = null;
let isoAnimId = null;
let currentStepData = null;
let modelCache = {};
let savedChoices = {};

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://unpkg.com/three@0.161.0/examples/jsm/libs/draco/",
);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// ═══════════════════════════════════════════════════════════════
//  INIT — point d'entrée unique
// ═══════════════════════════════════════════════════════════════
export function initDesigner() {
  injectHTML();
  injectStyles();
  attachListeners(); // ← UN SEUL endroit pour tous les listeners
}

// ═══════════════════════════════════════════════════════════════
//  LISTENERS — FIX: attachés UNE SEULE FOIS ici
// ═══════════════════════════════════════════════════════════════
function attachListeners() {
  document
    .getElementById("designerOpenBtn")
    .addEventListener("click", openDesigner);
  document
    .getElementById("designerCloseBtn")
    .addEventListener("click", closeDesigner);

  // FIX: un seul listener pour next/prev avec goToStep unifié
  document.getElementById("isoNextBtn").addEventListener("click", () => {
    saveCurrentChoice();
    if (currentStepIndex < DESIGN_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  });

  document.getElementById("isoPrevBtn").addEventListener("click", () => {
    saveCurrentChoice();
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  });

  document
    .getElementById("isoFinishBtn")
    .addEventListener("click", finishDesigner);

  // Sliders
  document.getElementById("isoScaleSlider").addEventListener("input", (e) => {
    if (!isoModel) return;
    const s = parseFloat(e.target.value);
    isoModel.scale.set(s, s, s);
    document.getElementById("isoScaleVal").textContent = s.toFixed(2) + "×";
  });

  document.getElementById("isoRotSlider").addEventListener("input", (e) => {
    if (!isoModel) return;
    const deg = parseFloat(e.target.value);
    isoModel.rotation.y = THREE.MathUtils.degToRad(deg);
    document.getElementById("isoRotVal").textContent = deg.toFixed(0) + "°";
  });

  // Gizmo mode buttons
  document.querySelectorAll(".gizmo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".gizmo-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (isoTransform) isoTransform.setMode(btn.dataset.mode);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  OUVRIR / FERMER
// ═══════════════════════════════════════════════════════════════
function openDesigner() {
  designerActive = true;
  currentStepIndex = 0;
  document.getElementById("designerOverlay").classList.add("show");
  document.getElementById("designerOpenBtn").style.display = "none";
  document.getElementById("mainCanvasFade").style.opacity = "1";

  // Personnage marche vers le 1er meuble
  if (walkTo) walkTo(DESIGN_STEPS[0].walkPos, 2.0);

  setTimeout(() => {
    startIsoScene();
    // FIX: attendre que isoTransform soit prêt avant de charger le modèle
    setTimeout(() => goToStep(0), 150);
  }, 300);
}

function closeDesigner() {
  designerActive = false;
  stopIsoScene();
  document.getElementById("designerOverlay").classList.remove("show");
  document.getElementById("designerOpenBtn").style.display = "";
  document.getElementById("mainCanvasFade").style.opacity = "0";
}

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION — FIX: une seule fonction goToStep
// ═══════════════════════════════════════════════════════════════
function goToStep(i) {
  currentStepIndex = i;
  const step = DESIGN_STEPS[i];

  // Update dots
  document.querySelectorAll(".step-dot").forEach((d, idx) => {
    d.classList.toggle("active", idx === i);
    d.classList.toggle("done", idx < i);
  });

  // Update nav buttons
  const total = DESIGN_STEPS.length;
  document.getElementById("isoStepCounter").textContent = `${i + 1} / ${total}`;
  document.getElementById("isoPrevBtn").style.opacity = i === 0 ? "0.3" : "1";
  document.getElementById("isoPrevBtn").disabled = i === 0;
  document.getElementById("isoNextBtn").style.display =
    i < total - 1 ? "" : "none";
  document.getElementById("isoFinishBtn").style.display =
    i === total - 1 ? "" : "none";
  document.getElementById("designerProgressFill").style.width =
    `${((i + 1) / total) * 100}%`;

  // Personnage marche vers ce meuble
  if (walkTo && step.walkPos) walkTo(step.walkPos, 1.8);

  // Charger dans la scène ISO
  loadStepIntoIso(step);
}

function saveCurrentChoice() {
  if (!isoModel || !currentStepData) return;
  const key = currentStepData.key;
  savedChoices[key] = {
    path: currentStepData._selectedPath || currentStepData.defaultModel,
    color: currentStepData._selectedColor || null,
    scale: isoModel.scale.x,
    rotY: isoModel.rotation.y,
  };
}

// ═══════════════════════════════════════════════════════════════
//  SCÈNE ISOLÉE
// ═══════════════════════════════════════════════════════════════
function startIsoScene() {
  const canvas = document.getElementById("isoCanvas");

  isoRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  isoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  isoRenderer.shadowMap.enabled = true;
  isoRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  isoRenderer.outputColorSpace = THREE.SRGBColorSpace;
  isoRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  isoRenderer.toneMappingExposure = 1.1;
  resizeIso();

  isoScene = new THREE.Scene();
  isoScene.background = new THREE.Color(0x1a1528);
  isoScene.fog = new THREE.FogExp2(0x1a1528, 0.04);

  // Sol plateforme
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 0.06, 48),
    new THREE.MeshStandardMaterial({ color: 0xd4a96a, roughness: 0.8 }),
  );
  floor.receiveShadow = true;
  floor.position.y = -0.03;
  isoScene.add(floor);

  // Grille décorative
  const grid = new THREE.GridHelper(7, 14, 0x443322, 0x332211);
  grid.position.y = 0.01;
  grid.material.opacity = 0.3;
  grid.material.transparent = true;
  isoScene.add(grid);

  // Lumières
  isoScene.add(new THREE.AmbientLight(0xffeedd, 1.2));
  const key = new THREE.DirectionalLight(0xfff0e0, 2.0);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.001;
  isoScene.add(key);
  const fill = new THREE.DirectionalLight(0x8899cc, 0.7);
  fill.position.set(-4, 4, -3);
  isoScene.add(fill);
  isoLight = new THREE.PointLight(0xffcc66, 0.5, 4);
  isoLight.position.set(0, 2, 0);
  isoScene.add(isoLight);

  // Caméra
  isoCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  isoCamera.position.set(3.5, 3, 4);
  isoCamera.lookAt(0, 0.8, 0);

  // Orbit controls
  isoOrbit = new OrbitControls(isoCamera, canvas);
  isoOrbit.target.set(0, 0.8, 0);
  isoOrbit.enableDamping = true;
  isoOrbit.dampingFactor = 0.08;
  isoOrbit.minDistance = 1.5;
  isoOrbit.maxDistance = 8;
  isoOrbit.maxPolarAngle = Math.PI * 0.85;

  // Transform controls
  isoTransform = new TransformControls(isoCamera, canvas);
  isoTransform.setMode("translate");
  isoTransform.setSize(0.7);
  isoScene.add(isoTransform);

  // FIX: empêcher les conflits TransformControls/OrbitControls
  isoTransform.addEventListener("dragging-changed", (e) => {
    isoOrbit.enabled = !e.value;
  });
  isoTransform.addEventListener("objectChange", syncSlidersFromModel);

  window.addEventListener("resize", resizeIso);

  // Boucle
  let t = 0;
  function loop() {
    isoAnimId = requestAnimationFrame(loop);
    t += 0.016;
    isoOrbit.update();
    if (isoLight) isoLight.intensity = 0.5 + Math.sin(t * 1.5) * 0.2;
    isoRenderer.render(isoScene, isoCamera);
  }
  loop();
}

function resizeIso() {
  const container = document.getElementById("isoViewport");
  if (!container || !isoRenderer || !isoCamera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  isoRenderer.setSize(w, h);
  isoCamera.aspect = w / h;
  isoCamera.updateProjectionMatrix();
}

function stopIsoScene() {
  if (isoAnimId) cancelAnimationFrame(isoAnimId);
  if (isoTransform) isoTransform.detach();
  if (isoRenderer) isoRenderer.dispose();
  isoRenderer =
    isoScene =
    isoCamera =
    isoOrbit =
    isoTransform =
    isoModel =
      null;
  window.removeEventListener("resize", resizeIso);
}

// ═══════════════════════════════════════════════════════════════
//  CHARGER UN MEUBLE DANS LA SCÈNE ISO
// ═══════════════════════════════════════════════════════════════
async function loadStepIntoIso(step) {
  currentStepData = step;
  step._selectedPath = step._selectedPath || step.defaultModel;

  // UI
  document.getElementById("isoStepEmoji").textContent = step.emoji;
  document.getElementById("isoStepTitle").textContent = step.label;
  document.getElementById("isoStepGuide").textContent = step.guide;
  buildVariantBtns(step);
  buildColorPalette(step);
  resetSliders();

  await swapIsoModel(step._selectedPath, step.targetSize);

  // Restaurer choix sauvegardés
  const saved = savedChoices[step.key];
  if (saved && isoModel) {
    const s = saved.scale || 1;
    isoModel.scale.set(s, s, s);
    isoModel.rotation.y = saved.rotY || 0;
    document.getElementById("isoScaleSlider").value = s;
    document.getElementById("isoRotSlider").value = THREE.MathUtils.radToDeg(
      saved.rotY || 0,
    );
    syncSlidersUI();
  }
}

async function swapIsoModel(path, targetSize) {
  // FIX: vérifier que la scène ISO est bien initialisée
  if (!isoScene || !isoTransform) {
    console.warn("⚠️ swapIsoModel appelé avant que la scène ISO soit prête");
    return;
  }

  // Supprimer l'ancien modèle
  if (isoModel) {
    isoTransform.detach();
    isoScene.remove(isoModel);
    isoModel = null;
  }

  showIsoLoading(true);

  // Helper pour placer un modèle dans la scène ISO
  function placeModel(model) {
    // Auto-scale
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) model.scale.setScalar(targetSize / maxDim);

    // Poser sur le sol
    const box2 = new THREE.Box3().setFromObject(model);
    model.position.y = -box2.min.y;

    model.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    isoScene.add(model);
    isoModel = model;

    // FIX: vérifier isoTransform avant attach
    if (isoTransform) isoTransform.attach(model);

    // Reset caméra
    if (isoCamera && isoOrbit) {
      isoCamera.position.set(3.5, 3, 4.5);
      isoOrbit.target.set(0, targetSize / 2, 0);
      isoOrbit.update();
    }

    // Flash lumière
    if (isoLight) {
      isoLight.intensity = 3;
      setTimeout(() => {
        if (isoLight) isoLight.intensity = 0.5;
      }, 400);
    }

    syncSlidersUI();
  }

  try {
    let model;
    if (modelCache[path]) {
      model = modelCache[path].clone();
    } else {
      const gltf = await new Promise((res, rej) =>
        gltfLoader.load(path, res, undefined, rej),
      );
      modelCache[path] = gltf.scene;
      model = gltf.scene.clone();
    }
    placeModel(model);
  } catch (err) {
    console.warn("⚠️ Modèle non trouvé:", path, "→ fallback box");
    // Fallback: boîte colorée avec label
    const fallback = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, targetSize, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x998877, roughness: 0.8 }),
    );
    box.castShadow = true;
    fallback.add(box);
    fallback.position.y = targetSize / 2;
    placeModel(fallback);
  }

  showIsoLoading(false);
}

// ═══════════════════════════════════════════════════════════════
//  COULEUR
// ═══════════════════════════════════════════════════════════════
function applyColorToModel(hex) {
  if (!isoModel) return;
  const color = new THREE.Color(hex);
  isoModel.traverse((c) => {
    if (c.isMesh && c.material) {
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach((m) => {
        m.color = color.clone();
      });
    }
  });
  if (currentStepData) currentStepData._selectedColor = hex;
}

// ═══════════════════════════════════════════════════════════════
//  SLIDERS
// ═══════════════════════════════════════════════════════════════
function resetSliders() {
  document.getElementById("isoScaleSlider").value = 1;
  document.getElementById("isoRotSlider").value = 0;
  syncSlidersUI();
}

function syncSlidersUI() {
  const s = document.getElementById("isoScaleSlider").value;
  const r = document.getElementById("isoRotSlider").value;
  document.getElementById("isoScaleVal").textContent =
    parseFloat(s).toFixed(2) + "×";
  document.getElementById("isoRotVal").textContent =
    parseFloat(r).toFixed(0) + "°";
}

function syncSlidersFromModel() {
  if (!isoModel) return;
  document.getElementById("isoScaleSlider").value = isoModel.scale.x;
  document.getElementById("isoRotSlider").value = THREE.MathUtils.radToDeg(
    isoModel.rotation.y,
  );
  syncSlidersUI();
}

// ═══════════════════════════════════════════════════════════════
//  UI DYNAMIQUE
// ═══════════════════════════════════════════════════════════════
function buildVariantBtns(step) {
  const grid = document.getElementById("variantGrid");
  grid.innerHTML = "";
  step.variants.forEach((v) => {
    const btn = document.createElement("button");
    btn.className =
      "variant-btn" + (v.path === step._selectedPath ? " active" : "");
    btn.innerHTML = `<span class="vb-emoji">${v.emoji}</span><span class="vb-label">${v.label}</span>`;
    btn.onclick = async () => {
      grid
        .querySelectorAll(".variant-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      step._selectedPath = v.path;
      await swapIsoModel(v.path, step.targetSize);
    };
    grid.appendChild(btn);
  });
}

function buildColorPalette(step) {
  const palette = document.getElementById("colorPalette");
  palette.innerHTML = "";
  step.colors.forEach((hex) => {
    const sw = document.createElement("button");
    sw.className = "color-sw";
    sw.style.background = hex;
    sw.title = hex;
    sw.onclick = () => {
      palette
        .querySelectorAll(".color-sw")
        .forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
      applyColorToModel(hex);
    };
    palette.appendChild(sw);
  });
  // Color picker personnalisé
  const picker = document.createElement("input");
  picker.type = "color";
  picker.className = "color-sw color-picker-btn";
  picker.title = "Couleur personnalisée";
  picker.oninput = (e) => applyColorToModel(e.target.value);
  palette.appendChild(picker);
}

// ═══════════════════════════════════════════════════════════════
//  FINALISER → Appliquer à la scène principale
//  FIX: utilise les positions finales définies dans DESIGN_STEPS
// ═══════════════════════════════════════════════════════════════
async function finishDesigner() {
  saveCurrentChoice();
  showIsoLoading(true, "Application à ta chambre…");

  for (const step of DESIGN_STEPS) {
    const choice = savedChoices[step.key];
    if (!choice) continue;

    try {
      let newModel;
      if (modelCache[choice.path]) {
        newModel = modelCache[choice.path].clone();
      } else {
        const gltf = await new Promise((res, rej) =>
          gltfLoader.load(choice.path, res, undefined, rej),
        );
        modelCache[choice.path] = gltf.scene;
        newModel = gltf.scene.clone();
      }

      // Scale: auto-scale de base * scale choisi par l'utilisateur
      const box = new THREE.Box3().setFromObject(newModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = step.targetSize / maxDim;
      const finalScale = baseScale * (choice.scale || 1);
      newModel.scale.setScalar(finalScale);

      // FIX: position et rotation depuis DESIGN_STEPS (pas depuis isoModel)
      const box2 = new THREE.Box3().setFromObject(newModel);
      newModel.position.set(...step.finalPos);
      newModel.position.y = -box2.min.y; // poser sur le sol
      newModel.rotation.set(...step.finalRot);

      // Rotation Y personnalisée
      if (choice.rotY !== undefined) {
        newModel.rotation.y = step.finalRot[1] + choice.rotY;
      }

      // Couleur
      if (choice.color) {
        const c = new THREE.Color(choice.color);
        newModel.traverse((ch) => {
          if (ch.isMesh && ch.material) {
            const mats = Array.isArray(ch.material)
              ? ch.material
              : [ch.material];
            mats.forEach((m) => {
              m.color = c.clone();
            });
          }
        });
      }

      newModel.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      // Tag interactif
      newModel.userData.interactable = true;
      newModel.userData.onInteract = () =>
        window.dispatchEvent(
          new CustomEvent("story:interact", { detail: step.key }),
        );

      // Remplacer dans la scène
      const existing = roomObjects[step.key];
      if (existing) mainScene.remove(existing);
      mainScene.add(newModel);
      roomObjects[step.key] = newModel;
    } catch (err) {
      console.warn("⚠️ Erreur application", step.key, err);
    }
  }

  showIsoLoading(false);
  closeDesigner();
  showFinalMessage();
}

function showFinalMessage() {
  const msg = document.createElement("div");
  msg.id = "designerFinalMsg";
  msg.innerHTML = `✨ Ta chambre est prête !<br><span>Good morning style 🌅</span>`;
  document.body.appendChild(msg);
  setTimeout(() => msg.classList.add("show"), 100);
  setTimeout(() => {
    msg.classList.remove("show");
    setTimeout(() => msg.remove(), 600);
  }, 3000);
}

// ═══════════════════════════════════════════════════════════════
//  LOADING
// ═══════════════════════════════════════════════════════════════
function showIsoLoading(visible, msg = "Chargement…") {
  const el = document.getElementById("isoLoading");
  if (!el) return;
  el.style.opacity = visible ? "1" : "0";
  el.style.pointerEvents = visible ? "all" : "none";
  el.querySelector("span").textContent = msg;
}

// ═══════════════════════════════════════════════════════════════
//  HTML INJECTION
// ═══════════════════════════════════════════════════════════════
function injectHTML() {
  // Fade overlay
  const fade = document.createElement("div");
  fade.id = "mainCanvasFade";
  document.body.appendChild(fade);

  // Bouton ouvrir
  const openBtn = document.createElement("button");
  openBtn.id = "designerOpenBtn";
  openBtn.innerHTML = `🎨 Designer ta chambre`;
  document.body.appendChild(openBtn);

  // Palettes ambiance chambre (mini) — construites AVANT l'overlay
  const overlay = document.createElement("div");
  overlay.id = "designerOverlay";
  overlay.innerHTML = `
    <div id="designerHeader">
      <div id="designerHeaderLeft">
        <span id="designerTitle">🏠 Room Designer</span>
        <div id="designerProgressBar"><div id="designerProgressFill"></div></div>
        <span id="isoStepCounter">1 / ${DESIGN_STEPS.length}</span>
      </div>
      <button id="designerCloseBtn">✕ Fermer</button>
    </div>

    <div id="designerBody">
      <div id="designerLeft">
        <div id="stepInfoCard">
          <div id="isoStepEmoji">🛏️</div>
          <div id="isoStepTitle">Le Lit</div>
          <div id="isoStepGuide">Guide…</div>
        </div>

        <div class="ctrl-section">
          <div class="ctrl-label">🔄 Choisir le modèle</div>
          <div id="variantGrid"></div>
        </div>

        <div class="ctrl-section">
          <div class="ctrl-label">🎨 Couleur du meuble</div>
          <div id="colorPalette"></div>
        </div>

        <div class="ctrl-section">
          <div class="ctrl-label">⇲ Taille &nbsp;<span id="isoScaleVal">1.00×</span></div>
          <input type="range" id="isoScaleSlider" min="0.3" max="3" step="0.05" value="1">
        </div>

        <div class="ctrl-section">
          <div class="ctrl-label">↻ Rotation &nbsp;<span id="isoRotVal">0°</span></div>
          <input type="range" id="isoRotSlider" min="-180" max="180" step="5" value="0">
        </div>

        <div class="ctrl-section">
          <div class="ctrl-label">🕹️ Mode gizmo</div>
          <div class="gizmo-modes">
            <button class="gizmo-btn active" data-mode="translate">↔ Déplacer</button>
            <button class="gizmo-btn" data-mode="rotate">↻ Tourner</button>
            <button class="gizmo-btn" data-mode="scale">⇲ Redimensionner</button>
          </div>
        </div>

        <div class="ctrl-section" id="roomColorSection">
          <div class="ctrl-label">🏠 Ambiance chambre</div>
          <div class="room-color-row">
            <span class="rclabel">Murs</span>
            <div class="color-swatches-mini" id="wallPaletteMain"></div>
          </div>
          <div class="room-color-row">
            <span class="rclabel">Sol</span>
            <div class="color-swatches-mini" id="floorPaletteMain"></div>
          </div>
          <div class="room-color-row">
            <span class="rclabel">Tapis</span>
            <div class="color-swatches-mini" id="rugPaletteMain"></div>
          </div>
        </div>
      </div>

      <div id="designerRight">
        <div id="isoViewport">
          <canvas id="isoCanvas"></canvas>
          <div id="isoLoading">
            <div class="iso-ring"></div>
            <span>Chargement…</span>
          </div>
          <div id="isoCamHint">🖱️ Glisser pour tourner · Scroll pour zoomer · Gizmo pour déplacer</div>
        </div>
      </div>
    </div>

    <div id="designerFooter">
      <button id="isoPrevBtn">◀ Précédent</button>
      <div id="footerStepDots"></div>
      <button id="isoNextBtn">Suivant ▶</button>
      <button id="isoFinishBtn" style="display:none">✨ Terminer & Appliquer</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Construire dots
  const dotsContainer = document.getElementById("footerStepDots");
  DESIGN_STEPS.forEach((s, i) => {
    const dot = document.createElement("div");
    dot.className = "step-dot" + (i === 0 ? " active" : "");
    dot.title = s.label;
    dot.textContent = s.emoji;
    // FIX: les dots utilisent goToStep directement
    dot.onclick = () => {
      saveCurrentChoice();
      goToStep(i);
    };
    dotsContainer.appendChild(dot);
  });

  // Palettes ambiance
  buildMiniPalette("wallPaletteMain", WALL_PRESETS, (v) => {
    if (mainScene._wallMat) mainScene._wallMat.color.set(v);
  });
  buildMiniPalette("floorPaletteMain", FLOOR_PRESETS, (v) => {
    if (mainScene._floorMat) mainScene._floorMat.color.set(v);
  });
  buildMiniPalette("rugPaletteMain", RUG_PRESETS, (v) => {
    if (mainScene._rugMat) mainScene._rugMat.color.set(v);
  });
}

function buildMiniPalette(containerId, presets, cb) {
  const c = document.getElementById(containerId);
  presets.forEach((p, idx) => {
    const sw = document.createElement("button");
    sw.className = "color-sw-mini" + (idx === 0 ? " active" : "");
    sw.style.background = p.v;
    sw.title = p.label;
    sw.dataset.color = p.v;
    sw.onclick = () => {
      c.querySelectorAll(".color-sw-mini").forEach((s) =>
        s.classList.remove("active"),
      );
      sw.classList.add("active");
      cb(p.v);
    };
    c.appendChild(sw);
  });
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
function injectStyles() {
  const s = document.createElement("style");
  s.textContent = `
#mainCanvasFade {
  position:fixed; inset:0; background:rgba(10,8,24,0.7);
  z-index:90; pointer-events:none;
  opacity:0; transition:opacity 0.5s ease;
}
#designerOpenBtn {
  position:fixed; bottom:180px; right:18px;
  padding:11px 20px; border-radius:24px;
  border:1px solid rgba(240,168,80,0.5);
  background:rgba(10,8,24,0.88);
  color:#f0d080; font-family:var(--font-body,sans-serif);
  font-size:13px; font-weight:600; cursor:pointer;
  z-index:70; backdrop-filter:blur(14px);
  transition:all 0.2s; box-shadow:0 4px 20px rgba(240,168,80,0.15);
}
#designerOpenBtn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(240,168,80,0.3); }

#designerOverlay {
  position:fixed; inset:0; z-index:100;
  display:flex; flex-direction:column;
  background:rgba(8,6,20,0.97); backdrop-filter:blur(20px);
  opacity:0; pointer-events:none; transform:scale(0.97);
  transition:opacity 0.4s, transform 0.4s;
}
#designerOverlay.show { opacity:1; pointer-events:all; transform:scale(1); }

#designerHeader {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 24px; border-bottom:1px solid rgba(240,168,80,0.15);
  background:rgba(255,255,255,0.02); flex-shrink:0;
}
#designerHeaderLeft { display:flex; align-items:center; gap:16px; }
#designerTitle { color:#f0d080; font-family:var(--font-display,serif); font-size:18px; letter-spacing:1px; }
#designerProgressBar { width:180px; height:3px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden; }
#designerProgressFill { height:100%; background:linear-gradient(90deg,#c06030,#f0d080); border-radius:4px; transition:width 0.5s; }
#isoStepCounter { font-size:11px; color:rgba(240,168,80,0.5); letter-spacing:2px; }
#designerCloseBtn {
  padding:7px 16px; border-radius:16px;
  border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06);
  color:rgba(255,255,255,0.6); cursor:pointer; font-size:12px;
  font-family:var(--font-body,sans-serif); transition:all 0.2s;
}
#designerCloseBtn:hover { background:rgba(255,100,100,0.15); color:#ff8888; }

#designerBody { display:flex; flex:1; overflow:hidden; min-height:0; }

#designerLeft {
  width:300px; flex-shrink:0; overflow-y:auto; overflow-x:hidden;
  padding:20px 16px; border-right:1px solid rgba(255,255,255,0.06);
  display:flex; flex-direction:column; gap:14px;
}
#designerLeft::-webkit-scrollbar { width:4px; }
#designerLeft::-webkit-scrollbar-thumb { background:rgba(240,168,80,0.25); border-radius:4px; }

#stepInfoCard {
  text-align:center; padding:16px 12px;
  background:rgba(240,168,80,0.06);
  border:1px solid rgba(240,168,80,0.15); border-radius:16px;
}
#isoStepEmoji { font-size:40px; line-height:1; margin-bottom:6px; }
#isoStepTitle { color:#fff; font-family:var(--font-display,serif); font-size:20px; margin-bottom:4px; }
#isoStepGuide { color:rgba(255,220,160,0.65); font-size:12px; line-height:1.5; }

.ctrl-section { display:flex; flex-direction:column; gap:8px; }
.ctrl-label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:rgba(240,168,80,0.55); display:flex; align-items:center; gap:6px; }
.ctrl-label span { color:#f0d080; font-size:12px; letter-spacing:0; text-transform:none; }

#variantGrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); gap:7px; }
.variant-btn {
  display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:10px 6px; border-radius:12px;
  border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04);
  color:rgba(255,255,255,0.65); cursor:pointer;
  font-family:var(--font-body,sans-serif); transition:all 0.18s;
}
.variant-btn:hover { background:rgba(240,168,80,0.1); border-color:rgba(240,168,80,0.3); }
.variant-btn.active { background:rgba(240,168,80,0.18); border-color:rgba(240,168,80,0.6); color:#f0d080; }
.vb-emoji { font-size:22px; }
.vb-label { font-size:10px; text-align:center; line-height:1.3; }

#colorPalette { display:flex; flex-wrap:wrap; gap:7px; }
.color-sw {
  width:30px; height:30px; border-radius:8px; border:2px solid transparent;
  cursor:pointer; transition:all 0.15s; box-shadow:0 2px 8px rgba(0,0,0,0.5);
}
.color-sw:hover { transform:scale(1.15); }
.color-sw.active { border-color:#f0d080; transform:scale(1.18); box-shadow:0 0 10px rgba(240,168,80,0.4); }
.color-picker-btn { padding:0; overflow:hidden; }

input[type=range] {
  -webkit-appearance:none; width:100%; height:4px;
  border-radius:4px; background:rgba(255,255,255,0.12); outline:none; cursor:pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; width:16px; height:16px;
  border-radius:50%; background:#f0a850;
  box-shadow:0 0 8px rgba(240,168,80,0.5); cursor:pointer; transition:transform 0.15s;
}
input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.2); }

.gizmo-modes { display:flex; gap:5px; flex-wrap:wrap; }
.gizmo-btn {
  flex:1; padding:7px 4px; border-radius:10px;
  border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04);
  color:rgba(255,255,255,0.55); font-size:10px; cursor:pointer;
  font-family:var(--font-body,sans-serif); transition:all 0.15s;
}
.gizmo-btn:hover { background:rgba(255,255,255,0.1); }
.gizmo-btn.active { background:rgba(240,168,80,0.2); border-color:rgba(240,168,80,0.5); color:#f0d080; }

#roomColorSection { border-top:1px solid rgba(255,255,255,0.07); padding-top:12px; }
.room-color-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.rclabel { font-size:10px; color:rgba(255,255,255,0.4); min-width:32px; }
.color-swatches-mini { display:flex; gap:5px; flex-wrap:wrap; }
.color-sw-mini {
  width:22px; height:22px; border-radius:5px;
  border:2px solid transparent; cursor:pointer;
  transition:all 0.15s; box-shadow:0 1px 4px rgba(0,0,0,0.5);
}
.color-sw-mini:hover { transform:scale(1.2); }
.color-sw-mini.active { border-color:#f0d080; transform:scale(1.2); }

#designerRight { flex:1; position:relative; min-width:0; }
#isoViewport { width:100%; height:100%; position:relative; overflow:hidden; }
#isoCanvas { width:100%; height:100%; display:block; }

#isoLoading {
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:rgba(8,6,20,0.75); backdrop-filter:blur(8px);
  opacity:0; pointer-events:none; transition:opacity 0.3s;
  gap:14px; color:rgba(240,168,80,0.7); font-size:13px;
  font-family:var(--font-body,sans-serif); letter-spacing:1px;
}
.iso-ring {
  width:40px; height:40px; border-radius:50%;
  border:2px solid rgba(240,168,80,0.15); border-top-color:#f0a850;
  animation:spin 0.9s linear infinite;
}
#isoCamHint {
  position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
  font-size:11px; color:rgba(255,255,255,0.3); pointer-events:none;
  white-space:nowrap; letter-spacing:0.5px;
}

#designerFooter {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 24px; border-top:1px solid rgba(255,255,255,0.07);
  background:rgba(255,255,255,0.02); flex-shrink:0; gap:12px;
}
#footerStepDots { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; flex:1; }
.step-dot {
  width:30px; height:30px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:14px; cursor:pointer;
  border:2px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04);
  transition:all 0.2s;
}
.step-dot:hover { border-color:rgba(240,168,80,0.4); transform:scale(1.1); }
.step-dot.active { border-color:#f0d080; background:rgba(240,168,80,0.2); box-shadow:0 0 10px rgba(240,168,80,0.3); transform:scale(1.15); }
.step-dot.done { border-color:rgba(100,200,100,0.4); background:rgba(100,200,100,0.1); }

#isoPrevBtn, #isoNextBtn {
  padding:10px 22px; border-radius:22px;
  border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06);
  color:rgba(255,255,255,0.7); font-size:13px; font-weight:600;
  cursor:pointer; font-family:var(--font-body,sans-serif);
  transition:all 0.2s; white-space:nowrap;
}
#isoPrevBtn:hover, #isoNextBtn:hover { background:rgba(255,255,255,0.12); transform:translateY(-1px); }
#isoPrevBtn:disabled { opacity:0.3; cursor:not-allowed; }

#isoFinishBtn {
  padding:11px 28px; border-radius:22px;
  border:1px solid rgba(240,168,80,0.5);
  background:linear-gradient(135deg, rgba(240,140,40,0.25), rgba(240,200,80,0.2));
  color:#f0d080; font-size:13px; font-weight:700;
  cursor:pointer; font-family:var(--font-body,sans-serif);
  transition:all 0.25s; letter-spacing:0.5px;
  box-shadow:0 4px 16px rgba(240,168,80,0.15);
}
#isoFinishBtn:hover { background:linear-gradient(135deg, rgba(240,140,40,0.4), rgba(240,200,80,0.35)); transform:translateY(-2px); }

#designerFinalMsg {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(0.9);
  z-index:200; text-align:center;
  font-family:var(--font-display,serif); font-size:clamp(28px,5vw,52px); font-weight:300;
  color:#fff; text-shadow:0 4px 40px rgba(255,160,50,0.8);
  background:rgba(8,6,20,0.88); backdrop-filter:blur(20px);
  padding:40px 60px; border-radius:24px;
  border:1px solid rgba(240,168,80,0.3);
  opacity:0; pointer-events:none; transition:all 0.5s cubic-bezier(0.16,1,0.3,1);
}
#designerFinalMsg.show { opacity:1; transform:translate(-50%,-50%) scale(1); }
#designerFinalMsg span { display:block; font-size:0.5em; color:#f0d080; margin-top:8px; letter-spacing:2px; }

@keyframes spin { to { transform:rotate(360deg); } }

@media(max-width:768px) {
  #designerBody { flex-direction:column; }
  #designerLeft { width:100%; max-height:42vh; border-right:none; border-bottom:1px solid rgba(255,255,255,0.06); }
  #designerRight { min-height:220px; }
  #designerLeft { padding:14px 12px; }
}
  `;
  document.head.appendChild(s);
}
