#version 300 es

in vec3 Position;
in vec3 Normal;

uniform mat4 u_ProjMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ModelMat;
uniform mat3 u_NormalMat;

out vec3 v_Normal;
out vec3 v_CamPos;
out vec4 v_Position;
out vec3 v_Distance;


void main(void)
{
	gl_Position = u_ProjMat * u_ViewMat * u_ModelMat * vec4(Position, 1.0);
	v_Position = gl_Position;
	v_Normal = u_NormalMat * Normal;
	v_CamPos = vec3( inverse(u_ViewMat * u_ModelMat) * vec4(0,0,0,1) ) - Position;
    v_Distance = (inverse(u_ViewMat) * vec4(0,0,0,1)).xyz - (u_ModelMat * vec4(Position, 1.0)).xyz;
}