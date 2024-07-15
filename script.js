// Import necessary modules
import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

// Declare global variables
let camera, scene, renderer;
let loader, model;

// Camera controls variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let touchStart = { x: 0, y: 0 };
let touchLast = { x: 0, y: 0 };
let zoomSpeed = 0.1;

// Initialize the scene and start the animation loop
init();
animate();

function init() {
  // Create container for the scene
  const container = document.createElement("div");
  document.body.appendChild(container);

  // Create the scene
  scene = new THREE.Scene();

  // Set up the camera
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    40
  );
  camera.position.set(0, 0, 2);

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // Enable WebXR
  container.appendChild(renderer.domElement);

  // Add lighting to the scene
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  // Add AR button to the page
  document.body.appendChild(ARButton.createButton(renderer));

  // Handle window resizing
  window.addEventListener("resize", onWindowResize, false);

  // Event listeners for interactions
  window.addEventListener("wheel", onDocumentMouseWheel, false);
  window.addEventListener("mousemove", onDocumentMouseMove, false);
  window.addEventListener("mousedown", onDocumentMouseDown, false);
  window.addEventListener("mouseup", onDocumentMouseUp, false);

  // Touch events
  renderer.domElement.addEventListener("touchstart", onDocumentTouchStart, false);
  renderer.domElement.addEventListener("touchmove", onDocumentTouchMove, false);

  // Load 3D model
  const modelURL =
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Lantern/glTF/Lantern.gltf";
  loader = new GLTFLoader();

  loader.load(
    modelURL,
    function (gltf) {
      model = gltf.scene;
      scene.add(model);

      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Center the model
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center); // Translate to center
      model.position.z = -size.z / 0.5; // Adjust z position based on depth
      model.position.y = -size.y / 3; // Adjust y position based on height

      // Light to the object
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(2, 2, 2);
      model.add(pointLight);

      // Second light to the object
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1).normalize();
      scene.add(directionalLight);
  
    },
    function (event) {
      console.log("Loading progress:", event);
    },
    function (error) {
      console.error("Error loading model:", error);
    }
  );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function onDocumentMouseWheel(event) {
  const fov = camera.fov + event.deltaY * zoomSpeed;
  camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
  camera.updateProjectionMatrix();
}

function onDocumentMouseMove(event) {
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  };

  if (isDragging) {
    // Adjust camera rotation based on mouse movement
    camera.rotation.y += deltaMove.x * 0.005;
    camera.rotation.x += deltaMove.y * 0.005;
  }

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}

function onDocumentMouseDown(event) {
  isDragging = true;
}

function onDocumentMouseUp(event) {
  isDragging = false;
}

function onDocumentTouchStart(event) {
  event.preventDefault();

  const touch = event.touches[0];
  touchStart.x = touch.clientX;
  touchStart.y = touch.clientY;
  touchLast.x = touch.clientX;
  touchLast.y = touch.clientY;
}

function onDocumentTouchMove(event) {
  event.preventDefault();

  const touch = event.touches[0];
  const deltaMove = {
    x: touch.clientX - touchLast.x,
    y: touch.clientY - touchLast.y
  };

  if (isDragging) {
    // Adjust camera rotation based on touch movement
    camera.rotation.y += deltaMove.x * 0.005;
    camera.rotation.x += deltaMove.y * 0.005;
  }

  touchLast.x = touch.clientX;
  touchLast.y = touch.clientY;
}

console.log("Initialization complete");
