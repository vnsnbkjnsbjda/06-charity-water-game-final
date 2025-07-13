// detect if keys are pressed (simultaneous OK)
let keyInputs = {};
document.addEventListener("keydown", function(event) {
    keyInputs[event.key] = true;

});
document.addEventListener("keyup", function(event) {
    keyInputs[event.key] = false;

});

// Record positon of mouse cursor
let mouse = { x: 0, y: 0 };
let mouseDown = false;
document.getElementById("canvas").addEventListener("mousemove", function(event) {
    const rect = this.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});
document.getElementById("canvas").addEventListener("mousedown", function(event) {
    if (event.button === 0) mouseDown = true;
});
document.getElementById("canvas").addEventListener("mouseup", function(event) {
    if (event.button === 0) mouseDown = false;
});

// Bubble firing control
let lastBubbleTime = 0;

function tryFireBubble() {
    if (Bubble.canFire(lastBubbleTime, newGame.player.rateOfFire)) {
        newGame.bubbles.push(Bubble.createFromPlayer(newGame.player));
        lastBubbleTime = Date.now();
    }
}

let level = 0;  // Game level
let MAX_ENEMIES = 4;

const ENEMY_TYPES = [1, 2, 3]; // 1: brown, 2: purple, 3: gray
let enemyProjectiles = [];

// Helper to spawn an enemy at a random edge
function spawnEnemy() {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { // top
        x = Math.random() * mapWidth - mapWidth / 2;
        y = -mapHeight / 2;
    } else if (edge === 1) { // bottom
        x = Math.random() * mapWidth - mapWidth / 2;
        y = mapHeight / 2;
    } else if (edge === 2) { // left
        x = -mapWidth / 2;
        y = Math.random() * mapHeight - mapHeight / 2;
    } else { // right
        x = mapWidth / 2;
        y = Math.random() * mapHeight - mapHeight / 2;
    }
    newGame.enemies.push(new Enemy(type, x, y, difficulty, level));
}

// Bubble-enemy collision detection
function bubbleHitsEnemy(bubble, enemy) {
    const dx = bubble.x - enemy.x;
    const dy = bubble.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    return dist < bubble.radius + Math.max(enemy.width, enemy.height) / 2;
}

// Bubble-enemy projectile collision detection
function bubbleHitsEnemyProjectile(bubble, projectile) {
    const dx = bubble.x - projectile.x;
    const dy = bubble.y - projectile.y;
    const dist = Math.hypot(dx, dy);
    return dist < bubble.radius + projectile.radius;
}

// Player collision detection with enemies
function playerHitsEnemy(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    // Use average of player width/height as radius
    const playerRadius = (player.width + player.height) / 4;
    const enemyRadius = Math.max(enemy.width, enemy.height) / 2;
    return dist < playerRadius + enemyRadius;
}

// Player collision detection with enemy projectiles
function playerHitsProjectile(player, projectile) {
    const dx = player.x - projectile.x;
    const dy = player.y - projectile.y;
    const dist = Math.hypot(dx, dy);
    const playerRadius = (player.width + player.height) / 4;
    return dist < playerRadius + projectile.radius;
}

// player cleanses corrupted droplet
function bubbleHitsDroplet(bubble, droplet) {
    if (droplet.cleansed) return false;
    const dx = bubble.x - droplet.x;
    const dy = bubble.y - droplet.y;
    const dist = Math.hypot(dx, dy);
    return dist < bubble.radius + droplet.radius;
}

// player collects cleansed droplet
function playerOverDroplet(player, droplet) {
    if (!droplet.cleansed) return false;
    const dx = player.x - droplet.x;
    const dy = player.y - droplet.y;
    const playerRadius = (player.width + player.height) / 4;
    return Math.hypot(dx, dy) < playerRadius + droplet.radius;
}

