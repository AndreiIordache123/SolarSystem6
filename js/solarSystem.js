//Import
import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
//////////////////////////////////////
//NOTE Creating renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//////////////////////////////////////

//////////////////////////////////////
//NOTE texture loader
const textureLoader = new THREE.TextureLoader();
//////////////////////////////////////

//////////////////////////////////////
//NOTE import all texture
const starTexture = textureLoader.load("./image/stars.jpg");
const sunTexture = textureLoader.load("./image/sun.jpg");
const mercuryTexture = textureLoader.load("./image/mercury.jpg");
const venusTexture = textureLoader.load("./image/venus.jpg");
const earthTexture = textureLoader.load("./image/earth.jpg");
const marsTexture = textureLoader.load("./image/mars.jpg");
const jupiterTexture = textureLoader.load("./image/jupiter.jpg");
const saturnTexture = textureLoader.load("./image/saturn.jpg");
const uranusTexture = textureLoader.load("./image/uranus.jpg");
const neptuneTexture = textureLoader.load("./image/neptune.jpg");
const plutoTexture = textureLoader.load("./image/pluto.jpg");
const saturnRingTexture = textureLoader.load("./image/saturn_ring.png");
const uranusRingTexture = textureLoader.load("./image/uranus_ring.png");
//////////////////////////////////////

const planetInfo = {
  Mercury: { name: "Mercur", description: "The closest planet to the Sun." },
  Venus: { name: "Venus", description: "The hottest planet in the Solar System." },
  Earth: { name: "Pamant", description: "The only planet known to support life." },
  Mars: { name: "Marte", description: "Known as the Red Planet." },
  Jupiter: { name: "Jupiter", description: "The largest planet in the Solar System." },
  Saturn: { name: "Saturn", description: "Famous for its stunning ring system." },
  Uranus: { name: "Uranus", description: "An ice giant with a tilted axis." },
  Neptune: { name: "Neptun", description: "The farthest planet from the Sun." },
  Pluto: { name: "Pluto", description: "A dwarf planet in the Kuiper Belt." },
};


//////////////////////////////////////
//NOTE Creating scene
const scene = new THREE.Scene();
//////////////////////////////////////

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster with camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check intersections with planets
  const intersects = raycaster.intersectObjects(
    planets.map((p) => p.planet),
    true
  );

  if (intersects.length > 0) {
    const selectedPlanet = intersects[0].object;

    // Get planet name from its texture (or another identifier)
    const planetName = Object.keys(planetInfo).find((name) =>
      selectedPlanet.material.map.image.src.includes(name.toLowerCase())
    );

    if (planetName) {
      focusOnPlanet(selectedPlanet, planetInfo[planetName]);
    }
  }
});

function focusOnPlanet(planet, info) {
  // Smoothly move the camera to the planet's position
  const targetPosition = new THREE.Vector3();
  planet.getWorldPosition(targetPosition);

  const duration = 1000; // 1 second
  const startTime = performance.now();
  const initialPosition = camera.position.clone();

  function animateFocus() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Interpolate camera position
    camera.position.lerpVectors(
      initialPosition,
      targetPosition.clone().add(new THREE.Vector3(0, 20, 50)),
      progress
    );

    // Make the camera look at the planet
    camera.lookAt(targetPosition);

    if (progress < 1) {
      requestAnimationFrame(animateFocus);
    }
  }


  animateFocus();

  // Delay showing the text box slightly to avoid conflicts
  setTimeout(() => {
    const infoDiv = document.getElementById("planet-info");
    document.getElementById("planet-name").innerText = info.name;
    document.getElementById("planet-description").innerText =
      info.description;
    infoDiv.style.display = "block";
  }, 500); // Delay to ensure smoothness



  animateFocus();

  // Update HTML with planet info
  const infoDiv = document.getElementById("planet-info");
  document.getElementById("planet-name").innerText = info.name;
  document.getElementById("planet-description").innerText = info.description;
  infoDiv.style.display = "block";
}

window.addEventListener("click", (event) => {
  const infoDiv = document.getElementById("planet-info");
  if (!event.target.closest("#planet-info") && !event.target.closest("canvas")) {
    infoDiv.style.display = "none";
  }
});



//////////////////////////////////////
//NOTE screen bg
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
  starTexture,
  starTexture,
  starTexture,
  starTexture,
  starTexture,
  starTexture,
]);
scene.background = cubeTexture;
//////////////////////////////////////

//////////////////////////////////////
//NOTE Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-50, 90, 150);
////////////////////////////////////

