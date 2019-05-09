#version 300 es

in vec3 Position;
in vec2 TexCoord;

uniform mat4 u_ProjMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ModelMat;
uniform mat3 u_NormalMat;

out vec2 v_TexCoord;
out vec3 v_CamPos;


void main(void)
{
	gl_Position = u_ProjMat * u_ViewMat * vec4(Position, 1.0);
	v_TexCoord = TexCoord;
}