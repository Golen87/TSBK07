var gl;

var shader_prog;
var normal_prog;
var texture_prog;
var fbo_prog;

var modelMatrix = mat4.create();

var camera;

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var models = [];
var portals = [];

var fbo;
const FBO_WIDTH = 256*8;
const FBO_HEIGHT = 256*8;


function initShaders() {

	// Shader
	shader_prog = new Shader( shaders.shaderVert, shaders.shaderFrag );
	shader_prog.addAttribute( "Position" );
	shader_prog.addAttribute( "Color" );
	shader_prog.addUniform( "u_ProjMat" );
	shader_prog.addUniform( "u_ViewMat" );
	shader_prog.addUniform( "u_ModelMat" );


	// Normal
	normal_prog = new Shader( shaders.normalVert, shaders.normalFrag );
	normal_prog.addAttribute( "Position" );
	normal_prog.addAttribute( "Normal" );
	normal_prog.addUniform( "u_ProjMat" );
	normal_prog.addUniform( "u_ViewMat" );
	normal_prog.addUniform( "u_ModelMat" );
	normal_prog.addUniform( "u_NormalMat" );


	// FBO
	fbo_prog = new Shader( shaders.fboVert, shaders.fboFrag );
	fbo_prog.addAttribute( "Position" );
	//fbo_prog.addAttribute( "TexCoord" );
	fbo_prog.addUniform( "u_ProjMat" );
	fbo_prog.addUniform( "u_ViewMat" );
	fbo_prog.addUniform( "u_ModelMat" );


	// Texture
	texture_prog = new Shader( shaders.textureVert, shaders.textureFrag );
	texture_prog.addAttribute( "Position" );
	texture_prog.addAttribute( "Normal" );
	texture_prog.addAttribute( "TexCoord" );
	texture_prog.addUniform( "u_ProjMat" );
	texture_prog.addUniform( "u_ViewMat" );
	texture_prog.addUniform( "u_ModelMat" );
	texture_prog.addUniform( "u_NormalMat" );
	texture_prog.addUniform( "u_Sampler" );
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
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, FBO_WIDTH, FBO_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
	framebuffer.texture = texture; // Store the texture object

	// Create a renderbuffer object and set its size and parameters
	depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
	if (!depthBuffer) {
		console.log('Failed to create renderbuffer object');
		return error();
	}
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, FBO_WIDTH, FBO_HEIGHT);

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
	var ground = new Model( objects.ground, texture_prog );
	ground.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	ground.setGLSetting( gl.CULL_FACE, true );
	mat4.translate(	ground.modelMatrix, ground.modelMatrix, [0.0, -1.0, 0.0] );
	mat3.normalFromMat4( ground.normalMatrix, ground.modelMatrix );
	models.push( ground );

	var corridor = new Model( objects.corridor, texture_prog );
	corridor.setTexture( loadTexture(gl, "tex/debug.png") );
	corridor.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( corridor.modelMatrix, corridor.modelMatrix, [-1.0, -1.0, -3.0] );
	mat3.normalFromMat4( corridor.normalMatrix, corridor.modelMatrix );
	models.push( corridor );

	var corridorLong = new Model( objects.corridor, texture_prog );
	corridorLong.setTexture( loadTexture(gl, "tex/debug.png") );
	corridorLong.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( corridorLong.modelMatrix, corridorLong.modelMatrix, [1.0, -1.0, -3.0] );
	mat4.scale( corridorLong.modelMatrix, corridorLong.modelMatrix, [1.0, 1.0, 4.0] );
	mat3.normalFromMat4( corridorLong.normalMatrix, corridorLong.modelMatrix );
	models.push( corridorLong );

	var sphere = new Model( objects.sphere, normal_prog );
	sphere.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [3.0, 0.0, -6.0] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );

	var sphereFlat = new Model( objects.sphere, normal_prog );
	sphereFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [3.0, 2.0, -6.0] );
	mat4.rotateZ( sphereFlat.modelMatrix, sphereFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereFlat.normalMatrix, sphereFlat.modelMatrix );
	models.push( sphereFlat );

	var sphereTex = new Model( objects.sphere, texture_prog );
	sphereTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTex.modelMatrix, sphereTex.modelMatrix, [3.0, 0.0, -3.0] );
	mat3.normalFromMat4( sphereTex.normalMatrix, sphereTex.modelMatrix );
	models.push( sphereTex );

	var sphereTexFlat = new Model( objects.sphere, texture_prog );
	sphereTexFlat.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTexFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [3.0, 2.0, -3.0] );
	mat4.rotateZ( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereTexFlat.normalMatrix, sphereTexFlat.modelMatrix );
	models.push( sphereTexFlat );

	var cube = new Model( objects.cube, normal_prog );
	cube.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cube.modelMatrix, cube.modelMatrix, [-3.0, 0.0, -6.0] );
	mat3.normalFromMat4( cube.normalMatrix, cube.modelMatrix );
	models.push( cube );

	var cubeTex = new Model( objects.cube, texture_prog );
	cubeTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	cubeTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cubeTex.modelMatrix, cubeTex.modelMatrix, [-3.0, 0.0, -3.0] );
	mat3.normalFromMat4( cubeTex.normalMatrix, cubeTex.modelMatrix );
	models.push( cubeTex );
}

