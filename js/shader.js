function compileShader(sourceCode, type) {
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

function loadShader( vertShader, fragShader ) {
	var program = gl.createProgram();
	gl.attachShader(program, compileShader(vertShader, gl.VERTEX_SHADER));
	gl.attachShader(program, compileShader(fragShader, gl.FRAGMENT_SHADER));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	return program;
}