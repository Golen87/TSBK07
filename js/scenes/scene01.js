var scene01 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	addGround();

	// Corridors
	addCorridor( /*Position*/ [-1.0,  0.0, -2.5], /*Scale*/ [1.0, 1.0, 1.0], /*Rotation*/ [0.0, 0.0, 0.0] );
	addCorridor( /*Position*/ [ 1.0,  0.0, -3.0], /*Scale*/ [1.0, 1.0, 4.0], /*Rotation*/ [0.0, 0.0, 0.0] );

	// Spheres
	var k = 2;
	for (var x = -k; x < k; x++) for (var y = 0.25; y < 2*k; y++) for (var z = -k; z < k; z++) {
		addModel(sphere_mesh, [3*x, 3*y, 3*z], [0.2, 0.2, 0.2], [0, 0, 0], normal_prog);
	}

	addModel(sphere_mesh, [3.5, 1, -6], [1, 1, 1], [0, 0, 0], normal_prog);
	addModel(sphere_mesh, [3.5, 3, -6], [1, 0.5, 1], [0, 0, 0.25 * Math.PI], normal_prog);
	addModel(sphere_mesh, [3.5, 1, -3], [1, 1, 1], [0, 0, 0], texture_prog)
		.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	addModel(sphere_mesh, [3.5, 3, -3.0], [1, 0.5, 1], [0, 0, 0.25 * Math.PI], texture_prog)
		.setTexture( loadTexture(gl, "tex/grass_lab.png") );

	addModel(cube_mesh, [-3.5, 1.0, -6.0], [1, 1, 1], [0, 0, 0], normal_prog);
	addModel(cube_mesh, [-3.5, 1.0, -3.0], [1, 1, 1], [0, 0, 0], normal_prog)
		.setTexture( loadTexture(gl, "tex/grass_lab.png") );


	// Init portals
	portals = [];
	const W = 0.8;
	const H = 1.9;
	var leftFront     = addPortal( [-1.0, 0.0, -2.0], 0.0, W, H );
	var leftBack      = addPortal( [-1.0, 0.0, -2.0], Math.PI, W, H );
	var leftEndFront  = addPortal( [-1.0, 0.0, -3.0], 0.0, W, H );
	var leftEndBack   = addPortal( [-1.0, 0.0, -3.0], Math.PI, W, H );
	var rightFront    = addPortal( [ 1.0, 0.0, -1.0], 0.0, W, H );
	var rightBack     = addPortal( [ 1.0, 0.0, -1.0], Math.PI, W, H );
	var rightEndFront = addPortal( [ 1.0, 0.0, -5.0], 0.0, W, H );
	var rightEndBack  = addPortal( [ 1.0, 0.0, -5.0], Math.PI, W, H );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0], leftBack, rightFront )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0], leftFront, rightBack )
	connectPortals( leftEndFront, rightEndBack, Math.PI, [0, 1, 0], leftEndBack, rightEndFront )
	connectPortals( leftEndBack, rightEndFront, Math.PI, [0, 1, 0], leftEndFront, rightEndBack )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.5, 1.46, 3.0), 0.0);
});