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
        this.frame = 0;
    }

    // Update player position based on key inputs
    updatePlayerMovement(player){
        const hasTrue = Object.values(keyInputs);
        const isWalk = (!hasTrue.includes(true))?  false :  true;

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

        return isWalk;
    }
    draw(ctx, cWidth, cHeight, frame, isWalk,) {

        this.faceTheta = this.getAngle();
        const degree = this.faceTheta * (180/Math.PI);
        let timeline;

        // Create animations
        if (!isWalk){
            if (degree <= 45 && degree >= -45){
                timeline = [sprites.playerIdleE1, sprites.playerIdleE2, sprites.playerIdleE3, sprites.playerIdleE4];
            }
            else if (degree > 45 && degree < 135){
                timeline = [sprites.playerIdleS1, sprites.playerIdleS2, sprites.playerIdleS3, sprites.playerIdleS4];
            }
            else if (degree >= 135 || degree <= -135){
                timeline = [sprites.playerIdleW1, sprites.playerIdleW2, sprites.playerIdleW3, sprites.playerIdleW4];
            }
            else if (degree < -45 && degree > -135){
                timeline = [sprites.playerIdleN1, sprites.playerIdleN2, sprites.playerIdleN3, sprites.playerIdleN4];
            }
        }
        else{
            if (degree <= 45 && degree >= -45){
                timeline = [sprites.playerIdleE1, sprites.playerWalkE1, sprites.playerIdleE1, sprites.playerWalkE2];
            }
            else if (degree > 45 && degree < 135){
                timeline = [sprites.playerIdleS1, sprites.playerWalkS1, sprites.playerIdleS1, sprites.playerWalkS2];
            }
            else if (degree >= 135 || degree <= -135){
                timeline = [sprites.playerIdleW1, sprites.playerWalkW1, sprites.playerIdleW1, sprites.playerWalkW2];
            }
            else if (degree < -45 && degree > -135){
                timeline = [sprites.playerIdleN1, sprites.playerWalkN1, sprites.playerIdleN1, sprites.playerWalkN2];
            }
        }
        ctx.drawImage(timeline[frame], cWidth/2 + this.x - (this.width/2), cHeight/2 + this.y - (this.height/2), this.width, this.height);

    }

    getAngle(){
        // Player's center position on canvas
        const px = cWidth / 2 + this.x;
        const py = cHeight / 2 + this.y;

        // Calculate angle to mouse
        let angle = Math.atan2(mouse.y - py, mouse.x - px);
        angle = joystickAim.firing ? joystickAim.angle : angle; // Use joystick angle if firing
        return angle;        
    }
}

class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 128;
        this.height = 128;
        this.health = 2000;
        this.maxHealth = 2000;
        this.speed = 0.2;
    }

    update(player) {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        this.faceTheta = Math.atan2(dy, dx);
    }

    draw(ctx, cWidth, cHeight, frame) {
        const timeline = [sprites.boss1, sprites.boss2, sprites.boss3, sprites.boss4];

        ctx.drawImage(timeline[frame], cWidth/2 + this.x - (this.width/2), cHeight/2 + this.y - (this.height/2), this.width, this.height);
    }
}

class Enemy {
    constructor(type, x, y, difficulty, level) {
        // type: 1 = brown/shooter, 2 = purple/tank, 3 = gray/fast
        this.level = level;
        this.difficulty = difficulty;
        this.type = type;
        this.x = x;
        this.y = y;
        
        let multipler
        if (this.difficulty == "normal"){
            multipler = 1;
        }else if (this.difficulty == "medium"){
            multipler = 1.5;
        }else if (this.difficulty == "hard"){
            multipler = 2;
        }

        let level_multiplier;
        if (this.level == 0){
            level_multiplier = 1;
        } else if (this.level == 1){
            level_multiplier = 1.3;
        } else if (this.level == 2){
            level_multiplier = 1.5;
        }
        
        if (type === 1) { // Sludge Slinger
            this.width = 76;
            this.height = 76;
            this.health = 200 * multipler * level_multiplier;
            this.maxHealth = 200 * multipler * level_multiplier;
            this.speed = 0.5 * level_multiplier;
            this.rateOfFire = 1400 / multipler * level_multiplier;
            this.lastShot = 0;
        } else if (type === 2) { // Virus Tank
            this.width = 56;
            this.height = 56;
            this.health = 350 * multipler * level_multiplier;
            this.maxHealth = 350 * multipler * level_multiplier;
            this.speed = 0.77 * level_multiplier;
        } else if (type === 3) { // Bacteria Scout
            this.width = 36;
            this.height = 36;
            this.health = 60 * multipler * level_multiplier;
            this.maxHealth = 60 * multipler * level_multiplier;
            this.speed = 0.95 * level_multiplier;
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

    draw(ctx, cWidth, cHeight, frame) {
        let timeline;
        if (this.type === 1){
            timeline = [sprites.sludge1, sprites.sludge2, sprites.sludge3, sprites.sludge2];

        }else if (this.type === 2){
            timeline = [sprites.tank1, sprites.tank2, sprites.tank1, sprites.tank3];

        }else if (this.type ===3){
            timeline = [sprites.scout1, sprites.scout2, sprites.scout3, sprites.scout4];
        }

        ctx.drawImage(timeline[frame], cWidth/2 + this.x - (this.width/2), cHeight/2 + this.y - (this.height/2), this.width, this.height);

        // Draw health bar above enemy
        ctx.fillStyle = "black";
        ctx.fillRect(cWidth / 2 + this.x - this.width / 2, cHeight / 2 + this.y - this.height / 2 - 8, this.width, 5);
        ctx.fillStyle = "red";
        ctx.fillRect(cWidth / 2 + this.x - this.width / 2, cHeight / 2 + this.y - this.height / 2 - 8, this.width * (this.health / this.maxHealth), 5);
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
        ctx.drawImage(sprites.sludge_proj, cWidth/2 + this.x - (this.radius/2), cHeight/2 + this.y - (this.radius/2), this.radius*2, this.radius*2)
    }

    isOutOfBounds(mapWidth, mapHeight) {
        return (
            this.x < -mapWidth / 2 || this.x > mapWidth / 2 ||
            this.y < -mapHeight / 2 || this.y > mapHeight / 2
        );
    }
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
        ctx.drawImage(sprites.bubble_proj, cWidth/2 + this.x - (this.radius/2), cHeight/2 + this.y - (this.radius/2), this.radius*2, this.radius*2)
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

    draw(ctx, cWidth, cHeight, frame) {
        let timeline;
        if(this.cleansed){
            timeline = [sprites.droplet1, sprites.droplet2, sprites.droplet3, sprites.droplet1];
        }
        else{
            timeline = [sprites.droplet_corrupt1, sprites.droplet_corrupt2, sprites.droplet_corrupt3, sprites.droplet_corrupt1];
        }
        
        ctx.drawImage(timeline[frame], cWidth/2 + this.x - (this.radius/2), cHeight/2 + this.y - (this.radius/2), this.radius*2, this.radius*2)
    }
}