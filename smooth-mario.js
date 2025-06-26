// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let coinCount = 0;
let currentLevel = 1;
let gameRunning = true;
let camera = { x: 0, y: 0 };
let gameTime = 0;

// Physics constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// Enhanced Mario object with smooth animations
const mario = {
    x: 100,
    y: 200,
    width: 32,
    height: 32,
    dx: 0,
    dy: 0,
    onGround: false,
    direction: 1,
    powerState: 'small',
    invulnerable: false,
    invulnerabilityTimer: 0,
    
    // Enhanced animation properties
    animationState: 'idle', // 'idle', 'walking', 'jumping', 'falling'
    animationFrame: 0,
    animationTimer: 0,
    walkCycle: 0,
    jumpSquash: 1,
    landingSquash: 1,
    powerUpAnimation: 0,
    
    // Smooth movement
    visualX: 100,
    visualY: 200,
    bobOffset: 0
};

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Enhanced sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Enhanced sound effects
const sounds = {
    jump: () => playSound(523, 0.2, 'sine', 0.4),
    coin: () => {
        playSound(800, 0.1, 'sine', 0.3);
        setTimeout(() => playSound(1000, 0.1, 'sine', 0.2), 50);
    },
    powerUp: () => {
        playSound(659, 0.2, 'sine', 0.4);
        setTimeout(() => playSound(784, 0.2, 'sine', 0.3), 100);
        setTimeout(() => playSound(988, 0.3, 'sine', 0.2), 200);
    },
    enemyDefeat: () => playSound(200, 0.3, 'square', 0.3),
    fireball: () => playSound(300, 0.1, 'sawtooth', 0.2),
    hurt: () => playSound(150, 0.5, 'square', 0.4),
    levelComplete: () => {
        setTimeout(() => playSound(523, 0.2), 0);
        setTimeout(() => playSound(659, 0.2), 200);
        setTimeout(() => playSound(784, 0.4), 400);
    }
};

// Enhanced fireballs with trail effects
const fireballs = [];
const fireballTrails = [];

// Enhanced particles system
const particles = [];

// Floating text effects
const floatingTexts = [];

// Level data (same as before)
const levels = [
    {
        platforms: [
            { x: 0, y: 350, width: 200, height: 50, color: '#8B4513' },
            { x: 250, y: 350, width: 150, height: 50, color: '#8B4513' },
            { x: 450, y: 350, width: 200, height: 50, color: '#8B4513' },
            { x: 700, y: 350, width: 200, height: 50, color: '#8B4513' },
            { x: 950, y: 350, width: 200, height: 50, color: '#8B4513' },
            { x: 300, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 500, y: 200, width: 100, height: 20, color: '#228B22' },
            { x: 750, y: 280, width: 100, height: 20, color: '#228B22' },
            { x: 1000, y: 220, width: 100, height: 20, color: '#228B22' }
        ],
        enemies: [
            { x: 300, y: 318, width: 24, height: 24, dx: -1, type: 'goomba', alive: true, animFrame: 0, animTimer: 0 },
            { x: 550, y: 318, width: 24, height: 24, dx: 1, type: 'goomba', alive: true, animFrame: 0, animTimer: 0 },
            { x: 800, y: 318, width: 24, height: 24, dx: -1, type: 'koopa', alive: true, shell: false, animFrame: 0, animTimer: 0 }
        ],
        coins: [
            { x: 350, y: 220, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 550, y: 170, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 800, y: 250, collected: false, bobOffset: 0, sparkleTimer: 0 }
        ],
        powerUps: [
            { x: 520, y: 170, type: 'mushroom', collected: false, bobOffset: 0, glowIntensity: 0 },
            { x: 1020, y: 190, type: 'fireFlower', collected: false, bobOffset: 0, glowIntensity: 0 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 350, width: 150, height: 50, color: '#8B4513' },
            { x: 200, y: 300, width: 100, height: 20, color: '#228B22' },
            { x: 350, y: 250, width: 100, height: 20, color: '#228B22' },
            { x: 500, y: 200, width: 100, height: 20, color: '#228B22' },
            { x: 650, y: 150, width: 100, height: 20, color: '#228B22' },
            { x: 800, y: 100, width: 100, height: 20, color: '#228B22' },
            { x: 950, y: 350, width: 200, height: 50, color: '#8B4513' }
        ],
        enemies: [
            { x: 220, y: 268, width: 24, height: 24, dx: 1, type: 'goomba', alive: true, animFrame: 0, animTimer: 0 },
            { x: 520, y: 168, width: 24, height: 24, dx: -1, type: 'koopa', alive: true, shell: false, animFrame: 0, animTimer: 0 },
            { x: 970, y: 318, width: 24, height: 24, dx: 1, type: 'goomba', alive: true, animFrame: 0, animTimer: 0 }
        ],
        coins: [
            { x: 230, y: 270, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 380, y: 220, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 530, y: 170, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 680, y: 120, collected: false, bobOffset: 0, sparkleTimer: 0 },
            { x: 830, y: 70, collected: false, bobOffset: 0, sparkleTimer: 0 }
        ],
        powerUps: [
            { x: 680, y: 120, type: 'fireFlower', collected: false, bobOffset: 0, glowIntensity: 0 }
        ]
    }
];

