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

Camera.prototype.update = function( dt ) {;
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
	
	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up )
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


Camera.prototype.getPortalView = function( projMatrix, viewMatrix, startMatrix, endMatrix, normal) {
	var pos = vec3.create();
	mat4.getTranslation( pos, startMatrix );

	//Extra clipping to prevent artifacts
	//var extra_clip = Math.min(/*GH_ENGINE->NearestPortalDist() * */0.5, 0.1);

	var endInverse = mat4.create();
	mat4.invert( endInverse, endMatrix );
	var delta = mat4.create();
	mat4.multiply( delta, startMatrix, endInverse );

	this.clipOblique( viewMatrix, projMatrix, /*pos - normal*extra_clip*/vec3.fromValues( pos[0]+0.1*normal[0], pos[1]+0.1*normal[1], pos[2]+0.1*normal[2] ), normal );

	mat4.multiply( viewMatrix, viewMatrix, delta );

	return;
};

Camera.prototype.clipOblique = function( viewMatrix, projMatrix, pos, normal ) {
	var pos4 = vec4.fromValues( pos[0], pos[1], pos[2], 1 );
	var worldViewPos = vec4.create();
	vec4.transformMat4( worldViewPos, pos4, viewMatrix )
	var cpos = vec3.fromValues( worldViewPos[0], worldViewPos[1], worldViewPos[2] );

	var nor4 = vec4.fromValues( normal[0], normal[1], normal[2], 0 );
	var worldViewNor = vec4.create();
	vec4.transformMat4( worldViewNor, nor4, viewMatrix );
	var cnormal = vec3.fromValues( worldViewNor[0], worldViewNor[1], worldViewNor[2] );

	distance = -vec3.dot( cpos, cnormal );
	var cplane = vec4.fromValues( cnormal[0], cnormal[1], cnormal[2], distance );

	var projInv = mat4.create();
	mat4.invert( projInv, projMatrix );

	var qpos = vec4.fromValues(
		(cplane[0] < 0.0 ? 1.0 : -1.0),
		(cplane[1] < 0.0 ? 1.0 : -1.0),
		1.0,
		1.0
	);
	var q = vec4.create();
	vec4.transformMat4( q, qpos, projInv )

	qdot = vec4.dot( cplane, q );
	var c = vec4.create();
	vec4.scale( c, cplane, 2.0 / qdot );

	projMatrix[2] = c[0] - projMatrix[3];
	projMatrix[6] = c[1] - projMatrix[7];
	projMatrix[10] = c[2] - projMatrix[11];
	projMatrix[14] = c[3] - projMatrix[15];
}
