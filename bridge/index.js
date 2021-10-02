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

// gets a bridge object
function getBridge(beams, width) {
	// error checks
	if (beams < 1) throw new Error("You must enter at least 1 beam");
	if (width <= 0) throw new Error("Width must be greater than 0");

	const bridge = new THREE.Group();
	const frontSupports = getSupports(beams);
	const backSupports = getSupports(beams);
	bridge.add(frontSupports);
	bridge.add(backSupports);

	// get the dimensions of a single support
	const bBox = new THREE.Box3().setFromObject(frontSupports);
	const size = new THREE.Vector3();
	bBox.getSize(size);

	// reposition front bridge support
	frontSupports.position.z = size.z + width;

	// create platform
	const platformHeight = 0.5;
	const platformGeometry = new THREE.BoxGeometry(size.x, platformHeight, width);
	const platformMesh = new THREE.Mesh( platformGeometry, new THREE.MeshPhongMaterial() );
	
	// set z position
	platformMesh.position.z = size.z/2 + width/2;

	// set y position
	platformMesh.position.y =  size.y/2 - platformHeight/2 - 0.5;

	// set x position
	platformMesh.position.x = size.x/2 - size.x/beams/2;

	// add platform to bridge
	bridge.add(platformMesh);

	// set the bridge to the center of the scene
	new THREE.Box3().setFromObject( bridge ).getCenter( bridge.position ).multiplyScalar(-1);

	bridge.position.y = size.y/2;

	return bridge;
}

scene.add(getBridge(4, 4));




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