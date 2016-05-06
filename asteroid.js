/**
 * Qing Bai
 * 05/02/2016
 */

 /************************************************/
 /******** H E L P E R  F U N C T I O N S ********/
 /************************************************/

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

var planetColors = ["rgb(27, 43, 156)", "rgb(112, 126, 231)", "rgb(113, 186, 230)", "rgb(129, 214, 199)",
    "rgb(186, 189, 153)", "rgb(199,160, 143)", "rgb(216, 131, 126)", "rgb(242, 64, 32)"];

 /*************************************************/
 /**************** A S T E R O I D ****************/
 /*************************************************/

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
                var newDensity = (this.density + ent.density) / 2 + 5000000;
                var newRadius = calculateRadius(newMass, newDensity);
                var newVelocity = {x: 0, y: 0};
                newVelocity.x = (this.velocity.x * this.mass + ent.velocity.x * ent.mass) / newMass;
                newVelocity.y = (this.velocity.y * this.mass + ent.velocity.y * ent.mass) / newMass;
                var newX = this.mass > ent.mass ? this.x : ent.x;
                var newY = this.mass > ent.mass ? this.y : ent.y;

                if (newMass > 2500000000000) {
                    this.game.entities.push(new Planet(this.game, newDensity, newRadius, newVelocity, newX, newY));
                } else {
                    this.game.entities.push(new Asteroid(this.game, newDensity, newRadius, newVelocity, newX, newY));
                }

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
}


Asteroid.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}

/***********************************************/
/******************** S U N ********************/
/***********************************************/

function Sun(game, density, radius, x, y) {
    Asteroid.call(this, game, density, radius, {x: 0, y:0}, x, y);
    this.color = "rgb(253, 184, 19)";
};

Sun.prototype = new Asteroid();
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

/***********************************************/
/***************** P L A N E T *****************/
/***********************************************/

function Planet(game, density, radius, velocity, x, y) {
    this.orbital = [];
    Asteroid.call(this, game, density, radius, velocity, x, y);
}

Planet.prototype = new Asteroid();
Planet.prototype.constructor = Planet;

Planet.prototype.update = function() {
    Asteroid.prototype.update.call(this);

    if (this.game.drawOrbitals) {
        this.orbital.push({x:this.x, y:this.y});
    } else if (this.game.removeOrbitals) {
        this.orbital = [];
    }
}

Planet.prototype.draw = function (ctx) {
    var dist = distance(this, this.game.entities[0]);

    if (dist > 700) {
        this.color = planetColors[0];
    } else if (dist > 600) {
        this.color = planetColors[1];
    } else if (dist > 500) {
        this.color = planetColors[2];
    } else if (dist > 400) {
        this.color = planetColors[3];
    } else if (dist > 300) {
        this.color = planetColors[4];
    } else if (dist > 200) {
        this.color = planetColors[5];
    } else if (dist > 100) {
        this.color = planetColors[6];
    } else {
        this.color = planetColors[7];
    }

    if (this.orbital.length > 0) {
        ctx.beginPath();
        var preStyle = ctx.strokeStyle;
        ctx.strokeStyle = "White";
        ctx.moveTo(this.orbital[0].x, this.orbital[0].y);

        for (var i = 1; i < this.orbital.length; i++) {
            ctx.lineTo(this.orbital[i].x, this.orbital[i].y)
        }

        ctx.stroke();
        ctx.strokeStyle = preStyle;
    }

    Asteroid.prototype.draw.call(this, ctx);
}




