#version 300 es
precision mediump float;

in vec2 v_TexCoord;
in vec4 v_Position;
in vec3 v_Distance;

uniform sampler2D u_Sampler;
uniform bool u_Debug;
uniform vec4 u_FogColor;

out vec4 o_FragColor;


vec4 add_fog(vec4 color) {
	const float fogDensity = 0.03;
	const float dmin = 20.0;
	const float dmax = 40.0;

	float dist = length(v_Distance);

	float fogFactor = 1.0 / exp( (dist * fogDensity)* (dist * fogDensity));
	fogFactor *= (dmax - dist)/(dmax - dmin);
	fogFactor = clamp( fogFactor, 0.0, 1.0 );

	return mix(u_FogColor, color, fogFactor);
}

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

	color = color + vec4(texture(u_Sampler, uv).rgb, 1.0);
	color = add_fog(color);

	o_FragColor = color;
}