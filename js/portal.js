function Portal(meshStr, shader, position) {
	Model.call( this, meshStr, shader );

	this.position = position;
	this.normal = vec3.create();
	this.radiusXZ = 0.0;

	this.warp = mat4.create();
	this.warpInverse = mat4.create();

	this.lastNormalAlignedOffset = vec3.create();

	this.targetMatrix = mat4.create();
	this.targetNormal = vec3.create();
	this.targetBack = null;

	this.distanceFromCamera = 0.0;

	this.queries = {};
	this.createQuery("");
}

Portal.prototype.updateDistanceFromCamera = function( camera ) {
	mat4.getTranslation( this.position, this.modelMatrix );
	var camPos = camera.getPosition();

	vec3.subtract( vec3.temp, camPos, this.position ); // Camera-Portal vector
	vec3.scale( vec3.temp, this.normal, vec3.dot( this.normal, vec3.temp ) ); // Scalar distance of point to plane
	vec3.sub( vec3.temp, camPos, vec3.temp ); // Point on plane

	this.distanceFromCamera = vec3.distance( camPos, vec3.temp );
}


Portal.prototype.isVisible = function( camera ) {
	var normal = vec3.fromValues( 0.0, 0.0, 1.0 );
	vec3.transformMat3( normal, normal, this.normalMatrix );

	var camPos = camera.getPosition();

	// Portal position
	mat4.getTranslation( vec3.temp, this.modelMatrix );
	// Portal to camera vector
	vec3.sub( vec3.temp, camPos, vec3.temp );

	// Check if portal is facing camera
	if ( vec3.dot( vec3.temp, normal ) < 0 ) {
		return false;
	}

	if ( !this.frustumCheck( camera ) ) {
		return false;
	}

	return true;
}

Portal.prototype.createQuery = function( parent ) {
	this.queries[parent] = gl.createQuery();
	this.queries[parent].inProgress = false;
	this.queries[parent].occluded = true;
}

Portal.prototype.checkOcclusionCulling = function( parent, camera ) {
	if ( !this.queries[parent] ) {
		this.createQuery(parent);
	}

	gl.colorMask(false, false, false, false);
	gl.depthMask(false);

	// Check query results here (will be from previous frame or earlier)
	if (this.queries[parent].inProgress && gl.getQueryParameter(this.queries[parent], gl.QUERY_RESULT_AVAILABLE)) {
		this.queries[parent].occluded = !gl.getQueryParameter(this.queries[parent], gl.QUERY_RESULT);
		this.queries[parent].inProgress = false;
	}

	// Query is initiated here by drawing the bounding box of the sphere
	if (!this.queries[parent].inProgress) {
		gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, this.queries[parent]);
		this.drawOcclusion( camera );
		gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE);
		this.queries[parent].inProgress = true;
	}

	gl.colorMask(true, true, true, true);
	gl.depthMask(true);

	return !this.queries[parent].occluded;
}

Portal.prototype.drawOcclusion = function( camera ) {
	var shader = unlit_color_prog;
	shader.use();
	gl.uniformMatrix4fv(shader.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(shader.u_ViewMat, false, camera.viewMatrix);
	gl.uniformMatrix4fv(shader.u_ModelMat, false, this.modelMatrix);

	$.each( this.settings, function( key, value ) {
		setGLSetting(key, value);
	});

	gl.uniform4fv(shader.u_Color, [1,1,1,1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	gl.vertexAttribPointer(shader.Position, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

Portal.prototype.calculateWarp = function() {
	var endInverse = mat4.create();
	mat4.invert( endInverse, this.targetMatrix );
	mat4.multiply( this.warp, this.modelMatrix, endInverse );
	mat4.invert( this.warpInverse, this.warp );
}

extend( Model, Portal );