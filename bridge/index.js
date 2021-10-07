// create WebGL canvas to render 3d objects in the browser
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create scene with blue background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xD8F2FF);

// create camera
const camera = new THREE.PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 1000);
// camera.position.z = 15;
camera.position.set(0, 15, 15);

// init camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// create scene lights
const light = new THREE.HemisphereLight(0xFFFFBB, 0x68684D, 1);
scene.add(light);

// gets a single support beam
function getSupport(height=5) {

	// define verticies
	const points = [
		{x: 0, y: 0},
		{x: 4, y: -4, cpX: 4, cpY: 0},
		{x: 4, y: -height},
		{x: 5, y: -height},
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

	return new THREE.Mesh( geometry.center(), new THREE.MeshPhongMaterial({color: 0xfc4425}) );
}

// gets a series of support beams
function getSupports(noOfSupports, height) {
	const support = getSupport(height);

	// get the dimensions of a single support
	const size = new THREE.Vector3();
	new THREE.Box3().setFromObject(support).getSize(size);

	if (noOfSupports <= 1) return support;
	// create group of support beams
	const supports = new THREE.Group();
	supports.add(support);

	for (let i = 1; i < noOfSupports; i++) {
		const temp = getSupport(height);
		temp.position.x = i * size.x;
		supports.add(temp);
	}

	return supports;
}

// gets a bridge object
function getBridge(beams, width, height) {
	// error checks
	if (beams < 1) throw new Error("You must enter at least 1 beam");
	if (width <= 0) throw new Error("Width must be greater than 0");

	const bridge = new THREE.Group();
	const frontSupports = getSupports(beams, height);
	const backSupports = getSupports(beams, height);
	bridge.add(frontSupports);
	bridge.add(backSupports);

	// get the dimensions of a single support
	const size = new THREE.Vector3();
	new THREE.Box3().setFromObject(frontSupports).getSize(size);

	// reposition front bridge support
	frontSupports.position.z = size.z + width;

	// create platform
	const platformHeight = 0.5;
	const platformGeometry = new THREE.BoxGeometry(size.x, platformHeight, width);
	const platformMesh = new THREE.Mesh( platformGeometry, new THREE.MeshPhongMaterial({color: 0x727272}) );
	
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

// gets a car object
function getCar() {
	const car = new THREE.Group();

	// define car body
	const bodyGeometry = new THREE.BoxGeometry(3, 1, 2);
	const body = new THREE.Mesh(bodyGeometry, new THREE.MeshPhongMaterial({color: 0xFF0000}));
	car.add(body);

	// define the head of the car
	const headGeometry = new THREE.BoxGeometry(1.75, 1, 2);
	const head = new THREE.Mesh(headGeometry, new THREE.MeshPhongMaterial({color: 0xFF0000}));
	head.position.y = 1;
	car.add(head);

	// generate wheels
	const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);

	const wheelPoints = [
		{x:1, z:1},
		{x:-1, z:1},
		{x:1, z:-1},
		{x:-1, z:-1},
	];

	for (let wheelPoint of wheelPoints) {
		const wheel = new THREE.Mesh(wheelGeometry, new THREE.MeshPhongMaterial({color: 0x000000, side: THREE.DoubleSide}) );
		wheel.rotation.x = Math.PI/2;
		wheel.position.set(wheelPoint.x, -0.5, wheelPoint.z);
		car.add(wheel);
	}
	
	return car;
}

// bridge options
const beams = 10;
const width = 3;
const height = 10;

// render bridge
const bridge = getBridge(beams, width, height);
const bridgeSize = new THREE.Vector3();
new THREE.Box3().setFromObject(bridge).getSize(bridgeSize);
scene.add(bridge);

// render car
const car = getCar();
const carSize = new THREE.Vector3();
new THREE.Box3().setFromObject(car).getSize(carSize);
car.position.y = height + 1.5;
if (bridgeSize.z-2 >= carSize.z) {
	scene.add(car);
}


// add sea to the scene
const seaGeometry = new THREE.PlaneGeometry(bridgeSize.x*3, bridgeSize.x*3);
const sea = new THREE.Mesh(seaGeometry, new THREE.MeshPhongMaterial({color: 0x006994}) );
sea.rotation.x = -Math.PI/2;
scene.add(sea);	

// render the scene
function animate() {
	requestAnimationFrame(animate);

	// reset car position
	if (car.position.x > bridgeSize.x/2) {
		car.position.x = -bridgeSize.x/2;
	}

	car.position.x += 0.1;

	renderer.render(scene, camera);
}
animate();