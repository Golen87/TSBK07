#version 300 es

in vec3 Position;
in vec2 TexCoord;

uniform mat4 u_ProjMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ModelMat;

out vec2 v_TexCoord;
out vec4 v_Position;
out vec3 v_Distance;


void main(void)
{
	gl_Position = u_ProjMat * u_ViewMat * u_ModelMat * vec4(Position, 1.0);
	v_TexCoord = TexCoord;
	v_Position = gl_Position;
    v_Distance = (inverse(u_ViewMat) * vec4(0,0,0,1)).xyz - (u_ModelMat * vec4(Position, 1.0)).xyz;
}