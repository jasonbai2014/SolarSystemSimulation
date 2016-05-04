/**
 * Qing Bai
 * 05/02/2016
 */

function distance(a, b) {
    var diffX = a.x - b.x;
    var diffY = a.y - b.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
};

function isCollided(a, b) {
    var dist = distance(a, b);
    return dist <= a.radius + b.radius;
};

function calculateRadius(mass, density) {
    return Math.cbrt((3 * mass) / (4 * density * Math.PI));
};


function Sun(game, density, radius, x, y) {
    this.color = "rgb(253, 184, 19)";
    this.density = density;
    this.radius = radius;
    this.mass = density * (4 * Math.PI * radius * radius * radius / 3);
    Entity.call(this, game, x, y);
};

Sun.prototype = new Entity();
Sun.prototype.constructor = Sun;

Sun.prototype.update = function() {
    for (var i = 1; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        if (isCollided(this, ent)) {
            this.mass += ent.mass;
            ent.removeFromWorld = true;
        }
    }
};

Sun.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
};


function Asteroid(game, density, radius, velocity, x, y) {
    this.color = "Gray";
    this.density = density;
    this.radius = radius;
    this.velocity = velocity;
    this.mass = density * (4 * Math.PI * radius * radius * radius / 3);
    Entity.call(this, game, x, y);
}

Asteroid.prototype = new Entity();
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.update = function () {
    if (this.removeFromWorld) return;
    var acceleration = {x:0, y:0};

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        if (this !== ent && !ent.removeFromWorld) {
            if (!(ent instanceof Sun) && isCollided(this, ent)) { // if two asteroids collide
                var newMass = this.mass + ent.mass;
                var newDensity = (this.density + ent.density) / 2;
                var newRadius = calculateRadius(newMass, newDensity);
                var newVelocity = {x: 0, y: 0};
                newVelocity.x = (this.velocity.x * this.mass + ent.velocity.x * ent.mass) / newMass;
                newVelocity.y = (this.velocity.y * this.mass + ent.velocity.y * ent.mass) / newMass;
                var newX = this.mass > ent.mass ? this.x : ent.x;
                var newY = this.mass > ent.mass ? this.y : ent.y;

                this.game.entities.push(new Asteroid(this.game, newDensity, newRadius, newVelocity, newX, newY));
                this.removeFromWorld = true;
                ent.removeFromWorld = true;
                return;
            } else {
                var dist = distance(this, ent);
                var diffX = ent.x - this.x;
                var diffY = ent.y - this.y;

                acceleration.x += (diffX / dist) * ((gravitationalConstant * ent.mass) / (dist * dist));
                acceleration.y += (diffY / dist) * ((gravitationalConstant * ent.mass) / (dist * dist));
            }
        }
    }

    this.velocity.x += acceleration.x * this.game.clockTick;
    this.velocity.y += acceleration.y * this.game.clockTick;
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    //this.x += this.velocity.x * this.game.clockTick + 0.5 * acceleration.x * (this.game.clockTick * this.game.clockTick);
    //this.y += this.velocity.y * this.game.clockTick + 0.5 * acceleration.y * (this.game.clockTick * this.game.clockTick);
}


Asteroid.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}


