var physicsWorld;

function initStaticBoxBody(shape, position, quaternion) {
	body = new CANNON.Body({
		mass: 0,
		type: CANNON.Body.STATIC,
		shape: shape,
		position: new CANNON.Vec3(position[0], position[1], position[2]),
		quaternion: quaternion,
		linearDamping: 0.99999
	});
	physicsWorld.add(body);
	return body;
}

function initCannon(){
    // Setup our world
	physicsWorld = new CANNON.World();

	physicsWorld.quatNormalizeSkip = 0;
	physicsWorld.quatNormalizeFast = false;

	var solver = new CANNON.GSSolver();

	physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
	physicsWorld.defaultContactMaterial.contactEquationRelaxation = 4;

	solver.iterations = 7;
	solver.tolerance = 0.1;
	var split = true;
	if(split)
		physicsWorld.solver = new CANNON.SplitSolver(solver);
	else
		physicsWorld.solver = solver;

    physicsWorld.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("wallMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
	                                                        physicsMaterial,
	                                                        { friction : 0.5 });
	// We must add the contact materials to the world
	physicsWorld.addContactMaterial(physicsContactMaterial);
}