// Current level data
let platforms = [...levels[0].platforms];
let enemies = [...levels[0].enemies];
let coins = [...levels[0].coins];
let powerUps = [...levels[0].powerUps];

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Enhanced particle creation
function createParticles(x, y, color, count = 8, type = 'explosion') {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed - 1,
            life: 40 + Math.random() * 20,
            maxLife: 60,
            color: color,
            size: 2 + Math.random() * 2,
            type: type,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

// Create floating text
function createFloatingText(x, y, text, color = '#FFD700') {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 60,
        dy: -1,
        alpha: 1
    });
}

// Smooth interpolation function
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Enhanced Mario update with smooth animations
function updateMario() {
    gameTime++;
    
    // Handle invulnerability
    if (mario.invulnerable) {
        mario.invulnerabilityTimer--;
        if (mario.invulnerabilityTimer <= 0) {
            mario.invulnerable = false;
        }
    }
    
    // Power-up animation
    if (mario.powerUpAnimation > 0) {
        mario.powerUpAnimation--;
    }
    
    // Determine animation state
    const wasOnGround = mario.onGround;
    
    // Horizontal movement
    mario.dx = 0;
    if (keys['ArrowLeft']) {
        mario.dx = -MOVE_SPEED;
        mario.direction = -1;
        mario.animationState = mario.onGround ? 'walking' : 'jumping';
    }
    if (keys['ArrowRight']) {
        mario.dx = MOVE_SPEED;
        mario.direction = 1;
        mario.animationState = mario.onGround ? 'walking' : 'jumping';
    }
    
    // Idle state
    if (mario.dx === 0 && mario.onGround) {
        mario.animationState = 'idle';
    }
    
    // Jumping
    if (keys['Space'] && mario.onGround) {
        mario.dy = JUMP_FORCE;
        mario.onGround = false;
        mario.animationState = 'jumping';
        mario.jumpSquash = 0.7; // Squash effect
        sounds.jump();
    }
    
    // Fireball shooting
    if (keys['KeyX'] && mario.powerState === 'fire') {
        shootFireball();
    }
    
    // Apply gravity
    mario.dy += GRAVITY;
    
    // Falling state
    if (mario.dy > 0 && !mario.onGround) {
        mario.animationState = 'falling';
    }
    
    // Update position
    mario.x += mario.dx;
    mario.y += mario.dy;
    
    // Smooth visual position
    mario.visualX = lerp(mario.visualX, mario.x, 0.8);
    mario.visualY = lerp(mario.visualY, mario.y, 0.8);
    
    // Platform collisions
    mario.onGround = false;
    for (let platform of platforms) {
        if (checkCollision(mario, platform)) {
            if (mario.dy > 0 && mario.y < platform.y) {
                mario.y = platform.y - mario.height;
                mario.dy = 0;
                mario.onGround = true;
                
                // Landing effect
                if (!wasOnGround) {
                    mario.landingSquash = 0.8;
                    createParticles(mario.x + mario.width/2, mario.y + mario.height, '#8B4513', 3, 'dust');
                }
            } else if (mario.dy < 0 && mario.y > platform.y) {
                mario.y = platform.y + platform.height;
                mario.dy = 0;
            } else if (mario.dx !== 0) {
                if (mario.dx > 0) {
                    mario.x = platform.x - mario.width;
                } else {
                    mario.x = platform.x + platform.width;
                }
            }
        }
    }
    
    // Update animation timers
    mario.animationTimer++;
    
    // Walking animation
    if (mario.animationState === 'walking') {
        if (mario.animationTimer > 8) {
            mario.walkCycle += 0.3;
            mario.animationTimer = 0;
        }
        mario.bobOffset = Math.sin(mario.walkCycle) * 2;
    } else {
        mario.bobOffset = lerp(mario.bobOffset, 0, 0.1);
        mario.walkCycle = 0;
    }
    
    // Squash and stretch recovery
    mario.jumpSquash = lerp(mario.jumpSquash, 1, 0.2);
    mario.landingSquash = lerp(mario.landingSquash, 1, 0.15);
    
    // Check if Mario falls
    if (mario.y > canvas.height) {
        takeDamage();
    }
    
    // Update camera with smooth following
    const targetCameraX = mario.x - canvas.width / 2;
    camera.x = lerp(camera.x, Math.max(0, targetCameraX), 0.1);
}

