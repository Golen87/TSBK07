var shaderFrag = `
	precision mediump float;

	varying vec3 v_Color;

	void main(void) {
		gl_FragColor = vec4(v_Color, 1.0);//vec4(0.9, 0.3, 0.6, 1.0);
	}
`;