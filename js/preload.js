
var shaders = {};
var objects = {};

var loaders = [];
function preload( obj, name, url ) {
	var loader = $.ajax({
		url: url,
		success: function(data) {
			obj[name] = data;
		}
	});
	loaders.push(loader);
}

preload( shaders, "shaderFrag", "shaders/shader.frag" );
preload( shaders, "shaderVert", "shaders/shader.vert" );
preload( shaders, "normalFrag", "shaders/normal.frag" );
preload( shaders, "normalVert", "shaders/normal.vert" );
preload( shaders, "textureFrag", "shaders/texture.frag" );
preload( shaders, "textureVert", "shaders/texture.vert" );

preload( objects, "cylinder", "obj/cylinder.obj" );
preload( objects, "octagon", "obj/octagon.obj" );
preload( objects, "skybox", "obj/skybox.obj" );
preload( objects, "utedass", "obj/utedass.obj" );
preload( objects, "sphere", "obj/sphere.obj" );
preload( objects, "rock", "obj/rock.obj" );
preload( objects, "tree", "obj/tree.obj" );
preload( objects, "ground", "obj/ground.obj" );

//LoadTGATextureSimple("textures/grass.tga", &tex_grass);
//LoadTGATextureSimple("textures/dirt.tga", &tex_dirt);
//LoadTGATextureSimple("textures/stone.tga", &tex_stone);
//LoadTGATextureSimple("textures/snow.tga", &tex_snow);
//LoadTGATextureSimple("textures/sand.tga", &tex_sand);
//LoadTGATextureSimple("textures/water.tga", &tex_water);
//LoadTGATextureSimple("SkyBox512.tga", &tex_skybox);


$.when.apply($, loaders).then(function(schemas) {
	loadWebGL();
});
