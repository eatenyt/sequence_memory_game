// 音频上下文
let audioContext;
// 音频是否已初始化
let audioInitialized = false;
// 音效对象
let soundEffects = {};

// 初始化音频上下文
function initAudio() {
    try {
        // 创建音频上下文
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('音频上下文已初始化');
        
        // 加载音效
        loadSoundEffects();
        
        // 标记音频已初始化
        audioInitialized = true;
    } catch (e) {
        console.error('Web Audio API 不受支持:', e);
    }
}

// 加载音效
function loadSoundEffects() {
    // 定义音效文件
    const effects = {
        correct: 'audio/correct.mp3',
        wrong: 'audio/wrong.mp3',
        display: 'audio/display.mp3',
        complete: 'audio/complete.mp3',
        gameover: 'audio/gameover.mp3'
    };
    
    // 加载每个音效
    for (const [name, path] of Object.entries(effects)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 1.0; // 设置音量为100%，与本地测试环境保持一致
        soundEffects[name] = audio;
        console.log(`加载音效: ${name} (${path})`);
    }
}

// 播放音效
function playSound(name) {
    if (!audioInitialized) {
        initAudio();
    }
    
    const sound = soundEffects[name];
    if (sound) {
        // 重置音频到开始位置
        sound.currentTime = 0;
        // 播放音效
        sound.play().catch(error => {
            console.error(`播放音效 ${name} 失败:`, error);
        });
    } else {
        console.error(`找不到音效: ${name}`);
    }
}

// 播放点击成功音效
function playCorrectSound() {
    playSound('correct');
}

// 播放点击错误音效
function playWrongSound() {
    playSound('wrong');
}

// 播放数字显示音效
function playDisplaySound() {
    playSound('display');
}

// 播放完成音效
function playCompleteSound() {
    playSound('complete');
}

// 播放游戏结束音效
function playGameOverSound() {
    playSound('gameover');
}

// 导出函数
window.GameAudio = {
    init: initAudio,
    playCorrect: playCorrectSound,
    playWrong: playWrongSound,
    playDisplay: playDisplaySound,
    playComplete: playCompleteSound,
    playGameOver: playGameOverSound
}; 