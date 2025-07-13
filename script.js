// Class to record game state
class Game {
    constructor(difficulty, mapx, mapy) {
        this.difficulty = difficulty;
        this.progress = 0; // Game progress
        this.friendship = 0; // Friendship meter

        if (this.difficulty == "normal") {
            console.log("[LOG] Selected *normal* difficulty ");
            this.maxProgress = 1000; // Max progress to reach extraction
            this.maxFriendship = 1000; // Max friendship for upgrade
            this.maxHealth = 500; // Player max health
            this.progressRate = 100; // Rate at which progress increases per cleansed droplet
            this.friendshipRate = 150; // Rate at which friendship increases per cleansed droplet

        } else if (this.difficulty == "medium") {
            console.log("[LOG] Selected *medium* difficulty ");
            this.maxProgress = 1500; // Max progress to reach extraction
            this.maxFriendship = 1500; // Max friendship for upgrade
            this.maxHealth = 400; // Player max health
            this.progressRate = 75; // Rate at which progress increases per cleansed droplet
            this.friendshipRate = 100; // Rate at which friendship increases per cleansed droplet

        } else if (this.difficulty == "hard") {
            console.log("[LOG] Selected *hard* difficulty ");
            this.maxProgress = 2500; // Max progress to reach extraction
            this.maxFriendship = 2500; // Max friendship for upgrade
            this.maxHealth = 350; // Player max health
            this.progressRate = 55; // Rate at which progress increases per cleansed droplet
            this.friendshipRate = 75; // Rate at which friendship increases per cleansed droplet

        }
        else {
            console.log(`[LOG] Error selecting difficulty --- ${this.difficulty}`)
        }

        this.bubbles = []; // Array to hold bubbles
        this.enemies = []; // Array to hold enemies
        this.droplets = []; // Array to hold corrupted droplets

        this.player = new Player(50, 50, 0, 0, "yellow", this.maxHealth, 1, 500); // Create player
        this.boss = new Boss(Math.random() * mapWidth - mapWidth / 2, -mapHeight / 2); // Create the Boss

        // Other metrics
        this.score = 0;
        this.elapsedTime = 0; // in seconds
        this.enemiesDefeated = 0; // Total enemies defeated
        this.dropletsCleansed = 0; // Total droplets cleansed
        this.frame = 0; // Help animate by iterating current frame
    }
}

const ctx = document.getElementById("canvas").getContext("2d");
const canvas = document.getElementById("canvas");

let isMobile;
let MAX_BAR_LEN;
let MAX_BAR_HEIGHT;

function checkMobile() {
    if (window.innerWidth <= 850) {
        isMobile = true;
        MAX_BAR_LEN = 600;
        MAX_BAR_HEIGHT = 10;
        console.log(`[LOG] Phone res --- ${isMobile}`);
        return true;
    }
    else {
        isMobile = false;
        console.log(`[LOG] Non-phone res --- ${isMobile}`);
        MAX_BAR_LEN = 800;
        MAX_BAR_HEIGHT = 20;
        return false;
    }
}
checkMobile();

// Responsive canvas support
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let cWidth = canvas.width;
let cHeight = canvas.height;
let mapWidth = canvas.width; // World map width
let mapHeight = canvas.height; // World map height

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cWidth = canvas.width;
    cHeight = canvas.height;
    mapWidth = canvas.width;
    mapHeight = canvas.height;
    checkMobile();
});

const refreshRate = 1;
let newGame;
let gameStarted = false;
let gameOver = false;
let currTime = 0; // Current elapsed time in seconds - add to elapsed time in Game class
let gameloop;
let recordTime;
let frameloop;
const framerate = 250; // animation update
let difficulty = "null";

// Start, win, loss screen logic
const startScreen = document.getElementById("startScreen");

const normalButton = document.getElementById("normalButton");
const mediumButton = document.getElementById("mediumButton");
const hardButton = document.getElementById("hardButton");

const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");
const nextScreen = document.getElementById("nextLevel");

const restartButton = document.getElementById("restartButton");
const restartWinButton = document.getElementById("restartWinButton");
const nextLevelButton = document.getElementById("nextButton");

startScreen.style.display = "flex";
gameStarted = false;
gameOver = false;

normalButton.addEventListener("click", function () {
    difficulty = "normal";
    //Create game object
    newGame = new Game(difficulty, mapWidth, mapHeight);

    startScreen.style.display = "none";
    gameStarted = true;
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
    console.log("[LOG] Game START.");
});

