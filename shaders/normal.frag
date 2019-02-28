precision mediump float;

varying vec3 v_Normal;

void main(void)
{
	const vec4 color = vec4(1, 1, 1, 1);
	const vec3 light = normalize(vec3(0.58, 0.58, 0.58));

	gl_FragColor = color * max(vec4(0.2, 0.2, 0.2, 1.0), dot(normalize(v_Normal), light));
}