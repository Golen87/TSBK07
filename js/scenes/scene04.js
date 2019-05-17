var scene04 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 15;
	setFogColor([0.573, 0.886, 0.992, 1.0]);
	clearPhysics();

	// Init models
	models = [];
	portals = [];

	addGround([15,0,0])
		.setTexture(textures.grass_lab);

	function createPortalFrame() {
		const t = 0.1;

		var edge1 = addModel(cube_mesh, [0, -1-t, 0], [1.0+2*t, 0.1, 0.1])
			.setTexture(textures.wood)
		var edge2 = addModel(cube_mesh, [0, 1+t, 0], [1.0+2*t, 0.1, 0.1])
			.setTexture(textures.wood);
		var edge3 = addModel(cube_mesh, [1+t, 0, 0], [0.1, 0.8+2*t, 0.1])
			.setTexture(textures.wood);
		var edge4 = addModel(cube_mesh, [-1-t, 0, 0], [0.1, 0.8+2*t, 0.1])
			.setTexture(textures.wood);
		var portal = addPortal( [0,-1,0], 0, 2, 2 );

		return [ portal, edge1, edge2, edge3, edge4 ];
	}

	function applyGroupTransform(group, trans) {
		for (var i = group.length - 1; i >= 0; i--) {
			mat4.mul( group[i].modelMatrix, trans, group[i].modelMatrix );
		}
		return group;
	}


	{
		var trans = mat4.create();
		mat4.translate( trans, trans, [-1.5, 1.6, 0] );
		mat4.rotateY( trans, trans, 0.5 * Math.PI );
		//mat4.rotateZ( trans, trans, 0.05 * Math.PI );
		mat4.scale( trans, trans, [1.2, 1.2, 1.2] );
		var portal1 = applyGroupTransform( createPortalFrame(), trans )[0];

		var trans = mat4.create();
		mat4.translate( trans, trans, [1, 1.6, 0] );
		mat4.rotateY( trans, trans, -0.5 * Math.PI );
		mat4.scale( trans, trans, [1.2, 1.2, 1.2] );
		var portal2 = applyGroupTransform( createPortalFrame(), trans )[0];

		connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] );

		addModel(sphere_mesh, [2, 1, -2]).setTexture(textures.soil);
		addModel(sphere_mesh, [-3, 3.3, 1.3]).setTexture(textures.plywood);
	}

	{
		var trans = mat4.create();
		mat4.translate( trans, trans, [7, 1.6, 0] );
		mat4.rotateY( trans, trans, 0.5 * Math.PI );
		mat4.scale( trans, trans, [1.3, 1.3, 1.3] );
		var portal1 = applyGroupTransform( createPortalFrame(), trans )[0];

		var trans = mat4.create();
		mat4.translate( trans, trans, [9.5, 1.6, 0] );
		mat4.rotateY( trans, trans, -0.5 * Math.PI );
		mat4.rotateZ( trans, trans, 0.1 * Math.PI );
		mat4.scale( trans, trans, [1.2, 1.2, 1.2] );
		var portal2 = applyGroupTransform( createPortalFrame(), trans )[0];

		connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] );

		addModel(sphere_mesh, [11, 3.1, 1.9]).setTexture(textures.wood_ceiling);
		addModel(sphere_mesh, [5.5, 1.3, -2.3]).setTexture(textures.wood);
	}

	{
		var trans = mat4.create();
		mat4.translate( trans, trans, [15.75, 1.6, 0] );
		mat4.rotateY( trans, trans, 0.5 * Math.PI );
		mat4.rotateY( trans, trans, -0.05 * Math.PI );
		mat4.scale( trans, trans, [1.3, 1.3, 1.3] );
		var portal1 = applyGroupTransform( createPortalFrame(), trans )[0];

		var trans = mat4.create();
		mat4.translate( trans, trans, [18.25, 1.6, 0] );
		mat4.rotateY( trans, trans, -0.5 * Math.PI );
		mat4.scale( trans, trans, [1.2, 1.2, 1.2] );
		var portal2 = applyGroupTransform( createPortalFrame(), trans )[0];

		connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] );

		addModel(sphere_mesh, [19, 1.1, 2.3]).setTexture(textures.leaves);
		addModel(sphere_mesh, [14.5, 3.6, 1.3]).setTexture(textures.plywood);
	}

	{
		var trans = mat4.create();
		mat4.translate( trans, trans, [24, 1.6, 0] );
		mat4.rotateY( trans, trans, 0.5 * Math.PI );
		mat4.scale( trans, trans, [0.7, 0.7, 0.7] );
		var portal1 = applyGroupTransform( createPortalFrame(), trans )[0];

		var trans = mat4.create();
		mat4.translate( trans, trans, [26, 1.6, 0] );
		mat4.rotateY( trans, trans, -0.5 * Math.PI );
		mat4.scale( trans, trans, [1.3, 1.3, 1.3] );
		var portal2 = applyGroupTransform( createPortalFrame(), trans )[0];

		connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] );

		addModel(sphere_mesh, [28, 3.6, 2.2], [1.5, 1.5, 1.5]).setTexture(textures.wood_tiles);
		addModel(sphere_mesh, [25, 2.8, -1.8]).setTexture(textures.metal_holes);
	}

	// Walls
	addModel(cube_mesh, [4, 3, 0], [0.5, 3, 3]).setTexture(textures.planks)
	addModel(cube_mesh, [12.5, 3, 0], [0.5, 3, 3]).setTexture(textures.planks)
	addModel(cube_mesh, [21, 3, 0], [0.5, 3, 3]).setTexture(textures.planks)

	// Planets
	addModel(sphere_mesh, [25, 30, -10], [25, 25, 25]).setTexture(textures.snow);
	addModel(sphere_mesh, [-20, 30, 15], [17, 17, 17]).setTexture(textures.gravel);
	addModel(sphere_mesh, [10, 25, 35], [20, 20, 20]).setTexture(textures.stone);

	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(-0.25, 1.46, 10.0), 0);
});