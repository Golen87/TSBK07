var scene02 = new Scene(function() {
	window.CURRENT_PORTAL_DEPTH = 10;
	clearPhysics();

	// Init models
	models = [];
	addSkybox();

	const red = [1, 0.25, 0.25, 1];
	const green = [0.25, 1, 0.25, 1];
	const blue = [0.25, 0.5, 1, 1];
	const yellow = [1, 1, 0.25, 1];

	const cageMeshes = [null, cube_mesh, sphere_mesh, cylinder_mesh, cylinder_mesh];
	const cageColors = [null, red, green, blue, yellow];

	var w = 1.5;
	var h = 1.5;
	var d = 0.15;
	const pillarH = h + 0.5 * d;
	const baseW = w - d;

	const rise = 2 * d;

	const offset = 500;

	// Cages
	for (let i = 0; i < cageMeshes.length; ++i) {
		let p = [offset * i, 0, 0];
		addGround(p).setTexture(textures.snow);
		p = vadd(p, [0, rise, 0]);
		const color = [0.8, 0.9, 1.0, 1.0];

		// Base
		addModel(cube_mesh, vadd(p, [0, -d, w]), [baseW, d, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [0, -d, -w]), [baseW, d, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [w, -d, 0]), [d, d, baseW]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [-w, -d, 0]), [d, d, baseW]).setTexture(textures.wall)
			.setColor(color);

		// Pillars
		addModel(cube_mesh, vadd(p, [-w, pillarH - 2*d, -w]), [d, pillarH, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [-w, pillarH - 2*d, w]), [d, pillarH, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [w, pillarH - 2*d, -w]), [d, pillarH, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [w, pillarH - 2*d, w]), [d, pillarH, d]).setTexture(textures.wall)
			.setColor(color);

		// Roof
		addModel(cube_mesh, vadd(p, [-w, 2 * h - 2*d, 0]), [d, d, baseW]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [w, 2 * h - 2*d, 0]), [d, d, baseW]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [0, 2 * h - 2*d, -w]), [baseW, d, d]).setTexture(textures.wall)
			.setColor(color);
		addModel(cube_mesh, vadd(p, [0, 2 * h - 2*d, w]), [baseW, d, d]).setTexture(textures.wall)
			.setColor(color);

		if (i != 0) {
			addModel(cageMeshes[i], vadd(p, [0, h - 2*d, 0]))
				.setTexture(textures.snow).setColor(cageColors[i]);
		}


		// Icicles
		var icicles = [
			[4.0,	4.0,	4.0,	0.5],
			[4.2,	3.3,	1.5,	0.2],
			[3.3,	3.9,	0.9,	0.1],
			[-6.0,	2.0,	6.0,	0.8],
			[-6.6,	0.6,	3.0,	0.3],
			[-5.5,	2.8,	1.0,	0.2],
			[2.0,	-9.0,	5.0,	0.9],
			[0.0,	-9.6,	4.0,	0.6],
			[-15.0,	20.0,	24.0,	5.0],
			[25.0,	-15.0,	30.0,	4.0],
		];

		for (var j = icicles.length - 1; j >= 0; j--) {
			var ic = icicles[j];
			addModel(cylinder_mesh, vadd([ic[0], ic[2]/2, ic[1]], [offset*i, 0, 0]), [ic[3], ic[2]/2, ic[3]]).setTexture(textures.snow);
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


	// Player
	playerCamera = new PlayerCamera(vec3.fromValues(6.0, 1.46, 0.0), Math.PI/2);
});