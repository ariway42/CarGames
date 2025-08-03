const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over");
const finalScoreText = document.getElementById("final-score");
const newGameBtn = document.getElementById("new-game-btn");
// Audio
const bgMusic = new Audio("img/backsound.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

let score = 0;
let spawnInterval;
let isGameOver = false;

const laneCount = 5;
let playerPositionX = 2;  // Horizontal posisi jalur (0-4)
let playerPositionY = 0;  // Vertikal posisi, 0 = paling bawah, 4 = paling atas

let activeEnemies = [];
let activeDecorations = [];

function getLaneLeftPercent(laneIndex) {
    return `calc(${(100 / laneCount) * laneIndex}% + 3%)`;
}

function getLaneBottomPercent(laneIndex) {
    const baseBottomPx = 5;
    const stepPercent = 14;
    return `${baseBottomPx + playerPositionY * stepPercent}%`;
}

document.addEventListener("keydown", (e) => {
    if (isGameOver) return;

    switch (e.key) {
        case "ArrowLeft":
            if (playerPositionX > 0) playerPositionX--;
            break;
        case "ArrowRight":
            if (playerPositionX < laneCount - 1) playerPositionX++;
            break;
        case "ArrowUp":
            if (playerPositionY < laneCount - 1) playerPositionY++;
            break;
        case "ArrowDown":
            if (playerPositionY > 0) playerPositionY--;
            break;
    }

    player.style.left = getLaneLeftPercent(playerPositionX);
    player.style.bottom = getLaneBottomPercent(playerPositionY);
});

document.querySelectorAll("#controller .arrow").forEach(btn => {
    btn.addEventListener("touchstart", () => handleControl(btn.dataset.dir));
    btn.addEventListener("mousedown", () => handleControl(btn.dataset.dir));
});

function handleControl(direction) {
    if (isGameOver) return;

    switch (direction) {
        case "left":
            if (playerPositionX > 0) playerPositionX--;
            break;
        case "right":
            if (playerPositionX < laneCount - 1) playerPositionX++;
            break;
        case "up":
            if (playerPositionY < laneCount - 1) playerPositionY++;
            break;
        case "down":
            if (playerPositionY > 0) playerPositionY--;
            break;
    }

    player.style.left = getLaneLeftPercent(playerPositionX);
    player.style.bottom = getLaneBottomPercent(playerPositionY);
}

function checkCollision(enemy) {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    const isOverlap =
        playerRect.left < enemyRect.right &&
        playerRect.right > enemyRect.left &&
        playerRect.top < enemyRect.bottom &&
        playerRect.bottom > enemyRect.top;

    if (!isOverlap) return false;

    const overlapWidth = Math.min(playerRect.right, enemyRect.right) - Math.max(playerRect.left, enemyRect.left);
    const overlapHeight = Math.min(playerRect.bottom, enemyRect.bottom) - Math.max(playerRect.top, enemyRect.top);
    const overlapArea = overlapWidth * overlapHeight;

    const playerArea = playerRect.width * playerRect.height;

    return overlapArea >= playerArea * 0.1;
}

function spawnEnemy() {
    if (activeEnemies.length >= 3) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");

    let lane;
    let retry = 0;
    do {
        lane = Math.floor(Math.random() * laneCount);
        retry++;
    } while (activeEnemies.some(e => parseInt(e.dataset.lane) === lane) && retry < 10);

    enemy.style.left = getLaneLeftPercent(lane);
    enemy.dataset.lane = lane;
    enemy.style.transform = "translateY(-100px)";

    game.appendChild(enemy);
    activeEnemies.push(enemy);

    let posY = -100;
    const fallSpeed = Math.min(3 + score * 0.1, 10);

    function move() {
        if (isGameOver) {
            enemy.remove();
            activeEnemies = activeEnemies.filter(e => e !== enemy);
            return;
        }

        posY += fallSpeed;
        enemy.style.transform = `translateY(${posY}px)`;

        if (checkCollision(enemy)) {
            endGame();
            return;
        }

        if (posY > game.offsetHeight) {
            enemy.remove();
            activeEnemies = activeEnemies.filter(e => e !== enemy);
            score++;
            scoreDisplay.innerText = "Score: " + score;
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

function spawnEthosDecoration() {
    if (activeDecorations.length >= 3) return;

    const ethos = document.createElement("div");
    ethos.classList.add("decoration", "ethos-img");
    ethos.style.backgroundImage = "url('img/ETHOS.png')";

    const lane = Math.floor(Math.random() * laneCount);
    ethos.style.left = getLaneLeftPercent(lane);
    ethos.dataset.lane = lane;
    ethos.style.transform = "translateY(-100px)";

    game.appendChild(ethos);
    activeDecorations.push(ethos);

    let posY = -100;
    const fallSpeed = 2;

    function move() {
        if (isGameOver) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);
            return;
        }

        posY += fallSpeed;
        ethos.style.transform = `translateY(${posY}px)`;

        const playerRect = player.getBoundingClientRect();
        const ethosRect = ethos.getBoundingClientRect();

        const isOverlap =
            playerRect.left < ethosRect.right &&
            playerRect.right > ethosRect.left &&
            playerRect.top < ethosRect.bottom &&
            playerRect.bottom > ethosRect.top;

        if (isOverlap) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);

            score += 5;
            scoreDisplay.innerText = "Score: " + score;
            return;
        }

        if (posY > game.offsetHeight) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

function startGame() {
    score = 0;
    isGameOver = false;
    playerPositionX = 2;
    playerPositionY = 0;
    scoreDisplay.innerText = "Score: 0";
    player.style.left = getLaneLeftPercent(playerPositionX);
    player.style.bottom = getLaneBottomPercent(playerPositionY);
    gameOverScreen.classList.add("hidden");
    document.querySelectorAll(".enemy").forEach(e => e.remove());
    document.querySelectorAll(".decoration").forEach(e => e.remove());
    activeEnemies = [];
    activeDecorations = [];

    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {
        console.warn("Audio autoplay mungkin diblokir oleh browser.");
    });

    // Spawn musuh dan decoration langsung tanpa delay saat mulai
    const enemiesPerWave = Math.min(1 + Math.floor(score / 10), 3);
    for (let i = 0; i < enemiesPerWave; i++) {
        setTimeout(spawnEnemy, i * 250);
    }
    setTimeout(spawnEthosDecoration, Math.floor(Math.random() * 1200));

    // Lanjut spawn terus setiap 1200ms
    spawnInterval = setInterval(() => {
        const enemiesPerWave = Math.min(1 + Math.floor(score / 10), 3);
        for (let i = 0; i < enemiesPerWave; i++) {
            setTimeout(spawnEnemy, i * 250);
        }
        setTimeout(spawnEthosDecoration, Math.floor(Math.random() * 1200));
    }, 1200);
}


function endGame() {
    isGameOver = true;
    clearInterval(spawnInterval);
    finalScoreText.innerText = `Final Score: ${score}`;
    gameOverScreen.classList.remove("hidden");
    newGameBtn.classList.remove("hidden");
    bgMusic.pause();
}

newGameBtn.addEventListener("click", () => {
    newGameBtn.classList.add("hidden");
    startGame();
});

window.onload = startGame;

// Pastikan backsound bisa dimulai setelah interaksi pertama
window.addEventListener("click", () => {
    if (!isGameOver && bgMusic.paused) {
        bgMusic.play().catch(() => {
            console.warn("Audio tidak bisa diputar otomatis.");
        });
    }
}, { once: true });

// Tambahan: deteksi key juga untuk mulai musik
window.addEventListener("keydown", () => {
    if (!isGameOver && bgMusic.paused) {
        bgMusic.play().catch(() => {
            console.warn("Audio tidak bisa diputar otomatis.");
        });
    }
}, { once: true });
