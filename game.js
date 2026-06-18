const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let highScore = 0; 
let isGameOver = false;

// Animation properties
let deathAnimationTimer = 0;
let playerRotation = 0;

// 1. Load Game Images
const originalPlayerImg = new Image();
originalPlayerImg.src = "yousufplayer.jpg"; // Your image with checkerboard background

const gameOverImg = new Image();
gameOverImg.src = "gopagop.jpg"; 

const bgImg = new Image();
bgImg.src = "gop.jpg"; 

// Create an off-screen canvas to automatically remove the checkerboard background
const transparentPlayerCanvas = document.createElement("canvas");
const tCtx = transparentPlayerCanvas.getContext("2d");
let playerImgReady = false;

originalPlayerImg.onload = function() {
    transparentPlayerCanvas.width = originalPlayerImg.width;
    transparentPlayerCanvas.height = originalPlayerImg.height;
    
    // Draw original image to our hidden canvas
    tCtx.drawImage(originalPlayerImg, 0, 0);
    
    // Get all pixel data of the image
    let imgData = tCtx.getImageData(0, 0, transparentPlayerCanvas.width, transparentPlayerCanvas.height);
    let data = imgData.data;
    
    // Scan every pixel and remove white/grey grid backgrounds
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];
        
        // If the pixel is near white or light grey (the checkerboard colors)
        if ((r > 190 && g > 190 && b > 190) || (r === g && g === b && r > 150)) {
            data[i + 3] = 0; // Make this pixel 100% transparent!
        }
    }
    
    // Put the cleaned up pixel data back
    tCtx.putImageData(imgData, 0, 0);
    playerImgReady = true;
};

// Player properties
let player = { 
    x: 50, 
    y: 140, 
    width: 65, 
    height: 60, 
    jumping: false, 
    yVelocity: 0 
};

// Obstacle properties
let obstacle = { 
    x: 400, 
    y: 170, 
    width: 20, 
    height: 30, 
    baseSpeed: 4,  
    speed: 4       
};

function jump() {
    if (isGameOver) {
        resetGame(); 
        return;
    }
    
    if (!player.jumping) {
        let jumpBoost = obstacle.speed > 8 ? -11 : -10;
        player.yVelocity = jumpBoost; 
        player.jumping = true;
    }
}

function resetGame() {
    if (score > highScore) {
        highScore = score;
    }
    
    score = 0;
    isGameOver = false;
    deathAnimationTimer = 0;
    playerRotation = 0;
    player.x = 50;
    player.y = 140;
    player.yVelocity = 0;
    player.jumping = false;
    
    obstacle.x = 400;
    obstacle.speed = obstacle.baseSpeed; 
}

// Main Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Background
    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!isGameOver) {
        player.yVelocity += 0.5; 
        player.y += player.yVelocity;

        if (player.y >= 140) {
            player.y = 140;
            player.jumping = false;
        }

        obstacle.x -= obstacle.speed;
        if (obstacle.x < -20) {
            obstacle.x = 400; 
            score += 1;       
            obstacle.speed = obstacle.baseSpeed + (score * 0.5); 
        }

        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            isGameOver = true; 
        }

    } else {
        if (deathAnimationTimer < 60) { 
            player.yVelocity += 0.3; 
            player.y += player.yVelocity;
            player.x -= 2;          
            playerRotation += 0.15; 
            deathAnimationTimer++;
        }
    }

    // 4. Draw Cleaned Player Image without background grid
    if (playerImgReady) {
        ctx.save(); 
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(playerRotation);
        ctx.drawImage(transparentPlayerCanvas, -player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore(); 
    }

    // 5. Draw Obstacle Box
    ctx.fillStyle = obstacle.speed > 8 ? "#FFFF00" : "white"; 
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // 6. Draw HUD Scores
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillStyle = "#E0E0E0";
    ctx.fillText("HI: " + (score > highScore ? score : highScore), 10, 38);

    // 7. Credits
    ctx.fillStyle = "#00FFCC"; 
    ctx.font = "bold 12px Arial";
    ctx.fillText("Request by Israk", 280, 20);
    ctx.shadowBlur = 0;

    // 8. Draw Game Over Overlay Screen
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (gameOverImg.complete) {
            ctx.drawImage(gameOverImg, 145, 10, 110, 110); 
        }

        ctx.fillStyle = "#FF3333";
        ctx.font = "bold 26px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 140);
        
        ctx.fillStyle = "#FFFF00"; 
        ctx.font = "italic bold 18px 'Courier New', monospace";
        ctx.fillText("meow gop gop", canvas.width / 2, 165);
        
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("Tap 'Jump' to Try Again | Score: " + score, canvas.width / 2, 188);
        
        ctx.textAlign = "left"; 
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
