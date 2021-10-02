// create WebGL canvas to render 3d objects in the browser
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create scene with white background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// create camera
const camera = new THREE.PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 10;

// init camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// create scene lights
const light = new THREE.HemisphereLight(0xFFFFBB, 0x68684D, 1);
scene.add(light);

// gets a single support beam
function getSupport() {

	// define verticies
	const points = [
		{x: 0, y: 0},
		{x: 4, y: -4, cpX: 4, cpY: 0},
		{x: 4, y: -6},
		{x: 5, y: -6},
		{x: 5, y: -4},
		{x: 9, y: 0, cpX: 5, cpY: 0},
		{x: 9, y: 1},
		{x: 0, y: 1},
	];

	const shape = new THREE.Shape();

	// create shape
	for (let point of points) {

		// check if the point has control points
		if (point.hasOwnProperty('cpX') && point.hasOwnProperty('cpY')) {
			shape.quadraticCurveTo(point.cpX, point.cpY, point.x, point.y);
		} else {
			shape.lineTo(point.x, point.y);
		}
	}

	const extrudeSettings = { depth: 1, bevelEnabled: false};
	const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

	return new THREE.Mesh( geometry.center(), new THREE.MeshPhongMaterial() );
}

// gets a series of support beams
function getSupports(noOfSupports) {
	const support = getSupport();

	// get the dimensions of a single support
	const bBox = new THREE.Box3().setFromObject(support);
	const size = new THREE.Vector3();
	bBox.getSize(size);

	if (noOfSupports <= 1) return support;
	// create group of support beams
	const supports = new THREE.Group();
	supports.add(support);

	for (let i = 1; i < noOfSupports; i++) {
		const temp = getSupport();
		temp.position.x = i * size.x;
		supports.add(temp);
	}

	return supports;
}

const supports = getSupports(2);

// get the dimensions of a single support
const bBox = new THREE.Box3().setFromObject(supports);
const size = new THREE.Vector3();
bBox.getSize(size);
console.log(size);

scene.add(supports);




// add polar grid helper to the scene
const radius = 10;
const radials = 16;
const circles = 8;
const divisions = 64;
scene.add( new THREE.PolarGridHelper( radius, radials, circles, divisions ) );


// render the scene
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();