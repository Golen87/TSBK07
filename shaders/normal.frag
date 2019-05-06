precision mediump float;

varying vec3 v_Normal;

void main(void)
{
	const vec4 color = vec4(1, 1, 1, 1);
	const vec3 light1 = normalize(vec3(0.58, 0.68, 0.48));
	const vec3 light2 = normalize(vec3(-0.58, -0.48, -0.68));
	const vec4 ambience = vec4(0.2, 0.2, 0.2, 1.0);

	gl_FragColor = color * max(
		ambience,
		max(
			1.0 * dot(normalize(v_Normal), light1),
			0.5 * dot(normalize(v_Normal), light2)
		)
	);
}