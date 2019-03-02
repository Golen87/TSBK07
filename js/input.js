// Keyboard helper
var Key = {
	_pressed: {},

	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	ESC: 27,
	SPACEBAR: 32,

	LEFT: 37,	A: 65,
	UP: 38,		W: 87,
	RIGHT: 39,	D: 68,
	DOWN: 40,	S: 83,

	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	onKeydown: function(event) {
		this._pressed[event.keyCode] = true;
	},
	
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
};

// Add event for keyboard input
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


// Add event for window resize
window.addEventListener('resize', function() {
	gl.viewportWidth = canvas.width  = window.innerWidth;
	gl.viewportHeight = canvas.height = window.innerHeight;
	camera.onWindowResize();
}, false);


// Set up pointer lock calls
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

// Lock pointer if window is clicked
canvas.onclick = function() {
	canvas.requestPointerLock();
}

function onLockChange() {
	if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
		document.addEventListener("mousemove", onMouseMove, false);
	} else {
		document.removeEventListener("mousemove", onMouseMove, false);
	}
}
function onMouseMove(e) {
	camera.mouseMove(e.movementX, e.movementY);
}

// Add event for locking pointer
document.addEventListener('pointerlockchange', onLockChange, false);
document.addEventListener('mozpointerlockchange', onLockChange, false);