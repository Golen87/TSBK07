var gl;

var shader_prog;
var normal_prog;
var texture_prog;
var fbo_prog;
var unlit_color_prog;
var screen_prog;

var modelMatrix = mat4.create();

var playerCamera;

//var triangleVertexPositionBuffer;
//var triangleVertexColorBuffer;
var models = [];
var portals = [];

/* Number of rendered levels of portals
 * 0 -- No portals
 * 1 -- Single level of portals
 * 2 -- Two levels of portals
 */
const MAX_PORTAL_DEPTH = 4;

var debugFrustumCount = 0;
var debugOcclusionCount = 0;


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
	fbo_prog.addAttribute( "TexCoord" );
	fbo_prog.addUniform( "u_ProjMat" );
	fbo_prog.addUniform( "u_ViewMat" );
	fbo_prog.addUniform( "u_ModelMat" );


	// Unlit color
	unlit_color_prog = new Shader( shaders.unlitColorVert, shaders.unlitColorFrag );
	unlit_color_prog.addAttribute( "Position" );
	unlit_color_prog.addUniform( "u_ProjMat" );
	unlit_color_prog.addUniform( "u_ViewMat" );
	unlit_color_prog.addUniform( "u_ModelMat" );
	unlit_color_prog.addUniform( "u_Color" );


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

/*
function initBuffers() {
	// Vertex position buffer
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	var vertices = [
		 0.0, 2.0,  0.0,
		-1.0, 0.0,  0.0,
		 1.0, 0.0,  0.0
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
*/

function initCorridor(scaleX, scaleY, scaleZ, x, y, z) {
	const BASE_HEIGHT = 2.0;
	const BASE_WIDTH = 1.0;
	const BASE_DEPTH = 1.0;
	const BASE_THICKNESS = 0.1;

	var width = scaleX * BASE_WIDTH;
	var height = scaleY * BASE_HEIGHT;
	var depth = scaleZ * BASE_DEPTH;
	var wallThickness = scaleX * BASE_THICKNESS;
	var roofThickness = scaleY * BASE_THICKNESS;

	var corridor = new Model( objects.corridor, texture_prog );
	corridor.setTexture( loadTexture(gl, "tex/debug.png") );
	corridor.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( corridor.modelMatrix, corridor.modelMatrix, [x, y, z] );
	mat4.scale( corridor.modelMatrix, corridor.modelMatrix, [scaleX, scaleY, scaleZ] );
	mat3.normalFromMat4( corridor.normalMatrix, corridor.modelMatrix );
	corridor.sphereOffset = vec3.fromValues(0.0, 1.0, 0.0);
	corridor.sphereRadius = 0.5 * lengthVec3(height, height, depth);
	models.push( corridor );

	// Physics
	wallShape = new CANNON.Box(new CANNON.Vec3(
		0.5 * wallThickness,
		0.5 * (height - roofThickness),
		0.5 * depth));
	roofShape = new CANNON.Box(new CANNON.Vec3(
		0.5 * width,
		0.5 * roofThickness,
		0.5 * depth));
	initStaticBoxBody(wallShape, [
		x - 0.5 * (width - wallThickness),
		y + 0.5 * (height - roofThickness),
		z],
		new CANNON.Quaternion());
	initStaticBoxBody(wallShape, [
		x + 0.5 * (width - wallThickness),
		y + 0.5 * (height - roofThickness),
		z],
		new CANNON.Quaternion());
	initStaticBoxBody(roofShape, [
		x,
		y + height + 0.5 * roofThickness,
		z],
		new CANNON.Quaternion());
}

