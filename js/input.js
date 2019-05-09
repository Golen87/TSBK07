// Keyboard helper
var Key = {
	_pressed: {},
	_keydownBinds: {},

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

	Q: 81,
	PLUS: 187,
	MINUS: 189,

	NUM_1: 49,
	NUM_2: 50,
	NUM_3: 51,
	NUM_4: 52,
	NUM_5: 53,
	NUM_6: 54,
	NUM_7: 55,
	NUM_8: 56,
	NUM_9: 57,
	NUM_0: 48,

	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},

	onKeydown: function(event) {
		if (this._keydownBinds[event.keyCode]) {
			this._keydownBinds[event.keyCode]();
		}
		this._pressed[event.keyCode] = true;
	},
	
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	},

	bindKeydown: function(keyCode, callback) {
		this._keydownBinds[keyCode] = callback;
	},
};

// Add event for keyboard input
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


// Add event for window resize
window.addEventListener('resize', function() {
	gl.viewportWidth = canvas.width = window.innerWidth;
	gl.viewportHeight = canvas.height = window.innerHeight;
	playerCamera.onWindowResize();
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
	if (Math.abs(e.movementX) > window.innerWidth/10)
		return;
	if (Math.abs(e.movementY) > window.innerHeight/10)
		return;
	playerCamera.mouseMove(e.movementX, e.movementY);
}

// Add event for locking pointer
document.addEventListener('pointerlockchange', onLockChange, false);
document.addEventListener('mozpointerlockchange', onLockChange, false);