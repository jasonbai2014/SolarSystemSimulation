var AM = new AssetManager();
var gravitationalConstant = 6.67384e-11;

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var draw_btn = document.getElementById("draw_btn");
    var remove_btn = document.getElementById("remove_btn");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);

    gameEngine.addEntity(new Sun(gameEngine, 3000000000000, 18, 600, 500));

    for (var i = 0; i < 1000; i++) {
        var density = Math.random()* 10000000000;
        var radius = Math.random() * 2 + 1;
        var x = Math.random() * 800 + 200;
        var y = Math.random() * 800 + 100;
        var sun = gameEngine.entities[0];
        var dist = distance(sun, {x:x, y:y});
        var diffX = sun.x - x;
        var diffY = y - sun.y;
        var speed = Math.sqrt(gravitationalConstant * sun.mass / dist);

        var velocity = {x: 0, y: 0};
        velocity.x = (diffY / dist) * speed;
        velocity.y = (diffX / dist) * speed;

        gameEngine.addEntity(new Asteroid(gameEngine, density, radius, velocity, x, y));
    }

    draw_btn.addEventListener("click", function(event) {
        gameEngine.drawOrbitals = true;
        gameEngine.removeOrbitals = false;
        event.preventDefault();
    }, false);

    remove_btn.addEventListener("click", function(event) {
        gameEngine.drawOrbitals = false;
        gameEngine.removeOrbitals = true;
        event.preventDefault();
    }, false);

    gameEngine.start();
    console.log("All Done!");
});