// Enhanced fireball with trails
function shootFireball() {
    if (fireballs.length < 2) {
        const fireball = {
            x: mario.x + (mario.direction > 0 ? mario.width : 0),
            y: mario.y + mario.height / 2,
            dx: mario.direction * 8,
            dy: -2,
            life: 100,
            trail: []
        };
        
        fireballs.push(fireball);
        sounds.fireball();
        
        // Muzzle flash effect
        createParticles(fireball.x, fireball.y, '#FF4500', 5, 'spark');
    }
}

// Update fireballs with enhanced effects
function updateFireballs() {
    for (let i = fireballs.length - 1; i >= 0; i--) {
        const fireball = fireballs[i];
        
        // Add to trail
        fireball.trail.push({ x: fireball.x, y: fireball.y, life: 10 });
        if (fireball.trail.length > 8) {
            fireball.trail.shift();
        }
        
        // Update trail
        for (let j = fireball.trail.length - 1; j >= 0; j--) {
            fireball.trail[j].life--;
            if (fireball.trail[j].life <= 0) {
                fireball.trail.splice(j, 1);
            }
        }
        
        fireball.x += fireball.dx;
        fireball.y += fireball.dy;
        fireball.dy += 0.3;
        fireball.life--;
        
        if (fireball.life <= 0 || fireball.y > canvas.height) {
            fireballs.splice(i, 1);
            continue;
        }
        
        // Check collision with enemies
        for (let enemy of enemies) {
            if (enemy.alive && checkCollision(fireball, enemy)) {
                enemy.alive = false;
                score += 200;
                createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FF4500', 8, 'explosion');
                createFloatingText(enemy.x, enemy.y - 20, '+200', '#FF4500');
                sounds.enemyDefeat();
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}

// Enhanced enemy updates with animations
function updateEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        
        // Animation
        enemy.animTimer++;
        if (enemy.animTimer > 15) {
            enemy.animFrame = (enemy.animFrame + 1) % 2;
            enemy.animTimer = 0;
        }
        
        // Move enemy
        enemy.x += enemy.dx;
        
        // Platform collision
        let onPlatform = false;
        for (let platform of platforms) {
            if (checkCollision(enemy, platform)) {
                if (enemy.y < platform.y) {
                    enemy.y = platform.y - enemy.height;
                    onPlatform = true;
                }
            }
        }
        
        if (!onPlatform) {
            enemy.dx = -enemy.dx;
        }
        
        // Mario collision
        if (enemy.alive && checkCollision(mario, enemy) && !mario.invulnerable) {
            if (mario.dy > 0 && mario.y < enemy.y) {
                if (enemy.type === 'koopa' && !enemy.shell) {
                    enemy.shell = true;
                    enemy.dx = 0;
                    createFloatingText(enemy.x, enemy.y - 20, 'SHELL!', '#00FF00');
                } else {
                    enemy.alive = false;
                    createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#8B4513', 6);
                    createFloatingText(enemy.x, enemy.y - 20, '+100', '#FFD700');
                }
                mario.dy = JUMP_FORCE / 2;
                score += 100;
                sounds.enemyDefeat();
            } else {
                takeDamage();
            }
        }
    }
}

// Enhanced power-up updates
function updatePowerUps() {
    for (let powerUp of powerUps) {
        if (powerUp.collected) continue;
        
        // Floating animation
        powerUp.bobOffset = Math.sin(gameTime * 0.1) * 3;
        powerUp.glowIntensity = (Math.sin(gameTime * 0.2) + 1) * 0.5;
        
        if (checkCollision(mario, { x: powerUp.x, y: powerUp.y + powerUp.bobOffset, width: 16, height: 16 })) {
            powerUp.collected = true;
            
            if (powerUp.type === 'mushroom') {
                if (mario.powerState === 'small') {
                    mario.powerState = 'big';
                    mario.height = 48;
                    mario.powerUpAnimation = 60;
                }
                score += 1000;
                createFloatingText(powerUp.x, powerUp.y - 30, '+1000', '#FF0000');
            } else if (powerUp.type === 'fireFlower') {
                mario.powerState = 'fire';
                mario.height = 48;
                mario.powerUpAnimation = 60;
                score += 1000;
                createFloatingText(powerUp.x, powerUp.y - 30, 'FIRE POWER!', '#FF4500');
            }
            
            createParticles(powerUp.x + 8, powerUp.y + 8, '#FFD700', 10, 'sparkle');
            sounds.powerUp();
        }
    }
}

// Enhanced coin updates
function updateCoins() {
    for (let coin of coins) {
        if (coin.collected) continue;
        
        // Floating and sparkling animation
        coin.bobOffset = Math.sin(gameTime * 0.15 + coin.x * 0.01) * 2;
        coin.sparkleTimer++;
        
        if (checkCollision(mario, { x: coin.x, y: coin.y + coin.bobOffset, width: 16, height: 16 })) {
            coin.collected = true;
            coinCount++;
            score += 50;
            
            createParticles(coin.x + 8, coin.y + 8, '#FFD700', 6, 'sparkle');
            createFloatingText(coin.x, coin.y - 20, '+50', '#FFD700');
            sounds.coin();
            
            if (coinCount % 100 === 0) {
                lives++;
                createFloatingText(mario.x, mario.y - 40, '1UP!', '#00FF00');
            }
        }
    }
}

// Update particles with enhanced effects
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += 0.1;
        particle.life--;
        particle.rotation += particle.rotationSpeed;
        
        // Fade out
        particle.alpha = particle.life / particle.maxLife;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Update floating texts
function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const text = floatingTexts[i];
        text.y += text.dy;
        text.life--;
        text.alpha = text.life / 60;
        
        if (text.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

// Take damage with enhanced effects
function takeDamage() {
    if (mario.invulnerable) return;
    
    if (mario.powerState !== 'small') {
        mario.powerState = mario.powerState === 'fire' ? 'big' : 'small';
        mario.height = mario.powerState === 'small' ? 32 : 48;
        mario.invulnerable = true;
        mario.invulnerabilityTimer = 120;
        createParticles(mario.x + mario.width/2, mario.y + mario.height/2, '#FF0000', 8);
        sounds.hurt();
    } else {
        lives--;
        if (lives > 0) {
            resetMario();
            sounds.hurt();
        } else {
            gameRunning = false;
        }
    }
}

// Check level completion
function checkLevelComplete() {
    if (coins.every(coin => coin.collected)) {
        if (currentLevel < levels.length) {
            nextLevel();
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎉 YOU WIN! 🎉', canvas.width / 2, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
        }
    }
}

// Next level
function nextLevel() {
    currentLevel++;
    sounds.levelComplete();
    
    if (currentLevel <= levels.length) {
        platforms = [...levels[currentLevel - 1].platforms];
        enemies = [...levels[currentLevel - 1].enemies];
        coins = [...levels[currentLevel - 1].coins];
        powerUps = [...levels[currentLevel - 1].powerUps];
        
        mario.x = 100;
        mario.y = 200;
        camera.x = 0;
        
        // Level transition effect
        createParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 20, 'celebration');
    }
}

// Reset functions (same as before but with animation resets)
function resetMario() {
    mario.x = 100;
    mario.y = 200;
    mario.visualX = 100;
    mario.visualY = 200;
    mario.dx = 0;
    mario.dy = 0;
    mario.onGround = false;
    mario.powerState = 'small';
    mario.height = 32;
    mario.invulnerable = true;
    mario.invulnerabilityTimer = 120;
    mario.animationState = 'idle';
    mario.bobOffset = 0;
    mario.walkCycle = 0;
    mario.jumpSquash = 1;
    mario.landingSquash = 1;
    camera.x = 0;
}

function resetGame() {
    score = 0;
    lives = 3;
    coinCount = 0;
    currentLevel = 1;
    gameRunning = true;
    gameTime = 0;
    
    platforms = [...levels[0].platforms];
    enemies = [...levels[0].enemies];
    coins = [...levels[0].coins];
    powerUps = [...levels[0].powerUps];
    
    fireballs.length = 0;
    particles.length = 0;
    floatingTexts.length = 0;
    
    resetMario();
}

// Enhanced drawing functions with smooth animations

function drawMario() {
    const flickering = mario.invulnerable && Math.floor(mario.invulnerabilityTimer / 5) % 2;
    if (flickering) return;
    
    // Power-up glow effect
    if (mario.powerUpAnimation > 0) {
        const glowSize = mario.powerUpAnimation * 0.5;
        ctx.shadowColor = mario.powerState === 'fire' ? '#FF4500' : '#FFD700';
        ctx.shadowBlur = glowSize;
    }
    
    // Mario colors based on power state
    let bodyColor = '#FF0000';
    let overallColor = '#0000FF';
    let skinColor = '#FFE4B5';
    
    if (mario.powerState === 'fire') {
        bodyColor = '#FF4500';
        overallColor = '#FFFFFF';
    }
    
    const x = mario.visualX - camera.x;
    const y = mario.visualY + mario.bobOffset;
    
    // Apply squash and stretch
    const scaleX = mario.direction * mario.jumpSquash;
    const scaleY = mario.landingSquash;
    const width = mario.width * Math.abs(scaleX);
    const height = mario.height * scaleY;
    
    ctx.save();
    
    // Flip sprite based on direction
    if (mario.direction < 0) {
        ctx.scale(-1, 1);
        ctx.translate(-x - width, 0);
    }
    
    // Body with animation
    ctx.fillStyle = bodyColor;
    if (mario.animationState === 'walking') {
        // Walking animation - slight body sway
        const sway = Math.sin(mario.walkCycle) * 2;
        ctx.fillRect(x + 8 + sway, y + 16, 16, height - 16);
    } else {
        ctx.fillRect(x + 8, y + 16, 16, height - 16);
    }
    
    // Overalls with detail
    ctx.fillStyle = overallColor;
    ctx.fillRect(x + 6, y + 20, 20, height - 24);
    
    // Overall straps
    ctx.fillStyle = overallColor;
    ctx.fillRect(x + 10, y + 18, 3, 8);
    ctx.fillRect(x + 19, y + 18, 3, 8);
    
    // Head with expression
    ctx.fillStyle = skinColor;
    if (mario.animationState === 'jumping') {
        // Excited expression when jumping
        ctx.fillRect(x + 8, y + 6, 16, 18);
    } else {
        ctx.fillRect(x + 8, y + 8, 16, 16);
    }
    
    // Hat with 'M' logo
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 4, y + 4, 24, 8);
    
    // 'M' logo on hat
    ctx.fillStyle = '#FFF';
    ctx.font = '8px Arial';
    ctx.fillText('M', x + 14, y + 10);
    
    // Eyes with animation
    ctx.fillStyle = '#000';
    if (mario.animationState === 'walking') {
        // Blinking animation
        const blinkFrame = Math.floor(mario.walkCycle * 2) % 20;
        if (blinkFrame < 18) {
            ctx.fillRect(x + 10, y + 12, 2, 2);
            ctx.fillRect(x + 20, y + 12, 2, 2);
        } else {
            // Blink
            ctx.fillRect(x + 10, y + 13, 2, 1);
            ctx.fillRect(x + 20, y + 13, 2, 1);
        }
    } else {
        ctx.fillRect(x + 10, y + 12, 2, 2);
        ctx.fillRect(x + 20, y + 12, 2, 2);
    }
    
    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 12, y + 16, 8, 2);
    
    // Legs with walking animation
    ctx.fillStyle = overallColor;
    if (mario.animationState === 'walking') {
        const legOffset = Math.sin(mario.walkCycle) * 3;
        ctx.fillRect(x + 8 + legOffset, y + height - 8, 6, 8);
        ctx.fillRect(x + 18 - legOffset, y + height - 8, 6, 8);
    } else if (mario.animationState === 'jumping') {
        // Legs together when jumping
        ctx.fillRect(x + 10, y + height - 8, 12, 8);
    } else {
        // Standing position
        ctx.fillRect(x + 8, y + height - 8, 6, 8);
        ctx.fillRect(x + 18, y + height - 8, 6, 8);
    }
    
    // Shoes
    ctx.fillStyle = '#8B4513';
    if (mario.animationState === 'walking') {
        const shoeOffset = Math.sin(mario.walkCycle) * 2;
        ctx.fillRect(x + 6 + shoeOffset, y + height - 4, 8, 4);
        ctx.fillRect(x + 18 - shoeOffset, y + height - 4, 8, 4);
    } else {
        ctx.fillRect(x + 6, y + height - 4, 8, 4);
        ctx.fillRect(x + 18, y + height - 4, 8, 4);
    }
    
    ctx.restore();
    ctx.shadowBlur = 0;
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        
        const x = enemy.x - camera.x;
        const y = enemy.y;
        
        if (enemy.type === 'goomba') {
            // Animated Goomba
            ctx.fillStyle = '#8B4513';
            
            // Body with walking animation
            const bodyWidth = enemy.animFrame === 0 ? 24 : 22;
            const bodyHeight = enemy.animFrame === 0 ? 24 : 26;
            ctx.fillRect(x + (24 - bodyWidth) / 2, y + (24 - bodyHeight), bodyWidth, bodyHeight);
            
            // Face
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x + 4, y + 4, 16, 12);
            
            // Eyes with animation
            ctx.fillStyle = '#000';
            const eyeY = y + 6 + (enemy.animFrame === 0 ? 0 : 1);
            ctx.fillRect(x + 6, eyeY, 2, 2);
            ctx.fillRect(x + 16, eyeY, 2, 2);
            
            // Angry eyebrows
            ctx.fillRect(x + 5, y + 4, 4, 1);
            ctx.fillRect(x + 15, y + 4, 4, 1);
            
            // Frown
            ctx.fillRect(x + 8, y + 12, 8, 2);
            
            // Feet animation
            if (enemy.dx !== 0) {
                const footOffset = enemy.animFrame === 0 ? 1 : -1;
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 2 + footOffset, y + 20, 4, 4);
                ctx.fillRect(x + 18 - footOffset, y + 20, 4, 4);
            }
            
        } else if (enemy.type === 'koopa') {
            if (enemy.shell) {
                // Animated shell
                ctx.fillStyle = '#00FF00';
                const shellBob = Math.sin(gameTime * 0.3) * 1;
                ctx.fillRect(x, y + 8 + shellBob, enemy.width, enemy.height - 8);
                
                // Shell pattern
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 2, y + 10 + shellBob, enemy.width - 4, enemy.height - 12);
                
                // Shell segments
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#32CD32' : '#228B22';
                    ctx.fillRect(x + 4, y + 12 + i * 3 + shellBob, enemy.width - 8, 2);
                }
            } else {
                // Normal Koopa with animation
                ctx.fillStyle = '#00FF00';
                const bodyBob = Math.sin(gameTime * 0.2 + enemy.x * 0.01) * 1;
                ctx.fillRect(x, y + bodyBob, enemy.width, enemy.height);
                
                // Shell pattern
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 4, y + 4 + bodyBob, 16, 12);
                
                // Head
                ctx.fillStyle = '#FFFF00';
                const headBob = Math.sin(gameTime * 0.25 + enemy.x * 0.01) * 0.5;
                ctx.fillRect(x + 8, y - 4 + headBob, 8, 8);
                
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 9, y - 2 + headBob, 1, 1);
                ctx.fillRect(x + 14, y - 2 + headBob, 1, 1);
                
                // Beak
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 11, y + 1 + headBob, 2, 1);
            }
        }
    }
}

