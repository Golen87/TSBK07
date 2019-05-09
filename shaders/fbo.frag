precision mediump float;

uniform sampler2D u_Sampler;
uniform bool u_Debug;

varying vec2 v_TexCoord;
varying vec4 v_Position;


void main(void)
{
	vec2 uv = (v_Position.xy / v_Position.w);
	uv = uv*0.5 + 0.5;

	const float k = 0.03;
	vec4 color = vec4(0, 0, 0, 0);

	if (u_Debug) {
		if (v_TexCoord.x < k || v_TexCoord.x > 1.0-k || v_TexCoord.y < k || v_TexCoord.y > 1.0-k) {
			color = vec4(1.0, 0.5, 0.0, 1.0);
		}
	}

	gl_FragColor = color + vec4(texture2D(u_Sampler, uv).rgb, 1.0);
}