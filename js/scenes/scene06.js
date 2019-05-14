var scene06 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	addSkybox();
	addGround()
		.setTexture(textures.leaves);

	// Inner walls -- Center
	addModel(cube_mesh, [1.25, 1.5, 0], [1, 1.5, 0.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [-1.25, 1.5, 0], [1, 1.5, 0.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, 1.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, -1.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);

	// Inner walls -- Outer
	addModel(cube_mesh, [7.25, 1.5, 0], [1, 1.5, 0.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [-7.25, 1.5, 0], [1, 1.5, 0.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, 7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, -7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);

	// Outer walls -- door
	addModel(cube_mesh, [8.5, 1.5, 7.25], [0.25, 1.5, 1])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [8.5, 1.5, -3], [0.25, 1.5, 5.25])
		.setTexture(textures.wood_wall);
	//addModel(cube_mesh, [8.5, 1.5, 0], [0.25, 1.5, 8.25])
	//	.setTexture(textures.wood_wall);

	// Outer walls
	addModel(cube_mesh, [-8.5, 1.5, 0], [0.25, 1.5, 8.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, 8.5], [8.25, 1.5, 0.25])
		.setTexture(textures.wood_wall);
	addModel(cube_mesh, [0, 1.5, -8.5], [8.25, 1.5, 0.25])
		.setTexture(textures.wood_wall);

	// Roof 
	addModel(cube_mesh, [0, 3.25, 0], [8.25, 0.25, 8.25])
		.setTexture(textures.wood);

	// Floor
	addModel(cube_mesh, [4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0])
		.setTexture(textures.wood)
	addModel(cube_mesh, [-4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0])
		.setTexture(textures.wood)
	addModel(cube_mesh, [-4.125, 0, -4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0])
		.setTexture(textures.wood)

	// Room decorative objects
	addModel(sphere_mesh, [4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor([1, 0.25, 0.25, 1]);
	addModel(cube_mesh, [-4.125, 1.05, 4.125])
		.setTexture(textures.concrete)
		.setColor([0.25, 1, 0.25, 1]);
	addModel(cylinder_mesh, [-4.125, 1.05, -4.125])
		.setTexture(textures.concrete)
		.setColor([0.25, 0.50, 1, 1]);


	// Init portals
	portals = [];

	var portal1 = addPortal([4.25, 0.0, 0.0], 0, 4, 3 );
	var portal2 = addPortal([0, 0.0, -4.25], -0.5 * Math.PI, 4, 3 );

	// Connect portals
	connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(12.0, 1.46, 4.25), 0.5 * Math.PI);
});