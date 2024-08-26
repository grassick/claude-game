const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 50,
    color: 'blue',
    speed: 5
}

// Bullets
const bullets = []
const bulletSpeed = 7

// Enemies
const enemies = []
const enemyRows = 3
const enemiesPerRow = 8
const enemySpeed = 1

// Initialize enemies
for (let i = 0; i < enemyRows; i++) {
    for (let j = 0; j < enemiesPerRow; j++) {
        enemies.push({
            x: j * 70 + 50,
            y: i * 50 + 30,
            width: 40,
            height: 30,
            color: 'green',
            speed: enemySpeed
        })
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw and move player
    ctx.fillStyle = player.color
    ctx.fillRect(player.x, player.y, player.width, player.height)
    
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed
    if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += player.speed

    // Shoot bullets
    if (keys.Space && bullets.length < 5) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y,
            width: 5,
            height: 10,
            color: 'red'
        })
    }

    // Move and draw bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed
        ctx.fillStyle = bullet.color
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        // Remove bullets that are off screen
        if (bullet.y < 0) bullets.splice(index, 1)
    })

    // Move and draw enemies
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed
        ctx.fillStyle = enemy.color
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)

        // Check for collision with player
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            alert('Game Over!')
            location.reload()
        }

        // Check for collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemies.splice(index, 1)
                bullets.splice(bulletIndex, 1)
            }
        })

        // Reset enemy position if it reaches bottom
        if (enemy.y > canvas.height) {
            enemy.y = 0
        }
    })

    requestAnimationFrame(gameLoop)
}

// Keyboard input
const keys = {}

document.addEventListener('keydown', e => {
    keys[e.code] = true
})

document.addEventListener('keyup', e => {
    keys[e.code] = false
})

// Start the game
gameLoop()