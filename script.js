// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let lives = 3;
let gameRunning = true;

// Sound effects (using Web Audio API)
const sounds = {
    jump: null,
    coin: null,
    enemy: null,
    gameOver: null,
    levelComplete: null
};

// Initialize audio context
function initAudio() {
    try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Create simple tone generators for sounds
        sounds.jump = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 523.25; // C5 note
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        };
        
        sounds.coin = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'square';
            oscillator.frequency.value = 1046.50; // C6 note
            gainNode.gain.value = 0.2;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        };
        
        sounds.enemy = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 220; // A3 note
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        };
        
        sounds.gameOver = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(110, audioCtx.currentTime + 0.2);
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        };
        
        sounds.levelComplete = () => {
            // Play a success melody
            const playNote = (frequency, duration, delay) => {
                setTimeout(() => {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.type = 'sine';
                    oscillator.frequency.value = frequency;
                    gainNode.gain.value = 0.3;
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + duration);
                }, delay);
            };
            
            // C-E-G-C melody
            playNote(523.25, 0.3, 0);    // C5
            playNote(659.25, 0.3, 300);  // E5
            playNote(783.99, 0.3, 600);  // G5
            playNote(1046.50, 0.5, 900); // C6
        };

    } catch (e) {
        console.log("Audio not supported");
    }
}

// Call initAudio when page loads
window.addEventListener('load', initAudio);

// Player object
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    grounded: false,
    color: '#FF0000' // Red color for Mario
};

// Gravity value
const gravity = 0.5;

// Key state tracking
const keys = {};

// Platforms
const platforms = [
    // Ground
    { x: 0, y: 380, width: 800, height: 20, color: '#8B4513' },
    
    // Platforms
    { x: 200, y: 300, width: 100, height: 20, color: '#8B4513' },
    { x: 400, y: 250, width: 100, height: 20, color: '#8B4513' },
    { x: 600, y: 200, width: 100, height: 20, color: '#8B4513' }
];

// Pipes
const pipes = [
    { x: 350, y: 320, width: 40, height: 60, color: '#00FF00' },
    { x: 550, y: 270, width: 40, height: 110, color: '#00FF00' }
];

// Coins
const coins = [
    { x: 230, y: 270, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 430, y: 220, width: 15, height: 15, collected: false, color: '#FFD700' },
    { x: 630, y: 170, width: 15, height: 15, collected: false, color: '#FFD700' }
];

// Enemies
const enemies = [
    { x: 300, y: 360, width: 20, height: 20, speed: 1, direction: 1, color: '#800080' },
    { x: 500, y: 230, width: 20, height: 20, speed: 1, direction: -1, color: '#800080' }
];

// Event listeners for key presses
document.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
});

document.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

// Collision detection function
function collisionCheck(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = 'Score: ' + score;
    document.getElementById('lives').textContent = 'Lives: ' + lives;
}

// Draw player
function drawPlayer() {
    // Draw Mario-like character
    // Red body
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y + 10, player.width, player.height - 10);
    
    // Blue overalls
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(player.x, player.y + 20, player.width, player.height - 20);
    
    // Skin color face
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(player.x + 5, player.y, player.width - 10, 15);
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 8, player.y + 5, 3, 3);
    ctx.fillRect(player.x + 19, player.y + 5, 3, 3);
    
    // Mustache
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 10, player.y + 10, 10, 3);
    
    // Hat
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, 5);
    ctx.fillRect(player.x + 10, player.y - 5, player.width - 20, 5);
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        // Draw brick pattern
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Draw brick lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = platform.x + 20; i < platform.x + platform.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, platform.y);
            ctx.lineTo(i, platform.y + platform.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = platform.y + 10; i < platform.y + platform.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(platform.x, i);
            ctx.lineTo(platform.x + platform.width, i);
            ctx.stroke();
        }
    });
}

// Draw pipes
function drawPipes() {
    const pipes = [
        { x: 350, y: 320, width: 40, height: 60 },
        { x: 550, y: 270, width: 40, height: 110 }
    ];
    
    pipes.forEach(pipe => {
        // Green pipe body
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        // Pipe top (darker green)
        ctx.fillStyle = '#008800';
        ctx.fillRect(pipe.x - 2, pipe.y, pipe.width + 4, 10);
        
        // Pipe lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
        ctx.strokeRect(pipe.x - 2, pipe.y, pipe.width + 4, 10);
    });
}

// Draw flag
function drawFlag() {
    // Flag pole
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(750, 200, 5, 180);
    
    // Flag
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(755, 200);
    ctx.lineTo(780, 210);
    ctx.lineTo(755, 220);
    ctx.fill();
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Draw coin with shine effect
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw shine
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/3, coin.y + coin.height/3, coin.width/6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw "$" symbol
            ctx.fillStyle = '#8B4513';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', coin.x + coin.width/2, coin.y + coin.height/2);
        }
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        // Brown body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Feet
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 3, enemy.y + enemy.height - 5, 5, 5);
        ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + enemy.height - 5, 5, 5);
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(enemy.x + 8, enemy.y + 8, 3, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width - 8, enemy.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(enemy.x + 8, enemy.y + 8, 1.5, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width - 8, enemy.y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5, enemy.y + 15);
        ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + 15);
        ctx.stroke();
    });
}

