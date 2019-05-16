var scene07 = new Scene(function() {
    window.CURRENT_PORTAL_DEPTH = 1;
    clearPhysics();

    // Init models
    models = [];
    addSkybox();
    addGround()
        .setTexture(textures.wood);

    const red = [1, 0.25, 0.25, 1];
    const green = [0.25, 1, 0.25, 1];
    const blue = [0.25, 0.5, 1, 1];

    const roomCount = 3;
    const roomObjectColors = [red, green, blue];
    const roomObjectMeshes = [cube_mesh, sphere_mesh, cylinder_mesh];
    const wallThickness = 0.1;

    // Clear portals
    portals = [];

    for (let i = 0; i < roomCount; ++i) {

        const x = i * 5.0;

        // Walls
        addModel(cube_mesh, [x + 2, 1.5, 1], [wallThickness, 1.5, 3])
            .setTexture(textures.wood_wall);
        addModel(cube_mesh, [x - 2, 1.5, 1], [wallThickness, 1.5, 3])
            .setTexture(textures.wood_wall);
        addModel(cube_mesh, [x, 1.5, 4], [2, 1.5, wallThickness])
            .setTexture(textures.wood_wall);
        addModel(cube_mesh, [x, 1.5, -2], [2, 1.5, wallThickness])
            .setTexture(textures.wood_wall);

        // Pillar
        addModel(cube_mesh, [x, 1.5, 0], [wallThickness, 1.5, wallThickness])
            .setTexture(textures.concrete);

        addModel(roomObjectMeshes[i], [x, 1, 3])
            .setTexture(textures.debug)
            .setColor(roomObjectColors[i]);

        addPortal([x, 0.0, -1], 0.5 * Math.PI, 2 - 2 * wallThickness, 3 );
        addPortal([x, 0.0, -1], -0.5 * Math.PI, 2 - 2 * wallThickness, 3 );

        // Connect to previous
        if (i != 0) {
            connectPortals( portals[2 * i - 1], portals[2 * i], Math.PI, [0, 1, 0] );
        }
    }
    // Connect start and end
    if (roomCount > 0) {
        connectPortals( portals[2 * roomCount - 1], portals[0], Math.PI, [0, 1, 0] );
    }

    // Init portals
/*
    var portal1 = addPortal([4.25, 0.0, 0.0], 0, 4, 3 );
    var portal2 = addPortal([0, 0.0, -4.25], -0.5 * Math.PI, 4, 3 );

    // Connect portals
    connectPortals( portal1, portal2, Math.PI, [0, 1, 0] )
*/

    // Player
    playerCamera = new PlayerCamera(vec3.fromValues(-1, 1.46, -1.5), 1.125 * Math.PI);
});