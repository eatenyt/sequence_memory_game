const GAME_CONFIG = {
    easy: {
        sequenceLength: 4,
        displayTime: 1000, // 1秒
        numberRange: { min: 1, max: 6 },
        gridSize: { rows: 2, cols: 3 },
        baseScore: 5,
        streakMultiplier: 1.2,
        gameTime: 60 // 秒
    },
    medium: {
        sequenceLength: 6,
        displayTime: 800, // 0.8秒
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 10,
        streakMultiplier: 1.5,
        gameTime: 60
    },
    hard: {
        sequenceLength: 9,
        displayTime: 600, // 0.6秒
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 15,
        streakMultiplier: 2.0,
        gameTime: 60
    }
};

// 音效配置
const SOUND_CONFIG = {
    // 数字展示音效
    displaySound: 'audio/display.mp3',
    // 点击成功音效
    correctSound: 'audio/correct.mp3',
    // 点击失败音效
    wrongSound: 'audio/wrong.mp3',
    // 游戏完成音效
    completeSound: 'audio/complete.mp3',
    // 游戏结束音效
    gameOverSound: 'audio/gameover.mp3',
    // 背景音乐
    backgroundMusic: 'audio/background_piano.mp3'
};

// 动画配置
const ANIMATION_CONFIG = {
    highlightDuration: 300,
    transitionDuration: 300
}; 