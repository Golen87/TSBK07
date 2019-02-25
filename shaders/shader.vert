var shaderVert = `
	attribute vec3 Position;
	attribute vec3 Color;

	uniform mat4 u_ModelView;
	uniform mat4 u_Persp;

	varying vec3 v_Color;

	void main(void) {
		gl_Position = u_Persp * u_ModelView * vec4(Position, 1.0);
		v_Color = Color;
	}
`;