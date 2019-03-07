function Camera() {
	this.viewMatrix = mat4.create();
	this.projMatrix = mat4.create();

	this.position = vec3.fromValues( 0, 0, 3 );
	this.direction = vec3.fromValues( 0, 0, -1 );
	this.pitch = 0.0;
	this.yaw = 0.0;
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	this.moveSpeed = 4.0;
	this.rotateSpeed = 0.003;

	this.updatePerspective();
}

Camera.prototype.updatePerspective = function() {
	mat4.perspective( this.projMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0 );
}

Camera.prototype.onWindowResize = function() {
	this.updatePerspective();
}

Camera.prototype.update = function( dt ) {
	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up );

	if ( Key.isDown(Key.UP) || Key.isDown(Key.W) ) {
		vec3.scale( vec3.temp, this.direction, this.moveSpeed * dt );
		vec3.add( this.position, this.position, vec3.temp );
	}
	if ( Key.isDown(Key.LEFT) || Key.isDown(Key.A) ) {
		vec3.scale( vec3.temp, this.direction, this.moveSpeed * dt );
		vec3.cross( vec3.temp, vec3.temp, this.up );
		vec3.sub( this.position, this.position, vec3.temp );
	}
	if ( Key.isDown(Key.DOWN) || Key.isDown(Key.S) ) {
		vec3.scale( vec3.temp, this.direction, this.moveSpeed * dt );
		vec3.sub( this.position, this.position, vec3.temp );
	}
	if ( Key.isDown(Key.RIGHT) || Key.isDown(Key.D) ) {
		vec3.scale( vec3.temp, this.direction, this.moveSpeed * dt );
		vec3.cross( vec3.temp, vec3.temp, this.up );
		vec3.add( this.position, this.position, vec3.temp );
	}
};

Camera.prototype.mouseMove = function( dx, dy ) {
	const fullRotation = 2 * Math.PI;
	const maxPitch = 0.49 * Math.PI;

	this.yaw = (this.yaw - dx*this.rotateSpeed) % fullRotation;
	this.pitch = this.pitch - dy*this.rotateSpeed;
	this.pitch = this.pitch.clamp( -maxPitch, maxPitch );

	this.direction = vec3.fromValues(0, 0, -1);
	vec3.rotateX(this.direction, this.direction, [0,0,0], this.pitch);
	vec3.rotateY(this.direction, this.direction, [0,0,0], this.yaw);
};


Camera.prototype.getPortalView = function( startMatrix, endMatrix ) {
	var posMatrix = mat4.create();
	mat4.fromTranslation( posMatrix, this.position );

	var mv = mat4.create();
	//var t = mat4.create();
	mat4.multiply( mv, posMatrix, startMatrix );

	var backwards = mat4.create();
	mat4.rotate( backwards, backwards, Math.PI, [0, 1, 0] );

	var endInverse = mat4.create();
	mat4.invert( endInverse, endMatrix );

	var portalView = mat4.create();
	mat4.multiply( portalView, portalView, mv );
	mat4.multiply( portalView, portalView, backwards );
	mat4.multiply( portalView, portalView, endInverse );

	//var invView = mat4.create();
	//mat4.invert( invView, this.viewMatrix );

	//var camPos = this.position;//vec3.create();
	//mat4.getTranslation( camPos, this.viewMatrix );
	//var portalPos = vec3.create();
	//mat4.getTranslation( portalPos, startMatrix );
	//var normal = vec3.fromValues( 0, 0, -1 );

	//var inDir = vec3.create();
	//vec3.subtract( inDir, camPos, portalPos );
	//var outDir = vec3.create();
	//vec3.scale( outDir, normal, 2 * vec3.dot( inDir, normal ) );
	//vec3.subtract( outDir, outDir, inDir );

	//var outPos = vec3.create();
	//vec3.add( outPos, portalPos, inDir );

	//var portalView = mat4.create();
	//mat4.lookAt( portalView, portalPos, outPos, this.up );

	return portalView;
};