var models = [];
var portals = [];

function Scene(initFunc) {
	this.init = initFunc;
}

Scene.prototype.update = function( dt ) {
	var newScene = null;
	if ( Key.isDown(Key.NUM_1) )
		newScene = scene01;
	else if ( Key.isDown(Key.NUM_2) )
		newScene = scene02;
	else if ( Key.isDown(Key.NUM_3) )
		newScene = scene03;
	else if ( Key.isDown(Key.NUM_4) )
		newScene = scene04;
	else if ( Key.isDown(Key.NUM_5) )
		newScene = scene05;
	else
		return;

	if (newScene && newScene != currentScene) {
		currentScene = newScene;
		currentScene.init();
	}
}

/**
 * Initiates a Box with a model and physical body and add both to the world.
 * Base width, height and depth is 2.0.
 *
 * Returns the model.
 */
function addCube(pos, scale, rot, shaderProg) {
	const BASE_LENGTH = 2.0;
	const width = scale[0] * BASE_LENGTH;
	const height = scale[1] * BASE_LENGTH;
	const depth = scale[2] * BASE_LENGTH;

	// Model
	var cube = new Model( objects.cube, shaderProg );
	cube.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( cube.modelMatrix, cube.modelMatrix, pos );
	mat4.rotateX( cube.modelMatrix, cube.modelMatrix, rot[0] );
	mat4.rotateY( cube.modelMatrix, cube.modelMatrix, rot[1] );
	mat4.rotateZ( cube.modelMatrix, cube.modelMatrix, rot[2] );
	mat4.scale( cube.modelMatrix, cube.modelMatrix, scale );
	mat3.normalFromMat4( cube.normalMatrix, cube.modelMatrix );
	cube.sphereOffset = vec3.fromValues(0.0, 0.0, 0.0);
	cube.sphereRadius = 0.5 * lengthVec3(width, height, depth);
	models.push( cube );

	// Physics
	cubeShape = new CANNON.Box(new CANNON.Vec3(
		0.5 * width,
		0.5 * height,
		0.5 * depth));
	var rotation = new CANNON.Quaternion();
	rotation.setFromEuler(rot[0], rot[1], rot[2], "XYZ");
	initStaticBoxBody(cubeShape, pos, rotation);

	return cube;
}

function initCorridor(scaleX, scaleY, scaleZ, translation, rotX, rotY, rotZ) {
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
	mat4.translate( corridor.modelMatrix, corridor.modelMatrix, translation );
	mat4.rotateX( corridor.modelMatrix, corridor.modelMatrix, rotX );
	mat4.rotateY( corridor.modelMatrix, corridor.modelMatrix, rotY );
	mat4.rotateZ( corridor.modelMatrix, corridor.modelMatrix, rotZ );
	var transRotMatrix = mat4.clone( corridor.modelMatrix );
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
	var rotation = new CANNON.Quaternion();
	rotation.setFromEuler(rotX, rotY, rotZ, "XYZ");

	// Wall left
	var relPhysicsPos =  vec3.fromValues(
		- 0.5 * (width - wallThickness),
		+ 0.5 * (height - roofThickness),
		0.0);
	vec3.transformMat4(relPhysicsPos, relPhysicsPos, transRotMatrix);
	initStaticBoxBody(wallShape, [relPhysicsPos[0], relPhysicsPos[1], relPhysicsPos[2]], rotation);

	// Wall right
	relPhysicsPos =  vec3.fromValues(
		+ 0.5 * (width - wallThickness),
		+ 0.5 * (height - roofThickness),
		0.0);
	vec3.transformMat4(relPhysicsPos, relPhysicsPos, transRotMatrix);
	initStaticBoxBody(wallShape, [relPhysicsPos[0], relPhysicsPos[1], relPhysicsPos[2]], rotation);

	// Roof
	relPhysicsPos =  vec3.fromValues(
		0.0,
		height + 0.5 * roofThickness,
		0.0);
	vec3.transformMat4(relPhysicsPos, relPhysicsPos, transRotMatrix);
	initStaticBoxBody(roofShape, [relPhysicsPos[0], relPhysicsPos[1], relPhysicsPos[2]], rotation);
}

function addPortal(position, yRotation, width, height) {
	var portal = new Portal( objects.surface, fbo_prog, position );
	portal.setGLSetting( gl.CULL_FACE, true );
	mat4.translate( portal.modelMatrix, portal.modelMatrix, position);
	mat4.scale( portal.modelMatrix, portal.modelMatrix, [width, height, width] );
	mat4.rotateY( portal.modelMatrix, portal.modelMatrix, yRotation);
	//mat4.rotateZ( portal.modelMatrix, portal.modelMatrix, 0.05);
	portal.sphereOffset = vec3.fromValues(0.0, 0.5, 0.0);
	portal.sphereRadius = 0.5 * lengthVec2(height, width); // Portal radius
	portal.id = portals.length;
	portal.radiusXZ = width * 0.5;
	portals.push( portal );
	return portal;
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

Scene.prototype.draw = function( camera, time ) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//drawTriangle(camera, time);

	//Draw models
	for (var i = models.length - 1; i >= 0; i--) {
		models[i].draw( camera );
	}

	debugFrustumCount = 0;
	debugOcclusionCount = 0;

	//Draw portals
	for (var i = portals.length - 1; i >= 0; i--) {
		if (window.CURRENT_PORTAL_DEPTH > 0) {
			// FBO shading
			if (portals[i].isVisible( camera )) {
				debugFrustumCount++;

				var depthKey = "";
				if ( portals[i].checkOcclusionCulling( depthKey, camera ) || playerCamera.justTeleported ) {
					debugOcclusionCount += 1;

					drawFBOScene( camera, time, portals[i], 0, depthKey );
					gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
					portals[i].setFBO(fbos[0]);
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