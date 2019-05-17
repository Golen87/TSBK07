var scene06 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 2;
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
	const orange = [1, 0.5, 0, 1];

	const roomOffset = 24.0;

	var x, z;
	var ceiling_tex = [textures.wood_ceiling, textures.wood_tiles];
	for (i = 0; i < 2; ++i) {
		x = 0.9 * i * roomOffset;
		z = 0.1 * i * roomOffset;

		// Inner walls -- Center
		addModel(cube_mesh, [x + 1.25, 1.5, z], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x - 1.25, 1.5, z], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, z+1.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, z-1.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);

		// Inner walls -- Outer
		addModel(cube_mesh, [x + 7.25, 1.5, z], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x - 7.25, 1.5, z], [1, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, z+7.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, z-7.25], [0.25, 1.5, 1])
			.setTexture(textures.wood_wall);

		// Roof
		addModel(cube_mesh, [x+4.25, 3, z+4.25], [4.25, 0.1, 4.25]).setTexture(ceiling_tex[i]);
		addModel(cube_mesh, [x-4.25, 3, z+4.25], [4.25, 0.1, 4.25]).setTexture(ceiling_tex[i]);
		addModel(cube_mesh, [x+4.25, 3, z-4.25], [4.25, 0.1, 4.25]).setTexture(ceiling_tex[i]);
		addModel(cube_mesh, [x-4.25, 3, z-4.25], [4.25, 0.1, 4.25]).setTexture(textures.wood_tiles);

		// Floor
		addModel(cube_mesh, [x+4.25, 0, z+4.25], [4.25, 0.05, 4.25]).setTexture(textures.wood);
		addModel(cube_mesh, [x-4.25, 0, z+4.25], [4.25, 0.05, 4.25]).setTexture(textures.wood);
		addModel(cube_mesh, [x+4.25, 0, z-4.25], [4.25, 0.05, 4.25]).setTexture(textures.wood);
		addModel(cube_mesh, [x-4.25, 0, z-4.25], [4.25, 0.05, 4.25]).setTexture(textures.wood);

		// Outer walls -- sides
		addModel(cube_mesh, [x, 1.5, z+8.5], [8.25, 1.5, 0.25])
			.setTexture(textures.wood_wall);
		addModel(cube_mesh, [x, 1.5, z-8.5], [8.25, 1.5, 0.25])
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
	addModel(cube_mesh, [x-8.5, 1.5, z+7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [x-8.5, 1.5, z-3], [0.25, 1.5, 5.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [x+8.5, 1.5, z], [0.25, 1.5, 8.25])
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
	addModel(cylinder_mesh, [-4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor(blue);

	// Room 2
	addModel(cylinder_mesh, [x - 4.125, 1.05, z+4.125])
		.setTexture(textures.concrete)
		.setColor(yellow);
	addModel(cube_mesh, [x + 4.125, 1.05, z+4.125])
		.setTexture(textures.concrete)
		.setColor(orange);
	addModel(sphere_mesh, [x + 4.125, 1.05, z-4.125])
		.setTexture(textures.concrete)
		.setColor(green);
	addModel(sphere_mesh, [x - 4.125, 1.05, z-4.125])
		.setTexture(textures.concrete)
		.setColor(magenta);


	// Init portals
	portals = [];

	// Room 1
	const portal1 = addPortal([-4.25, 0, 0], 0, 4, 3 );
	const portal2 = addPortal([0, 0, -4.25], 0.5 * Math.PI, 4, 3 );

	// Room 2
	const portal21 = addPortal([x, 0, z-4.25], 0.5 * Math.PI, 4, 3 );
	const portal22 = addPortal([0, 0, -4.25], -0.5 * Math.PI, 4, 3 );
	const portal23 = addPortal([-4.25, 0, 0], -Math.PI, 4, 3 );
	const portal24 = addPortal([x, 0, z-4.25], -0.5 * Math.PI, 4, 3 );


	// Connect portals
	connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )
	connectPortals( portal21, portal22, Math.PI, [0, 1, 0] )
	connectPortals( portal23, portal24, Math.PI, [0, 1, 0] )


	// Decorations
	addModel(sphere_mesh, [10, 30, -15], [10, 10, 10]).setTexture(textures.plywood);
	addModel(sphere_mesh, [2, 25, -8], [7, 7, 7]).setTexture(textures.wood);
	addModel(sphere_mesh, [30, 30, 16], [8, 8, 8]).setTexture(textures.brick);


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(12.0, 1.46, 4.25), 0.5 * Math.PI);
});