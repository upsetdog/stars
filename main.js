const FPS = 60 / 1000;
const SCALE = 4;

var canvas, ctx;
var entities = [];

function Star(x, y) {
    this.pos = { x: x, y: y };
    this.neighbors = [];

    var speed = 0.05;
    var viewDistance = 30; // how far a neighboring star can be, to be counted as a neighbor.

    var movement = {
        cooldown: 0, // the amount of seconds to move for, before changing direction.
        min: 2,      // minimum seconds to move for.
        max: 5,      // maximum seconds to move for.
        angle: 0     // the angle (in radians) to move in.
    };

    var self = this;

    this.tick = () => {
        movement.cooldown -= 1;

        if (movement.cooldown <= 0) {
            movement.cooldown = (movement.min + Math.floor(Math.random() * (movement.max - movement.min))) * 1000;

            var degrees = Math.floor(Math.random() * 360);
            var radians = degrees * Math.PI / 180;

            movement.angle = radians;
        }

        var tempX = this.pos.x + Math.cos(movement.angle) * speed;
        var tempY = this.pos.y + Math.sin(movement.angle) * speed;
        var cachedX = tempX;
        var cachedY = tempY;

        if (tempX < 0) tempX = 0;
        if (tempY < 0) tempY = 0;
        if (tempX > canvas.width) tempX = canvas.width;
        if (tempY > canvas.height) tempY = canvas.height;

        if (tempX == cachedX && tempY == cachedY) {
            this.pos.x = tempX;
            this.pos.y = tempY;
        } else {
            movement.cooldown = 0;
        }

        this.neighbors = [];

        for (var entity of entities) {
            if (entity == self) continue;

            var dx = this.pos.x - entity.pos.x;
            var dy = this.pos.y - entity.pos.y;

            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < viewDistance) {

                if (!entity.neighbors.includes(self)) {
                    this.neighbors.push(entity);
                }
            }
        }
    }

    this.renderLines = (ctx) => {
        ctx.strokeStyle = "#d0d0d077";

        ctx.beginPath();
        for (var neighbor of this.neighbors) {
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(neighbor.pos.x, neighbor.pos.y);
            ctx.stroke();
        }
    }

    this.render = (ctx) => {
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(this.pos.x - 1, this.pos.y, 1, 1);
        ctx.fillRect(this.pos.x + 1, this.pos.y, 1, 1);
        ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
        ctx.fillRect(this.pos.x, this.pos.y + 1, 1, 1);
        ctx.fillRect(this.pos.x, this.pos.y - 1, 1, 1);
    }
}

function tick() {
    for (var entity of entities) {
        entity.tick();
    }
}

function render() {
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var entity of entities) {
        entity.renderLines(ctx);
    }

    for (var entity of entities) {
        entity.render(ctx);
    }
}

function setupCanvas() {
    canvas = document.getElementById("game");
    canvas.style.width = `${canvas.width * SCALE}px`;
    canvas.style.height = `${canvas.height * SCALE}px`;

    ctx = canvas.getContext("2d");
}

function spawnStars(amount) {
    for (var i = 0; i < amount; i++) {
        var x = 1 + Math.floor(Math.random() * (canvas.width - 1));
        var y = 1 + Math.floor(Math.random() * (canvas.height - 1));

        var star = new Star(x, y);
        entities.push(star);
    }
}

function main() {
    setupCanvas();
    spawnStars(45);

    setInterval(() => {
        tick();
        render();
    }, FPS);
}

main();