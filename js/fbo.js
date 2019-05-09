/* Number of rendered levels of portals
 * 0 -- No portals
 * 1 -- Single level of portals
 * 2 -- Two levels of portals
 */
const MAX_PORTAL_DEPTH = 30;
window.CURRENT_PORTAL_DEPTH = 3;

var fbos = [];
const FBO_WIDTH = 256*8;
const FBO_HEIGHT = 256*8;

var maskFBO;
const MASK_WIDTH = 1;
const MASK_HEIGHT = 1;


function initFBO() {
	for (var i = 0; i < MAX_PORTAL_DEPTH; ++i) {
		fbos.push( createFBO() );
	}

	maskFBO = createFBO();
}

function createFBO() {
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

	return framebuffer;
}

function bindFBO(fbo) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbo.texture, 0)
	gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
}


function drawFBOScene(camera, time, portal, portalDepth, depthKey) {
	if (portalDepth >= window.CURRENT_PORTAL_DEPTH) {
		return;
	}

	depthKey += portal.id;

	portal.setFBO(fbos[portalDepth]);
	bindFBO(fbos[portalDepth]);

	gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var portalCam = camera.clone();
	portalCam.setPortalView( portal );

	if (window.skybox) {
		window.skybox.draw( playerCamera );
	}

	//Draw models
	//drawTriangle(portalCam, time);
	for (var i = models.length - 1; i >= 0; i--) {
		models[i].draw( portalCam );
	}

	//Draw portals
	for (var i = portals.length - 1; i >= 0; i--) {
		if (portals[i] != portal.targetBack &&
			portals[i].isVisible( portalCam )) {

			if (portalDepth < window.CURRENT_PORTAL_DEPTH - 1) {
				debugFrustumCount++;

				if ( portals[i].checkOcclusionCulling( depthKey, portalCam ) ) {
					debugOcclusionCount += 1;
					// Draw to inner portal's FBO
					drawFBOScene( portalCam, time, portals[i], portalDepth + 1, depthKey);
					portals[i].setFBO(fbos[portalDepth + 1]);

					// Draw to this portal's FBO
					bindFBO(fbos[portalDepth]);
					portals[i].shader = fbo_prog;
					portals[i].draw( portalCam );
				}
			}
			else {
				// Dummy shading
				gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
				portals[i].drawColor( portalCam, [1.0, 0.0, 1.0, 1.0] );
			}
		}
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}