// Update player position and physics
function updatePlayer() {
    // Apply gravity
    player.velY += gravity;
    
    // Handle left and right movement
    if (keys[37]) { // Left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }
    
    if (keys[39]) { // Right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    
    // Handle jumping
    if (keys[38] && !player.jumping && player.grounded) { // Up arrow
        player.jumping = true;
        player.grounded = false;
        player.velY = -12;
        if (sounds.jump) sounds.jump();
    }
    
    // Apply velocity
    player.x += player.velX;
    player.y += player.velY;
    
    // Apply friction
    player.velX *= 0.9;
    
    // Check boundaries
    if (player.x <= 0) {
        player.x = 0;
    } else if (player.x + player.width >= canvas.width) {
        player.x = canvas.width - player.width;
    }
    
    // Reset grounded state
    player.grounded = false;
    
    // Platform collision
    platforms.forEach(platform => {
        const direction = collisionCheck(player, platform);
        
        if (direction) {
            // Top collision
            if (player.y + player.height <= platform.y + 10 && player.velY > 0) {
                player.jumping = false;
                player.grounded = true;
                player.velY = 0;
                player.y = platform.y - player.height;
            }
            // Bottom collision
            else if (player.y >= platform.y + platform.height - 10 && player.velY < 0) {
                player.velY = 0;
                player.y = platform.y + platform.height;
            }
            // Left collision
            else if (player.x + player.width <= platform.x + 10 && player.velX > 0) {
                player.velX = 0;
                player.x = platform.x - player.width;
            }
            // Right collision
            else if (player.x >= platform.x + platform.width - 10 && player.velX < 0) {
                player.velX = 0;
                player.x = platform.x + platform.width;
            }
        }
    });
    
    // Pipe collision
    const pipes = [
        { x: 350, y: 320, width: 40, height: 60 },
        { x: 550, y: 270, width: 40, height: 110 }
    ];
    
    pipes.forEach(pipe => {
        const direction = collisionCheck(player, pipe);
        
        if (direction) {
            // Top collision
            if (player.y + player.height <= pipe.y + 10 && player.velY > 0) {
                player.jumping = false;
                player.grounded = true;
                player.velY = 0;
                player.y = pipe.y - player.height;
            }
            // Bottom collision
            else if (player.y >= pipe.y + pipe.height - 10 && player.velY < 0) {
                player.velY = 0;
                player.y = pipe.y + pipe.height;
            }
            // Left collision
            else if (player.x + player.width <= pipe.x + 10 && player.velX > 0) {
                player.velX = 0;
                player.x = pipe.x - player.width;
            }
            // Right collision
            else if (player.x >= pipe.x + pipe.width - 10 && player.velX < 0) {
                player.velX = 0;
                player.x = pipe.x + pipe.width;
            }
        }
    });
    
    // Check if player fell off the screen
    if (player.y > canvas.height) {
        lives--;
        updateUI();
        if (lives <= 0) {
            gameRunning = false;
            if (sounds.gameOver) sounds.gameOver();
        } else {
            // Reset player position
            player.x = 50;
            player.y = 300;
            player.velX = 0;
            player.velY = 0;
        }
    }
}

// Update coins
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected && collisionCheck(player, coin)) {
            coin.collected = true;
            score += 100;
            updateUI();
            if (sounds.coin) sounds.coin();
        }
    });
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        // Move enemy
        enemy.x += enemy.speed * enemy.direction;
        
        // Reverse direction if hitting a platform edge
        let onPlatform = false;
        platforms.forEach(platform => {
            if (enemy.y + enemy.height === platform.y && 
                enemy.x >= platform.x && 
                enemy.x + enemy.width <= platform.x + platform.width) {
                onPlatform = true;
                
                // Check if at edge of platform
                if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
                    enemy.direction *= -1;
                }
            }
        });
        
        // If not on platform, reverse direction
        if (!onPlatform) {
            enemy.direction *= -1;
        }
        
        // Check collision with player
        if (collisionCheck(player, enemy)) {
            // If player jumps on enemy
            if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                // Enemy defeated
                enemy.y = 1000; // Move off screen
                player.velY = -8; // Bounce
                score += 200;
                updateUI();
                if (sounds.enemy) sounds.enemy();
            } else {
                // Player hit by enemy
                lives--;
                updateUI();
                if (sounds.enemy) sounds.enemy();
                if (lives <= 0) {
                    gameRunning = false;
                    if (sounds.gameOver) sounds.gameOver();
                } else {
                    // Reset player position
                    player.x = 50;
                    player.y = 300;
                    player.velX = 0;
                    player.velY = 0;
                }
            }
        }
    });
}

// Draw background
function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2);
    ctx.arc(120, 40, 25, 0, Math.PI * 2);
    ctx.arc(140, 50, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(300, 80, 20, 0, Math.PI * 2);
    ctx.arc(320, 70, 25, 0, Math.PI * 2);
    ctx.arc(340, 80, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(600, 60, 20, 0, Math.PI * 2);
    ctx.arc(620, 50, 25, 0, Math.PI * 2);
    ctx.arc(640, 60, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Hills
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.bezierCurveTo(100, 250, 200, 280, 300, 300);
    ctx.lineTo(0, 400);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.bezierCurveTo(400, 250, 500, 280, 600, 300);
    ctx.lineTo(300, 400);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(600, 300);
    ctx.bezierCurveTo(700, 250, 800, 280, 800, 300);
    ctx.lineTo(600, 400);
    ctx.fill();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        // Draw background
        drawBackground();
        
        // Update game objects
        updatePlayer();
        updateCoins();
        updateEnemies();
        
        // Draw everything
        drawPlatforms();
        drawPipes();
        drawCoins();
        drawEnemies();
        drawPlayer();
        drawFlag();
        
        // Check if player reached the flag
        if (player.x > 750 && player.y < 300) {
            // Level complete
            if (sounds.levelComplete) sounds.levelComplete();
            score += 500; // Bonus points for completing the level
            updateUI();
            ctx.fillStyle = '#000000';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
            gameRunning = false;
        }
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    } else {
        // Game over
        drawBackground();
        ctx.fillStyle = '#000000';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Bravo Davdovy!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Initialize UI
updateUI();

// Start the game
gameLoop();