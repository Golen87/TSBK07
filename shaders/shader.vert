var shaderVert = `
	attribute vec3 Position;

	uniform mat4 u_ModelView;
	uniform mat4 u_Persp;

	void main(void) {
		gl_Position = u_Persp * u_ModelView * vec4(Position, 1.0);
	}
`;