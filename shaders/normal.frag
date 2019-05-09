#version 300 es
precision mediump float;

in vec3 v_Normal;
in vec3 v_CamPos;

uniform sampler2D u_Sampler;
uniform vec4 u_Color;

out vec4 o_FragColor;

const float k_d = 0.6;		// Surface reflectivity
const float k_spec = 0.4;	// Surface specularity

struct LightSource
{
	vec3 position;
	vec3 attenuation;
	vec3 color;
};

const LightSource light_2 = LightSource(
	vec3( -7, 6, -4 ),
	vec3( 0, 0, 0 ),
	vec3( 1, 1, 1 )
);


vec3 add_ambient_light()
{
	const vec3 ambient_color = vec3( 1, 1, 1 );
	const float i_a = 0.3;		// Ambient light level

	float i_amb = k_d * i_a;
	float i = i_amb;

	return ambient_color * i;
}

vec3 add_directional_light( LightSource light )
{
	const float i_s = 1.0;		// Light source level
	const float alpha = 4.0;		// Sharpness of reflection

	vec3 n = normalize( v_Normal );
	vec3 s = normalize( light.position );
	vec3 r = normalize( 2.0 * n * dot( s, n ) - s );

	vec3 v = normalize( v_CamPos );
	vec3 h_s = normalize( s + v );
	float theta = dot( n, s );
	float phi = dot( r, v );
	float alpha_s = dot( n, h_s );

	float i_diff = k_d * i_s * max( 0.0, theta );
	float i_spec = k_spec * i_s * pow( max( 0.0, phi ), alpha );
	//float i_spec = k_spec * i_s * pow( max( 0, alpha_s ), alpha );

	float i = i_diff + i_spec;

	return light.color * i;
}

void main(void)
{
	vec3 lightColor =
		add_ambient_light() +
		add_directional_light( light_2 );

	vec4 color = u_Color * vec4( lightColor, 1.0 );

	// Gamma correction
	vec4 gamma = vec4( 1.0 / 1.5 );
	o_FragColor = pow( max( color, vec4(0,0,0,0) ), gamma );
}