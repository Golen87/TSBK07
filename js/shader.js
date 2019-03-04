function Shader(vert, frag) {
	this.shader = this.loadShader(vert, frag);

	gl.useProgram(this.shader);

	this.attributes = {};
	this.uniforms = {};
}


Shader.prototype.loadShader = function( vertShader, fragShader ) {
	var program = gl.createProgram();
	gl.attachShader(program, this.compileShader(vertShader, gl.VERTEX_SHADER));
	gl.attachShader(program, this.compileShader(fragShader, gl.FRAGMENT_SHADER));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	return program;
}

Shader.prototype.compileShader = function( sourceCode, type ) {
	// Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
	var shader = gl.createShader(type);
	gl.shaderSource(shader, sourceCode);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var info = gl.getShaderInfoLog(shader);
		throw 'Could not compile WebGL program. \n\n' + info;
	}
	return shader;
}


Shader.prototype.addAttribute = function(name) {
	this[name] = this.attributes[name] = gl.getAttribLocation(this.shader, name);
	if (this[name] == -1) {
		console.error("Attribute not found in shader:", name);
	}
}

Shader.prototype.addUniform = function(name) {
	this[name] = this.uniforms[name] = getUniformLocation(this.shader, name);
}

Shader.prototype.use = function() {
	gl.useProgram(this.shader);

	$.each( this.attributes, function( name, location ) {
		gl.enableVertexAttribArray(location);
	});
}