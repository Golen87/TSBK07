var scene01 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 2;
	clearPhysics();

	// Init models
	models = [];
	addSkybox();
	addGround()
		.setTexture(textures.soil);

	// Corridors
	addCorridor( /*Position*/ [-2.0, 0.0, 0.0], /*Scale*/ [1.5, 1.2, 2.0], /*Rotation*/ [0.0, 0.0, 0.0] );
	addCorridor( /*Position*/ [ 2.0, 0.0, 0.0], /*Scale*/ [1.5, 1.2, 8.0], /*Rotation*/ [0.0, 0.0, 0.0] );


	// Init portals
	portals = [];
	const W = 0.8 * 1.5;
	const H = 1.9 * 1.2;
	var leftFront     = addPortal( [-2.0, 0.0, +1.0], 0.0, W, H );
	var leftBack      = addPortal( [-2.0, 0.0, +1.0], Math.PI, W, H );
	var leftEndFront  = addPortal( [-2.0, 0.0, -1.0], 0.0, W, H );
	var leftEndBack   = addPortal( [-2.0, 0.0, -1.0], Math.PI, W, H );
	var rightFront    = addPortal( [ 2.0, 0.0, +4.0], 0.0, W, H );
	var rightBack     = addPortal( [ 2.0, 0.0, +4.0], Math.PI, W, H );
	var rightEndFront = addPortal( [ 2.0, 0.0, -4.0], 0.0, W, H );
	var rightEndBack  = addPortal( [ 2.0, 0.0, -4.0], Math.PI, W, H );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0], leftBack, rightFront )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0], leftFront, rightBack )
	connectPortals( leftEndFront, rightEndBack, Math.PI, [0, 1, 0], leftEndBack, rightEndFront )
	connectPortals( leftEndBack, rightEndFront, Math.PI, [0, 1, 0], leftEndFront, rightEndBack )


	// Decorations
	addModel( sphere_mesh, [-1, 2.5, -14], [5, 5, 5]).setTexture( textures.planks );
	addModel( sphere_mesh, [5, 1, -8], [1.5, 1.5, 1.5]).setTexture( textures.snow );
	addModel( sphere_mesh, [0, 1, 11], [2.6, 2.6, 2.6]).setTexture( textures.grass );
	addModel( sphere_mesh, [3, 0.6, 9], [1, 1, 1]).setTexture( textures.grass_lab );
	addModel( sphere_mesh, [1.5, 35, -1], [15, 15, 15]).setTexture( textures.grass_lab );
	addModel( sphere_mesh, [-7, 0.4, 2], [1.5, 1.5, 1.5]).setTexture( textures.soil );
	addModel( sphere_mesh, [-45, 5, 10], [15, 15, 15]).setTexture( textures.soil );


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(-2.0, 1.46, 7.0), -0.15*Math.PI);
});