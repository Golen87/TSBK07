function Model(meshStr, shader) {
	if (!meshStr)
		console.error("Mesh is missing");

	this.mesh = new OBJ.Mesh(meshStr);
	OBJ.initMeshBuffers(gl, this.mesh);
	this.shader = shader;
	this.modelMatrix = mat4.create();
	this.normalMatrix = mat3.create();

	this.sphereOffset = vec3.fromValues(0.0, 0.0, 0.0);
	this.sphereRadius = 1.0;

	this.texture = null;
	this.hasTexture = false;
	this.color = [1, 1, 1, 1];
	this.isSkybox = false;

	this.isFBO = false;

	// Render settings
	this.settings = {};
	this.setGLSetting( gl.CULL_FACE, true );
	this.setGLSetting( gl.DEPTH_TEST, true );

	this.frustumCulling = true;
}

Model.prototype.frustumCheck = function( camera ) {
	var mat = mat4.create();
	mat4.mul( mat, camera.viewMatrix, this.modelMatrix );
	var spherePos = vec3.clone(this.sphereOffset);
	vec3.transformMat4(spherePos, spherePos, mat);

	return camera.frustumCulling( spherePos, this.sphereRadius );
}


Model.prototype.setTexture = function(texture) {
	this.texture = texture;
	this.hasTexture = true;
	return this;
}

Model.prototype.setColor = function(color) {
	this.color = color;
	return this;
}

Model.prototype.setFBO = function(fbo) {
	this.isFBO = true;
	this.texture = fbo.texture;
	this.hasTexture = true;
	return this;
}

Model.prototype.setSkybox = function() {
	this.isSkybox = true;
	return this;
}

Model.prototype.setGLSetting = function(setting, state) {
	this.settings[setting] = state;
	return this;
}


Model.prototype.draw = function(camera) {

	if ( this.frustumCulling && !this.frustumCheck( camera ) )
		return;

	this.shader.use();
	gl.uniformMatrix4fv(this.shader.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(this.shader.u_ViewMat, false, camera.viewMatrix);
	gl.uniformMatrix4fv(this.shader.u_ModelMat, false, this.modelMatrix);

	if (this.isSkybox) {
		var skyView = mat4.clone(camera.viewMatrix);
		skyView[3] = 0.0;
		skyView[7] = 0.0;
		skyView[11] = 0.0;
		skyView[12] = 0.0;
		skyView[13] = 0.0;
		skyView[14] = 0.0;
		skyView[15] = 1.0;
		gl.uniformMatrix4fv(this.shader.u_ViewMat, false, skyView);
	}

	$.each( this.settings, function( key, value ) {
		setGLSetting(key, value);
	});

	if (this.hasTexture) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		if (this.isFBO) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
		else {
			// Only for pixel perfect
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
	}


	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	gl.vertexAttribPointer(this.shader.Position, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// it's possible that the mesh doesn't contain
	// any texture coordinates (e.g. suzanne.obj in the development branch).
	// in this case, the texture vertexAttribArray will need to be disabled
	// before the call to drawElements
	if (this.shader.TexCoord) {
		if (this.mesh.textures.length) {
			// if the texture vertexAttribArray has been previously
			// disabled, then it needs to be re-enabled
			//gl.enableVertexAttribArray(this.shader.TexCoord);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.textureBuffer);
			gl.vertexAttribPointer(this.shader.TexCoord, this.mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		}
	}

	if (this.shader.Normal) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
		gl.vertexAttribPointer(this.shader.Normal, this.mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	if (this.shader.u_NormalMat) {
		gl.uniformMatrix3fv(this.shader.u_NormalMat, false, this.normalMatrix);
	}

	if (this.shader.u_Sampler) {
		gl.uniform1i(this.shader.u_Sampler, 0); // Texture unit 0
	}

	if (this.shader.u_Color) {
		gl.uniform4fv(this.shader.u_Color, this.color);
	}

	if (this.shader.u_Debug) {
		gl.uniform1i(this.shader.u_Debug, window.shaderDebug);
	}


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

Model.prototype.drawColor = function(camera, color) {

	if ( this.frustumCulling && !this.frustumCheck( camera ) )
		return;

	var shader = unlit_color_prog;
	shader.use();
	gl.uniformMatrix4fv(shader.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(shader.u_ViewMat, false, camera.viewMatrix);
	gl.uniformMatrix4fv(shader.u_ModelMat, false, this.modelMatrix);
	gl.uniform4fv(shader.u_Color, color);

	$.each( this.settings, function( key, value ) {
		setGLSetting(key, value);
	});

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	gl.vertexAttribPointer(shader.Position, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}