mediumButton.addEventListener("click", function () {
    difficulty = "medium";
    //Create game object
    newGame = new Game(difficulty, mapWidth, mapHeight);

    startScreen.style.display = "none";
    gameStarted = true;
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
    console.log("[LOG] Game START.");
});

hardButton.addEventListener("click", function () {
    difficulty = "hard";
    //Create game object
    newGame = new Game(difficulty, mapWidth, mapHeight);

    startScreen.style.display = "none";
    gameStarted = true;
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
    console.log("[LOG] Game START.");
});

restartButton.addEventListener("click", function () {
    resetGame();
    clearInterval(gameloop);
    gameOverScreen.style.display = "none";
    gameStarted = true;
    console.log("[LOG] Game RESTART.");
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
});

restartWinButton.addEventListener("click", function () {
    resetGame();
    level = 0;
    clearInterval(gameloop);
    winScreen.style.display = "none";
    document.getElementById('canvas').style.backgroundImage = 'url("sprites/grass_tile.png")';
    gameStarted = true;
    console.log("[LOG] Game RESTART.");
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
});

nextLevelButton.addEventListener("click", function () {
    prepNextLevel();
    clearInterval(gameloop);
    nextLevel.style.display = "none";
    level++;

    if (level == 1) {
        document.getElementById('canvas').style.backgroundImage = 'url("sprites/sand.png")';
    } else if (level == 2) {
        document.getElementById('canvas').style.backgroundImage = 'url("sprites/brick.png")';
    }

    if (level == 0) {
        MAX_ENEMIES += 0;
        console.log('[LOG] Increased max enemies');
    } else if (level == 1) {
        MAX_ENEMIES += 2;
        console.log('[LOG] Increased max enemies');
    } else if (level >= 2) {
        MAX_ENEMIES /= 2;
        console.log('[LOG] Increased max enemies');
    }

    gameStarted = true;
    console.log("[LOG] game NEXT LEVEL.");
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    frameloop = setInterval(() => {
        newGame.frame = (newGame.frame >= 3) ? newGame.frame = 0 : newGame.frame += 1;
    }, framerate);
});

