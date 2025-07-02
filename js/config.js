const GAME_CONFIG = {
    easy: {
        sequenceLength: 6,
        displayTime: 1500, // 毫秒
        numberRange: { min: 1, max: 6 },
        gridSize: { rows: 2, cols: 3 },
        baseScore: 5,
        streakMultiplier: 1.2,
        perfectBonus: 30,
        penaltyScore: 3,
        maxHints: 3,
        lives: 5
    },
    medium: {
        sequenceLength: 9,
        displayTime: 1000,
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 10,
        streakMultiplier: 1.5,
        perfectBonus: 50,
        penaltyScore: 5,
        maxHints: 3,
        lives: 3,
        effects: {
            shake: true
        }
    },
    hard: {
        sequenceLength: 12,
        displayTime: 800,
        numberRange: { min: 1, max: 9 },
        gridSize: { rows: 3, cols: 3 },
        baseScore: 15,
        streakMultiplier: 2.0,
        perfectBonus: 100,
        penaltyScore: 10,
        maxHints: 3,
        lives: 1,
        effects: {
            shake: true,
            flash: true,
            randomize: true
        }
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
    transitionDuration: 300,
    shakeIntensity: 3,
    flashDuration: 100
}; 