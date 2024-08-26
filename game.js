const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const homeScreen = document.getElementById('homeScreen')

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Load sound effects
let bounceSound;
fetch('bounce.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        bounceSound = audioBuffer;
    });

// Function to play bounce sound
function playBounceSound() {
    if (bounceSound) {
        const source = audioContext.createBufferSource();
        source.buffer = bounceSound;
        source.connect(audioContext.destination);
        source.start();
    }
}

// Background music
const backgroundMusic = document.getElementById('backgroundMusic');

// Function to start background music
function startBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    }
}

// Paddles
const paddleWidth = 100
const paddleHeight = 10
let paddleSpeed = 8

const leftPaddle = { x: 10, y: 0, width: paddleHeight, height: paddleWidth, color: 'green' }
const rightPaddle = { x: 0, y: 0, width: paddleHeight, height: paddleWidth, color: 'yellow' }
const topPaddle = { x: 0, y: 10, width: paddleWidth, height: paddleHeight, color: 'blue' }
const bottomPaddle = { x: 0, y: 0, width: paddleWidth, height: paddleHeight, color: 'red' }

// Ball
const ball = {
    x: 0,
    y: 0,
    radius: 5,
    dx: 0,
    dy: 0,
    speed: 4
}

let score = 0
let timeLeft = 60
let gameOver = false
let highScore = localStorage.getItem('highScore') || 0

// Set canvas size to fullscreen
function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
    // Recalculate paddle positions after resize
    topPaddle.x = canvas.width / 2 - paddleWidth / 2
    bottomPaddle.x = canvas.width / 2 - paddleWidth / 2
    bottomPaddle.y = canvas.height - paddleHeight - 10
    leftPaddle.y = canvas.height / 2 - paddleWidth / 2
    rightPaddle.x = canvas.width - paddleHeight - 10
    rightPaddle.y = canvas.height / 2 - paddleWidth / 2
    // Recenter ball
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
}

// Call resizeCanvas initially and add event listener
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

// Keyboard input
const keys = {}

document.addEventListener('keydown', e => {
    keys[e.code] = true
    if (e.code === 'Enter' && gameOver) {
        showHomeScreen()
    }
})

document.addEventListener('keyup', e => {
    keys[e.code] = false
})

function resetGame(duration) {
    gameOver = false
    score = 0
    timeLeft = duration * 60 // Convert minutes to seconds
    paddleSpeed = 8
    ball.speed = 4
    resetBall()
    resizeCanvas()
    startBackgroundMusic()
}

function showHomeScreen() {
    homeScreen.style.display = 'flex'
    canvas.style.display = 'none'
}

function startGame(duration) {
    homeScreen.style.display = 'none'
    canvas.style.display = 'block'
    resetGame(duration)
    resetGame.lastDuration = duration // Store the last duration
    lastTime = 0 // Reset lastTime
    requestAnimationFrame(gameLoop)
}

function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

function drawBall() {
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()
}

function drawScore() {
    ctx.fillStyle = 'white'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    const minutes = Math.floor(timeLeft / 60)
    const seconds = Math.floor(timeLeft % 60)
    ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width / 2, 30)
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 60)
}

function movePaddles() {
    if (keys.ArrowLeft) {
        topPaddle.x = Math.max(0, topPaddle.x - paddleSpeed)
        bottomPaddle.x = Math.max(0, bottomPaddle.x - paddleSpeed)
    }
    if (keys.ArrowRight) {
        topPaddle.x = Math.min(canvas.width - paddleWidth, topPaddle.x + paddleSpeed)
        bottomPaddle.x = Math.min(canvas.width - paddleWidth, bottomPaddle.x + paddleSpeed)
    }
    if (keys.ArrowUp) {
        leftPaddle.y = Math.max(0, leftPaddle.y - paddleSpeed)
        rightPaddle.y = Math.max(0, rightPaddle.y - paddleSpeed)
    }
    if (keys.ArrowDown) {
        leftPaddle.y = Math.min(canvas.height - paddleWidth, leftPaddle.y + paddleSpeed)
        rightPaddle.y = Math.min(canvas.height - paddleWidth, rightPaddle.y + paddleSpeed)
    }
}

function moveBall() {
    ball.x += ball.dx
    ball.y += ball.dy

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx
        playBounceSound()
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy
        playBounceSound()
    }

    // Paddle collisions
    const allPaddles = [topPaddle, bottomPaddle, leftPaddle, rightPaddle]
    allPaddles.forEach(paddle => {
        if (
            ball.x + ball.radius > paddle.x &&
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height
        ) {
            if (paddle.width > paddle.height) {
                ball.dy = -ball.dy
            } else {
                ball.dx = -ball.dx
            }
            score++
            playBounceSound()
        }
    })
}

function resetBall() {
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    const angle = Math.random() * Math.PI * 2
    ball.dx = Math.cos(angle) * ball.speed
    ball.dy = Math.sin(angle) * ball.speed
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50)
    ctx.font = '24px Arial'
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2)
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30)
    ctx.fillText('Press Enter to return to home screen', canvas.width / 2, canvas.height / 2 + 70)
}

function updateTimer(deltaTime) {
    if (timeLeft > 0) {
        timeLeft -= deltaTime / 1000; // Convert milliseconds to seconds
        if (timeLeft < 0) timeLeft = 0;

        // Increase speed as time runs out
        const totalGameTime = resetGame.lastDuration * 60;
        const speedMultiplier = 1 + (totalGameTime - timeLeft) / totalGameTime;
        paddleSpeed = 8 * speedMultiplier;
        ball.speed = 4 * speedMultiplier;
        ball.dx = Math.sign(ball.dx) * ball.speed;
        ball.dy = Math.sign(ball.dy) * ball.speed;
    } else {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
    }
}

function gameLoop(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        drawGameOver();
    } else {
        [topPaddle, bottomPaddle, leftPaddle, rightPaddle].forEach(drawPaddle);
        drawBall();
        drawScore();

        movePaddles();
        moveBall();

        updateTimer(deltaTime);
        requestAnimationFrame(gameLoop);
    }
}

// Start with the home screen
showHomeScreen()