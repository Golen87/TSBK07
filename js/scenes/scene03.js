var scene03 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];


	// Ground

	const angle = 0.08 * Math.PI;
	const slopeDepth = 4.0;
	groundHeight = 0.1;

	const grassColor = [0.3, 0.7, 0.3, 1];

	var slopeEdgeDepth = Math.cos(angle) * slopeDepth;
	slopeEdgeHeight = Math.sin(angle) * slopeDepth;
	var slopeEdgeDepthOffset = Math.sin(angle) * groundHeight;
	addModel(cube_mesh, [0, 0, 0], [slopeDepth, groundHeight, slopeDepth], [angle, 0, 0], texture_prog)
		.setTexture( loadTexture(gl, "tex/grass.png") ).setColor(grassColor);
	addModel(cube_mesh, [0, slopeEdgeHeight, -(slopeEdgeDepth - slopeEdgeDepthOffset + slopeDepth)],
		[slopeDepth, groundHeight, slopeDepth], [0, 0, 0], texture_prog)
		.setTexture( loadTexture(gl, "tex/grass.png") ).setColor(grassColor);
	addModel(cube_mesh, [0, -slopeEdgeHeight, (slopeEdgeDepth - slopeEdgeDepthOffset + slopeDepth)],
		[slopeDepth, groundHeight, slopeDepth], [0, 0, 0], texture_prog)
		.setTexture( loadTexture(gl, "tex/grass.png") ).setColor(grassColor);


	// Corridors
	var shearTransform = mat4.fromValues(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, -Math.tan(angle /*+ 0.015*/), 1, 0,
		0, 0, 0, 1
	);
	var corridor = addCorridor( /*Position*/ [0, groundHeight, 0], /*Scale*/ [2, 1.5, 2 * slopeEdgeDepth], /*Rotation*/ [0.0, 0.0, 0.0]);
	mat4.multiply(corridor.modelMatrix, shearTransform, corridor.modelMatrix);

	// Physical walls
	var width = 2;
	var wallThickness = 0.2;
	var depth = 2 * slopeEdgeDepth;
	wallShape = new CANNON.Box(new CANNON.Vec3(
		0.5 * wallThickness,
		80,
		0.5 * depth));

	var wallPos = vec3.fromValues(
		- 0.5 * (width - wallThickness),
		0,
		0.0);
	initStaticBoxBody(wallShape, wallPos, new CANNON.Quaternion());

	wallPos = vec3.fromValues(
		+ 0.5 * (width - wallThickness),
		0,
		0.0);
	initStaticBoxBody(wallShape, wallPos, new CANNON.Quaternion());


	// Init portals
	const W = 0.8 * 2;
	const H = 1.9 * 1.5;
	portals = [];
	var topFront = addPortal( [0, slopeEdgeHeight + groundHeight, -slopeEdgeDepth],
		0.0, W, H );
	var topBack = addPortal( [0, slopeEdgeHeight + groundHeight, -slopeEdgeDepth],
		Math.PI, W, H );
	var bottomFront = addPortal( [0, -slopeEdgeHeight + groundHeight, slopeEdgeDepth],
		Math.PI, W, H );
	var bottomBack = addPortal( [0, -slopeEdgeHeight + groundHeight, slopeEdgeDepth],
		0.0, W, H );

	// Connect portals
	connectPortals( topFront, bottomFront, 0, [0, 1, 0], topBack, bottomBack );
	connectPortals( topBack, bottomBack, 0, [0, 1, 0], topFront, bottomFront );

	// Player
	playerCamera = new PlayerCamera(
		vec3.fromValues(0.0, 1.46 + slopeEdgeHeight + 0.5 * groundHeight, -7.0), Math.PI);
});