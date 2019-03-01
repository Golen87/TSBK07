var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("WebGL is not avaiable on your browser!");
	}
}


var shader_prog;
var normal_prog;
var texture_prog;

function initShaders() {

	// Shader
	shader_prog = loadShader( shaders.shaderVert, shaders.shaderFrag );
	gl.useProgram(shader_prog);

	shader_prog.positionLocation = gl.getAttribLocation(shader_prog, "Position");
	gl.enableVertexAttribArray(shader_prog.positionLocation);

	shader_prog.colorLocation = gl.getAttribLocation(shader_prog, "Color");
	gl.enableVertexAttribArray(shader_prog.colorLocation);

	shader_prog.u_PerspLocation = gl.getUniformLocation(shader_prog, "u_Persp");
	shader_prog.u_ModelViewLocation = gl.getUniformLocation(shader_prog, "u_ModelView");


	// Normal
	normal_prog = loadShader( shaders.normalVert, shaders.normalFrag );
	gl.useProgram(normal_prog);

	normal_prog.positionLocation = gl.getAttribLocation(normal_prog, "Position");
	gl.enableVertexAttribArray(normal_prog.positionLocation);

	normal_prog.normalLocation = gl.getAttribLocation(normal_prog, "Normal");
	gl.enableVertexAttribArray(normal_prog.normalLocation);

	normal_prog.u_PerspLocation = gl.getUniformLocation(normal_prog, "u_Persp");
	normal_prog.u_ModelViewLocation = gl.getUniformLocation(normal_prog, "u_ModelView")


	// Texture
	texture_prog = loadShader( shaders.textureVert, shaders.textureFrag );
	gl.useProgram(texture_prog);

	texture_prog.positionLocation = gl.getAttribLocation(texture_prog, "Position");
	gl.enableVertexAttribArray(texture_prog.positionLocation);

	texture_prog.normalLocation = gl.getAttribLocation(texture_prog, "Normal");
	gl.enableVertexAttribArray(texture_prog.normalLocation);

	texture_prog.texCoordLocation = gl.getAttribLocation(texture_prog, "TexCoord");
	gl.enableVertexAttribArray(texture_prog.texCoordLocation);

	texture_prog.u_PerspLocation = gl.getUniformLocation(texture_prog, "u_Persp");
	texture_prog.u_ModelViewLocation = gl.getUniformLocation(texture_prog, "u_ModelView")
	texture_prog.u_SamplerLocation = gl.getUniformLocation(texture_prog, "u_Sampler")
}



var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;

function initBuffers() {
	// Vertex position buffer
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	var vertices = [
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	// Vertex color buffer
	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var vertices = [
		 1.0,  0.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  0.0,  1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 3;
	triangleVertexColorBuffer.numItems = 3;

}

var cubeMesh;

function initModels() {
	gl.useProgram(texture_prog);

	var objStr = objects.skybox;
	cubeMesh = new OBJ.Mesh(objStr);
	OBJ.initMeshBuffers(gl, cubeMesh);

	// Bind texture to sampler unit 0
	const texture = loadTexture(gl, "tex/grass_lab.png");
	gl.activeTexture(gl.TEXTURE0);
  	gl.bindTexture(gl.TEXTURE_2D, texture);
}

function drawModels(time) {
	gl.useProgram(texture_prog);

	//Move our triangle
	modelViewMatrix = mat4.create();
	var position = [ 0.0, 0.0, -4.0 - Math.sin(time) ]; // Or use vec3.fromValues
	mat4.translate(	modelViewMatrix,	// Output
					modelViewMatrix,	// Input
					position);
	mat4.rotate(modelViewMatrix,	// Output
				modelViewMatrix,	// Input
				time,				// amount to rotate in radians
				[0, 1, 1]);			// axis to rotate around
	mat4.scale(	modelViewMatrix,	// Output
					modelViewMatrix,	// Input
					[0.4, 0.4, 0.4]);

	gl.uniformMatrix4fv(texture_prog.u_PerspLocation, false, projectionMatrix);
	gl.uniformMatrix4fv(texture_prog.u_ModelViewLocation, false, modelViewMatrix);


	gl.bindBuffer(gl.ARRAY_BUFFER, cubeMesh.vertexBuffer);
	gl.vertexAttribPointer(texture_prog.positionLocation, cubeMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// it's possible that the mesh doesn't contain
	// any texture coordinates (e.g. suzanne.obj in the development branch).
	// in this case, the texture vertexAttribArray will need to be disabled
	// before the call to drawElements
	if(!cubeMesh.textures.length){
		gl.disableVertexAttribArray(texture_prog.texCoordLocation);
	}
	else{
		// if the texture vertexAttribArray has been previously
		// disabled, then it needs to be re-enabled
		gl.enableVertexAttribArray(texture_prog.texCoordLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeMesh.textureBuffer);
		gl.vertexAttribPointer(texture_prog.texCoordLocation, cubeMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeMesh.normalBuffer);
	gl.vertexAttribPointer(texture_prog.normalLocation, cubeMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  	gl.uniform1i(texture_prog.u_SamplerLocation, 0); // Texture unit 0

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeMesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, cubeMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();

function drawScene(time) {
	gl.useProgram(shader_prog);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(projectionMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

	modelViewMatrix = mat4.create();
	//Move our triangle
	var position = [ 0.0, 0.0, -4.0 + Math.sin(time) ]; // Or use vec3.fromValues
	mat4.translate(	modelViewMatrix,	// Output
					modelViewMatrix,	// Input
					position);
	mat4.rotate(modelViewMatrix,	// Output
				modelViewMatrix,	// Input
				time,				// amount to rotate in radians
				[0, 1, 0]);			// axis to rotate around

	//Pass triangle position to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shader_prog.positionLocation, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass triangle colors to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shader_prog.colorLocation, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass model view projection matrix to vertex shader
	gl.uniformMatrix4fv(shader_prog.u_PerspLocation, false, projectionMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ModelViewLocation, false, modelViewMatrix);

	gl.disableVertexAttribArray(2);

	//Draw our lovely triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function updateLoop(elapsedTime) {
	drawScene(elapsedTime / 1000);
	drawModels(elapsedTime / 1000);
	requestAnimationFrame(updateLoop);
}


function loadWebGL() {
	var canvas = document.getElementById("webgl_canvas");
	initGL(canvas);
	initShaders();
	initBuffers();
	initModels();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	requestAnimationFrame(updateLoop);
}
