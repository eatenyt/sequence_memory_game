class SequenceGame {
    constructor() {
        this.currentDifficulty = 'easy';
        this.sequence = [];
        this.playerSequence = [];
        this.isPlaying = false;
        this.score = 0;
        this.streak = 0;
        this.hintsLeft = GAME_CONFIG.easy.maxHints;
        this.lives = GAME_CONFIG.easy.lives;
        this.correctMoves = 0;
        this.totalMoves = 0;
        
        // 最佳记录
        this.bestScores = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        this.loadBestScores();
    }

    // 初始化游戏
    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    // 设置事件监听
    setupEventListeners() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('hintButton').addEventListener('click', () => {
            this.showHint();
        });
    }

    // 设置难度
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.hintsLeft = GAME_CONFIG[difficulty].maxHints;
        this.lives = GAME_CONFIG[difficulty].lives;
        this.updateUI();
        this.setupGrid();
    }

    // 设置数字网格
    setupGrid() {
        const grid = document.getElementById('numberGrid');
        grid.innerHTML = '';
        grid.className = `number-grid ${this.currentDifficulty}`;

        const config = GAME_CONFIG[this.currentDifficulty];
        const numbers = this.generateNumbers(config.numberRange.min, config.numberRange.max);

        numbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = number;
            cell.addEventListener('click', () => this.handleNumberClick(number));
            grid.appendChild(cell);
        });
    }

    // 生成随机数字序列
    generateNumbers(min, max) {
        const numbers = [];
        for (let i = min; i <= max; i++) {
            numbers.push(i);
        }
        return numbers;
    }

    // 生成游戏序列
    generateSequence() {
        const config = GAME_CONFIG[this.currentDifficulty];
        this.sequence = [];
        for (let i = 0; i < config.sequenceLength; i++) {
            const randomNum = Math.floor(Math.random() * 
                (config.numberRange.max - config.numberRange.min + 1)) + 
                config.numberRange.min;
            this.sequence.push(randomNum);
        }
    }

    // 开始游戏
    async startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.playerSequence = [];
        this.generateSequence();
        
        document.getElementById('startButton').disabled = true;
        await this.showSequence();
        
        document.getElementById('hintButton').disabled = false;
        this.updateUI();
    }

    // 显示序列
    async showSequence() {
        const config = GAME_CONFIG[this.currentDifficulty];
        const cells = document.querySelectorAll('.number-cell');

        for (const number of this.sequence) {
            await new Promise(resolve => {
                const cell = Array.from(cells).find(cell => 
                    cell.textContent === number.toString());
                
                cell.classList.add('highlight');
                
                if (config.effects?.shake) {
                    cell.style.transform = `translate(${Math.random() * 
                        ANIMATION_CONFIG.shakeIntensity}px, ${Math.random() * 
                        ANIMATION_CONFIG.shakeIntensity}px)`;
                }

                setTimeout(() => {
                    cell.classList.remove('highlight');
                    cell.style.transform = '';
                    resolve();
                }, config.displayTime);
            });

            if (config.effects?.flash) {
                document.body.style.backgroundColor = '#fff';
                setTimeout(() => {
                    document.body.style.backgroundColor = '';
                }, ANIMATION_CONFIG.flashDuration);
            }

            await new Promise(resolve => 
                setTimeout(resolve, ANIMATION_CONFIG.transitionDuration));
        }
    }

    // 处理数字点击
    handleNumberClick(number) {
        if (!this.isPlaying) return;

        this.playerSequence.push(number);
        this.totalMoves++;

        const currentIndex = this.playerSequence.length - 1;
        const isCorrect = number === this.sequence[currentIndex];

        this.showFeedback(number, isCorrect);

        if (isCorrect) {
            this.correctMoves++;
            this.handleCorrectMove(currentIndex);
        } else {
            this.handleWrongMove();
        }

        this.updateUI();
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

    // 处理正确移动
    handleCorrectMove(currentIndex) {
        this.streak++;
        this.score += Math.floor(GAME_CONFIG[this.currentDifficulty].baseScore * 
            Math.pow(GAME_CONFIG[this.currentDifficulty].streakMultiplier, 
                Math.floor(this.streak / 3)));

        if (currentIndex === this.sequence.length - 1) {
            this.handleLevelComplete();
        }
    }

    // 处理错误移动
    handleWrongMove() {
        this.streak = 0;
        this.lives--;
        this.score = Math.max(0, this.score - 
            GAME_CONFIG[this.currentDifficulty].penaltyScore);

        if (this.lives <= 0) {
            this.handleGameOver();
        } else {
            Swal.fire({
                title: '错误!',
                text: `还剩 ${this.lives} 条命`,
                icon: 'error',
                confirmButtonText: '继续'
            });
        }
    }

    // 处理关卡完成
    handleLevelComplete() {
        const config = GAME_CONFIG[this.currentDifficulty];
        
        if (this.playerSequence.length === config.sequenceLength) {
            this.score += config.perfectBonus;
            
            if (this.score > this.bestScores[this.currentDifficulty]) {
                this.bestScores[this.currentDifficulty] = this.score;
                this.saveBestScores();
            }

            Swal.fire({
                title: '太棒了!',
                text: '完美通关!',
                icon: 'success',
                confirmButtonText: '继续'
            }).then(() => {
                this.isPlaying = false;
                this.playerSequence = [];
                document.getElementById('startButton').disabled = false;
                this.updateUI();
            });
        }
    }

    // 处理游戏结束
    handleGameOver() {
        this.isPlaying = false;
        document.getElementById('startButton').disabled = false;
        document.getElementById('hintButton').disabled = true;

        Swal.fire({
            title: '游戏结束',
            text: `最终得分: ${this.score}`,
            icon: 'info',
            confirmButtonText: '重新开始'
        }).then(() => {
            this.resetGame();
        });
    }

    // 显示提示
    showHint() {
        if (this.hintsLeft <= 0 || !this.isPlaying) return;

        const currentIndex = this.playerSequence.length;
        if (currentIndex < this.sequence.length) {
            const nextNumber = this.sequence[currentIndex];
            const cells = document.querySelectorAll('.number-cell');
            const cell = Array.from(cells).find(cell => 
                cell.textContent === nextNumber.toString());

            cell.classList.add('highlight');
            setTimeout(() => {
                cell.classList.remove('highlight');
            }, ANIMATION_CONFIG.highlightDuration);

            this.hintsLeft--;
            this.updateUI();
        }
    }

    // 重置游戏
    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.playerSequence = [];
        this.sequence = [];
        this.isPlaying = false;
        this.hintsLeft = GAME_CONFIG[this.currentDifficulty].maxHints;
        this.lives = GAME_CONFIG[this.currentDifficulty].lives;
        this.correctMoves = 0;
        this.totalMoves = 0;
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('level').textContent = 
            this.currentDifficulty.charAt(0).toUpperCase() + 
            this.currentDifficulty.slice(1);
        document.getElementById('hintButton').textContent = 
            `提示 (${this.hintsLeft})`;
        document.getElementById('bestScore').textContent = 
            this.bestScores[this.currentDifficulty];
        document.getElementById('accuracy').textContent = 
            `${this.totalMoves ? Math.round((this.correctMoves / this.totalMoves) * 100) : 0}%`;

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', 
                btn.dataset.difficulty === this.currentDifficulty);
        });
    }

    // 加载最佳分数
    loadBestScores() {
        const saved = localStorage.getItem('sequenceGameBestScores');
        if (saved) {
            this.bestScores = JSON.parse(saved);
        }
    }

    // 保存最佳分数
    saveBestScores() {
        localStorage.setItem('sequenceGameBestScores', 
            JSON.stringify(this.bestScores));
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SequenceGame();
    game.init();
}); 