var AM = new AssetManager();
var gravitationalConstant = 6.67384e-11;

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);

    gameEngine.addEntity(new Sun(gameEngine, 2000000000000, 18, 800, 600));

    // function Sun(game, density, radius, x, y)
    // Asteroid(game, density, radius, velocity, x, y)
    //gameEngine.addEntity(new Asteroid(gameEngine, 10, 3, 6, {x:0.5, y:0.5}, 600, 400 , false));
    for (var i = 0; i < 1000; i++) {
        var density = Math.random()* 100000;
        var radius = Math.random() * 3 + 1;
        var x = Math.random() * 1000 + 300;
        var y = Math.random() * 1000 + 100;
        var sun = gameEngine.entities[0];
        var dist = distance(sun, {x:x, y:y});
        var diffX = sun.x - x;
        var diffY = y - sun.y;
        var speed = Math.sqrt(gravitationalConstant * sun.mass / dist);
        console.log(speed);
        var velocity = {x: 0, y: 0};
        velocity.x = (diffY / dist) * speed;
        velocity.y = (diffX / dist) * speed;

        gameEngine.addEntity(new Asteroid(gameEngine, density, radius, velocity, x, y));
    }

    gameEngine.start();
    console.log("All Done!");
});


