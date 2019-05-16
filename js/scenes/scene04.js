var scene04 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 20;
	clearPhysics();

	// Init models
	models = [];
	addGround()
		.setTexture(textures.grass_lab);

	// Corridors
	var pos1 = [1, 0, 0];
	var pos2 = [-1, 0, 0];
	var rot1 = -0.5 * Math.PI;
	var rot2 = 0.5 * Math.PI;

	// Init portals
	portals = [];
	var portal1 = addPortal( pos1, rot1, 3, 3 );
	var portal2 = addPortal( pos2, rot2, 3, 3 );
	mat4.rotateZ( portal2.modelMatrix, portal2.modelMatrix, 0.2);

	// Connect portals
	portal1.modelMatrix;
	portal2.modelMatrix;
	connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] )


	addModel(sphere_mesh, [2, 1, 2])
		.setTexture(textures.snow);
	addModel(sphere_mesh, [2, 1, -2])
		.setTexture(textures.soil);


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, 2.0), 0);
});