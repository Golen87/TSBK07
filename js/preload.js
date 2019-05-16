var loaders = [];

var shaders = {};
var objects = {};
var textures = {};

window.textureCache = {};

function preload( obj, name, url ) {
	var loader = $.ajax({
		url: url,
		success: function(data) {
			obj[name] = data;
		}
	});
	loaders.push(loader);
}

preload( shaders, "normalFrag", "shaders/normal.frag" );
preload( shaders, "normalVert", "shaders/normal.vert" );
preload( shaders, "textureFrag", "shaders/texture.frag" );
preload( shaders, "textureVert", "shaders/texture.vert" );
preload( shaders, "fboFrag", "shaders/fbo.frag" );
preload( shaders, "fboVert", "shaders/fbo.vert" );
preload( shaders, "unlitColorFrag", "shaders/unlit_color.frag" );
preload( shaders, "unlitColorVert", "shaders/unlit_color.vert" );
preload( shaders, "skyboxFrag", "shaders/skybox.frag" );
preload( shaders, "skyboxVert", "shaders/skybox.vert" );

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
preload( objects, "monkey", "obj/monkey.obj" );

textures.debug		= "tex/debug.png";
textures.grass_lab	= "tex/grass_lab.png";
textures.wall		= "tex/wall.png";
textures.skybox		= "tex/skybox.png";

textures.mc_grass	= "tex/minecraft/grass.png";
textures.mc_dirt	= "tex/minecraft/dirt.png";
textures.mc_stone	= "tex/minecraft/stone.png";
textures.mc_snow	= "tex/minecraft/snow.png";
textures.mc_sand	= "tex/minecraft/sand.png";
textures.mc_water	= "tex/minecraft/water.png";

textures.grass		= "tex/fancy/grass.jpg";
textures.soil		= "tex/fancy/soil.jpg";
textures.snow		= "tex/fancy/snow.jpg";
textures.leaves		= "tex/fancy/leaves.jpg";
textures.gravel		= "tex/fancy/gravel.jpg";

textures.plywood	= "tex/fancy/plywood.jpg";
textures.wood		= "tex/fancy/wood.jpg";
textures.wood_wall	= "tex/fancy/wood_wall.jpg";
textures.brick		= "tex/fancy/brick.jpg";
textures.concrete	= "tex/fancy/concrete.jpg";
textures.metal_holes= "tex/fancy/metal.jpg";
textures.metal		= "tex/fancy/metal_scratches.jpg";


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

skybox_mesh = {
	mesh: "skybox",
	dims: [2.0, 2.0, 2.0]
};

monkey_mesh = {
	mesh: "monkey",
	dims: [2.0, 2.0, 2.0]
};


function preloadTextures() {
	for (var i = 0; i < Object.keys(textures).length; i++) {
		var tex = textures[Object.keys(textures)[i]];
		window.textureCache[tex] = loadTexture(gl, tex);
	}
}

function onPreload( func ) {
	$.when.apply($, loaders).then(function() {
		func();
	});
}
