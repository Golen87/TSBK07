var scene03 = new Scene(function() {
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
	var pos1 = [1, 0, 0];
	var pos2 = [-1, 0, 0];
	var rot1 = -0.5 * Math.PI;
	var rot2 = 0.5 * Math.PI;

	// Init portals
	portals = [];
	var portal1 = addPortal( pos1, rot1, 3, 3 );
	var portal2 = addPortal( pos2, rot2, 3, 3 );

	// Connect portals
	portal1.modelMatrix;
	portal2.modelMatrix;
	connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] )


	var sphere = new Model( objects.sphere, normal_prog );
	sphere.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [2, 1, 2] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );

	var sphereTex = new Model( objects.sphere, texture_prog );
	sphereTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTex.modelMatrix, sphereTex.modelMatrix, [2, 1, -2] );
	mat3.normalFromMat4( sphereTex.normalMatrix, sphereTex.modelMatrix );
	models.push( sphereTex );


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, 2.0), 0);
});