var scene02 = new Scene(function() {
	clearPhysics();

	// Init models
	models = [];
	addSkybox();
	addGround()
		.setTexture(textures.snow);

	// Corridors
	var corrLeftPos = [-3.0, 0.0, -2.5];
	var corrRightPos = [3.0,  0.0, -3.0];
	var corrLeftRotY = 0.75 * Math.PI;
	var corrRightRotY = 0.35 * Math.PI;
	addCorridor( /*Position*/ corrLeftPos, /*Scale*/ [1.0, 1.0, 1.0], /*Rotation*/ [0.0, corrLeftRotY, 0.0] );
	addCorridor( /*Position*/ corrRightPos, /*Scale*/ [1.0, 1.0, 4.0], /*Rotation*/ [0.0, corrRightRotY, 0.0] );


	// Init portals
	const W = 0.8;
	const H = 1.9;

	portals = [];
	var leftPos    = [-3.0, 0.0, -2.0];
	var leftEndPos = [-3.0, 0.0, -3.0];
	vec3.rotateY(leftPos, leftPos, corrLeftPos, corrLeftRotY);
	vec3.rotateY(leftEndPos, leftEndPos, corrLeftPos, corrLeftRotY);
	var leftFront    = addPortal( leftPos, corrLeftRotY, W, H );
	var leftBack     = addPortal( leftPos, corrLeftRotY + Math.PI, W, H );
	var leftEndFront = addPortal( leftEndPos, corrLeftRotY, W, H );
	var leftEndBack  = addPortal( leftEndPos, corrLeftRotY + Math.PI, W, H );

	var rightPos    = [3.0, 0.0, -1.0];
	var rightEndPos = [3.0, 0.0, -5.0];
	vec3.rotateY(rightPos, rightPos, corrRightPos, corrRightRotY);
	vec3.rotateY(rightEndPos, rightEndPos, corrRightPos, corrRightRotY);
	var rightFront    = addPortal( rightPos, corrRightRotY, W, H );
	var rightBack     = addPortal( rightPos, corrRightRotY + Math.PI, W, H );
	var rightEndFront = addPortal( rightEndPos, corrRightRotY, W, H );
	var rightEndBack  = addPortal( rightEndPos, corrRightRotY + Math.PI, W, H );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0], leftBack, rightFront )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0], leftFront, rightBack )
	connectPortals( leftEndFront, rightEndBack, Math.PI, [0, 1, 0], leftEndBack, rightEndFront )
	connectPortals( leftEndBack, rightEndFront, Math.PI, [0, 1, 0], leftEndFront, rightEndBack )


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, -9.0), Math.PI);
});