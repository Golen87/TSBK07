function Camera() {
	this.viewMatrix = mat4.create();
	this.projMatrix = mat4.create();

	this.NEAR = 0.1;
	this.FAR = 100.0;

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

Camera.prototype.setPortalView = function( startMatrix, endMatrix, normal ) {
	var pos = vec3.create();
	mat4.getTranslation( pos, startMatrix );

	//Extra clipping to prevent artifacts
	//var extra_clip = Math.min(/*GH_ENGINE->NearestPortalDist() * */0.5, 0.1);

	var endInverse = mat4.create();
	mat4.invert( endInverse, endMatrix );
	var delta = mat4.create();
	mat4.multiply( delta, startMatrix, endInverse );

	this.clipOblique( /*pos - normal*extra_clip*/vec3.fromValues( pos[0]+0.1*normal[0], pos[1]+0.1*normal[1], pos[2]+0.1*normal[2] ), normal );

	mat4.multiply( this.viewMatrix, this.viewMatrix, delta );
};

// Clip the projection matrix to the portal surface, removing everything behind it
Camera.prototype.clipOblique = function( pos, normal ) {
	var pos4 = vec4.fromValues( pos[0], pos[1], pos[2], 1 );
	var worldViewPos = vec4.create();
	vec4.transformMat4( worldViewPos, pos4, this.viewMatrix )
	var cpos = vec3.fromValues( worldViewPos[0], worldViewPos[1], worldViewPos[2] );

	var nor4 = vec4.fromValues( normal[0], normal[1], normal[2], 0 );
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
	this.left = vec4.create();
	this.right = vec4.create();
	this.bottom = vec4.create();
	this.top = vec4.create();
	this.near = vec4.create();
	this.far = vec4.create();

	var mat = this.projMatrix;

	for (i = 0; i < 4; i++) {
		this.left[i]   = mat[4*i + 3] + mat[4*i + 0];
		this.right[i]  = mat[4*i + 3] - mat[4*i + 0]; 
		this.bottom[i] = mat[4*i + 3] + mat[4*i + 1];
		this.top[i]    = mat[4*i + 3] - mat[4*i + 1];
		this.near[i]   = mat[4*i + 3] + mat[4*i + 2];
		this.far[i]    = mat[4*i + 3] - mat[4*i + 2];
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
	var planes = [this.left, this.right, this.bottom, this.top, this.near, this.far];
	for (var i = 0; i < planes.length; i++) {
		var D = this.pointToPlaneDistance( planes[i], point );
		if ( D < -radius ) {
			return false;
		}
	}

	return true;
}