function initModels() {
	var ground = new Model( objects.ground, texture_prog );
	ground.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	ground.setGLSetting( gl.CULL_FACE, true );
	ground.frustumCulling = false;
	mat4.translate(	ground.modelMatrix, ground.modelMatrix, [0.0, 0.0, 0.0] );
	mat3.normalFromMat4( ground.normalMatrix, ground.modelMatrix );
	models.push( ground );

	var groundShape = new CANNON.Plane();
	var groundRotation = new CANNON.Quaternion();
	groundRotation.setFromAxisAngle (new CANNON.Vec3(1, 0, 0), -0.5 * Math.PI);
	initStaticBoxBody(groundShape, [0, 0, 0], groundRotation);

	// Corridors
	initCorridor( /*Scale*/ 1.0, 1.0, 1.0, /*Position*/ -1.0,  0.0, -2.5 );
	initCorridor( /*Scale*/ 1.0, 1.0, 4.0, /*Position*/  1.0,  0.0, -3.0 );

	// Spheres
	var k = 2;
	for (var x = -k-0.25; x < k; x++) for (var y = 0.25; y < 2*k; y++) for (var z = -k; z < k; z++) {
		var sphere = new Model( objects.sphere, normal_prog );
		sphere.setGLSetting( gl.CULL_FACE, true );
		mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [3*x, 3*y, 3*z] );
		mat4.scale( sphere.modelMatrix, sphere.modelMatrix, [0.2, 0.2, 0.2] );
		sphere.sphereRadius = 0.2;
		mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
		models.push( sphere );
	}

	var sphere = new Model( objects.sphere, normal_prog );
	sphere.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphere.modelMatrix, sphere.modelMatrix, [3.5, 1.0, -6.0] );
	mat3.normalFromMat4( sphere.normalMatrix, sphere.modelMatrix );
	models.push( sphere );

	var sphereFlat = new Model( objects.sphere, normal_prog );
	sphereFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [3.5, 3.0, -6.0] );
	mat4.rotateZ( sphereFlat.modelMatrix, sphereFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereFlat.modelMatrix, sphereFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereFlat.normalMatrix, sphereFlat.modelMatrix );
	models.push( sphereFlat );

	var sphereTex = new Model( objects.sphere, texture_prog );
	sphereTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTex.modelMatrix, sphereTex.modelMatrix, [3.5, 1.0, -3.0] );
	mat3.normalFromMat4( sphereTex.normalMatrix, sphereTex.modelMatrix );
	models.push( sphereTex );

	var sphereTexFlat = new Model( objects.sphere, texture_prog );
	sphereTexFlat.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	sphereTexFlat.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [3.5, 3.0, -3.0] );
	mat4.rotateZ( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, Math.PI * 0.25);
	mat4.scale( sphereTexFlat.modelMatrix, sphereTexFlat.modelMatrix, [1.0, 0.5, 1.0] );
	mat3.normalFromMat4( sphereTexFlat.normalMatrix, sphereTexFlat.modelMatrix );
	models.push( sphereTexFlat );

	var cube = new Model( objects.cube, normal_prog );
	cube.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cube.modelMatrix, cube.modelMatrix, [-3.5, 1.0, -6.0] );
	mat3.normalFromMat4( cube.normalMatrix, cube.modelMatrix );
	cube.sphereRadius = Math.sqrt(3.0);
	models.push( cube );

	var cubeTex = new Model( objects.cube, texture_prog );
	cubeTex.setTexture( loadTexture(gl, "tex/grass_lab.png") );
	cubeTex.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cubeTex.modelMatrix, cubeTex.modelMatrix, [-3.5, 1.0, -3.0] );
	mat3.normalFromMat4( cubeTex.normalMatrix, cubeTex.modelMatrix );
	cubeTex.sphereRadius = Math.sqrt(3.0);
	models.push( cubeTex );
}

const PORTAL_WIDTH = 0.8;
const PORTAL_HEIGHT = 1.9;
const PORTAL_RADIUS = 0.5 * lengthVec2(PORTAL_HEIGHT, PORTAL_WIDTH);
function addPortal(position, yRotation) {
	var portal = new Portal( objects.surface, fbo_prog, position );
	portal.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( portal.modelMatrix, portal.modelMatrix, position);
	mat4.scale( portal.modelMatrix, portal.modelMatrix, [PORTAL_WIDTH, PORTAL_HEIGHT, PORTAL_WIDTH] );
	mat4.rotateY( portal.modelMatrix, portal.modelMatrix, yRotation);
	portal.sphereOffset = vec3.fromValues(0.0, 0.5, 0.0);
	portal.sphereRadius = PORTAL_RADIUS;
	portal.id = portals.length;
	portal.radiusXZ = PORTAL_WIDTH * 0.5;
	portals.push( portal );
	return portal;
}

function initPortals() {
	var leftFront  = addPortal( [-1.0, 0.0, -2.0], 0.0 );
	var leftBack   = addPortal( [-1.0, 0.0, -2.0], Math.PI );
	var rightFront = addPortal( [ 1.0, 0.0, -1.0], 0.0 );
	var rightBack  = addPortal( [ 1.0, 0.0, -1.0], Math.PI );
	var leftEndFront  = addPortal( [-1.0, 0.0, -3.0], 0.0 );
	var leftEndBack   = addPortal( [-1.0, 0.0, -3.0], Math.PI );
	var rightEndFront = addPortal( [ 1.0, 0.0, -5.0], 0.0 );
	var rightEndBack  = addPortal( [ 1.0, 0.0, -5.0], Math.PI );

	// Connect portals
	connectPortals( leftFront, rightBack, Math.PI, [0, 1, 0], leftBack, rightFront )
	connectPortals( leftBack, rightFront, Math.PI, [0, 1, 0], leftFront, rightBack )
	connectPortals( leftEndFront, rightEndBack, Math.PI, [0, 1, 0], leftEndBack, rightEndFront )
	connectPortals( leftEndBack, rightEndFront, Math.PI, [0, 1, 0], leftEndFront, rightEndBack )
}