//////////////////////////////////////
//NOTE Percpective controll
const orbit = new OrbitControls(camera, renderer.domElement);
//////////////////////////////////////

//////////////////////////////////////
//NOTE - sun
const sungeo = new THREE.SphereGeometry(15, 50, 50);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});
const sun = new THREE.Mesh(sungeo, sunMaterial);
scene.add(sun);
//////////////////////////////////////

//////////////////////////////////////
//NOTE - sun light (point light)
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);
//////////////////////////////////////

//////////////////////////////////////
//NOTE - ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);
//////////////////////////////////////

//////////////////////////////////////
//NOTE - path for planet
const path_of_planets = [];
function createLineLoopWithMesh(radius, color, width) {
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width,
  });
  const geometry = new THREE.BufferGeometry();
  const lineLoopPoints = [];

  // Calculate points for the circular path
  const numSegments = 100; // Number of segments to create the circular path
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    lineLoopPoints.push(x, 0, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lineLoopPoints, 3)
  );
  const lineLoop = new THREE.LineLoop(geometry, material);
  scene.add(lineLoop);
  path_of_planets.push(lineLoop);
}
//////////////////////////////////////

/////////////////////////////////////
//NOTE: create planet
const genratePlanet = (size, planetTexture, x, ring) => {
  const planetGeometry = new THREE.SphereGeometry(size, 50, 50);
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetTexture,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  const planetObj = new THREE.Object3D();
  planet.position.set(x, 0, 0);
  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: ring.ringmat,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    planetObj.add(ringMesh);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(planetObj);

  planetObj.add(planet);
  createLineLoopWithMesh(x, 0xffffff, 3);
  return {
    planetObj: planetObj,
    planet: planet,
  };
};

const planets = [
  {
    ...genratePlanet(3.2, mercuryTexture, 28),
    rotaing_speed_around_sun: 0.004,
    self_rotation_speed: 0.004,
  },
  {
    ...genratePlanet(5.8, venusTexture, 44),
    rotaing_speed_around_sun: 0.015,
    self_rotation_speed: 0.002,
  },
  {
    ...genratePlanet(6, earthTexture, 62),
    rotaing_speed_around_sun: 0.01,
    self_rotation_speed: 0.02,
  },
  {
    ...genratePlanet(4, marsTexture, 78),
    rotaing_speed_around_sun: 0.008,
    self_rotation_speed: 0.018,
  },
  {
    ...genratePlanet(12, jupiterTexture, 100),
    rotaing_speed_around_sun: 0.002,
    self_rotation_speed: 0.04,
  },
  {
    ...genratePlanet(10, saturnTexture, 138, {
      innerRadius: 10,
      outerRadius: 20,
      ringmat: saturnRingTexture,
    }),
    rotaing_speed_around_sun: 0.0009,
    self_rotation_speed: 0.038,
  },
  {
    ...genratePlanet(7, uranusTexture, 176, {
      innerRadius: 7,
      outerRadius: 12,
      ringmat: uranusRingTexture,
    }),
    rotaing_speed_around_sun: 0.0004,
    self_rotation_speed: 0.03,
  },
  {
    ...genratePlanet(7, neptuneTexture, 200),
    rotaing_speed_around_sun: 0.0001,
    self_rotation_speed: 0.032,
  },
  {
    ...genratePlanet(2.8, plutoTexture, 216),
    rotaing_speed_around_sun: 0.0007,
    self_rotation_speed: 0.008,
  },
];

//////////////////////////////////////

//////////////////////////////////////
//NOTE - GUI options
var GUI = dat.gui.GUI;
const gui = new GUI();
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
};
gui.add(options, "Real view").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});
gui.add(options, "Show path").onChange((e) => {
  path_of_planets.forEach((dpath) => {
    dpath.visible = e;
  });
});
const maxSpeed = new URL(window.location.href).searchParams.get("ms")*1
gui.add(options, "speed", 0, maxSpeed?maxSpeed:20);

//////////////////////////////////////

//////////////////////////////////////
//NOTE - animate function
function animate(time) {
  sun.rotateY(options.speed * 0.004);
  planets.forEach(
    ({ planetObj, planet, rotaing_speed_around_sun, self_rotation_speed }) => {
      planetObj.rotateY(options.speed * rotaing_speed_around_sun);
      planet.rotateY(options.speed * self_rotation_speed);
    }
  );
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
//////////////////////////////////////

//////////////////////////////////////
//NOTE - resize camera view
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
//////////////////////////////////////
