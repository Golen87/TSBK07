var scene03 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	var ground = new Model( objects.ground, texture_prog );
	ground.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	ground.setGLSetting( gl.CULL_FACE, true );
	ground.frustumCulling = false;
	mat4.translate(	ground.modelMatrix, ground.modelMatrix, [0.0, 0.0, 0.0] );
	mat4.rotateX( ground.modelMatrix, ground.modelMatrix, 0.1 * Math.PI);
	mat3.normalFromMat4( ground.normalMatrix, ground.modelMatrix );
	models.push( ground );

	var groundShape = new CANNON.Plane();
	var groundRotation = new CANNON.Quaternion();
	groundRotation.setFromAxisAngle (new CANNON.Vec3(1, 0, 0), -0.4 * Math.PI);
	initStaticBoxBody(groundShape, [0, 0, 0], groundRotation);

	// Corridors
	var corrLeftPos = [-3.0, 0.0, -2.5];
	var corrRightPos = [3.0,  0.0, -3.0];
	var corrLeftRotY = 0.75 * Math.PI;
	var corrRightRotY = 0.35 * Math.PI;
	initCorridor( /*Scale*/ 1.0, 1.0, 1.0, /*Position*/ corrLeftPos, /*Rotation*/ 0.0, corrLeftRotY, 0.0 );
	initCorridor( /*Scale*/ 1.0, 1.0, 4.0, /*Position*/ corrRightPos, /*Rotation*/ 0.0, corrRightRotY, 0.0 );


	// Init portals
	portals = [];
	var leftPos    = [-3.0, 0.0, -2.0];
	var leftEndPos = [-3.0, 0.0, -3.0];
	vec3.rotateY(leftPos, leftPos, corrLeftPos, corrLeftRotY);
	vec3.rotateY(leftEndPos, leftEndPos, corrLeftPos, corrLeftRotY);
	var leftFront    = addPortal( leftPos, corrLeftRotY );
	var leftBack     = addPortal( leftPos, corrLeftRotY + Math.PI );
	var leftEndFront = addPortal( leftEndPos, corrLeftRotY );
	var leftEndBack  = addPortal( leftEndPos, corrLeftRotY + Math.PI );

	var rightPos    = [3.0, 0.0, -1.0];
	var rightEndPos = [3.0, 0.0, -5.0];
	vec3.rotateY(rightPos, rightPos, corrRightPos, corrRightRotY);
	vec3.rotateY(rightEndPos, rightEndPos, corrRightPos, corrRightRotY);
	var rightFront    = addPortal( rightPos, corrRightRotY );
	var rightBack     = addPortal( rightPos, corrRightRotY + Math.PI );
	var rightEndFront = addPortal( rightEndPos, corrRightRotY );
	var rightEndBack  = addPortal( rightEndPos, corrRightRotY + Math.PI );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0], leftBack, rightFront )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0], leftFront, rightBack )
	connectPortals( leftEndFront, rightEndBack, Math.PI, [0, 1, 0], leftEndBack, rightEndFront )
	connectPortals( leftEndBack, rightEndFront, Math.PI, [0, 1, 0], leftEndFront, rightEndBack )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, -9.0), Math.PI);
});