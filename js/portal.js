function Portal(meshStr, shader, position) {
	Model.call( this, meshStr, shader );

	this.normal = vec3.create();
	this.targetMatrix = mat4.create();
	this.targetNormal = vec3.create();
	this.targetBack = null;
	this.position = position;
	this.radiusXZ = 0.0;

	this.warp = mat4.create();
	this.warpInverse = mat4.create();

	this.lastNormalAlignedOffset = vec3.create();
}


Portal.prototype.isVisible = function( camera ) {
	var normal = vec3.fromValues( 0.0, 0.0, 1.0 );
	vec3.transformMat3( normal, normal, this.normalMatrix );

	var pos = vec3.create();
	mat4.getTranslation( pos, this.modelMatrix );

	var camPos = camera.getPosition();

	var relPos = vec3.create();
	vec3.sub( relPos, camPos, pos );

	if ( vec3.dot( relPos, normal ) < 0 ) {
		return false;
	}

	if ( !this.frustumCheck( camera ) ) {
		return false;
	}

	return true;
}

Portal.prototype.calculateWarp = function() {
	var pos = vec3.create();
	mat4.getTranslation( pos, this.modelMatrix );

	var endInverse = mat4.create();
	mat4.invert( endInverse, this.targetMatrix );
	mat4.multiply( this.warp, this.modelMatrix, endInverse );
	mat4.invert( this.warpInverse, this.warp, )
}

extend( Model, Portal );