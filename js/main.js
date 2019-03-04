var gl;

var shader_prog;
var normal_prog;
var texture_prog;

var modelMatrix = mat4.create();

var camera;

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var groundModel;
var corridorModel;
var model_texture;

var fbo;
const OFFSCREEN_WIDTH = 256;
const OFFSCREEN_HEIGHT = 256;


function initShaders() {

	// Shader
	shader_prog = loadShader( shaders.shaderVert, shaders.shaderFrag );
	gl.useProgram(shader_prog);

	shader_prog.Position = gl.getAttribLocation(shader_prog, "Position");
	gl.enableVertexAttribArray(shader_prog.Position);

	shader_prog.Color = gl.getAttribLocation(shader_prog, "Color");
	gl.enableVertexAttribArray(shader_prog.Color);

	shader_prog.u_ProjMat = getUniformLocation(shader_prog, "u_ProjMat");
	shader_prog.u_ViewMat = getUniformLocation(shader_prog, "u_ViewMat");
	shader_prog.u_ModelMat = getUniformLocation(shader_prog, "u_ModelMat");


	// Normal
	normal_prog = loadShader( shaders.normalVert, shaders.normalFrag );
	gl.useProgram(normal_prog);

	normal_prog.Position = gl.getAttribLocation(normal_prog, "Position");
	gl.enableVertexAttribArray(normal_prog.Position);

	normal_prog.Normal = gl.getAttribLocation(normal_prog, "Normal");
	gl.enableVertexAttribArray(normal_prog.Normal);

	normal_prog.u_ProjMat = getUniformLocation(normal_prog, "u_ProjMat");
	normal_prog.u_ViewMat = getUniformLocation(normal_prog, "u_ViewMat");
	normal_prog.u_ModelMat = getUniformLocation(normal_prog, "u_ModelMat")


	// Texture
	texture_prog = loadShader( shaders.textureVert, shaders.textureFrag );
	gl.useProgram(texture_prog);

	texture_prog.Position = gl.getAttribLocation(texture_prog, "Position");
	gl.enableVertexAttribArray(texture_prog.Position);

	texture_prog.Normal = gl.getAttribLocation(texture_prog, "Normal");
	gl.enableVertexAttribArray(texture_prog.Normal);

	texture_prog.TexCoord = gl.getAttribLocation(texture_prog, "TexCoord");
	gl.enableVertexAttribArray(texture_prog.TexCoord);

	texture_prog.u_ProjMat = getUniformLocation(texture_prog, "u_ProjMat");
	texture_prog.u_ViewMat = getUniformLocation(texture_prog, "u_ViewMat");
	texture_prog.u_ModelMat = getUniformLocation(texture_prog, "u_ModelMat")
	texture_prog.u_Sampler = getUniformLocation(texture_prog, "u_Sampler")
}

function getUniformLocation(program, name) {
	var location = gl.getUniformLocation(program, name);
	if (!location) {
		console.warn(name, "not found or used in shader");
	}
	return location;
}

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

function initFramebufferObject() {
	var framebuffer, texture, depthBuffer;

	// Define the error handling function
	var error = function() {
		if (framebuffer) gl.deleteFramebuffer(framebuffer);
		if (texture) gl.deleteTexture(texture);
		if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
		return null;
	}

	// Create a frame buffer object (FBO)
	framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		console.log('Failed to create frame buffer object');
		return error();
	}

	// Create a texture object and set its size and parameters
	texture = gl.createTexture(); // Create a texture object
	if (!texture) {
		console.log('Failed to create texture object');
		return error();
	}
	gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	framebuffer.texture = texture; // Store the texture object

	// Create a renderbuffer object and set its size and parameters
	depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
	if (!depthBuffer) {
		console.log('Failed to create renderbuffer object');
		return error();
	}
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

	// Attach the texture and the renderbuffer object to the FBO
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

	// Check if FBO is configured correctly
	var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (gl.FRAMEBUFFER_COMPLETE !== e) {
		console.log('Frame buffer object is incomplete: ' + e.toString());
		return error();
	}

	// Unbind the buffer object
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	fbo = framebuffer;
}

