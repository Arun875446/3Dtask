import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 2, 8);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);

let mixer;

loader.load(
  "/model.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);
    model.position.set(0, -3.2, 0);
    scene.add(model);
    console.log("Model Loaded!");

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      console.log("Animation playing!");
    } else {
      console.log("No animations found in the model.");
    }
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error("Error loading model", error);
  }
);

const fontLoader = new FontLoader();

let madeWithMadnessText;
let unlockHumanPotentialText;

fontLoader.load(
  "/robo.json",
  (font) => {
    const textGeometry = new TextGeometry("Made With Madness", {
      font: font,
      size: 0.4,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    const textMaterial = new THREE.MeshNormalMaterial();
    madeWithMadnessText = new THREE.Mesh(textGeometry, textMaterial);
    madeWithMadnessText.position.set(-1.5, 4, 0);
    scene.add(madeWithMadnessText);
  },
  undefined,
  (error) => {
    console.error("Error loading font", error);
  }
);

fontLoader.load(
  "/robo.json",
  (font) => {
    const textGeometry = new TextGeometry("Unlock Human Potential", {
      font: font,
      size: 0.7,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    const textMaterial = new THREE.MeshNormalMaterial();
    unlockHumanPotentialText = new THREE.Mesh(textGeometry, textMaterial);
    unlockHumanPotentialText.position.set(-4, 3, -1);
    scene.add(unlockHumanPotentialText);
  },
  undefined,
  (error) => {
    console.error("Error loading font", error);
  }
);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
});

window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
const clock = new THREE.Clock();

const particlesGeometry = new THREE.BufferGeometry();
const count = 80;

const positions = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }

  if (madeWithMadnessText) {
    madeWithMadnessText.rotation.y = Math.sin(clock.getElapsedTime()) * 0.05;
  }

  if (unlockHumanPotentialText) {
    unlockHumanPotentialText.rotation.y =
      Math.sin(clock.getElapsedTime() + Math.PI / 2) * 0.05;
  }

  for (let i = 0; i < count * 3; i += 3) {
    positions[i + 1] -= 0.005;
    if (positions[i + 1] < -5) {
      positions[i + 1] = 5;
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
animate();
