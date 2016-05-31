var AM = new AssetManager();
var gravitationalConstant = 6.67384e-11;

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var draw_btn = document.getElementById("draw_btn");
    var remove_btn = document.getElementById("remove_btn");
    var save_btn = document.getElementById("save_btn");
    var load_btn = document.getElementById("load_btn");

    var socket = io.connect("http://76.28.150.193:8888");
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

    save_btn.addEventListener("click", function(event) {
        var len = gameEngine.entities.length;
        var data = {drawOrbitals:gameEngine.drawOrbitals, removeOrbitals:gameEngine.removeOrbitals,
            asteroidData:[]};

        for (var i = 0; i < len; i++) {
            var ent = gameEngine.entities[i];
            var info = {density:ent.density, radius:ent.radius, velocity:ent.velocity,
                x:ent.x, y:ent.y, color:ent.color};

            if (ent instanceof Sun) {
                info.type = "Sun";
            } else if (ent instanceof Planet) {
                info.type = "Planet";
                info.orbital = ent.orbital;
            } else if (ent instanceof Asteroid) {
                info.type = "Asteroid";
            }

            data.asteroidData.push(info);
        }

        socket.emit("save", {studentname: "Qing Bai", statename: "saveState", data: data});
        console.log("Data saved");
        event.preventDefault();
    }, false);

    load_btn.addEventListener("click", function(event) {
        socket.emit("load", {studentname: "Qing Bai", statename: "saveState"});
        event.preventDefault();
    }, false);

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

    socket.on("load", function(data) {
        gameEngine.entities = [];
        var dataList = data.data.asteroidData;
        gameEngine.drawOrbitals = data.data.drawOrbitals;
        gameEngine.removeOrbitals = data.data.removeOrbitals;

        var len = dataList.length;

        for (var i = 0; i < len; i++) {
            var ent = dataList[i];
            var type = ent.type;
            var asteroid;

            if (type === "Sun") {
                asteroid = new Sun(gameEngine, ent.density, ent.radius, ent.x, ent.y);
                asteroid.color = ent.color;
            } else if (type === "Planet") {
                asteroid = new Planet(gameEngine, ent.density, ent.radius, ent.velocity, ent.x, ent.y);
                asteroid.color = ent.color;
                asteroid.orbital = ent.orbital;
            } else if (type === "Asteroid") {
                asteroid = new Asteroid(gameEngine, ent.density, ent.radius, ent.velocity, ent.x, ent.y);
                asteroid.color = ent.color;
            }

            gameEngine.addEntity(asteroid);
        }

        console.log("Data loaded");
    });

    gameEngine.start();
    console.log("All Done!");
});