function drawFireballs() {
    for (let fireball of fireballs) {
        const x = fireball.x - camera.x;
        const y = fireball.y;
        
        // Draw trail
        for (let i = 0; i < fireball.trail.length; i++) {
            const trail = fireball.trail[i];
            const alpha = trail.life / 10;
            const size = 2 + (alpha * 2);
            
            ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(trail.x - camera.x, trail.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main fireball with animation
        const pulseSize = 4 + Math.sin(gameTime * 0.5) * 1;
        
        // Outer glow
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot center
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function drawPowerUps() {
    for (let powerUp of powerUps) {
        if (powerUp.collected) continue;
        
        const x = powerUp.x - camera.x;
        const y = powerUp.y + powerUp.bobOffset;
        
        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 5 + powerUp.glowIntensity * 10;
        
        if (powerUp.type === 'mushroom') {
            // Animated mushroom
            const capHeight = 8 + Math.sin(gameTime * 0.1) * 1;
            
            // Cap
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x, y, 16, capHeight);
            
            // White spots with animation
            ctx.fillStyle = '#FFFFFF';
            const spotSize = 2 + Math.sin(gameTime * 0.2) * 0.5;
            ctx.fillRect(x + 2, y + 2, spotSize, spotSize);
            ctx.fillRect(x + 8, y + 2, spotSize, spotSize);
            ctx.fillRect(x + 14, y + 2, spotSize * 0.8, spotSize * 0.8);
            ctx.fillRect(x + 5, y + 5, spotSize * 0.6, spotSize * 0.6);
            
            // Stem with slight sway
            const stemSway = Math.sin(gameTime * 0.15) * 0.5;
            ctx.fillStyle = '#FFE4B5';
            ctx.fillRect(x + 6 + stemSway, y + capHeight, 4, 8);
            
            // Stem highlight
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(x + 6 + stemSway, y + capHeight, 1, 8);
            
        } else if (powerUp.type === 'fireFlower') {
            // Animated fire flower
            const petalSize = 4 + Math.sin(gameTime * 0.3) * 1;
            
            // Petals with rotation
            const rotation = gameTime * 0.1;
            ctx.save();
            ctx.translate(x + 8, y + 4);
            ctx.rotate(rotation);
            
            // Four petals
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate((Math.PI / 2) * i);
                
                // Petal gradient effect
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(-petalSize/2, -petalSize - 2, petalSize, petalSize);
                
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(-petalSize/2 + 1, -petalSize - 1, petalSize - 2, petalSize - 2);
                
                ctx.restore();
            }
            
            ctx.restore();
            
            // Center
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + 8, y + 4, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Stem
            const stemSway = Math.sin(gameTime * 0.2) * 0.8;
            ctx.fillStyle = '#228B22';
            ctx.fillRect(x + 7 + stemSway, y + 8, 2, 8);
            
            // Leaves
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(x + 4 + stemSway, y + 10, 3, 2);
            ctx.fillRect(x + 9 + stemSway, y + 12, 3, 2);
        }
    }
    ctx.shadowBlur = 0;
}

function drawCoins() {
    for (let coin of coins) {
        if (coin.collected) continue;
        
        const x = coin.x - camera.x + 8;
        const y = coin.y + 8 + coin.bobOffset;
        
        // Spinning animation
        const spinFrame = Math.floor(gameTime * 0.2) % 8;
        const width = [8, 7, 5, 3, 1, 3, 5, 7][spinFrame];
        
        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        
        // Main coin
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - width/2, y - 8, width, 16);
        
        // Inner shine
        if (width > 3) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x - width/2 + 1, y - 6, Math.max(1, width - 2), 2);
            ctx.fillRect(x - width/2 + 1, y + 2, Math.max(1, width - 2), 2);
        }
        
        // Sparkle effects
        if (coin.sparkleTimer % 30 === 0) {
            createParticles(coin.x + 8, coin.y + 8, '#FFD700', 2, 'sparkle');
        }
    }
    ctx.shadowBlur = 0;
}

