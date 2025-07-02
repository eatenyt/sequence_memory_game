// 全局游戏实例
let game = null;

// 全局函数 - 必须定义在window对象上才能从HTML中直接调用
window.startGame = function(difficulty) {
    game.startGame(difficulty);
};

window.showInstructions = function() {
    game.showInstructions();
};

window.backToHome = function() {
    console.log("返回首页被调用");
    game.backToHome();
};

// 当文档加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM加载完成，初始化游戏");
    
    // 创建游戏实例
    game = new SequenceGame();
    
    // 确保按钮在全局可访问
    window.startGame = () => game.startGame();
    window.showInstructions = () => game.showInstructions();
    window.backToHome = () => game.backToHome();
    
    // 添加全局事件监听器
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', backToHome);
    });
});

class SequenceGame {
    constructor() {
        this.currentDifficulty = null;
        this.sequence = [];
        this.playerSequence = [];
        this.isPlaying = false;
        this.score = 0;
        this.streak = 0;
        this.correctMoves = 0;
        this.totalMoves = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.round = 1;
        
        // 最佳记录
        this.bestScores = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        this.loadBestScores();
        this.init();
    }

    // 初始化游戏
    init() {
        // 绑定按钮事件
        document.getElementById('easyButton').addEventListener('click', () => this.startGame('easy'));
        document.getElementById('mediumButton').addEventListener('click', () => this.startGame('medium'));
        document.getElementById('hardButton').addEventListener('click', () => this.startGame('hard'));
        document.getElementById('instructionsButton').addEventListener('click', () => this.showInstructions());
        
        // 显示主页
        this.showPage('homePage');
    }

    // 显示指定页面
    showPage(pageId) {
        console.log("切换到页面:", pageId);
        
        // 隐藏所有页面
        document.getElementById('homePage').style.display = 'none';
        document.getElementById('gamePage').style.display = 'none';
        document.getElementById('instructionsPage').style.display = 'none';
        
        // 显示指定页面
        document.getElementById(pageId).style.display = 'block';
    }

