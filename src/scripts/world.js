
function setupWorld(canvas, world) {

    var viewWidth = window.innerWidth
        ,viewHeight = window.innerHeight
        // bounds of the window
        ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('pixi', {
        el: 'viewport'
    });

    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
        world.render();
    });
    // add the interaction
    world.add(Physics.behavior('interactive', { el: renderer.container }));

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds
        ,restitution: 0.2
        ,cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {

        viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    // create some bodies
    // projectile
    projectile = Physics.body('circle', {
        x: -20
        ,y: viewHeight - 100
        ,vx: 2
        ,mass: 4
        ,radius: 20
        ,restitution: 0.99
        ,angularVelocity: 0
        ,label: 'bullet'
        ,styles: {
            fillStyle: '0xd33682'
            ,lineWidth: 1
            ,angleIndicator: '0x751b4b'
        }
    });

    var images = [
        'anni_normal.png',
        'antti_normal.png',
        'cosmo_normal.png',
        'elice_normal.png',
        'heli_normal.png',
        'ilkka_normal.png',
        'jani_normal.png',
        'janne_normal.png',
        'jari_normal.png',
        'jouni_normal.png',
        'kalle_normal.png',
        'kimble_normal.png',
        'koobo_normal.png',
        'lappis_normal.png',
        'mike_normal.png',
        'mikko_normal.png',
        'miro_normal.png',
        'o-p_normal.png',
        'osmo_normal.png',
        'pekka_normal.png',
        'piipponen_normal.png',
        'riku_normal.png',
        'riussi_normal.png',
        'sakari_normal.png',
        'tommi_normal.png',
        'tuomas_normal.png',
        'tuomo_normal.png',
        'tupis_normal.png',
        'viinis_normal.png',
        'ville_normal.png'
    ];
    // squares
    var squares = [];
    for ( var i = 0; i < images.length - 1; ++i ){

        squares.push( Physics.body('rectangle', {
            width: 30
            ,height: 36
            ,x: 42 * (i / 6 | 0) + viewWidth - 40 * 8
            ,y: 40 * (i % 6) + viewHeight - 40 * 6 + 15
            ,vx: 0
            ,cof: 0.99
            ,restitution: 0.99
            ,label: 'box'
            ,styles: {
                src: '/images/' + images[i]
                ,width: 60
                ,height: 60
            }
        }));
    }

    world.add( squares );

    setTimeout(function(){

        world.add( projectile );

    }, 2000);

    // setup bullet time
    function bulletTime( active ){
        // warp is the world warp factor. 0.03 is slowing the world down
        var warp = active === false ? 1 : 0.03
            ,tween
            ;

        tween = new TWEEN.Tween( { warp: world.warp() } )
            .to( { warp: warp }, 600 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function () {
                // set the world warp on every tween step
                world.warp( this.warp );
            } )
            .start()
            ;
    }

    // query to find a collision of the bullet
    var query = Physics.query({
        $or: [
            { bodyA: { label: 'bullet' }, bodyB: { label: 'box' } }
            ,{ bodyB: { label: 'bullet' }, bodyA: { label: 'box' } }
        ]
    });

    // enter bullet time on first collision
    world.on('collisions:detected', function( data, e ){
        // find the first collision of the bullet with a box
        var found = Physics.util.find( data.collisions, query );
        if ( found ){
            // enter bullet time
            bulletTime();
            // ... for a few seconds
            setTimeout(function(){
                bulletTime(false);
            }, 5000);
            // stop checking
            world.off(e.topic, e.handler);
        }
    });

    // activate bullet time on pokes
    world.on({
        'interact:poke': function( pos ){
            // activate bullet time
            bulletTime();
        }
        ,'interact:release': function(){
            // de-activate bullet time
            bulletTime(false);
        }
    });

    // add things to the world
    world.add([
        Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('body-collision-detection')
        ,Physics.behavior('sweep-prune')
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        TWEEN.update();
        world.step( time );
    });
}

module.exports = setupWorld;
