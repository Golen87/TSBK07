function Model(meshStr, shader) {
	if (!meshStr)
		console.error("Mesh is missing");

	this.mesh = new OBJ.Mesh(meshStr);
	OBJ.initMeshBuffers(gl, this.mesh);
	this.shader = shader;
	this.modelMatrix = mat4.create();

	this.texture = null;
	this.hasTexture = false;

	this.fbo = null;
	this.isFBO = false;

	// Render settings
	this.settings = {};
	this.setGLSetting(gl.CULL_FACE, true);
}

Model.prototype.setTexture = function(texture) {
	this.texture = texture;
	this.hasTexture = true;
}

Model.prototype.setFBO = function(fbo) {
	this.fbo = fbo;
	this.isFBO = true;
	this.texture = fbo.texture;
	this.hasTexture = true;
}

Model.prototype.setGLSetting = function(setting, state) {
	this.settings[setting] = state;
}


Model.prototype.draw = function(projMatrix, viewMatrix) {
	if (this.isFBO && this.fbo.active)
		return;

	this.shader.use();
	gl.uniformMatrix4fv(this.shader.u_ProjMat, false, projMatrix);
	gl.uniformMatrix4fv(this.shader.u_ViewMat, false, viewMatrix);
	gl.uniformMatrix4fv(this.shader.u_ModelMat, false, this.modelMatrix);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	$.each( this.settings, function( key, value ) {
		setGLSetting(key, value);
	});

	if (this.hasTexture)
		gl.activeTexture(gl.TEXTURE0);

	if (this.isFBO || this.hasTexture) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
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

	if (this.shader.u_Sampler) {
  		gl.uniform1i(this.shader.u_Sampler, 0); // Texture unit 0
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
