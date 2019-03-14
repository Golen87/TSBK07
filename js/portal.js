function Portal(meshStr, shader) {
	Model.call( this, meshStr, shader );

	this.targetMatrix = mat4.create();
	this.targetNormal = vec3.create();
	this.targetBack = null;
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

extend( Model, Portal );