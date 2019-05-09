var scene01 = new Scene(function() {
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

	// Corridors
	addCorridor( /*Position*/ [-1.0,  0.0, -2.5], /*Scale*/ [1.0, 1.0, 1.0], /*Rotation*/ [0.0, 0.0, 0.0] );
	addCorridor( /*Position*/ [ 1.0,  0.0, -3.0], /*Scale*/ [1.0, 1.0, 4.0], /*Rotation*/ [0.0, 0.0, 0.0] );

	// Spheres
	var k = 2;
	for (var x = -k; x < k; x++) for (var y = 0.25; y < 2*k; y++) for (var z = -k; z < k; z++) {
		var sphere = new Model( objects.sphere, normal_prog );
		sphere.setGLSetting( gl.CULL_FACE, true );
		mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [3*x, 3*y, 3*z] );
		mat4.scale( sphere.modelMatrix, sphere.modelMatrix, [0.2, 0.2, 0.2] );
		sphere.sphereRadius = 0.2;
		mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
		models.push( sphere );
	}

	var sphere = new Model( objects.sphere, normal_prog );
	sphere.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [3.5, 1.0, -6.0] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );

	var sphereFlat = new Model( objects.sphere, normal_prog );
	sphereFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [3.5, 3.0, -6.0] );
	mat4.rotateZ( sphereFlat.modelMatrix, sphereFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereFlat.normalMatrix, sphereFlat.modelMatrix );
	models.push( sphereFlat );

	var sphereTex = new Model( objects.sphere, texture_prog );
	sphereTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTex.modelMatrix, sphereTex.modelMatrix, [3.5, 1.0, -3.0] );
	mat3.normalFromMat4( sphereTex.normalMatrix, sphereTex.modelMatrix );
	models.push( sphereTex );

	var sphereTexFlat = new Model( objects.sphere, texture_prog );
	sphereTexFlat.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTexFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [3.5, 3.0, -3.0] );
	mat4.rotateZ( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereTexFlat.normalMatrix, sphereTexFlat.modelMatrix );
	models.push( sphereTexFlat );

	addCube([-3.5, 1.0, -6.0], [1, 1, 1], [0, 0, 0], normal_prog);
	addCube([-3.5, 1.0, -3.0], [1, 1, 1], [0, 0, 0], normal_prog)
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
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, 3.0), 0.0);
});