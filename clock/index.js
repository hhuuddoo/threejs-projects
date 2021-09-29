// create WebGL canvas to render 3D objects in the browser
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create scene with grey background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// create camera at (0, 0, 40)
const camera = new THREE.PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 40;

// initialise camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// add lights to the scene
const frontLight = new THREE.DirectionalLight(0xFFFFFF, 1);
frontLight.position.z = 5;
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xFFFFFF, 1);
backLight.position.z = -5;
scene.add(backLight);

const clockRadius = 5;

// create extruded circle
const nodes = 36;
const angle = 2 * Math.PI / nodes;
const vectors = [];

for (let i = 0; i < nodes; i++) {
	const x = clockRadius * Math.cos(angle*i);	
	const y = clockRadius * Math.sin(angle*i);
	vectors.push(new THREE.Vector2(x, y));
}

const faceShape = new THREE.Shape(vectors);

// create extrusion settings
const extrudeSettings = {
	depth: 0.05,
	bevelEnabled: false
};

// create clock face mesh
const faceGeometry = new THREE.ExtrudeGeometry(faceShape, extrudeSettings);
const faceMaterial = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
scene.add(faceMesh);

// create hour handle
const hourGeometry = new THREE.BoxGeometry(0.1, clockRadius, 0.2);
hourGeometry.translate(0, clockRadius/2, 0);
const hourMaterial = new THREE.MeshPhongMaterial({color: 0x282832});
const hourMesh = new THREE.Mesh(hourGeometry, hourMaterial);
scene.add(hourMesh);

// create hour handle
const minuteGeometry = new THREE.BoxGeometry(0.1, clockRadius/2, 0.2);
minuteGeometry.translate(0, clockRadius/4, 0);
const minuteMaterial = new THREE.MeshPhongMaterial({color: 0x282832});
const minuteMesh = new THREE.Mesh(minuteGeometry, minuteMaterial);
scene.add(minuteMesh);

// create clock head
const clockHeadSize = clockRadius * 3;
const clockHeadGeometry = new THREE.BoxGeometry(clockHeadSize, clockHeadSize, clockHeadSize);
const clockHeadMaterial = new THREE.MeshPhongMaterial({color: 0xE1E1BE});
const clockHeadMesh = new THREE.Mesh(clockHeadGeometry, clockHeadMaterial);
clockHeadMesh.position.z = -clockHeadSize/2;
scene.add(clockHeadMesh);

// create clock base
const clockBaseSize = clockRadius * 2.5;
const clockBaseGeometry = new THREE.BoxGeometry(clockBaseSize, 50, clockBaseSize);
const clockBaseMaterial = new THREE.MeshPhongMaterial({color: 0xE1E1BE});
const clockBaseMesh = new THREE.Mesh(clockBaseGeometry, clockBaseMaterial);
clockBaseMesh.position.z = -clockBaseSize/2 - Math.abs(clockBaseSize - clockHeadSize)/2;
clockBaseMesh.position.y = -25;
scene.add(clockBaseMesh);

// render the scene and animate the clock hands
function animate() {
	requestAnimationFrame(animate);

	hourMesh.rotation.z -= Math.PI / 120;
	minuteMesh.rotation.z -= Math.PI / 1440;

	renderer.render(scene, camera);
}
animate();