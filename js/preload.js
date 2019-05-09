var loaders = [];

var shaders = {};
var objects = {};
var textures = {};

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
preload( shaders, "fboFrag", "shaders/fbo.frag" );
preload( shaders, "fboVert", "shaders/fbo.vert" );
preload( shaders, "unlitColorFrag", "shaders/unlit_color.frag" );
preload( shaders, "unlitColorVert", "shaders/unlit_color.vert" );

preload( objects, "cylinder", "obj/cylinder.obj" );
preload( objects, "octagon", "obj/octagon.obj" );
preload( objects, "skybox", "obj/skybox.obj" );
preload( objects, "utedass", "obj/utedass.obj" );
preload( objects, "sphere", "obj/sphere.obj" );
preload( objects, "rock", "obj/rock.obj" );
preload( objects, "tree", "obj/tree.obj" );
preload( objects, "ground", "obj/ground.obj" );
preload( objects, "corridor", "obj/corridor.obj" );
preload( objects, "surface", "obj/surface.obj" );
preload( objects, "cube", "obj/cube.obj" );

textures.grass_lab	= "tex/grass_lab.png";
textures.grass		= "tex/grass.png";
textures.dirt		= "tex/dirt.png";
textures.stone		= "tex/stone.png";
textures.snow		= "tex/snow.png";
textures.sand		= "tex/sand.png";
textures.water		= "tex/water.png";
textures.wall		= "tex/wall.png";

// Meshes

cube_mesh = {
	mesh: "cube",
	dims: [2.0, 2.0, 2.0]
};

sphere_mesh = {
	mesh: "sphere",
	dims: [2.0, 2.0, 2.0]
};

cylinder_mesh = {
	mesh: "cylinder",
	dims: [2.0, 2.0, 2.0]
};


function onPreload( func ) {
	$.when.apply($, loaders).then(function() {
		func();
	});
}
