"use strict";
class GameObject {
    constructor(position, size, speed, angle, color) {
        this.position = position;
        this.size = size;
        this.speed = speed;
        this.angle = angle;
        this.color = color;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
        ctx.restore();
    }
    checkCollision(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size.width + other.size.width) / 2;
    }
}
class Tank extends GameObject {
    constructor(position, color) {
        super(position, { width: 30, height: 30 }, 3, 0, color);
        this.canShoot = true;
        this.shootCooldown = 500;
        this.lastShootTime = 0;
        this.score = 0;
        this.bullets = [];
    }
    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -3, 20, 6);
        ctx.restore();
    }
    moveForward() {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x += dx;
        this.position.y += dy;
    }
    moveBackward() {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x -= dx;
        this.position.y -= dy;
    }
    rotateLeft() {
        this.angle -= 0.05;
    }
    rotateRight() {
        this.angle += 0.05;
    }
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime > this.shootCooldown) {
            this.lastShootTime = currentTime;
            const bulletPosition = {
                x: this.position.x + Math.cos(this.angle) * 20,
                y: this.position.y + Math.sin(this.angle) * 20
            };
            const bullet = new Bullet(bulletPosition, this.angle, this.color);
            this.bullets.push(bullet);
            return bullet;
        }
        return null;
    }
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].position.x < 0 ||
                this.bullets[i].position.x > 800 ||
                this.bullets[i].position.y < 0 ||
                this.bullets[i].position.y > 600) {
                this.bullets.splice(i, 1);
            }
        }
    }
}
class Bullet extends GameObject {
    constructor(position, angle, color) {
        super(position, { width: 6, height: 6 }, 5, angle, color);
    }
    update() {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x += dx;
        this.position.y += dy;
    }
}
class Obstacle extends GameObject {
    constructor(position, size) {
        super(position, size, 0, 0, '#8B4513');
    }
}
class Game {
    constructor() {
        this.obstacles = [];
        this.keys = {};
        this.gameOver = false;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player1 = new Tank({ x: 100, y: 300 }, '#b22234');
        this.player2 = new Tank({ x: 700, y: 300 }, '#009B3A');
        this.createObstacles();
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restart.bind(this));
        this.gameLoop();
    }
    createObstacles() {
        for (let i = 0; i < 5; i++) {
            const position = {
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50
            };
            const size = {
                width: Math.random() * 50 + 30,
                height: Math.random() * 50 + 30
            };
            this.obstacles.push(new Obstacle(position, size));
        }
    }
    handleKeyDown(e) {
        const controlKeys = ['w', 'a', 's', 'd', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
        if (controlKeys.includes(e.key)) {
            e.preventDefault();
        }
        this.keys[e.key] = true;
    }
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    processInput() {
        if (this.keys['w'])
            this.player1.moveForward();
        if (this.keys['s'])
            this.player1.moveBackward();
        if (this.keys['a'])
            this.player1.rotateLeft();
        if (this.keys['d'])
            this.player1.rotateRight();
        if (this.keys[' '])
            this.player1.shoot();
        if (this.keys['ArrowUp'])
            this.player2.moveForward();
        if (this.keys['ArrowDown'])
            this.player2.moveBackward();
        if (this.keys['ArrowLeft'])
            this.player2.rotateLeft();
        if (this.keys['ArrowRight'])
            this.player2.rotateRight();
        if (this.keys['Enter'])
            this.player2.shoot();
    }
    update() {
        if (this.gameOver)
            return;
        this.processInput();
        this.player1.updateBullets();
        this.player2.updateBullets();
        this.checkWallCollisions(this.player1);
        this.checkWallCollisions(this.player2);
        this.checkObstacleCollisions(this.player1);
        this.checkObstacleCollisions(this.player2);
        this.checkBulletCollisions();
        document.getElementById('score1').textContent = this.player1.score.toString();
        document.getElementById('score2').textContent = this.player2.score.toString();
    }
    checkWallCollisions(tank) {
        if (tank.position.x < 0)
            tank.position.x = 0;
        if (tank.position.x > this.canvas.width)
            tank.position.x = this.canvas.width;
        if (tank.position.y < 0)
            tank.position.y = 0;
        if (tank.position.y > this.canvas.height)
            tank.position.y = this.canvas.height;
    }
    checkObstacleCollisions(tank) {
        for (const obstacle of this.obstacles) {
            if (tank.checkCollision(obstacle)) {
                const dx = tank.position.x - obstacle.position.x;
                const dy = tank.position.y - obstacle.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const overlapDistance = (tank.size.width + obstacle.size.width) / 2 - distance + 1;
                if (distance > 0) {
                    tank.position.x += overlapDistance * dx / distance;
                    tank.position.y += overlapDistance * dy / distance;
                }
            }
        }
    }
    checkBulletCollisions() {
        for (let i = this.player1.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player1.bullets[i];
            if (bullet.checkCollision(this.player2)) {
                this.player1.bullets.splice(i, 1);
                this.player1.score++;
                this.resetPositions();
                break;
            }
            for (const obstacle of this.obstacles) {
                if (bullet.checkCollision(obstacle)) {
                    this.player1.bullets.splice(i, 1);
                    break;
                }
            }
        }
        for (let i = this.player2.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player2.bullets[i];
            if (bullet.checkCollision(this.player1)) {
                this.player2.bullets.splice(i, 1);
                this.player2.score++;
                this.resetPositions();
                break;
            }
            for (const obstacle of this.obstacles) {
                if (bullet.checkCollision(obstacle)) {
                    this.player2.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
    resetPositions() {
        this.player1.position = { x: 100, y: 300 };
        this.player1.angle = 0;
        this.player1.bullets = [];
        this.player2.position = { x: 700, y: 300 };
        this.player2.angle = Math.PI;
        this.player2.bullets = [];
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        for (const bullet of this.player1.bullets) {
            bullet.draw(this.ctx);
        }
        for (const bullet of this.player2.bullets) {
            bullet.draw(this.ctx);
        }
    }
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    restart() {
        this.player1.score = 0;
        this.player2.score = 0;
        this.resetPositions();
        this.obstacles = [];
        this.createObstacles();
        this.gameOver = false;
    }
}
window.addEventListener('load', () => {
    new Game();
});
//# sourceMappingURL=tanks.js.map