function drawParticles() {
    for (let particle of particles) {
        const alpha = particle.alpha;
        ctx.save();
        
        if (particle.type === 'sparkle') {
            // Sparkle particles
            ctx.translate(particle.x - camera.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.fillRect(-particle.size/4, -particle.size, particle.size/2, particle.size * 2);
        } else if (particle.type === 'explosion') {
            // Explosion particles
            ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(particle.x - camera.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Default particles
            ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(particle.x - camera.x, particle.y, particle.size, particle.size);
        }
        
        ctx.restore();
    }
}

function drawFloatingTexts() {
    for (let text of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = text.alpha;
        ctx.fillStyle = text.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(text.text, text.x - camera.x, text.y);
        ctx.fillText(text.text, text.x - camera.x, text.y);
        ctx.restore();
    }
}

function drawPlatforms() {
    for (let platform of platforms) {
        const x = platform.x - camera.x;
        const y = platform.y;
        
        // Main platform
        ctx.fillStyle = platform.color;
        ctx.fillRect(x, y, platform.width, platform.height);
        
        // Top highlight
        ctx.fillStyle = platform.color === '#8B4513' ? '#A0522D' : '#32CD32';
        ctx.fillRect(x, y, platform.width, 3);
        
        // Side shadows
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + platform.width - 2, y, 2, platform.height);
        ctx.fillRect(x, y + platform.height - 2, platform.width, 2);
        
        // Brick pattern for ground platforms
        if (platform.height > 30) {
            ctx.fillStyle = '#A0522D';
            for (let i = 0; i < platform.width; i += 20) {
                for (let j = 10; j < platform.height; j += 10) {
                    const brickX = x + i + (j % 20 === 10 ? 10 : 0);
                    ctx.fillRect(brickX, y + j, 18, 8);
                    
                    // Brick highlights
                    ctx.fillStyle = '#CD853F';
                    ctx.fillRect(brickX, y + j, 18, 1);
                    ctx.fillRect(brickX, y + j, 1, 8);
                    ctx.fillStyle = '#A0522D';
                }
            }
        }
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 10; i++) {
        let cloudX = (i * 120 + 80) - camera.x * 0.2; // Parallax
        let cloudY = 40 + Math.sin(i + gameTime * 0.01) * 15;
        let cloudSize = 15 + Math.sin(i * 2) * 5;
        
        // Cloud shadow
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(cloudX + 2, cloudY + 2, cloudSize, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize + 2, cloudY + 2, cloudSize * 1.3, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize * 2 + 2, cloudY + 2, cloudSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Main cloud
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize, cloudY, cloudSize * 1.3, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize * 2, cloudY, cloudSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('coinCount').textContent = coinCount;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('powerStatus').textContent = 
        mario.powerState === 'small' ? 'Small' :
        mario.powerState === 'big' ? 'Super' : 'Fire';
}

// Enhanced main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        // Update all game systems
        updateMario();
        updateEnemies();
        updateCoins();
        updatePowerUps();
        updateFireballs();
        updateParticles();
        updateFloatingTexts();
        checkLevelComplete();
        
        // Draw everything in proper order
        drawClouds();
        drawPlatforms();
        drawCoins();
        drawPowerUps();
        drawEnemies();
        drawFireballs();
        drawMario();
        drawParticles();
        drawFloatingTexts();
        drawUI();
    } else {
        // Enhanced game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF0000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
        
        ctx.fillStyle = '#FFF';
        ctx.strokeText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);
        
        if (keys['KeyR']) {
            resetGame();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the enhanced game
gameLoop();
