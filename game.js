// 游戏配置
const config = {
  canvasWidth: 400,
  canvasHeight: 400,
  gridSize: 20,
  initialSpeed: 150,
  speedIncrement: 10,
  maxSpeed: 50,
  initialLength: 3,
  maxLives: 3,
  specialItemDuration: 5000 // 特殊效果持续时间
};

// Emoji配置
const emoji = {
  food: ['🎁', '🧧', '🧨', '🎊'],
  specialFood: '🥟',
  obstacle: '👹',
  snakeHead: '🐲',
  snakeBody: '🐍'
};

// 游戏状态
let gameState = {
  score: 0,
  level: 1,
  lives: config.maxLives,
  isPaused: false,
  isGameOver: false,
  specialEffect: null,
  effectEndTime: null
};

// 游戏元素
let snake = [];
let food = null;
let specialFood = null;
let obstacles = [];

// 初始化游戏
function initGame() {
  const canvas = document.getElementById('game-canvas');
  canvas.width = config.canvasWidth;
  canvas.height = config.canvasHeight;
  
  // 初始化蛇
  const startX = Math.floor(config.canvasWidth / config.gridSize / 2) * config.gridSize;
  const startY = Math.floor(config.canvasHeight / config.gridSize / 2) * config.gridSize;
  for (let i = 0; i < config.initialLength; i++) {
    snake.push({x: startX - i * config.gridSize, y: startY});
  }
  
  // 初始化食物
  spawnFood();
  
  // 初始化控制按钮
  initControls();
  
  // 开始游戏循环
  gameLoop();
}

// 初始化控制按钮
function initControls() {
  const controls = document.querySelector('.controls');
  controls.style.display = 'flex';
  controls.style.justifyContent = 'center';
  controls.style.gap = '10px';
  
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      changeDirection(button.dataset.direction);
    });
  });
}

// 改变方向
let currentDirection = 'right';
function changeDirection(newDirection) {
  if (gameState.isPaused || gameState.isGameOver) return;
  
  const oppositeDirections = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };
  
  if (newDirection !== oppositeDirections[currentDirection]) {
    currentDirection = newDirection;
  }
}

// 生成食物
function spawnFood() {
  const x = Math.floor(Math.random() * (config.canvasWidth / config.gridSize)) * config.gridSize;
  const y = Math.floor(Math.random() * (config.canvasHeight / config.gridSize)) * config.gridSize;
  
  // 检查是否与蛇身重叠
  if (snake.some(segment => segment.x === x && segment.y === y)) {
    return spawnFood();
  }
  
  food = {x, y};
}

// 游戏主循环
function gameLoop() {
  if (gameState.isGameOver || gameState.isPaused) {
    return;
  }
  
  update();
  draw();
  
  setTimeout(gameLoop, config.initialSpeed - (gameState.level - 1) * config.speedIncrement);
}

// 更新游戏状态
function update() {
  // 移动蛇
  const head = {...snake[0]};
  
  switch (currentDirection) {
    case 'up':
      head.y -= config.gridSize;
      break;
    case 'down':
      head.y += config.gridSize;
      break;
    case 'left':
      head.x -= config.gridSize;
      break;
    case 'right':
      head.x += config.gridSize;
      break;
  }
  
  // 检查碰撞
  if (checkCollision(head)) {
    handleCollision();
    return;
  }
  
  // 添加新头部
  snake.unshift(head);
  
  // 检查是否吃到食物
  if (head.x === food.x && head.y === food.y) {
    handleFoodCollision();
  } else {
    // 移除尾部
    snake.pop();
  }
  
  // 更新UI
  updateUI();
}

// 绘制游戏
function draw() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制网格线
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = 0.5;
  
  // 绘制垂直线
  for (let x = 0; x <= canvas.width; x += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // 绘制水平线
  for (let y = 0; y <= canvas.height; y += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // 绘制蛇
  ctx.font = `${config.gridSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  snake.forEach((segment, index) => {
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(
      index === 0 ? emoji.snakeHead : emoji.snakeBody,
      segment.x + config.gridSize / 2,
      segment.y + config.gridSize / 2
    );
  });
  
  // 绘制食物
  ctx.fillStyle = '#FF5252';
  const foodEmoji = emoji.food[Math.floor(Math.random() * emoji.food.length)];
  ctx.fillText(
    foodEmoji,
    food.x + config.gridSize / 2,
    food.y + config.gridSize / 2
  );
}

// 检查碰撞
function checkCollision(head) {
  // 边界碰撞
  if (head.x < 0 || head.x >= config.canvasWidth ||
      head.y < 0 || head.y >= config.canvasHeight) {
    return true;
  }
  
  // 自身碰撞
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

// 处理碰撞
function handleCollision() {
  gameState.lives--;
  if (gameState.lives > 0) {
    resetSnake();
  } else {
    gameOver();
  }
}

// 重置蛇
function resetSnake() {
  const startX = Math.floor(config.canvasWidth / config.gridSize / 2) * config.gridSize;
  const startY = Math.floor(config.canvasHeight / config.gridSize / 2) * config.gridSize;
  snake = [];
  for (let i = 0; i < config.initialLength; i++) {
    snake.push({x: startX - i * config.gridSize, y: startY});
  }
  currentDirection = 'right';
}

// 游戏结束
function gameOver() {
  gameState.isGameOver = true;
  showGameOverScreen();
}

// 显示游戏结束界面
function showGameOverScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="content">
      <h2>游戏结束</h2>
      <p>最终得分: ${gameState.score}</p>
      <button onclick="restartGame()">重新开始</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// 重新开始游戏
function restartGame() {
  const overlay = document.getElementById('game-over-overlay');
  if (overlay) overlay.remove();
  
  gameState = {
    score: 0,
    level: 1,
    lives: config.maxLives,
    isPaused: false,
    isGameOver: false,
    specialEffect: null,
    effectEndTime: null
  };
  
  resetSnake();
  spawnFood();
  gameLoop();
}

// 处理食物碰撞
function handleFoodCollision() {
  gameState.score += 10;
  spawnFood();
  
  // 每100分升一级
  if (gameState.score % 100 === 0) {
    gameState.level++;
  }
}

// 更新UI
function updateUI() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('level').textContent = gameState.level;
  document.getElementById('lives').textContent = gameState.lives;
}

// 暂停/继续游戏
function togglePause() {
  gameState.isPaused = !gameState.isPaused;
  if (!gameState.isPaused) {
    gameLoop();
  }
}

// 双击画布暂停
const canvas = document.getElementById('game-canvas');
canvas.addEventListener('dblclick', togglePause);

// 初始化游戏
initGame();
