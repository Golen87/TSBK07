vec3.temp = vec3.create();

function setGLSetting(setting, state) {
	if (state) {
		gl.enable(setting);
	}
	else {
		gl.disable(setting);
	}
}

Number.prototype.clamp = function( min, max ) {
	return Math.min( Math.max( this, min ), max );
};

function extend(base, sub) {
	// Avoid instantiating the base class just to setup inheritance
	// Also, do a recursive merge of two prototypes, so we don't overwrite 
	// the existing prototype, but still maintain the inheritance chain
	// Thanks to @ccnokes
	var origProto = sub.prototype;
	sub.prototype = Object.create(base.prototype);
	for (var key in origProto)	{
		 sub.prototype[key] = origProto[key];
	}
	// The constructor property was set wrong, let's fix it
	Object.defineProperty(sub.prototype, 'constructor', { 
		enumerable: false, 
		value: sub 
	});
}

function cannonVec3FromGL(glVec3) {
	return new CANNON.Vec3(glVec3[0], glVec3[1], glVec3[2]);
}

function glVec3FromCannon(cannonVec3) {
	return vec3.fromValues(cannonVec3.x, cannonVec3.y, cannonVec3.z);
}

function cannonQuatFromGl(glQuat) {
	return new CANNON.Quaternion(glQuat[0], glQuat[1], glQuat[2], glQuat[3]);
}

function lengthVec2(x, y) {
	return Math.sqrt(x*x + y*y);
}

function lengthVec3(x, y, z) {
	return Math.sqrt(x*x + y*y + z*z);
}

function vadd(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}