function draw() {
    if (!gameStarted || gameOver || upgradePending || winPending) return;

    ctx.clearRect(0, 0, cWidth, cHeight);

    // Spawn enemies if needed
    if (newGame.enemies.length < MAX_ENEMIES) {
        spawnEnemy();
    }

    // Handle bubble firing
    if ((keyInputs[" "] || mouseDown)) {
        tryFireBubble();
    }
    else if (joystickAim.firing) {
        tryFireBubble();
    }

    // Draw the player
    let isWalk = newGame.player.updatePlayerMovement(newGame.player);
    newGame.player.draw(ctx, cWidth, cHeight, newGame.frame, isWalk);

    // Player collision with enemies
    for (let i = newGame.enemies.length - 1; i >= 0; i--) {
        const enemy = newGame.enemies[i];
        if (playerHitsEnemy(newGame.player, enemy)) {
            // Progress bar decreases on hit
            newGame.score -= 10;

            if (newGame.progress - newGame.progressRate >= 0 && level < 2) {
                // Decrease progress by a fixed amount
                newGame.progress -= 20;
            } else
                newGame.progress = 0;


            // Damage values can be tuned per enemy type
            if (enemy.type === 2) {
                newGame.player.health -= 2; // Tank does more
            } else if (enemy.type === 3) {
                newGame.player.health -= 1; // Fast does less
            } else {
                newGame.player.health -= 1.5; // Default
            }
        }
    }

    // Player collision with enemy projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = enemyProjectiles[i];
        if (playerHitsProjectile(newGame.player, proj)) {
            newGame.player.health -= 10;
            newGame.score -= 25;
            enemyProjectiles.splice(i, 1);
        }
    }


    // Clamp health to 0
    if (newGame.player.health <= 0) {
        newGame.player.health = 0;
        gameOver = true;
        clearInterval(recordTime);
        clearInterval(frameloop);
        currTime = 0;
        updateSummary();
        console.log("[LOG] Player HEALTH reached 0 and LOST!");
        document.getElementById("gameOverScreen").style.display = "flex";
        return;
    }

    // Update and draw enemies
    const now = Date.now();
    for (let i = newGame.enemies.length - 1; i >= 0; i--) {
        const enemy = newGame.enemies[i];
        enemy.update(newGame.player, now, enemyProjectiles);
        enemy.draw(ctx, cWidth, cHeight, newGame.frame);
        if (enemy.health <= 0) {
            // Spawn a corrupted droplet at enemy position
            newGame.droplets.push(new CorruptedDroplet(enemy.x, enemy.y));
            newGame.enemies.splice(i, 1);
            newGame.enemiesDefeated++;
            newGame.score += 100;
        }
    }

    // Update and draw enemy projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = enemyProjectiles[i];
        proj.update();
        proj.draw(ctx, cWidth, cHeight);
        if (proj.isOutOfBounds(mapWidth, mapHeight)) {
            enemyProjectiles.splice(i, 1);
        }
    }

    // Draw and handle corrupted droplets
    for (let i = newGame.droplets.length - 1; i >= 0; i--) {
        const droplet = newGame.droplets[i];
        droplet.draw(ctx, cWidth, cHeight, newGame.frame);

        // Collect cleansed droplets
        if (droplet.cleansed && playerOverDroplet(newGame.player, droplet)) {
            newGame.droplets.splice(i, 1);
            if (level < 2){
                newGame.progress = Math.min(newGame.maxProgress, newGame.progress + newGame.progressRate);
            }
            newGame.friendship = Math.min(newGame.maxFriendship, newGame.friendship + newGame.friendshipRate);
            newGame.dropletsCleansed++;
            newGame.score += 75;
            newGame.player.health = Math.min(newGame.maxHealth, newGame.player.health + 5); // Heal player slightly on cleanse
            // Friendship bar full: trigger upgrade
            if (newGame.friendship >= newGame.maxFriendship && !upgradePending) {
                setTimeout(showFriendshipUpgrade, 300);
            }
        }
    }

    if(newGame.boss.health < 0){
        console.log("Boss dead");
    }

    // Draw the bubbles and handle collisions
    for (let i = newGame.bubbles.length - 1; i >= 0; i--) {
        const bubble = newGame.bubbles[i];
        bubble.update();
        let hit = false;

        // Check collision with enemies
        for (let j = newGame.enemies.length - 1; j >= 0; j--) {
            const enemy = newGame.enemies[j];
            if (bubbleHitsEnemy(bubble, enemy)) {
                enemy.health -= newGame.player.bubbleDamage || 100;
                hit = true;
                break;
            }

            // Bubble collision with boss
            if (bubbleHitsEnemy(bubble, newGame.boss)) {
                newGame.boss.health -= newGame.player.bubbleDamage || 100;
                hit = true;
                break;
            }
        }

        // Check collision with enemy projectiles
        if (!hit) {
            for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
                const proj = enemyProjectiles[k];
                if (bubbleHitsEnemyProjectile(bubble, proj)) {
                    enemyProjectiles.splice(k, 1);
                    hit = true;
                    break;
                }
            }
        }

        // Check collision with corrupted droplets (cleanse)
        if (!hit) {
            for (let d = 0; d < newGame.droplets.length; d++) {
                const droplet = newGame.droplets[d];
                if (!droplet.cleansed && bubbleHitsDroplet(bubble, droplet)) {
                    droplet.cleansed = true;
                    hit = true;
                    break;
                }
            }
        }

        bubble.draw(ctx, cWidth, cHeight);
        if (bubble.isOutOfBounds(mapWidth, mapHeight) || hit) {
            newGame.bubbles.splice(i, 1);
        }
    }


    // Draw timer
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Time: ${newGame.elapsedTime}s`, cWidth / 2, 70);
    ctx.fillText(`Score: ${newGame.score}`, cWidth / 2, 90);
    //Track frames (for dev)
    // ctx.fillText(`Frame: ${newGame.frame}`, cWidth/2, 110);

    // Draw health bar
    ctx.fillStyle = "#F5402C";
    ctx.fillRect(cWidth / 2 - newGame.maxHealth / 2, cHeight - (cHeight / 4), newGame.maxHealth, MAX_BAR_HEIGHT); // Background for
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(cWidth / 2 - newGame.maxHealth / 2, cHeight - (cHeight / 4), newGame.player.health, MAX_BAR_HEIGHT); // Background for progress bar

    // Draw progress bar
    if (level < 2){
        ctx.fillStyle = "#7878785e";
        ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 10, MAX_BAR_LEN, MAX_BAR_HEIGHT); // Background for progress bar
        ctx.fillStyle = "#8BD1CB";
        ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 10, newGame.progress / newGame.maxProgress * MAX_BAR_LEN, MAX_BAR_HEIGHT); // Background for progress bar

        // Extraction point logic
        if (newGame.progress >= newGame.maxProgress && !extractionActive) {
            spawnExtractionPoint();
        }
    }
    else{
        //Draw and update the boss
        newGame.boss.draw(ctx, cWidth, cHeight, newGame.frame);
        newGame.boss.update(newGame.player);

        // Draw boss health bar
        ctx.fillStyle = "#7878785e";
        ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 10, MAX_BAR_LEN, MAX_BAR_HEIGHT); // Background for progress bar
        ctx.fillStyle = "red";
        ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 10, newGame.boss.health / newGame.boss.maxHealth * MAX_BAR_LEN, MAX_BAR_HEIGHT); // Background for progress bar

        // Boss collision with player
        if (playerHitsEnemy(newGame.player, newGame.boss)) {
            // Progress bar decreases on hit
            newGame.score -= 15;
            newGame.player.health -= 10;
        }

        // Clamp boss health to 0
        if (newGame.boss.health <= 0){
            newGame.boss.health = 0;
        }

        if (newGame.boss.health <= 0) {
            winPending = true;
            setTimeout(() => {
                clearInterval(recordTime);
                clearInterval(frameloop);
                currTime = 0;
                updateSummary();

                document.getElementById("winScreen").style.display = "flex";

                console.log("[LOG] Player reached EXTRACTION point and WON!");
            }, 200);
        }

    }

    // Draw friendship meter
    ctx.fillStyle = "#7878785e";
    ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 30, MAX_BAR_LEN, MAX_BAR_HEIGHT); // Background for friendship meter
    ctx.fillStyle = "#F16061";
    ctx.fillRect(cWidth / 2 - MAX_BAR_LEN / 2, 30, newGame.friendship / newGame.maxFriendship * MAX_BAR_LEN, MAX_BAR_HEIGHT); // Friendship meter (0-250)
    
    

    // Draw extraction point if active
    if (extractionActive && extractionPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cWidth / 2 + extractionPoint.x, cHeight / 2 + extractionPoint.y, extractionPoint.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FFC907";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#FFC907";
        ctx.textAlign = "center";
        ctx.fillText("🚁 Extraction", cWidth / 2 + extractionPoint.x, cHeight / 2 + extractionPoint.y - extractionPoint.radius - 10);
        ctx.restore();

        // Check if player reached extraction
        if (playerAtExtraction(newGame.player, extractionPoint) && newGame.progress >= newGame.maxProgress) {
            extractionActive = false;
            winPending = true;
            setTimeout(() => {
                clearInterval(recordTime);
                clearInterval(frameloop);
                currTime = 0;
                updateSummary();

                document.getElementById("nextLevel").style.display = "flex";

                console.log("[LOG] Player reached EXTRACTION point and WON!");
            }, 200);
        }
    }
}



function resetGame() {
    //Reset player
    newGame.player.x = 0;
    newGame.player.y = 0;
    newGame.player.speed = 1;
    newGame.player.rateOfFire = 500;
    newGame.player.health = newGame.maxHealth;

    //Reset boss
    newGame.boss.x = Math.random() * mapWidth - mapWidth / 2;
    newGame.boss.y = -mapHeight / 2;
    newGame.boss.health = newGame.boss.maxHealth;

    //Reset game state
    newGame.progress = 0;
    newGame.friendship = 0;
    newGame.bubbles = [];
    newGame.enemies = [];
    newGame.droplets = [];
    enemyProjectiles = [];

    //Reset flags
    gameStarted = true;
    gameOver = false;
    winPending = false;
    upgradePending = false;

    //Reset other metrics
    newGame.score = 0;
    newGame.elapsedTime = 0;
    newGame.enemiesDefeated = 0;
    newGame.dropletsCleansed = 0;
    newGame.frame = 0;

    //Extraction point state
    extractionPoint = null;
    extractionActive = false;
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("extractionPopup").style.display = "none";
}

function prepNextLevel() {
    //Reset player
    newGame.player.x = 0;
    newGame.player.y = 0;

    //Reset game state
    newGame.progress = 0;
    newGame.friendship = 0;
    newGame.bubbles = [];
    newGame.enemies = [];
    newGame.droplets = [];
    enemyProjectiles = [];

    //Reset flags
    gameStarted = true;
    gameOver = false;
    winPending = false;
    upgradePending = false;

    //Reset other metrics
    newGame.frame = 0;

    //Extraction point state
    extractionPoint = null;
    extractionActive = false;
    document.getElementById("extractionPopup").style.display = "none";
}

function updateTimer(time) {
    newGame.elapsedTime = time;
}
