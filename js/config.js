const GAME_CONFIG = {
    easy: {
        sequenceLength: 4,
        displayTime: 1500, // 毫秒
        numberRange: { min: 1, max: 6 },
        gridSize: { rows: 2, cols: 3 },
        baseScore: 5,
        streakMultiplier: 1.2,
        gameTime: 60 // 秒
    },
    medium: {
        sequenceLength: 6,
        displayTime: 1000,
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 10,
        streakMultiplier: 1.5,
        gameTime: 60
    },
    hard: {
        sequenceLength: 9,
        displayTime: 800,
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 15,
        streakMultiplier: 2.0,
        gameTime: 60
    }
};

// 音效配置
const SOUND_CONFIG = {
    numberDisplay: 'path/to/sound/display.mp3',
    correct: 'path/to/sound/correct.mp3',
    wrong: 'path/to/sound/wrong.mp3',
    levelComplete: 'path/to/sound/complete.mp3',
    newRecord: 'path/to/sound/record.mp3'
};

// 动画配置
const ANIMATION_CONFIG = {
    highlightDuration: 300,
    transitionDuration: 300
}; 