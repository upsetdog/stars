const FPS = 60 / 1000;
const SCALE = 4;

const BACKGROUND_COLOR = "#0d0d0dff";
const STAR_COLOR = "#ffffffff";
const LINE_COLOR = "#d0d0d077";

var canvas, ctx;
var entities = [];

function Star(x, y) {
    this.pos = { x: x, y: y };
    this.neighbors = [];

    var speed = 0.05;
    var viewDistance = 30; // how far a neighboring star can be

    var movement = {
        cooldown: 0, // the amount of seconds to move for, before changing direction
        min: 2,      // minimum seconds to move for
        max: 6,      // maximum seconds to move for
        angle: 0     // the angle (in radians) to move in
    };

    var self = this;

    this.tick = () => {
        // movement direction
        movement.cooldown -= 1;

        if (movement.cooldown <= 0) {
            movement.cooldown = (movement.min + Math.floor(Math.random() * (movement.max - movement.min))) * 1000;

            var degrees = Math.floor(Math.random() * 360);
            var radians = degrees * Math.PI / 180;

            movement.angle = radians;
        }



        // try to move
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



        // update the neighbors array
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
        ctx.strokeStyle = LINE_COLOR;

        ctx.beginPath();
        for (var neighbor of this.neighbors) {
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(neighbor.pos.x, neighbor.pos.y);
            ctx.stroke();
        }
    }

    this.render = (ctx) => {
        ctx.fillStyle = STAR_COLOR;

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
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var entity of entities) {
        entity.renderLines(ctx);
    }

    for (var entity of entities) {
        entity.render(ctx);
    }
}

function setupCanvas() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    var width = urlParams.get('width');
    var height = urlParams.get('height');
    
    width = width == null ? 160 : width;
    height = height == null ? 144 : width;
    
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.id = "game";   
    canvas.style.width = `${canvas.width * SCALE}px`;
    canvas.style.height = `${canvas.height * SCALE}px`;
    
    document.body.appendChild(canvas);

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
