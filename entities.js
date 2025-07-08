class Player{
    constructor(width, height, x, y, color, health, speed, rateOfFire) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.health = health;
        this.speed = speed;
        this.rateOfFire = rateOfFire;
        this.faceTheta = 0;
    }

    // Update player position based on key inputs
    updatePlayerMovement(player){
        if (keyInputs["ArrowUp"] || keyInputs["w"]) {
            player.y -= player.speed;
        }
        if (keyInputs["ArrowDown"] || keyInputs["s"]) {
            player.y += player.speed;
        }
        if (keyInputs["ArrowLeft"] || keyInputs["a"]) {
            player.x -= player.speed;
        }
        if (keyInputs["ArrowRight"] || keyInputs["d"]) {
            player.x += player.speed;
        }

        // Mobile joystick movement
        if (joystickInput) {
            player.x += joystickInput.x * player.speed;
            player.y += joystickInput.y * player.speed;
        }

        player.x = Math.max(-cWidth/2 + (player.width/2), Math.min(player.x, cWidth/2 - (player.width/2)));
        player.y = Math.max(-cHeight/2 + (player.height/2), Math.min(player.y, cHeight/2 - 25));
    }
    // Draw the player as a triangle
    draw(ctx, cWidth, cHeight, mouse) {

        // Player's center position on canvas
        const px = cWidth / 2 + this.x;
        const py = cHeight / 2 + this.y;

        // Calculate angle to mouse
        let angle = Math.atan2(mouse.y - py, mouse.x - px);
        angle = joystickAim.firing ? joystickAim.angle : angle; // Use joystick angle if firing
        this.faceTheta = angle; // facing direction for projectiles

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + Math.PI / 2); // +PI/2 so the tip points up

        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); // Tip (top)
        ctx.lineTo(this.width / 2, this.height / 2); // Bottom right
        ctx.lineTo(-this.width / 2, this.height / 2); // Bottom left
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}

class Enemy {
    constructor(type, x, y) {
        // type: 1 = brown/shooter, 2 = purple/tank, 3 = gray/fast
        this.type = type;
        this.x = x;
        this.y = y;
        
        if (type === 1) { // Sludge Slinger
            this.width = 70;
            this.height = 70;
            this.color = "brown";
            this.health = 80;
            this.maxHealth = 80;
            this.speed = 0.5;
            this.rateOfFire = 3000;
            this.lastShot = 0;
        } else if (type === 2) { // Virus Tank
            this.width = 50;
            this.height = 50;
            this.color = "purple";
            this.health = 350;
            this.maxHealth = 350;
            this.speed = 0.77;
        } else if (type === 3) { // Bacteria Scout
            this.width = 30;
            this.height = 30;
            this.color = "gray";
            this.health = 60;
            this.maxHealth = 60;
            this.speed = 1.33;
        }
        this.faceTheta = 0;
    }

    update(player, now, projectiles) {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        this.faceTheta = Math.atan2(dy, dx);

        // Type 1: shoot at player
        if (this.type === 1 && now - this.lastShot > this.rateOfFire) {
            //Change enemy projectile speed
            const projSpeed = 1;
            const vx = (dx / dist) * projSpeed;
            const vy = (dy / dist) * projSpeed;
            projectiles.push(new EnemyProjectile(this.x, this.y, vx, vy));
            this.lastShot = now;
        }
    }

    draw(ctx, cWidth, cHeight) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(cWidth / 2 + this.x - this.width / 2, cHeight / 2 + this.y - this.height / 2, this.width, this.height);
        // Draw health bar above enemy
        ctx.fillStyle = "red";
        ctx.fillRect(cWidth / 2 + this.x - this.width / 2, cHeight / 2 + this.y - this.height / 2 - 8, this.width, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(cWidth / 2 + this.x - this.width / 2, cHeight / 2 + this.y - this.height / 2 - 8, this.width * (this.health / this.maxHealth), 5);
        ctx.restore();
    }
}

class EnemyProjectile {
    constructor(x, y, vx, vy, radius = 10, color = "orange") {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    draw(ctx, cWidth, cHeight) {
        ctx.beginPath();
        ctx.arc(cWidth / 2 + this.x, cHeight / 2 + this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    isOutOfBounds(mapWidth, mapHeight) {
        return (
            this.x < -mapWidth / 2 || this.x > mapWidth / 2 ||
            this.y < -mapHeight / 2 || this.y > mapHeight / 2
        );
    }
}

class waterDroplet{
    
}

class Bubble {
    constructor(x, y, vx, vy, radius = 8, color = "cyan") {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx, cWidth, cHeight) {
        ctx.beginPath();
        ctx.arc(cWidth / 2 + this.x, cHeight / 2 + this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isOutOfBounds(mapWidth, mapHeight) {
        return (
            this.x < -mapWidth / 2 || this.x > mapWidth / 2 ||
            this.y < -mapHeight / 2 || this.y > mapHeight / 2
        );
    }

    // Static method to check if a bubble can be fired (rate limiting)
    static canFire(lastBubbleTime, rateOfFire) {
        const now = Date.now();
        return now - lastBubbleTime >= rateOfFire;
    }

    // Static method to create a bubble in the direction the player is facing
    static createFromPlayer(player) {
        const px = player.x;
        const py = player.y;
        const angle = player.faceTheta;
        const speed = 4; //Control the speed of the bubble
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        return new Bubble(px, py, vx, vy);
    }
}

class CorruptedDroplet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.cleansed = false;
    }

    draw(ctx, cWidth, cHeight) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cWidth / 2 + this.x, cHeight / 2 + this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.cleansed ? "#8BD1CB" : "#A020F0"; // cyan if cleansed, purple if not
        ctx.globalAlpha = this.cleansed ? 0.7 : 1;
        ctx.fill();
        ctx.restore();
    }
}