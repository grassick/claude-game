const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

// Paddles
const paddleWidth = 100
const paddleHeight = 10
let paddleSpeed = 8

const topPaddle = { x: 0, y: 10, width: paddleWidth, height: paddleHeight, color: 'blue' }
const bottomPaddle = { x: 0, y: 0, width: paddleWidth, height: paddleHeight, color: 'red' }
const leftPaddle = { x: 10, y: 0, width: paddleHeight, height: paddleWidth, color: 'green' }
const rightPaddle = { x: 0, y: 0, width: paddleHeight, height: paddleWidth, color: 'yellow' }

// Ball
const ball = {
    x: 0,
    y: 0,
    radius: 5,
    dx: 0,
    dy: 0,
    speed: 4
}

// Set canvas size to fullscreen
function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
    // Recalculate paddle positions after resize
    topPaddle.x = bottomPaddle.x = canvas.width / 2 - paddleWidth / 2
    leftPaddle.y = rightPaddle.y = canvas.height / 2 - paddleWidth / 2
    bottomPaddle.y = canvas.height - 20
    rightPaddle.x = canvas.width - 20
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
        resetGame()
    }
})

document.addEventListener('keyup', e => {
    keys[e.code] = false
})

function resetGame() {
    gameOver = false
    score = 0
    timeLeft = 60
    paddleSpeed = 8
    ball.speed = 4
    resetBall()
    topPaddle.x = bottomPaddle.x = canvas.width / 2 - paddleWidth / 2
    leftPaddle.y = rightPaddle.y = canvas.height / 2 - paddleWidth / 2
}

// Start the game
resetGame()
setInterval(updateTimer, 1000)
gameLoop()

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
    ctx.fillText(`Time: ${timeLeft}`, canvas.width / 2, 30)
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
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy
    }

    // Paddle collisions
    if (ball.y - ball.radius < topPaddle.y + topPaddle.height && 
        ball.x > topPaddle.x && ball.x < topPaddle.x + topPaddle.width) {
        ball.dy = Math.abs(ball.dy)
        score++
    }
    if (ball.y + ball.radius > bottomPaddle.y && 
        ball.x > bottomPaddle.x && ball.x < bottomPaddle.x + bottomPaddle.width) {
        ball.dy = -Math.abs(ball.dy)
        score++
    }
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width && 
        ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height) {
        ball.dx = Math.abs(ball.dx)
        score++
    }
    if (ball.x + ball.radius > rightPaddle.x && 
        ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height) {
        ball.dx = -Math.abs(ball.dx)
        score++
    }
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
    ctx.fillText('Press Enter to restart', canvas.width / 2, canvas.height / 2 + 70)
}

function updateTimer() {
    timeLeft--
    if (timeLeft <= 0) {
        gameOver = true
        if (score > highScore) {
            highScore = score
            localStorage.setItem('highScore', highScore)
        }
    } else {
        // Increase speed as time runs out
        const speedMultiplier = 1 + (60 - timeLeft) / 60
        paddleSpeed = 8 * speedMultiplier
        ball.speed = 4 * speedMultiplier
        ball.dx = Math.sign(ball.dx) * ball.speed
        ball.dy = Math.sign(ball.dy) * ball.speed
    }
}

function gameLoop() {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (gameOver) {
        drawGameOver()
    } else {
        drawPaddle(topPaddle)
        drawPaddle(bottomPaddle)
        drawPaddle(leftPaddle)
        drawPaddle(rightPaddle)
        drawBall()
        drawScore()

        movePaddles()
        moveBall()
    }

    requestAnimationFrame(gameLoop)
}