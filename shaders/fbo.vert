attribute vec3 Position;
attribute vec2 TexCoord;

uniform mat4 u_ProjMat;
uniform mat4 u_ViewMat;
uniform mat4 u_ModelMat;

varying vec2 v_TexCoord;


void main(void)
{
	gl_Position = u_ProjMat * u_ViewMat * u_ModelMat * vec4(Position, 1.0);
	v_TexCoord = TexCoord;
}