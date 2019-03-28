function PlayerCamera(position) {
	Camera.call( this );

	this.position = vec3.clone(position);
	this.direction = vec3.fromValues( 0, 0, -1 )
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	this.pitch = 0.0;
	this.yaw = 0.0;

	this.physicsBodyOffset = vec3.fromValues(0.0, -0.6, 0.0);
	this.physicsBody = new CANNON.Body({
		mass: 5,
		type: CANNON.Body.DYNAMIC,
		shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.85, 0.25)),
		position: new CANNON.Vec3(position[0], position[1], position[2]),
		linearDamping: 0.99999
	});
	physicsWorld.add(this.physicsBody);

	this.physicsBody.fixedRotation = true;

	this.moveSpeed = 4.0;
	this.rotateSpeed = 0.003;

	this.updateView();
}

PlayerCamera.prototype.updateView = function() {
	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up )
}

PlayerCamera.prototype.update = function( dt ) {
	this.keyboardMove( dt );
	this.updateView();
}

PlayerCamera.prototype.keyboardMove = function( dt ) {
	var movement = vec3.create();
	if ( Key.isDown(Key.UP) || Key.isDown(Key.W) ) {
		vec3.add( movement, movement, this.direction );
	}
	if ( Key.isDown(Key.DOWN) || Key.isDown(Key.S) ) {
		vec3.sub( movement, movement, this.direction );
	}
	if ( Key.isDown(Key.RIGHT) || Key.isDown(Key.D) ) {
		vec3.cross( vec3.temp, this.direction, this.up );
		vec3.add( movement, movement, vec3.temp );
	}
	if ( Key.isDown(Key.LEFT) || Key.isDown(Key.A) ) {
		vec3.cross( vec3.temp, this.direction, this.up );
		vec3.sub( movement, movement, vec3.temp );
	}

	vec3.scale( movement, movement, this.moveSpeed );
	this.physicsBody.velocity.set(movement[0], movement[1], movement[2]);
	positionGlMatrix = vec3.fromValues(this.physicsBody.position.x, this.physicsBody.position.y, this.physicsBody.position.z);

	return true;
};

PlayerCamera.prototype.updateVisualPosition = function() {
	vec3.sub(this.position, positionGlMatrix, this.physicsBodyOffset);
}


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