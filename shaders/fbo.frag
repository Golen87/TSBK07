precision mediump float;

uniform sampler2D u_Sampler;

varying vec2 v_TexCoord;
varying vec4 v_Position;


void main(void)
{
	vec2 uv = (v_Position.xy / v_Position.w);
	uv = uv*0.5 + 0.5;
	gl_FragColor = vec4(texture2D(u_Sampler, uv).rgb, 1.0);
}