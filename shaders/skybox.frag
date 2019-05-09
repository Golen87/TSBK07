#version 300 es
precision mediump float;

in vec2 v_TexCoord;

uniform sampler2D u_Sampler;

out vec4 o_FragColor;

void main(void)
{
	vec4 color = texture(u_Sampler, v_TexCoord);

	// Gamma correction
	vec4 gamma = vec4( 1.0 / 1.5 );
	o_FragColor = pow( max( color, vec4(0,0,0,0) ), gamma );
}