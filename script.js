// Canvas and context setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;
const AI_SPEED = 4.5;

// Game objects
const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    speed: BALL_SPEED
};

// Game state
let gameRunning = false;
let keys = {};

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for paddle control
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move player paddle to mouse position smoothly
    const targetY = mouseY - PADDLE_HEIGHT / 2;
    const maxY = canvas.height - PADDLE_HEIGHT;
    
    player.y = Math.max(0, Math.min(targetY, maxY));
});

// Start button
startBtn.addEventListener('click', () => {
    gameRunning = !gameRunning;
    startBtn.textContent = gameRunning ? 'Pause' : 'Resume';
    if (gameRunning) {
        gameLoop();
    }
});

// Draw functions
function drawRect(x, y, width, height, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw net
    drawNet();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#4ade80');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#f87171');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#fbbf24');
}

// Update functions
function updatePlayer() {
    // Keyboard controls for arrow keys
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += PADDLE_SPEED;
    }
    
    // Keep player paddle within bounds
    player.y = Math.max(0, Math.min(player.y, canvas.height - PADDLE_HEIGHT));
}

function updateComputer() {
    // Simple AI: move computer paddle towards ball
    const computerCenter = computer.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    
    // Add some "imperfection" to AI by giving it a reaction zone
    if (ballCenter < computerCenter - 20) {
        computer.y -= AI_SPEED;
    } else if (ballCenter > computerCenter + 20) {
        computer.y += AI_SPEED;
    }
    
    // Keep computer paddle within bounds
    computer.y = Math.max(0, Math.min(computer.y, canvas.height - PADDLE_HEIGHT));
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
    }
    
    // Paddle collision (player)
    if (
        ball.x - ball.radius <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball moves right
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy += hitPos * 3;
    }
    
    // Paddle collision (computer)
    if (
        ball.x + ball.radius >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy += hitPos * 3;
    }
    
    // Scoring
    if (ball.x - ball.radius < 0) {
        computer.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }
    
    // Update score display
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    ball.dy = (Math.random() * 2 - 1) * BALL_SPEED;
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Update game state
    updatePlayer();
    updateComputer();
    updateBall();
    
    // Draw everything
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Initialize on page load
window.addEventListener('load', () => {
    drawGame();
});
