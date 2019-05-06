var scene05 = new Scene(function() {
	clearPhysics();
	models = [];
	portals = [];

	var offset = 1000;
	var scale = [0.4, 1.7, 0.4];

	// Init models
	for (var i = 0; i < 2; i++) {
		var ground = new Model( objects.ground, texture_prog );
		ground.setTexture( loadTexture(gl, "tex/grass_lab.png") );
		ground.setGLSetting( gl.CULL_FACE, false );
		ground.frustumCulling = false;
		mat4.translate(	ground.modelMatrix, ground.modelMatrix, [2*scale[0]*offset*i, 0.0, 0.0] );
		mat3.normalFromMat4( ground.normalMatrix, ground.modelMatrix );
		models.push( ground );

		var groundShape = new CANNON.Plane();
		var groundRotation = new CANNON.Quaternion();
		groundRotation.setFromAxisAngle (new CANNON.Vec3(1, 0, 0), -0.5 * Math.PI);
		initStaticBoxBody(groundShape, [0, 0, 0], groundRotation);
	}

	var walls = [
		[0, 0], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], [0, 16], [0, 17], [0, 18], [0, 19], [0, 20], [0, 21], [0, 22], [0, 23], [0, 24], [1, 0], [1, 6], [1, 9], [1, 12], [1, 18], [1, 24], [2, 0], [2, 6], [2, 9], [2, 12], [2, 18], [2, 24], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 9], [3, 12], [3, 15], [3, 16], [3, 17], [3, 18], [3, 19], [3, 20], [3, 21], [3, 24], [4, 0], [4, 6], [4, 12], [4, 15], [4, 18], [4, 24], [5, 0], [5, 6], [5, 12], [5, 15], [5, 18], [5, 24], [6, 0], [6, 1], [6, 2], [6, 3], [6, 6], [6, 7], [6, 8], [6, 9], [6, 12], [6, 15], [6, 18], [6, 19], [6, 20], [6, 21], [6, 24], [7, 0], [7, 3], [7, 6], [7, 12], [7, 15], [7, 21], [7, 24], [8, 0], [8, 3], [8, 6], [8, 12], [8, 15], [8, 21], [8, 24], [9, 0], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9], [9, 10], [9, 11], [9, 12], [9, 13], [9, 14], [9, 15], [9, 16], [9, 17], [9, 18], [9, 19], [9, 20], [9, 21], [9, 24], [10, 0], [10, 6], [10, 9], [10, 12], [10, 15], [10, 21], [10, 24], [11, 0], [11, 6], [11, 9], [11, 12], [11, 15], [11, 21], [11, 24], [12, 0], [12, 3], [12, 4], [12, 5], [12, 6], [12, 9], [12, 12], [12, 15], [12, 16], [12, 17], [12, 18], [12, 21], [12, 24], [13, 0], [13, 3], [13, 6], [13, 9], [13, 15], [13, 18], [13, 21], [13, 24], [14, 0], [14, 3], [14, 6], [14, 9], [14, 15], [14, 18], [14, 21], [14, 24], [15, 0], [15, 1], [15, 2], [15, 3], [15, 6], [15, 7], [15, 8], [15, 9], [15, 12], [15, 13], [15, 14], [15, 15], [15, 18], [15, 19], [15, 20], [15, 21], [15, 22], [15, 23], [15, 24], [16, 0], [16, 3], [16, 6], [16, 9], [16, 15], [16, 21], [16, 24], [17, 0], [17, 3], [17, 6], [17, 9], [17, 15], [17, 21], [17, 24], [18, 0], [18, 3], [18, 4], [18, 5], [18, 6], [18, 9], [18, 12], [18, 13], [18, 14], [18, 15], [18, 18], [18, 19], [18, 20], [18, 21], [18, 24], [19, 0], [19, 3], [19, 15], [19, 18], [19, 24], [20, 0], [20, 3], [20, 15], [20, 18], [20, 24], [21, 0], [21, 1], [21, 2], [21, 3], [21, 4], [21, 5], [21, 6], [21, 7], [21, 8], [21, 9], [21, 12], [21, 13], [21, 14], [21, 15], [21, 16], [21, 17], [21, 18], [21, 19], [21, 20], [21, 21], [21, 24], [22, 0], [22, 6], [22, 9], [22, 12], [22, 15], [22, 21], [22, 24], [23, 0], [23, 6], [23, 9], [23, 12], [23, 15], [23, 21], [23, 24], [24, 0], [24, 3], [24, 4], [24, 5], [24, 6], [24, 7], [24, 8], [24, 9], [24, 10], [24, 11], [24, 12], [24, 13], [24, 14], [24, 15], [24, 16], [24, 17], [24, 18], [24, 19], [24, 20], [24, 21], [24, 22], [24, 23], [24, 24],
		[10-offset, -10+0],
		[10-offset, -10+3],
	]
	var doors = [
		[[8, 20], [20, 5], [0, 1]], [[17, 14], [5, 2], [0, 1]], [[8, 5], [17, 23], [1, 0]], [[20, 20], [2, 5], [0, -1]], [[5, 17], [20, 17], [-1, 0]], [[14, 17], [14, 2], [-1, 0]], [[23, 8], [23, 8], [0, -1]], [[8, 2], [20, 2], [-1, 0]], [[20, 14], [5, 20], [0, 1]], [[14, 23], [14, 5], [1, 0]], [[17, 8], [14, 20], [-1, 0]], [[11, 17], [2, 17], [0, -1]], [[11, 11], [14, 8], [-1, 0]], [[8, 14], [2, 11], [1, 0]], [[8, 8], [23, 5], [0, -1]], [[23, 14], [23, 14], [0, 1]],
		[[10-offset, -10+2], [0, 2], [1, 0]],
		[[11-offset, -10+2], [25, 2], [-1, 0]],
	]


	for (var i = 0; i < walls.length; i++) {
		var p = walls[i];
		var pos = [
			scale[0] * 2 * (p[0] + offset),
			scale[1] / 2,
			scale[2] * 2 * p[1],
		];

		var cube = new Model( objects.cube, normal_prog );
		cube.setGLSetting( gl.CULL_FACE, true );
		mat4.translate( cube.modelMatrix, cube.modelMatrix, pos );
		mat4.scale( cube.modelMatrix, cube.modelMatrix, scale );
		mat3.normalFromMat4( cube.normalMatrix, cube.modelMatrix );
		cube.sphereRadius = Math.sqrt(3.0);
		models.push( cube );

		var box = new CANNON.Box(new CANNON.Vec3(
			scale[0],
			scale[1],
			scale[2]
		));
		initStaticBoxBody(box, pos, new CANNON.Quaternion());
	}

	for (var i = 0; i < doors.length; i++) {
		var p1 = doors[i][0];
		var p2 = doors[i][1];
		var d = doors[i][2];

		//var p_scale = [0.4, 0.6, 0.4];
		var pos1 = [
			scale[0] * 2 * (p1[0] + offset - 0.5),
			0.001,
			scale[2] * 2 * (p1[1] - 0.5),
		];
		var pos2 = [
			scale[0] * 2 * (p2[0] + offset - 0.5),
			0.001,
			scale[2] * 2 * (p2[1] - 0.5),
		];

		var rot1 = Math.atan2(d[1], -d[0]) + Math.PI/2;
		var rot2 = Math.atan2(-d[1], d[0]) + Math.PI/2;

		var portal1 = addPortal( pos1, rot1, 4*scale[0]-0.001, scale[1]*1.5 );
		var portal2 = addPortal( pos2, rot2, 4*scale[0]-0.001, scale[1]*1.5 );

		// Connect portals
		portal1.modelMatrix;
		portal2.modelMatrix;
		connectPortals( portal1, portal2, 1*Math.PI, [0, 1, 0] )
	}

	var cubeTex = new Model( objects.cube, texture_prog );
	cubeTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	cubeTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cubeTex.modelMatrix, cubeTex.modelMatrix, [-3.5, 1.0, -3.0] );
	mat3.normalFromMat4( cubeTex.normalMatrix, cubeTex.modelMatrix );
	cubeTex.sphereRadius = Math.sqrt(3.0);
	models.push( cubeTex );

	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(6, 1.46, -2), 0);
});