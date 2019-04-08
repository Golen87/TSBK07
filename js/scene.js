var models = [];
var portals = [];

function Scene(initFunc) {
	this.init = initFunc;
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