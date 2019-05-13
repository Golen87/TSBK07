var scene06 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	addSkybox();
	addGround();

	// Inner walls -- Center
	addModel(cube_mesh, [1.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [-1.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, 1.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, -1.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Inner walls -- Outer
	addModel(cube_mesh, [7.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [-7.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, 7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, -7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Outer walls -- door
	addModel(cube_mesh, [8.5, 1.5, 7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [8.5, 1.5, -3], [0.25, 1.5, 5.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	//addModel(cube_mesh, [8.5, 1.5, 0], [0.25, 1.5, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Outer walls
	addModel(cube_mesh, [-8.5, 1.5, 0], [0.25, 1.5, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, 8.5], [8.25, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addModel(cube_mesh, [0, 1.5, -8.5], [8.25, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Roof 
	addModel(cube_mesh, [0, 3.25, 0], [8.25, 0.25, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Floor
	addModel(cube_mesh, [4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([1, 0.25, 0.25, 1]);
	addModel(cube_mesh, [-4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 1, 0.25, 1])
	addModel(cube_mesh, [-4.125, 0, -4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 0.5, 1, 1])

	// Room decorative objects
	addModel(sphere_mesh, [4.125, 1.05, 4.125], [1, 1, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([1, 0.25, 0.25, 1]);
	addModel(cube_mesh, [-4.125, 1.05, 4.125], [1, 1, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 1, 0.25, 1]);
	addModel(cylinder_mesh, [-4.125, 1.05, -4.125], [1, 1, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
			.setColor([0.25, 0.5, 1, 1]);


	// Init portals
	portals = [];

	var portal1 = addPortal([4.25, 0.0, 0.0], 0, 4, 3 );
	var portal2 = addPortal([0, 0.0, -4.25], -0.5 * Math.PI, 4, 3 );

	// Connect portals
	connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(12.0, 1.46, 4.25), 0.5 * Math.PI);
});