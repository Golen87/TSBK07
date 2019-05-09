var scene06 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	var ground = new Model( objects.ground, texture_prog );
	ground.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	ground.setGLSetting( gl.CULL_FACE, true );
	ground.frustumCulling = false;
	mat4.translate(	ground.modelMatrix, ground.modelMatrix, [0.0, 0.0, 0.0] );
	mat3.normalFromMat4( ground.normalMatrix, ground.modelMatrix );
	models.push( ground );

	var groundShape = new CANNON.Plane();
	var groundRotation = new CANNON.Quaternion();
	groundRotation.setFromAxisAngle (new CANNON.Vec3(1, 0, 0), -0.5 * Math.PI);
	initStaticBoxBody(groundShape, [0, 0, 0], groundRotation);

	// Inner walls -- Center
	addCube([1.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([-1.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, 1.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, -1.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Inner walls -- Outer
	addCube([7.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([-7.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, 7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, -7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Outer walls -- door
	addCube([8.5, 1.5, 7.25], [0.25, 1.5, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([8.5, 1.5, -3], [0.25, 1.5, 5.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	//addCube([8.5, 1.5, 0], [0.25, 1.5, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Outer walls
	addCube([-8.5, 1.5, 0], [0.25, 1.5, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, 8.5], [8.25, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	addCube([0, 1.5, -8.5], [8.25, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Roof 
	addCube([0, 3.25, 0], [8.25, 0.25, 8.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );

	// Floor
	addCube([4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([1, 0.25, 0.25, 1]);
	addCube([-4.125, 0, 4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 1, 0.25, 1])
	addCube([-4.125, 0, -4.125], [4.125, 0.05, 4.125], [0, Math.PI, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 0.5, 1, 1])

	// Room decorative objects
	sphere = new Model( objects.sphere, texture_prog )
		.setTexture( loadTexture(gl, "tex/debug.png") )
		.setGLSetting( gl.CULL_FACE, true )
		.setColor([1, 0.25, 0.25, 1]);
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [4.125, 1.05, 4.125] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );
	addCube([-4.125, 1.05, 4.125], [1, 1, 1], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") )
		.setColor([0.25, 1, 0.25, 1]);
	sphere = new Model( objects.cylinder, texture_prog )
		.setTexture( loadTexture(gl, "tex/debug.png") )
		.setGLSetting( gl.CULL_FACE, true )
		.setColor([0.25, 0.5, 1, 1])
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [-4.125, 1.05, -4.125] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );


	// Init portals
	portals = [];

	//addCube([1.25, 1.5, 0], [1, 1.5, 0.25], [0, 0, 0], texture_prog).setTexture( loadTexture(gl, "tex/debug.png") );
	var portal1 = addPortal([4.25, 0.0, 0.0], 0, 4, 3 );
	var portal2 = addPortal([0, 0.0, -4.25], -0.5 * Math.PI, 4, 3 );

	// Connect portals
	connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(12.0, 1.46, 4.25), 0.5 * Math.PI);
});