function initPortals() {
	var leftFront = new Model( objects.surface, fbo_prog );
	leftFront.setFBO( fbo );
	leftFront.setGLSetting( gl.CULL_FACE, true );
	mat4.translate(	leftFront.modelMatrix, leftFront.modelMatrix, [-1.0, -1.0, -2.5] );
	mat4.scale(	leftFront.modelMatrix, leftFront.modelMatrix, [0.8, 1.9, 0.8] );
	portals.push( leftFront );

	var leftBack = new Model( objects.surface, fbo_prog );
	leftBack.setFBO( fbo );
	leftBack.setGLSetting( gl.CULL_FACE, true );
	mat4.translate(	leftBack.modelMatrix, leftBack.modelMatrix, [-1.0, -1.0, -2.5] );
	mat4.scale(	leftBack.modelMatrix, leftBack.modelMatrix, [0.8, 1.9, 0.8] );
	mat4.rotate( leftBack.modelMatrix, leftBack.modelMatrix, Math.PI, [0, 1, 0] );
	portals.push( leftBack );

	var rightFront = new Model( objects.surface, fbo_prog );
	rightFront.setFBO( fbo );
	rightFront.setGLSetting( gl.CULL_FACE, true );
	mat4.translate(	rightFront.modelMatrix, rightFront.modelMatrix, [1.0, -1.0, -1.0] );
	mat4.scale(	rightFront.modelMatrix, rightFront.modelMatrix, [0.8, 1.9, 0.8] );
	portals.push( rightFront );

	var rightBack = new Model( objects.surface, fbo_prog );
	rightBack.setFBO( fbo );
	rightBack.setGLSetting( gl.CULL_FACE, true );
	mat4.translate(	rightBack.modelMatrix, rightBack.modelMatrix, [1.0, -1.0, -1.0] );
	mat4.scale(	rightBack.modelMatrix, rightBack.modelMatrix, [0.8, 1.9, 0.8] );
	mat4.rotate( rightBack.modelMatrix, rightBack.modelMatrix, Math.PI, [0, 1, 0] );
	portals.push( rightBack );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0] )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0] )
}

function connectPortals(portal1, portal2, deltaRotation, rotationAxis) {
	mat4.rotate( portal1.targetMatrix, portal2.modelMatrix, deltaRotation, rotationAxis );
	mat4.rotate( portal2.targetMatrix, portal1.modelMatrix, -deltaRotation, rotationAxis );
	mat3.normalFromMat4( portal1.normalMatrix, portal1.modelMatrix );
	mat3.normalFromMat4( portal2.normalMatrix, portal2.modelMatrix );
	vec3.transformMat3( portal1.targetNormal, vec3.fromValues(0.0, 0.0,-1.0), portal2.normalMatrix );
	vec3.transformMat3( portal2.targetNormal, vec3.fromValues(0.0, 0.0,-1.0), portal1.normalMatrix );
	vec3.normalize( portal1.targetNormal, portal1.targetNormal );
	vec3.normalize( portal2.targetNormal, portal2.targetNormal );
}

function drawTriangle(time, projMatrix, viewMatrix) {
	shader_prog.use();
	gl.uniformMatrix4fv(shader_prog.u_ProjMat, false, projMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ViewMat, false, viewMatrix);
	gl.disable(gl.CULL_FACE)

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

	//Draw our lovely triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

	gl.enable(gl.CULL_FACE)
}

function drawFBO(time, portal) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
	fbo.active = true;

	gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
	gl.clearColor(1.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var projMatrix = mat4.create();
	mat4.perspective( projMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100 );
	var viewMatrix = mat4.create();
	mat4.lookAt( viewMatrix, camera.position, camera.targetPos, camera.up );

	camera.getPortalView( projMatrix, viewMatrix, portal.modelMatrix, portal.targetMatrix, portal.targetNormal );

	drawTriangle(time, projMatrix, viewMatrix);

	//Draw models
	for (var i = models.length - 1; i >= 0; i--) {
		models[i].draw( projMatrix, viewMatrix );
	}

	//Draw portals
	for (var i = portals.length - 1; i >= 0; i--) {
		portals[i].draw( projMatrix, viewMatrix );
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	fbo.active = false;
}

function drawScene(time) {

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawTriangle(time, camera.projMatrix, camera.viewMatrix);

	//Draw models
	for (var i = models.length - 1; i >= 0; i--) {
		models[i].draw( camera.projMatrix, camera.viewMatrix );
	}

	//Draw portals
	for (var i = portals.length - 1; i >= 0; i--) {
		drawFBO( time, portals[i] );
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		portals[i].draw( camera.projMatrix, camera.viewMatrix );
	}
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
	initPortals();

	gl.enable(gl.DEPTH_TEST);

	camera = new Camera();

	requestAnimationFrame(updateLoop);
}

onPreload( loadWebGL );
