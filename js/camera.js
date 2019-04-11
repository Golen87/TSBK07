function Camera() {
	this.viewMatrix = mat4.create();
	this.projMatrix = mat4.create();

	this.NEAR = 0.001;
	this.FAR = 100.0;

	this.frustumPlanes = [
		vec4.create(), // left
		vec4.create(), // right
		vec4.create(), // bottom
		vec4.create(), // top
		vec4.create(), // near
		vec4.create(), // far
	];

	this.updatePerspective();
}

Camera.prototype.clone = function() {
	var newCamera = new Camera();
	newCamera.viewMatrix = mat4.clone( this.viewMatrix );
	newCamera.projMatrix = mat4.clone( this.projMatrix );
	return newCamera;
}

Camera.prototype.getPosition = function() {
	var invViewMatrix = mat4.create();
	mat4.invert( invViewMatrix, this.viewMatrix );

	var pos = vec3.create();
	mat4.getTranslation( pos, invViewMatrix );

	return pos;
}



Camera.prototype.updatePerspective = function() {
	mat4.perspective( this.projMatrix, 45, gl.viewportWidth / gl.viewportHeight, this.NEAR, this.FAR );
	this.extractPlanesFromProjmat();
}

Camera.prototype.onWindowResize = function() {
	this.updatePerspective();
}



/* Portal */

Camera.prototype.setPortalView = function( portal ) {
	var pos = vec3.create();
	mat4.getTranslation( pos, portal.modelMatrix );

	//var nearest_portal_dist = portals[portals.length-1].distanceFromCamera;
	//var extra_clip = Math.min( nearest_portal_dist * 0.5, 0.1 );
	var extra_clip = 0.001;

	vec3.scale( vec3.temp, portal.normal, extra_clip );
	vec3.add( vec3.temp, pos, vec3.temp );

	this.clipOblique( vec3.temp, portal.normal );

	mat4.multiply( this.viewMatrix, this.viewMatrix, portal.warp );
};

// Clip the projection matrix to the portal surface, removing everything behind it
Camera.prototype.clipOblique = function( pos, normal ) {
	var pos4 = vec4.fromValues( pos[0], pos[1], pos[2], 1 );
	var worldViewPos = vec4.create();
	vec4.transformMat4( worldViewPos, pos4, this.viewMatrix )
	var cpos = vec3.fromValues( worldViewPos[0], worldViewPos[1], worldViewPos[2] );

	var nor4 = vec4.fromValues( -normal[0], -normal[1], -normal[2], 0 );
	var worldViewNor = vec4.create();
	vec4.transformMat4( worldViewNor, nor4, this.viewMatrix );
	var cnormal = vec3.fromValues( worldViewNor[0], worldViewNor[1], worldViewNor[2] );

	distance = -vec3.dot( cpos, cnormal );
	var cplane = vec4.fromValues( cnormal[0], cnormal[1], cnormal[2], distance );

	var projInv = mat4.create();
	mat4.invert( projInv, this.projMatrix );

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

	this.projMatrix[2] = c[0] - this.projMatrix[3];
	this.projMatrix[6] = c[1] - this.projMatrix[7];
	this.projMatrix[10] = c[2] - this.projMatrix[11];
	this.projMatrix[14] = c[3] - this.projMatrix[15];

	this.extractPlanesFromProjmat();
}


/* Frustum culling */

Camera.prototype.extractPlanesFromProjmat = function() {
	var mat = this.projMatrix;

	for (i = 0; i < 4; i++) {
		this.frustumPlanes[0][i] = mat[4*i + 3] + mat[4*i + 0]; // left
		this.frustumPlanes[1][i] = mat[4*i + 3] - mat[4*i + 0]; // right
		this.frustumPlanes[2][i] = mat[4*i + 3] + mat[4*i + 1]; // bottom
		this.frustumPlanes[3][i] = mat[4*i + 3] - mat[4*i + 1]; // top
		this.frustumPlanes[4][i] = mat[4*i + 3] + mat[4*i + 2]; // near
		this.frustumPlanes[5][i] = mat[4*i + 3] - mat[4*i + 2]; // far
	}
}

Camera.prototype.pointToPlaneDistance = function( plane, point ) {
	var a = plane[0];
	var b = plane[1];
	var c = plane[2];
	var d = plane[3];
	var x = point[0];
	var y = point[1];
	var z = point[2];

	return ( a*x + b*y + c*z + d ) / Math.sqrt( a*a + b*b + c*c );
}

Camera.prototype.frustumCulling = function( point, radius=0 ) {
	for (var i = 0; i < this.frustumPlanes.length; i++) {
		var D = this.pointToPlaneDistance( this.frustumPlanes[i], point );
		if ( D < -radius ) {
			return false;
		}
	}

	return true;
}