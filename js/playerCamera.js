function PlayerCamera(position) {
	Camera.call( this );

	this.position = vec3.clone(position);
	this.direction = vec3.create();
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	vec3.set( this.direction, 0, 0, -1 );

	this.pitch = 0.0;
	this.yaw = 0.0;

	this.moveSpeed = 4.0;
	this.rotateSpeed = 0.003;

	this.updateView();
}

PlayerCamera.prototype.updateView = function() {
	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up )
}

PlayerCamera.prototype.update = function( dt ) {
	if ( this.keyboardMove( dt ) ) {
		// Update view matrix
		this.updateView();
	}
}

PlayerCamera.prototype.keyboardMove = function( dt ) {
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

	return true;
};

PlayerCamera.prototype.mouseMove = function( dx, dy ) {
	const fullRotation = 2 * Math.PI;
	const maxPitch = 0.49 * Math.PI;

	this.yaw = (this.yaw - dx*this.rotateSpeed) % fullRotation;
	this.pitch = this.pitch - dy*this.rotateSpeed;
	this.pitch = this.pitch.clamp( -maxPitch, maxPitch );

	this.direction = vec3.fromValues(0, 0, -1);
	vec3.rotateX(this.direction, this.direction, [0,0,0], this.pitch);
	vec3.rotateY(this.direction, this.direction, [0,0,0], this.yaw);
};


extend( Camera, PlayerCamera );