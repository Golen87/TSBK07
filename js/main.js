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


function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


var shader_prog;

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

function initShaders() {
	var fragmentShader = compileShader(shaderFrag, gl.FRAGMENT_SHADER);
	var vertexShader = compileShader(shaderVert, gl.VERTEX_SHADER);

	shader_prog = gl.createProgram();
	gl.attachShader(shader_prog, vertexShader);
	gl.attachShader(shader_prog, fragmentShader);
	gl.linkProgram(shader_prog);

	if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shader_prog);

	shader_prog.positionLocation = gl.getAttribLocation(shader_prog, "Position");
	gl.enableVertexAttribArray(shader_prog.positionLocation);

	shader_prog.u_PerspLocation = gl.getUniformLocation(shader_prog, "u_Persp");
	shader_prog.u_ModelViewLocation = gl.getUniformLocation(shader_prog, "u_ModelView");
}



var triangleVertexPositionBuffer;

function initBuffers() {

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

}

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();

function drawScene(time) {

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

	//Pass model view projection matrix to vertex shader
	gl.uniformMatrix4fv(shader_prog.u_PerspLocation, false, projectionMatrix);
	gl.uniformMatrix4fv(shader_prog.u_ModelViewLocation, false, modelViewMatrix);

	//Draw our lovely triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function updateLoop(elapsedTime) {
	drawScene(elapsedTime / 1000);
	requestAnimationFrame(updateLoop);
}


(function loadWebGL(){
	var canvas = document.getElementById("webgl_canvas");
	initGL(canvas);
	initShaders();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	requestAnimationFrame(updateLoop);
})();