function connectPortals(portal1, portal2, deltaRotation, rotationAxis, portal1back, portal2back) {
	mat4.rotate( portal1.targetMatrix, portal2.modelMatrix, deltaRotation, rotationAxis );
	mat4.rotate( portal2.targetMatrix, portal1.modelMatrix, -deltaRotation, rotationAxis );
	mat3.normalFromMat4( portal1.normalMatrix, portal1.modelMatrix );
	mat3.normalFromMat4( portal2.normalMatrix, portal2.modelMatrix );
	vec3.transformMat3( portal1.targetNormal, vec3.fromValues(0.0, 0.0,-1.0), portal2.normalMatrix );
	vec3.transformMat3( portal2.targetNormal, vec3.fromValues(0.0, 0.0,-1.0), portal1.normalMatrix );
	vec3.normalize( portal1.targetNormal, portal1.targetNormal );
	vec3.normalize( portal2.targetNormal, portal2.targetNormal );
	vec3.copy(portal1.normal, portal2.targetNormal);
	vec3.copy(portal2.normal, portal1.targetNormal);
	portal1.targetBack = portal2back;
	portal2.targetBack = portal1back;
	portal1.calculateWarp();
	portal2.calculateWarp();
}

/*
function drawTriangle(camera, time) {
	shader_prog.use();
	gl.uniformMatrix4fv(shader_prog.u_ProjMat, false, camera.projMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ViewMat, false, camera.viewMatrix);
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
*/

function drawScene( camera, time ) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//drawTriangle(camera, time);

	//Draw models
	for (var i = models.length - 1; i >= 0; i--) {
		models[i].draw( camera );
	}

	// Sort portals
	for (var i = portals.length - 1; i >= 0; i--) {
		portals[i].updateDistanceFromCamera( camera );
	}
	portals.sort(function(a, b) {
		var distA = a.distanceFromCamera;
		var distB = b.distanceFromCamera;
		return distA < distB ? 1 : -1;
	});

	debugFrustumCount = 0;
	debugOcclusionCount = 0;

	//Draw portals
	for (var i = portals.length - 1; i >= 0; i--) {
		if (MAX_PORTAL_DEPTH > 0) {
			// FBO shading
			if (portals[i].isVisible( camera )) {
				debugFrustumCount++;

				var depthKey = "";
				if ( portals[i].checkOcclusionCulling( depthKey, camera ) || playerCamera.justTeleported ) {
					debugOcclusionCount += 1;

					drawFBOScene( camera, time, portals[i], 0, depthKey );
					gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
					portals[i].shader = fbo_prog;
					portals[i].draw( camera );
				}
			}
		}
		else {
			// Dummy shading
			portals[i].drawColor( camera, [1.0, 0.0, 1.0, 1.0] );
		}
	}
}

var deltas = [0,0,0,0,0,0,0,0,0,0,0,0,0];
function updateFPS( deltaTime ) {
	deltas.push(deltaTime);
	deltas.shift();
	var sum = deltas.reduce((partial_sum, a) => partial_sum + a);
	$("#debug-0").html(Math.round(1/(sum/deltas.length)));
	$("#debug-2").html("count: " + portals.length);
	$("#debug-3").html("frust: " + debugFrustumCount);
	$("#debug-4").html("occlu: " + debugOcclusionCount);
}

var previousTime = 0;
var timeStep = 1.0 / 60.0;
function updateLoop( elapsedTime ) {
	var deltaTime = (elapsedTime - previousTime) / 1000;
	updateFPS(deltaTime);

	playerCamera.update( deltaTime );
	physicsWorld.step(timeStep);
	playerCamera.postPhysicsUpdate();
	drawScene( playerCamera, elapsedTime / 1000 );

	requestAnimationFrame(updateLoop);
	previousTime = elapsedTime;
}


function initGL() {
	try {
		var canvas = document.getElementById("canvas");
		gl = canvas.getContext("webgl2");
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
	initFBO();
	initShaders();
	//initBuffers();
	initCannon();
	initModels();
	initPortals();

	gl.enable(gl.DEPTH_TEST);

	playerCamera = new PlayerCamera(vec3.fromValues(0.0, 1.46, 3.0));

	requestAnimationFrame(updateLoop);
}

onPreload( loadWebGL );