    // 清理游戏状态
    cleanupGame() {
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 重置游戏状态
        this.isPlaying = false;
        this.sequence = [];
        this.playerSequence = [];
        this.timeLeft = 0;
        
        // 重置显示
        document.getElementById('timer').textContent = '60';
        document.getElementById('score').textContent = '0';
        document.getElementById('streak').textContent = '0';
        document.getElementById('accuracy').textContent = '0%';
        
        // 启用开始按钮
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.disabled = false;
        }
    }

    // 开始游戏
    startGame(difficulty = 'easy') {
        this.currentDifficulty = difficulty;
        this.score = 0;
        this.streak = 0;
        this.round = 1;
        this.isPlaying = false;
        this.updateUI();
        
        // 设置游戏网格
        this.setupGrid();
        
        // 显示游戏页面
        this.showPage('gamePage');
        
        // 重置计时器
        this.timeLeft = GAME_CONFIG[this.currentDifficulty].gameTime;
        this.updateTimerDisplay();
        
        // 绑定开始按钮事件
        document.getElementById('startButton').addEventListener('click', () => this.startRound());
    }

    // 设置游戏网格
    setupGrid() {
        const config = GAME_CONFIG[this.currentDifficulty];
        const grid = document.getElementById('gameGrid');
        
        // 清空网格
        grid.innerHTML = '';
        
        // 设置网格列数
        grid.style.gridTemplateColumns = `repeat(${config.gridSize.cols}, 1fr)`;
        
        // 生成随机数字
        const numbers = this.generateNumbers(config.numberRange.min, config.numberRange.max);
        
        // 创建单元格
        for (let i = 0; i < config.gridSize.rows * config.gridSize.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = numbers[i % numbers.length];
            cell.addEventListener('click', () => this.handleNumberClick(parseInt(cell.textContent)));
            grid.appendChild(cell);
        }
        
        console.log("Grid setup complete with", config.gridSize.rows * config.gridSize.cols, "cells");
    }

    // 生成随机数字序列
    generateNumbers(min, max) {
        const numbers = [];
        for (let i = min; i <= max; i++) {
            numbers.push(i);
        }
        return this.shuffleArray(numbers);
    }

    // 打乱数组顺序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 生成游戏序列
    generateSequence() {
        const config = GAME_CONFIG[this.currentDifficulty];
        this.sequence = [];
        const numbers = this.generateNumbers(config.numberRange.min, config.numberRange.max);
        for (let i = 0; i < config.sequenceLength; i++) {
            this.sequence.push(numbers[i % numbers.length]);
        }
    }

    // 显示序列
    async showSequence() {
        // 在展示序列期间禁用点击
        this.disableGridClicks();
        
        const config = GAME_CONFIG[this.currentDifficulty];
        const sequenceInterval = 300; // 数字间隔时间：300ms
        
        for (let i = 0; i < this.sequence.length; i++) {
            const number = this.sequence[i];
            await this.highlightNumber(number);
            await this.sleep(sequenceInterval);
        }
        
        // 展示完毕后启用点击
        this.enableGridClicks();
    }

    // 禁用网格点击
    disableGridClicks() {
        const grid = document.getElementById('gameGrid');
        grid.classList.add('disabled');
    }
    
    // 启用网格点击
    enableGridClicks() {
        const grid = document.getElementById('gameGrid');
        grid.classList.remove('disabled');
    }

    // 处理数字点击
    handleNumberClick(number) {
        // 如果游戏未开始或网格被禁用，则忽略点击
        if (!this.isPlaying || document.getElementById('gameGrid').classList.contains('disabled')) return;

        this.playerSequence.push(number);
        this.totalMoves++;

        const currentIndex = this.playerSequence.length - 1;
        const isCorrect = number === this.sequence[currentIndex];

        this.showFeedback(number, isCorrect);

        if (!isCorrect) {
            // 如果点击错误，重置连击并开始下一轮
            this.streak = 0;
            setTimeout(() => {
                this.isPlaying = false;
                this.startRound();
            }, 1000);
            return;
        }

        // 增加正确移动计数
        this.correctMoves++;
        this.updateUI();

        // 检查是否完成当前序列
        if (this.playerSequence.length === this.sequence.length) {
            this.streak++;
            this.score += Math.floor(GAME_CONFIG[this.currentDifficulty].baseScore * 
                this.calculateStreakMultiplier());
            this.updateUI();
            
            // 自动开始下一轮
            setTimeout(() => {
                this.isPlaying = false;
                this.startRound();
            }, 1000);
        }
    }

    // 显示反馈
    showFeedback(number, isCorrect) {
        const cells = document.querySelectorAll('.number-cell');
        const cell = Array.from(cells).find(cell => 
            cell.textContent === number.toString());

        cell.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            cell.classList.remove('correct', 'wrong');
        }, ANIMATION_CONFIG.highlightDuration);
    }

    // 计算连击倍率
    calculateStreakMultiplier() {
        return Math.pow(GAME_CONFIG[this.currentDifficulty].streakMultiplier, 
            Math.floor(this.streak / 3));
    }

    // 启动计时器
    startTimer() {
        this.timeLeft = GAME_CONFIG[this.currentDifficulty].gameTime;
        this.updateTimerDisplay();
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleGameOver();
            }
        }, 1000);
    }

    // 更新计时器显示
    updateTimerDisplay() {
        document.getElementById('timer').textContent = this.timeLeft;
    }

    // 返回主页
    backToHome() {
        console.log("游戏类的backToHome方法被调用");
        
        // 清理游戏状态
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 重置游戏状态
        this.isPlaying = false;
        this.sequence = [];
        this.playerSequence = [];
        this.timeLeft = 0;
        
        // 重置显示
        document.getElementById('timer').textContent = '60';
        document.getElementById('score').textContent = '0';
        document.getElementById('streak').textContent = '0';
        
        // 重置开始按钮显示
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'block';
        }
        
        // 显示主页
        this.showPage('homePage');
    }

    // 显示游戏说明
    showInstructions() {
        this.showPage('instructionsPage');
    }

    // 更新界面
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
    }

    // 加载最高分
    loadBestScores() {
        const saved = localStorage.getItem('bestScores');
        if (saved) {
            this.bestScores = JSON.parse(saved);
        }
    }

    // 保存最高分
    saveBestScores() {
        localStorage.setItem('bestScores', JSON.stringify(this.bestScores));
    }

    // 处理游戏结束
    handleGameOver() {
        clearInterval(this.timer);
        this.timer = null;
        this.isPlaying = false;
        
        // 保存最高分
        if (this.score > this.bestScores[this.currentDifficulty]) {
            this.bestScores[this.currentDifficulty] = this.score;
            this.saveBestScores();
        }
        
        // 显示游戏结束弹窗，让用户选择
        Swal.fire({
            title: '游戏结束',
            html: `
                <div class="game-over-stats">
                    <p>最终得分: ${this.score}</p>
                    <p>最大连击: ${this.streak}</p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: '再玩一次',
            cancelButtonText: '返回首页'
        }).then((result) => {
            if (result.isConfirmed) {
                // 用户选择再玩一次
                this.startGame(this.currentDifficulty);
                // 重置开始按钮显示
                document.getElementById('startButton').style.display = 'block';
            } else {
                // 用户选择返回首页
                this.backToHome();
            }
        });
    }

    // 高亮显示数字
    async highlightNumber(number) {
        const cells = document.querySelectorAll('.number-cell');
        const cell = Array.from(cells).find(cell => 
            cell.textContent === number.toString());
        
        if (cell) {
            cell.classList.add('highlight');
            await this.sleep(GAME_CONFIG[this.currentDifficulty].displayTime);
            cell.classList.remove('highlight');
        }
    }
    
    // 等待指定时间
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 开始新一轮
    async startRound() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playerSequence = [];
            this.generateSequence();
            
            // 第一轮开始时启动计时器
            if (!this.timer) {
                this.startTimer();
            }
            
            // 隐藏开始按钮
            document.getElementById('startButton').style.display = 'none';
            await this.showSequence();
        }
    }
} 