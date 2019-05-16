var scene02 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 13;
	clearPhysics();

	// Init models
	models = [];
	addSkybox();

	const red = [1, 0.25, 0.25, 1];
	const green = [0.25, 1, 0.25, 1];
	const blue = [0.25, 0.5, 1, 1];
	const yellow = [1, 1, 0.25, 1];

	const cageMeshes = [null, cube_mesh, sphere_mesh, cylinder_mesh, sphere_mesh];
	const cageColors = [null, red, green, blue, yellow];

	const w = 1.5;
	const h = 1.5;
	const d = 0.25;
	const pillarH = h + 0.5 * d;
	const baseW = w - d;

	const rise = 2 * d;

	const offset = 500;

	// Cages
	for (let i = 0; i < cageMeshes.length; ++i) {
		let p = [offset * i, 0, 0];
		addGround(p).setTexture(textures.snow);
		p = vadd(p, [0, rise, 0]);

		// Base
		addModel(cube_mesh, vadd(p, [0, -d, w]), [baseW, d, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [0, -d, -w]), [baseW, d, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [w, -d, 0]), [d, d, baseW]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [-w, -d, 0]), [d, d, baseW]).setTexture(textures.wall);

		// Pillars
		addModel(cube_mesh, vadd(p, [-w, pillarH - 2*d, -w]), [d, pillarH, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [-w, pillarH - 2*d, w]), [d, pillarH, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [w, pillarH - 2*d, -w]), [d, pillarH, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [w, pillarH - 2*d, w]), [d, pillarH, d]).setTexture(textures.wall);

		// Roof
		addModel(cube_mesh, vadd(p, [-w, 2 * h - 2*d, 0]), [d, d, baseW]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [w, 2 * h - 2*d, 0]), [d, d, baseW]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [0, 2 * h - 2*d, -w]), [baseW, d, d]).setTexture(textures.wall);
		addModel(cube_mesh, vadd(p, [0, 2 * h - 2*d, w]), [baseW, d, d]).setTexture(textures.wall);

		if (i != 0) {
			addModel(cageMeshes[i], vadd(p, [0, h - 2*d, 0]), [0.75, 0.75, 0.75])
				.setTexture(textures.snow).setColor(cageColors[i]);
		}
	}

	// Init portals
	const W = 2 * baseW;
	const H = 2 * (pillarH - 2 * d);
	portals = [];

	const front = [0, rise, w + d];
	const back = [0, rise, -w - d];
	const right = [w + d, rise, 0];
	const left = [-w - d, rise, 0];

	const mainFront = addPortal(front, 0, W, H);
	const targetFront = addPortal(vadd(front, [1 * offset, 0, 0]), Math.PI, W, H);

	const mainBack = addPortal(back, Math.PI, W, H);
	const targetBack = addPortal(vadd(back, [2 * offset, 0, 0]), 0, W, H);

	const mainRight = addPortal(right, 0.5 * Math.PI, W, H);
	const targetRight = addPortal(vadd(right, [3 * offset, 0, 0]), -0.5 * Math.PI, W, H);

	const mainLeft = addPortal(left, -0.5 * Math.PI, W, H);
	const targetLeft = addPortal(vadd(left, [4 * offset, 0, 0]), 0.5 * Math.PI, W, H);
	const targetLeft2 = addPortal(vadd(right, [4 * offset, 0, 0]), -0.5 * Math.PI, W, H);

	connectPortals( mainFront, targetFront, Math.PI, [0, 1, 0], null, null )
	connectPortals( mainBack, targetBack, Math.PI, [0, 1, 0], null, null )
	connectPortals( mainRight, targetRight, Math.PI, [0, 1, 0], null, null )
	connectPortals( mainLeft, targetLeft, Math.PI, [0, 1, 0], null, null )
	connectPortals( targetLeft2, targetLeft, Math.PI, [0, 1, 0], null, null )
	/*
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
*/

	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, 5.0), 0);
});