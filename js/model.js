function Model(meshStr, shaderProg, modelMatrix) {
	this.mesh = new OBJ.Mesh(meshStr);
	OBJ.initMeshBuffers(gl, this.mesh);

	this.shaderProg = shaderProg;

	this.modelMatrix = modelMatrix;
}

Model.prototype.draw = function() {
	gl.useProgram(this.shaderProg);

	gl.uniformMatrix4fv(this.shaderProg.u_ModelMat, false, this.modelMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	gl.vertexAttribPointer(this.shaderProg.Position, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// it's possible that the mesh doesn't contain
	// any texture coordinates (e.g. suzanne.obj in the development branch).
	// in this case, the texture vertexAttribArray will need to be disabled
	// before the call to drawElements
	if(!this.mesh.textures.length){
		gl.disableVertexAttribArray(this.shaderProg.TexCoord);
	}
	else{
		// if the texture vertexAttribArray has been previously
		// disabled, then it needs to be re-enabled
		gl.enableVertexAttribArray(this.shaderProg.TexCoord);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.textureBuffer);
		gl.vertexAttribPointer(this.shaderProg.TexCoord, this.mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
	gl.vertexAttribPointer(this.shaderProg.Normal, this.mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  	gl.uniform1i(this.shaderProg.u_Sampler, 0); // Texture unit 0

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