// --- Friendship upgrade logic ---
let upgradePending = false;
function showFriendshipUpgrade() {
    upgradePending = true;
    gameStarted = false;
    const overlay = document.getElementById("friendshipUpgradeScreen");
    const optionsDiv = document.getElementById("upgradeOptions");
    optionsDiv.innerHTML = "";

    // Define all possible upgrades
    const upgrades = [
        {
            name: "Heal",
            desc: "💖 Heal 50 HP",
            apply: () => {
                newGame.player.health = Math.min(newGame.player.health + 50, newGame.player.maxHealth || 200);
            }
        },
        {
            name: "Speed",
            desc: "🏃‍♂️ Increase Movement Speed",
            apply: () => {
                newGame.player.speed += 0.5;
            }
        },
        {
            name: "Rate of Fire",
            desc: "⚡ Increase Rate of Fire",
            apply: () => {
                newGame.player.rateOfFire = Math.max(50, newGame.player.rateOfFire - 40);
            }
        },
        {
            name: "Bubble Radius",
            desc: "🔵 Increase Bubble Radius",
            apply: () => {
                newGame.player.bubbleRadius = (newGame.player.bubbleRadius || 8) + 2;
            }
        },
        {
            name: "Bubble Damage",
            desc: "💥 Increase Bubble Damage",
            apply: () => {
                newGame.player.bubbleDamage = (newGame.player.bubbleDamage || 100) + 40;
            }
        }
    ];

    // Pick 3 random upgrades
    const shuffled = upgrades.sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);

    //update DOM
    choices.forEach((upgrade) => {
        const btn = document.createElement("button");
        btn.className = "upgrade-btn";
        btn.innerHTML = upgrade.desc;
        btn.onclick = function() {
            upgrade.apply();
            overlay.style.display = "none";
            newGame.friendship = 0;
            // Decrease friendshipRate, minimum 20
            newGame.friendshipRate = Math.max(20, Math.floor(newGame.friendshipRate * 0.85));
            upgradePending = false;
            gameStarted = true;
        };
        optionsDiv.appendChild(btn);
    });

    overlay.style.display = "flex";
}

Bubble.createFromPlayer = function(player) {
    const px = player.x;
    const py = player.y;
    const angle = player.faceTheta;
    const speed = 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    return new Bubble(px, py, vx, vy, player.bubbleRadius || 8, "cyan");
};

// Extraction point state
let extractionPoint = null;
let extractionActive = false;
let winPending = false;

function showExtractionPopup() {
    const popup = document.getElementById("extractionPopup");
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
    }, 3000);
}

function spawnExtractionPoint() {
    // Place on the edge of the visible canvas, not the world map
    const radius = 100;
    let x, y;
    const edge = Math.floor(Math.random() * 4);

    if (edge === 0) { // top
        x = Math.random() * (cWidth - 2 * radius) - (cWidth / 2 - radius);
        y = -cHeight / 2 + radius*2;
    } else if (edge === 1) { // bottom
        x = Math.random() * (cWidth - 2 * radius) - (cWidth / 2 - radius);
        y = cHeight / 2 - radius*2;
    } else if (edge === 2) { // left
        x = -cWidth / 2 + radius*2;
        y = Math.random() * (cHeight - 2 * radius) - (cHeight / 2 - radius);
    } else { // right
        x = cWidth / 2 - radius*2;
        y = Math.random() * (cHeight - 2 * radius) - (cHeight / 2 - radius);
    }
    extractionPoint = { x, y, radius };
    extractionActive = true;
    showExtractionPopup();
    console.log("[LOG] Extraction point SPAWNED");
}

// Check if player is at extraction point
function playerAtExtraction(player, point) {
    const dx = player.x - point.x;
    const dy = player.y - point.y;
    const dist = Math.hypot(dx, dy);
    const playerRadius = (player.width + player.height) / 4;
    return dist < playerRadius + point.radius;
}

function updateSummary() {
    console.log("[LOG] Updating end-of-game summary");
    const summary = document.getElementsByClassName("summary");
    for (const elem of summary) {
        elem.innerHTML = `
        <p> Score: ${newGame.score} </p>
        <p> Droplets Cleansed: ${newGame.dropletsCleansed} </p>
        <p> Enemies Defeated: ${newGame.enemiesDefeated} </p>
        <p> Time Survived: ${newGame.elapsedTime} seconds </p>`;
    }
}
