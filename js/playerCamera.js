function PlayerCamera(position, rotationY) {
	Camera.call( this );

	this.position = vec3.create();
	this.direction = vec3.fromValues( 0, 0, -1 );
	this.forward = vec3.fromValues( 0, 0, -1);
	this.right = vec3.fromValues( 1, 0, 0);
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	this.pitch = 0.0;
	this.yaw = rotationY;

	this.physicsBodyOffset = vec3.fromValues(0.0, -0.6, 0.0);
	this.physicsBody = new CANNON.Body({
		mass: 5,
		type: CANNON.Body.DYNAMIC,
		shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.85, 0.25)),
		position: new CANNON.Vec3(
			position[0] + this.physicsBodyOffset[0],
			position[1] + this.physicsBodyOffset[1],
			position[2] + this.physicsBodyOffset[2]),
		linearDamping: 0.99999
	});
	physicsWorld.add(this.physicsBody);
	this.postPhysicsUpdate();


	this.physicsBody.fixedRotation = true;
	this.justTeleported = true;

	this.moveSpeed = 2.0;
	this.rotateSpeed = 0.003;

	this.mouseMove(0.0, 0.0);
	this.updateView();
}

PlayerCamera.prototype.updateView = function() {
	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up )
}

PlayerCamera.prototype.update = function( dt ) {
	this.keyboardMove( dt );
	this.justTeleported = false;
}

PlayerCamera.prototype.keyboardMove = function( dt ) {
	var movement = vec3.create();
	if ( Key.isDown(Key.UP) || Key.isDown(Key.W) ) {
		vec3.add( movement, movement, this.forward );
	}
	if ( Key.isDown(Key.DOWN) || Key.isDown(Key.S) ) {
		vec3.sub( movement, movement, this.forward );
	}

	if ( Key.isDown(Key.RIGHT) || Key.isDown(Key.D) ) {
		vec3.add( movement, movement, this.right );
	}
	if ( Key.isDown(Key.LEFT) || Key.isDown(Key.A) ) {
		vec3.sub( movement, movement, this.right);
	}

	vec3.scale( movement, movement, this.moveSpeed );
	this.physicsBody.velocity.set(movement[0], movement[1], movement[2]);

	return true;
};

PlayerCamera.prototype.postPhysicsUpdate = function() {
	var positionGL = glVec3FromCannon(this.physicsBody.position);
	var nearLimit = this.NEAR;

	// Handle teleportation
	for (var i = portals.length - 1; i >= 0; i--) {
		vec3.add( vec3.temp, portals[i].position, portals[i].sphereOffset );
		vec3.sub( vec3.temp, positionGL, vec3.temp ); // Delta position
		normalAlignedOffset = vec3.dot( vec3.temp, portals[i].normal )
		if ( !this.justTeleported && normalAlignedOffset >= -nearLimit && portals[i].lastNormalAlignedOffset < -nearLimit ) {
			// Crossed portal plane
			if ( Math.abs(vec3.temp[1]) <= portals[i].sphereRadius
				&& vec2.length(vec2.fromValues(vec3.temp[0], vec3.temp[2])) <= portals[i].radiusXZ ) {
				// Inside portal

				// Teleport -- position
				vec3.transformMat4(positionGL, positionGL, portals[i].warpInverse);
				vec3.scale(vec3.temp, portals[i].normal, 2.0 * nearLimit);
				vec3.add(positionGL, positionGL, vec3.temp);
				this.physicsBody.position.x = positionGL[0];
				this.physicsBody.position.y = positionGL[1];
				this.physicsBody.position.z = positionGL[2];

				// Rotatation -- rotation
				var warpRotationGL = quat.create();
				mat4.getRotation(warpRotationGL, portals[i].warpInverse);
				var rotation = cannonQuatFromGl(warpRotationGL);;
				var rotYZX = new CANNON.Vec3();
				rotation.toEuler(rotYZX, 'YZX');
				this.yaw += rotYZX.y;
				this.mouseMove(0.0, 0.0);

				this.justTeleported = true;
				return this.postPhysicsUpdate(true); // Update normalAlignedOffset with new position (without teleporting again)
			}
		}
		portals[i].lastNormalAlignedOffset = normalAlignedOffset;
	}

	// Update camera position
	vec3.sub(this.position, positionGL, this.physicsBodyOffset);
	this.updateView();
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

	this.forward = vec3.fromValues(this.direction[0], 0, this.direction[2]);
	vec3.normalize(this.forward, this.forward);
	vec3.cross( this.right, this.direction, this.up );
};


extend( Camera, PlayerCamera );