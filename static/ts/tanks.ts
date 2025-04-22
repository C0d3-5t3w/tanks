interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

class GameObject {
    position: Position;
    size: Size;
    speed: number;
    angle: number;
    color: string;

    constructor(position: Position, size: Size, speed: number, angle: number, color: string) {
        this.position = position;
        this.size = size;
        this.speed = speed;
        this.angle = angle;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
        ctx.restore();
    }

    checkCollision(other: GameObject): boolean {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.size.width + other.size.width) / 2;
    }
}

class Tank extends GameObject {
    canShoot: boolean = true;
    shootCooldown: number = 500; // ms
    lastShootTime: number = 0;
    score: number = 0;
    bullets: Bullet[] = [];

    constructor(position: Position, color: string) {
        super(position, { width: 30, height: 30 }, 3, 0, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Draw tank body
        super.draw(ctx);
        
        // Draw tank cannon
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -3, 20, 6);
        ctx.restore();
    }

    moveForward(): void {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x += dx;
        this.position.y += dy;
    }

    moveBackward(): void {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x -= dx;
        this.position.y -= dy;
    }

    rotateLeft(): void {
        this.angle -= 0.05;
    }

    rotateRight(): void {
        this.angle += 0.05;
    }

    shoot(): Bullet | null {
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

    updateBullets(): void {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            
            // Remove bullets that are off-screen
            if (
                this.bullets[i].position.x < 0 ||
                this.bullets[i].position.x > 800 ||
                this.bullets[i].position.y < 0 ||
                this.bullets[i].position.y > 600
            ) {
                this.bullets.splice(i, 1);
            }
        }
    }
}

class Bullet extends GameObject {
    constructor(position: Position, angle: number, color: string) {
        super(position, { width: 6, height: 6 }, 5, angle, color);
    }

    update(): void {
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.position.x += dx;
        this.position.y += dy;
    }
}

class Obstacle extends GameObject {
    constructor(position: Position, size: Size) {
        super(position, size, 0, 0, '#8B4513');
    }
}

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player1: Tank;
    player2: Tank;
    obstacles: Obstacle[] = [];
    keys: { [key: string]: boolean } = {};
    gameOver: boolean = false;
    
    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Create two tanks with different colors (red and green from the Rasta theme)
        this.player1 = new Tank({ x: 100, y: 300 }, '#b22234');
        this.player2 = new Tank({ x: 700, y: 300 }, '#009B3A');
        
        // Add some obstacles
        this.createObstacles();
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.getElementById('restartBtn')!.addEventListener('click', this.restart.bind(this));
        
        // Start the game loop
        this.gameLoop();
    }
    
    createObstacles(): void {
        // Create some random obstacles
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
    
    handleKeyDown(e: KeyboardEvent): void {
        this.keys[e.key] = true;
    }
    
    handleKeyUp(e: KeyboardEvent): void {
        this.keys[e.key] = false;
    }
    
    processInput(): void {
        // Player 1 controls - WASD + Space
        if (this.keys['w']) this.player1.moveForward();
        if (this.keys['s']) this.player1.moveBackward();
        if (this.keys['a']) this.player1.rotateLeft();
        if (this.keys['d']) this.player1.rotateRight();
        if (this.keys[' ']) this.player1.shoot();
        
        // Player 2 controls - Arrow keys + Enter
        if (this.keys['ArrowUp']) this.player2.moveForward();
        if (this.keys['ArrowDown']) this.player2.moveBackward();
        if (this.keys['ArrowLeft']) this.player2.rotateLeft();
        if (this.keys['ArrowRight']) this.player2.rotateRight();
        if (this.keys['Enter']) this.player2.shoot();
    }
    
    update(): void {
        if (this.gameOver) return;
        
        this.processInput();
        
        // Update bullets
        this.player1.updateBullets();
        this.player2.updateBullets();
        
        // Check collisions between tanks and walls
        this.checkWallCollisions(this.player1);
        this.checkWallCollisions(this.player2);
        
        // Check collisions between tanks and obstacles
        this.checkObstacleCollisions(this.player1);
        this.checkObstacleCollisions(this.player2);
        
        // Check bullet collisions
        this.checkBulletCollisions();
        
        // Update scores
        document.getElementById('score1')!.textContent = this.player1.score.toString();
        document.getElementById('score2')!.textContent = this.player2.score.toString();
    }
    
    checkWallCollisions(tank: Tank): void {
        if (tank.position.x < 0) tank.position.x = 0;
        if (tank.position.x > this.canvas.width) tank.position.x = this.canvas.width;
        if (tank.position.y < 0) tank.position.y = 0;
        if (tank.position.y > this.canvas.height) tank.position.y = this.canvas.height;
    }
    
    checkObstacleCollisions(tank: Tank): void {
        for (const obstacle of this.obstacles) {
            if (tank.checkCollision(obstacle)) {
                // Simple collision response - push back
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
    
    checkBulletCollisions(): void {
        // Check player 1 bullets against player 2
        for (let i = this.player1.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player1.bullets[i];
            
            if (bullet.checkCollision(this.player2)) {
                this.player1.bullets.splice(i, 1);
                this.player1.score++;
                this.resetPositions();
                break;
            }
            
            // Check against obstacles
            for (const obstacle of this.obstacles) {
                if (bullet.checkCollision(obstacle)) {
                    this.player1.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Check player 2 bullets against player 1
        for (let i = this.player2.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player2.bullets[i];
            
            if (bullet.checkCollision(this.player1)) {
                this.player2.bullets.splice(i, 1);
                this.player2.score++;
                this.resetPositions();
                break;
            }
            
            // Check against obstacles
            for (const obstacle of this.obstacles) {
                if (bullet.checkCollision(obstacle)) {
                    this.player2.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    resetPositions(): void {
        this.player1.position = { x: 100, y: 300 };
        this.player1.angle = 0;
        this.player1.bullets = [];
        
        this.player2.position = { x: 700, y: 300 };
        this.player2.angle = Math.PI;
        this.player2.bullets = [];
    }
    
    draw(): void {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }
        
        // Draw tanks
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        
        // Draw bullets
        for (const bullet of this.player1.bullets) {
            bullet.draw(this.ctx);
        }
        
        for (const bullet of this.player2.bullets) {
            bullet.draw(this.ctx);
        }
    }
    
    gameLoop(): void {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    restart(): void {
        this.player1.score = 0;
        this.player2.score = 0;
        this.resetPositions();
        this.obstacles = [];
        this.createObstacles();
        this.gameOver = false;
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    new Game();
});
