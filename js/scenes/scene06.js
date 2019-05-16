var scene06 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	addSkybox();
	addGround()
		.setTexture(textures.leaves);

	const red = [1, 0.25, 0.25, 1];
	const green = [0.25, 1, 0.25, 1];
	const blue = [0.25, 0.5, 1, 1];
	const yellow = [1, 1, 0.25, 1];
	const magenta = [1, 0.25, 1, 1];

	const roomOffset = 24.0;

	for (i = 0; i < 2; ++i) {
		const x = i * roomOffset;

		// Inner walls -- Center
		addModel(cube_mesh, [x + 1.25, 1.5, 0], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x - 1.25, 1.5, 0], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, 1.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, -1.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);

		// Inner walls -- Outer
		addModel(cube_mesh, [x + 7.25, 1.5, 0], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x - 7.25, 1.5, 0], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, 7.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, -7.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);

		// Roof
		addModel(cube_mesh, [x, 3.25, 0], [8.25, 0.25, 8.25])
			.setTexture(textures.wood);

		// Floor
		addModel(cube_mesh, [x, 0, 0], [8.25, 0.05, 8.25])
			.setTexture(textures.wood);

		// Outer walls -- sides
		addModel(cube_mesh, [x, 1.5, 8.5], [8.25, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, -8.5], [8.25, 1.5, 0.25])
			.setTexture(textures.wood_wall);
	}

	// Outer walls -- door and back

	// Room 1
	addModel(cube_mesh, [8.5, 1.5, 7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [8.5, 1.5, -3], [0.25, 1.5, 5.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [-8.5, 1.5, 0], [0.25, 1.5, 8.25])
		.setTexture(textures.wood_wall);

	// Room 2
	addModel(cube_mesh, [roomOffset - 8.5, 1.5, 7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [roomOffset - 8.5, 1.5, -3], [0.25, 1.5, 5.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [roomOffset + 8.5, 1.5, 0], [0.25, 1.5, 8.25])
		.setTexture(textures.wood_wall);

	// Room decorative objects

	// Room 1
	addModel(sphere_mesh, [4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor(red);
	addModel(cube_mesh, [-4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor(green);
	addModel(cylinder_mesh, [4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor(blue);

	// Room 2
	addModel(sphere_mesh, [roomOffset - 4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor(red);
	addModel(cube_mesh, [roomOffset + 4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor(green);
	addModel(cylinder_mesh, [roomOffset + 4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor(blue);
	addModel(cylinder_mesh, [-4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor(yellow);
	addModel(sphere_mesh, [roomOffset - 4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor(magenta);


	// Init portals
	portals = [];

	// Room 1
	const portal1 = addPortal([-4.25, 0, 0], 0, 4, 3 );
	const portal2 = addPortal([0, 0, -4.25], 0.5 * Math.PI, 4, 3 );

	// Room 2
	const portal21 = addPortal([roomOffset, 0, -4.25], 0.5 * Math.PI, 4, 3 );
	const portal22 = addPortal([0, 0, -4.25], -0.5 * Math.PI, 4, 3 );
	const portal23 = addPortal([-4.25, 0, 0], -Math.PI, 4, 3 );
	const portal24 = addPortal([roomOffset, 0, -4.25], -0.5 * Math.PI, 4, 3 );


	// Connect portals
	connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )
	connectPortals( portal21, portal22, Math.PI, [0, 1, 0] )
	connectPortals( portal23, portal24, Math.PI, [0, 1, 0] )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(12.0, 1.46, 4.25), 0.5 * Math.PI);
});