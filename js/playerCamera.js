function PlayerCamera(position, rotationY) {
	Camera.call( this );

	this.position = vec3.create();
	this.direction = vec3.fromValues( 0, 0, -1 );
	this.forward = new CANNON.Vec3( 0, 0, -1 );
	this.right = new CANNON.Vec3( 1, 0, 0 );
	this.targetPos = vec3.clone( this.direction );
	this.up = vec3.fromValues( 0, 1, 0 );

	this.pitch = 0.0;
	this.yaw = rotationY;

	this.bobbing = vec3.create();
	this.bobValue = 0.0;

	this.physicsBodyOffset = vec3.fromValues(0.0, -1.2, 0.0);
	this.physicsBodyRadius = 0.25;
	this.physicsBody = new CANNON.Body({
		mass: 5,
		type: CANNON.Body.DYNAMIC,
		shape: new CANNON.Sphere(this.physicsBodyRadius),
		position: new CANNON.Vec3(
			position[0] + this.physicsBodyOffset[0],
			position[1] + this.physicsBodyOffset[1],
			position[2] + this.physicsBodyOffset[2]),
		linearDamping: 0.99999
	});
	physicsWorld.add(this.physicsBody);
	this.postPhysicsUpdate(0.0);


	this.physicsBody.fixedRotation = true;
	this.justTeleported = true;

	this.moveSpeed = 2.8 * 60;
	this.runFactor = null;
	this.rotateSpeed = 0.003;

	this.mouseMove(0.0, 0.0);
	this.updateView(0.0);
}

PlayerCamera.prototype.updateView = function( dt ) {
	var height = Math.abs(0.05 * Math.sin(0.04 * this.bobValue));
	vec3.set( this.bobbing, 0, height, 0 );
	vec3.add( this.position, this.position, this.bobbing );

	vec3.add( this.targetPos, this.position, this.direction );
	mat4.lookAt( this.viewMatrix, this.position, this.targetPos, this.up )
}

PlayerCamera.prototype.update = function( dt ) {
	this.keyboardMove( dt );
	this.justTeleported = false;
}

PlayerCamera.prototype.keyboardMove = function( dt ) {
	if ( Key.isDown(Key.SHIFT) ) {
		this.runFactor = 2.1;
	}
	else {
		this.runFactor = 1.0;
	}

	var movement = new CANNON.Vec3();
	if ( Key.isDown(Key.UP) || Key.isDown(Key.W) ) {
		movement = movement.vadd(this.forward);
	}
	if ( Key.isDown(Key.DOWN) || Key.isDown(Key.S) ) {
		movement = movement.vsub(this.forward);
	}

	if ( Key.isDown(Key.RIGHT) || Key.isDown(Key.D) ) {
		movement = movement.vadd(this.right);
	}
	if ( Key.isDown(Key.LEFT) || Key.isDown(Key.A) ) {
		movement = movement.vsub(this.right);
	}

	var raycastResult = new CANNON.RaycastResult();
	if(physicsWorld.raycastClosest(
		this.physicsBody.position,
		this.physicsBody.position.vsub(new CANNON.Vec3(0, 40, 0)),
		{skipBackfaces: true}, raycastResult))
	{
		// Snap to surface
		var gPos = raycastResult.hitPointWorld;
		this.physicsBody.position.set(gPos.x, gPos.y + this.physicsBodyRadius, gPos.z);

		if (movement.lengthSquared() > 0.0) {
			var surfaceNormal = raycastResult.hitNormalWorld.unit();
			var movementNormalProjection = surfaceNormal.scale(surfaceNormal.dot(movement));
			var surfaceMovement = movement.vsub(movementNormalProjection);
			var finalMovement = surfaceMovement.unit().scale(dt * this.moveSpeed * this.runFactor);
			this.physicsBody.velocity.set(finalMovement.x, finalMovement.y, finalMovement.z);

			this.bobValue += finalMovement.length();
		}
		else {
			this.physicsBody.velocity.set(0, 0, 0);
		}
	}
	else {
		// Floating
		if (movement.lengthSquared() > 0.0) {
			var finalMovement = movement.unit().scale(dt * this.moveSpeed * this.runFactor);
			this.physicsBody.velocity.set(finalMovement.x, finalMovement.y, finalMovement.z);
		}
		else {
			this.physicsBody.velocity.set(0, 0, 0);
		}
	}

	return true;
};

PlayerCamera.prototype.postPhysicsUpdate = function( dt ) {
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
				vec3.scale(vec3.temp, portals[i].targetNormal, -2.0 * nearLimit);
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
				return this.postPhysicsUpdate( dt ); // Update normalAlignedOffset with new position (without teleporting again)
			}
		}
		portals[i].lastNormalAlignedOffset = normalAlignedOffset;
	}

	// Update camera position
	vec3.sub(this.position, positionGL, this.physicsBodyOffset);
	this.updateView( dt );
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
	this.forward = cannonVec3FromGL(this.forward);
	this.right = cannonVec3FromGL(this.right);
};


extend( Camera, PlayerCamera );