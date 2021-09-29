// create WebGL canvas to render 3d objects in the browser
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create scene with grey background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// create camera at (0, 0, 10)
const camera = new THREE.PerspectiveCamera(85, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 10;

// init camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// create scene lights
const light = new THREE.HemisphereLight(0xFFFFBB, 0x68684D, 1);
scene.add(light);

// creates a floor object at a vertical offset
function createFloor(yOffset) {

	// points that define our shape
	const points = [
		{x: -5.5, y: -2.5},
	    {x: -5.5, y: -0.5},
	    {x: -2.5, y: 2.5},
	    {x: 2.5, y: 2.5},
	    {x: 5.5, y: -0.5},
	    {x: 5.5, y: -2.5},
	    {x: 3.5, y: -2.5},
	    {x: 1.5, y: -0.5},
	    {x: -1.5, y: -0.5},
	    {x: -3.5, y: -2.5},
	    {x: -5.5, y: -2.5}
	];

	// vectors that define the shape
	const vectors = [];

	for (let point of points) {
		vectors.push(new THREE.Vector2(point.x, point.y));
	}

	// create extrusion settings
	const extrudeSettings = {
		depth: 0.1,
		bevelEnabled: false
	};

	// create the shape using the vectors
	const floorShape = new THREE.Shape(vectors);
	const floorGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeSettings);
	const floorMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
	const floorMesh = new THREE.Mesh(floorGeometry.center(), floorMaterial);

	// correct the orientation of the generated shape
	floorMesh.rotation.x = -Math.PI / 2;

	floorMesh.position.y = yOffset;

	return floorMesh;
}

// create the beams with a horizontal offset and beam height
function createBeams(yOffset, beamHeight) {

	// define beam locations
	const points = [
        {x: -5, z: 2},
        {x: -2.5, z: -2},
        {x: 2.5, z: -2},
        {x: 5, z: 2},
        {x: 2, z: 0.5},
        {x: -2, z: 0.5},
    ];

    // container to hold beams
    const beams = new THREE.Group();

    // create beam geometry
    const beamGeometry = new THREE.BoxGeometry(0.1, beamHeight, 0.1);
    const beamMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});

    // create beam mesh and add to group
    for (let point of points) {
    	// have to add half of beam height since origin is center of beam
    	const y = yOffset+beamHeight/2;
    	const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
    	beamMesh.position.set(point.x, y, point.z);
    	beams.add(beamMesh);
    }

    return beams;
}


// create building object with levels and a level height 
function createBuilding(levels, levelHeight) {
	const building = new THREE.Group();

	for (let i = 0; i < levels; i++) {
		const yOffset = i * levelHeight;
		building.add(createFloor(yOffset), createBeams(yOffset, levelHeight));
	}

	return building;
}

// add building to the scene
scene.add(createBuilding(10, 3));


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