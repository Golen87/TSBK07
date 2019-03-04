var loaders = [];

var shaders = {};
var objects = {};

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
preload( objects, "corridor", "obj/corridor.obj" );

// "tex/grass.png"
// "tex/dirt.png"
// "tex/stone.png"
// "tex/snow.png"
// "tex/sand.png"
// "tex/water.png"


function onPreload( func ) {
	$.when.apply($, loaders).then(function() {
		func();
	});
}