function initModels() {
	gl.useProgram(texture_prog);

	var groundModelMatrix = mat4.create();
	var position = [ 0.0, -1.0, 0.0 ]; // Or use vec3.fromValues
	mat4.translate(	groundModelMatrix, // Output
					groundModelMatrix, // Input
					position);
	groundModel = new Model(objects.ground, texture_prog, groundModelMatrix);

	var corridorModelMatrix = mat4.create();
	var position = [ 0.0, -1.0, 3.0 ];	 // Or use vec3.fromValues
	mat4.translate(	corridorModelMatrix, // Output
					corridorModelMatrix, // Input
					position);	 // Or use vec3.fromValues
	corridorModel = new Model(objects.corridor, texture_prog, corridorModelMatrix);

	model_texture = loadTexture(gl, "tex/grass_lab.png");
}

function drawFBO(time) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
	gl.clearColor(1.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var projMatrix = mat4.create();
	mat4.perspective( projMatrix, 45, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 0.1, 100 );
	var viewMatrix = mat4.create();
	mat4.lookAt( viewMatrix, camera.position, camera.targetPos, camera.up );


	// Avoid drawing the FBO objects, but draw everything else
	//drawModels(time, projMatrix);

	gl.useProgram(shader_prog);
	gl.uniformMatrix4fv(shader_prog.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ViewMat, false, camera.viewMatrix);

	//Move our triangle
	mat4.identity( modelMatrix );
	var position = [ 0.0, 0.0, 0.0 ]; // Or use vec3.fromValues
	mat4.translate(	modelMatrix,	// Output
					modelMatrix,	// Input
					position);
	mat4.rotate(modelMatrix,	// Output
				modelMatrix,	// Input
				time,				// amount to rotate in radians
				[0, 1, 0]);			// axis to rotate around

	//Pass triangle position to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shader_prog.Position, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass triangle colors to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shader_prog.Color, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass model view projection matrix to vertex shader
	gl.uniformMatrix4fv(shader_prog.u_ModelMat, false, modelMatrix);

	gl.disableVertexAttribArray(2);

	//Draw our lovely triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function drawScene(time) {
	drawFBO(time);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shader_prog);

	//Move our triangle
	mat4.identity( modelMatrix );
	var position = [ 0.0, 0.0, 0.0 ]; // Or use vec3.fromValues
	mat4.translate(	modelMatrix,	// Output
					modelMatrix,	// Input
					position);
	mat4.rotate(modelMatrix,	// Output
				modelMatrix,	// Input
				time,				// amount to rotate in radians
				[0, 1, 0]);			// axis to rotate around

	//Pass triangle position to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shader_prog.Position, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass triangle colors to vertex shader
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shader_prog.Color, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Pass model view projection matrix to vertex shader
	gl.uniformMatrix4fv(shader_prog.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ViewMat, false, camera.viewMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ModelMat, false, modelMatrix);

	gl.disableVertexAttribArray(2);

	//Draw our lovely triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

	//Draw models
	gl.useProgram(texture_prog);
	gl.uniformMatrix4fv(texture_prog.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(texture_prog.u_ViewMat, false, camera.viewMatrix);
	groundModel.draw();
	corridorModel.draw();
}

var previousTime = 0;
function updateLoop( elapsedTime ) {
	var deltaTime = (elapsedTime - previousTime) / 1000;

	camera.update( deltaTime );
	drawScene(elapsedTime / 1000);
	requestAnimationFrame(updateLoop);

	previousTime = elapsedTime;
}


function initGL() {
	try {
		var canvas = document.getElementById("canvas");
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width = window.innerWidth;
		gl.viewportHeight = canvas.height = window.innerHeight;
	} catch (e) {
	}
	if (!gl) {
		alert("WebGL is not avaiable on your browser!");
	}
}

function loadWebGL() {
	initGL();
	initFramebufferObject();
	initShaders();
	initBuffers();
	initModels();

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE)

	camera = new Camera();

	requestAnimationFrame(updateLoop);
}

onPreload( loadWebGL );
