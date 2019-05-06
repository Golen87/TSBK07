var gl;

var shader_prog;
var normal_prog;
var texture_prog;
var fbo_prog;
var unlit_color_prog;
var screen_prog;

var modelMatrix = mat4.create();

var playerCamera;

var currentScene = scene01;

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
	fbo_prog.addUniform( "u_Sampler" );


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
	physicsWorld.step( timeStep );
	playerCamera.postPhysicsUpdate( deltaTime );

	// Sort portals
	for (var i = portals.length - 1; i >= 0; i--) {
		portals[i].updateDistanceFromCamera( playerCamera );
	}
	portals.sort(function(a, b) {
		var distA = a.distanceFromCamera;
		var distB = b.distanceFromCamera;
		return distA < distB ? 1 : -1;
	});

	currentScene.update();
	currentScene.draw( playerCamera, elapsedTime / 1000 );

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
	currentScene.init();

	gl.enable(gl.DEPTH_TEST);

	requestAnimationFrame(updateLoop);
}

onPreload( loadWebGL );
