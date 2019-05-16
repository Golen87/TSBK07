#version 300 es

in vec3 Position;
in vec3 Normal;
in vec2 TexCoord;

uniform mat4 u_ProjMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ModelMat;
uniform mat3 u_NormalMat;

out vec3 v_Normal;
out vec2 v_TexCoord;
out vec3 v_CamPos;
out vec3 v_Distance;


void main(void)
{
	gl_Position = u_ProjMat * u_ViewMat * u_ModelMat * vec4(Position, 1.0);
	v_Normal = u_NormalMat * Normal;
	v_TexCoord = TexCoord;
	v_CamPos = vec3( inverse(u_ViewMat * u_ModelMat) * vec4(0,0,0,1) ) - Position;
    v_Distance = (inverse(u_ViewMat) * vec4(0,0,0,1)).xyz - (u_ModelMat * vec4(Position, 1.0)).xyz;
}