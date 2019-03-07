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