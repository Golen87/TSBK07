precision mediump float;

varying vec3 v_Normal;
varying vec2 v_TexCoord;

uniform sampler2D u_Sampler;
uniform vec4 u_Color;

void main(void)
{
	const vec3 light = normalize(vec3(0.58, 0.68, 0.48));

	gl_FragColor = u_Color * texture2D(u_Sampler, v_TexCoord) * max(vec4(0.2, 0.2, 0.2, 1.0), dot(normalize(v_Normal), light));
}