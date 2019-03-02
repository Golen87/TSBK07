function Camera() {
	this.viewMatrix = mat4.create();
	this.projMatrix = mat4.create();

	this.position = vec3.fromValues( 0, 0, 0 );
	this.direction = vec3.fromValues( 0, 0, 1 );
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	this.moveSpeed = 4.0;

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
	vec3.rotateY( this.direction, this.direction, [0,0,0], -dx*0.001 );

	vec3.normalize( this.direction, this.direction );
};
