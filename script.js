ctx = document.getElementById("canvas").getContext("2d");
canvas = document.getElementById("canvas");
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
});


const refreshRate = 1;


let fireActive = true;
let gameStarted = false;
let gameOver = false;
let currTime = 0; // Current elapsed time in seconds - add to elapsed time in Game class



// Class to record game state
class Game{
    constructor() {
        this.progress = 0; // Game progress (0-500)
        this.friendship = 0; // Friendship meter
        this.maxProgress = cWidth/2; // Max progress to reach extraction
        this.maxFriendship = cWidth/2; // Max friendship for upgrade
        this.maxHealth = cWidth/2; // Player max health
        this.progressRate = this.maxProgress/10; // Rate at which progress increases per cleansed droplet
        this.friendshipRate = this.maxProgress/5; // Rate at which friendship increases per cleansed droplet
        this.bubbles = []; // Array to hold bubbles
        this.enemies = []; // Array to hold enemies
        this.droplets = []; // Array to hold corrupted droplets

        this.player = new Player(50, 50, 0, 0, "yellow", this.maxHealth, 1, 500); // Create player

        // Other metrics
        this.score = 0;
        this.elapsedTime = 0; // in seconds
        this.enemiesDefeated = 0; // Total enemies defeated
        this.dropletsCleansed = 0; // Total droplets cleansed
    }
}
const newGame = new Game();

function updateTimer(time){
    newGame.elapsedTime = time;
}

// Reset game state
function resetGame() {
    //Reset player
    newGame.player.x = 0;
    newGame.player.y = 0;
    newGame.player.speed = 1;
    newGame.player.rateOfFire = 500;
    newGame.player.health = newGame.maxHealth;

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

    //Extraction point state
    extractionPoint = null;
    extractionActive = false;
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("extractionPopup").style.display = "none";
}



function draw(){
    if (!gameStarted || gameOver || upgradePending || winPending) return;

    ctx.clearRect(0,0, cWidth, cHeight);

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
    newGame.player.updatePlayerMovement(newGame.player);

    // Player collision with enemies - How player takes damage
    for (let i = newGame.enemies.length - 1; i >= 0; i--) {
        const enemy = newGame.enemies[i];
        if (playerHitsEnemy(newGame.player, enemy)) {
            // Progress bar decreases on hit
            newGame.score -= 10;

            if (newGame.progress - newGame.progressRate >= 0) {
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

    // --- Player collision with enemy projectiles ---
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
        currTime = 0;
        updateSummary();
        console.log("[LOG] Player HEALTH reached 0 and LOST!");
        document.getElementById("gameOverScreen").style.display = "flex";
        return;
    }

    newGame.player.draw(ctx, cWidth, cHeight, mouse);

    // Update and draw enemies
    const now = Date.now();
    for (let i = newGame.enemies.length - 1; i >= 0; i--) {
        const enemy = newGame.enemies[i];
        enemy.update(newGame.player, now, enemyProjectiles);
        enemy.draw(ctx, cWidth, cHeight);
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
        droplet.draw(ctx, cWidth, cHeight);

        // Collect cleansed droplets
        if (droplet.cleansed && playerOverDroplet(newGame.player, droplet)) {
            newGame.droplets.splice(i, 1);
            newGame.progress = Math.min(newGame.maxProgress, newGame.progress + newGame.progressRate);
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
    ctx.fillText(`Time: ${newGame.elapsedTime}s`, cWidth/2, 70);
    ctx.fillText(`Score: ${newGame.score}`, cWidth/2, 90);


    // Draw health bar
    ctx.fillStyle = "#F5402C";
    ctx.fillRect(cWidth/2 - newGame.maxHealth/2, cHeight-(cHeight/4), newGame.maxHealth, 20); // Background for
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(cWidth/2 - newGame.maxHealth/2, cHeight-(cHeight/4), newGame.player.health, 20); // Background for progress bar
    
    // Draw progress bar
    ctx.fillStyle = "gray";
    ctx.fillRect(cWidth/2 - newGame.maxProgress/2, 10, newGame.maxProgress, 20); // Background for progress bar
    ctx.fillStyle = "#8BD1CB";
    ctx.fillRect(cWidth/2 - newGame.maxProgress/2, 10, newGame.progress, 20); // Background for progress bar

    // Draw friendship meter
    ctx.fillStyle = "purple";
    ctx.fillRect(cWidth/2 - newGame.maxFriendship/2, 30, newGame.maxFriendship, 20); // Background for friendship meter
    ctx.fillStyle = "#F16061";
    ctx.fillRect(cWidth/2 -  newGame.maxFriendship/2, 30, newGame.friendship, 20); // Friendship meter (0-250)

    // Extraction point logic
    if (newGame.progress >= newGame.maxProgress && !extractionActive) {
        spawnExtractionPoint();
    }

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
                currTime = 0;
                updateSummary();
                document.getElementById("winScreen").style.display = "flex";
                console.log("[LOG] Player reached EXTRACTION point and WON!");
            }, 300);
        }
    }

}

let gameloop;
let recordTime;

// Start, win, loss screen logic
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
const winScreen = document.getElementById("winScreen");
const restartWinButton = document.getElementById("restartWinButton");

startScreen.style.display = "flex";
gameStarted = false;
gameOver = false;

startButton.addEventListener("click", function() {
    startScreen.style.display = "none";
    gameStarted = true;
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
    console.log("[LOG] Game START.");
});

restartButton.addEventListener("click", function() {
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
});

restartWinButton.addEventListener("click", function() {
    resetGame();
    clearInterval(gameloop);
    winScreen.style.display = "none";
    gameStarted = true;
    console.log("[LOG] Game RESTART.");
    gameloop = setInterval(draw, refreshRate);
    recordTime = setInterval(() => {
        currTime++;
        updateTimer(currTime);
    }, 1000);
});

