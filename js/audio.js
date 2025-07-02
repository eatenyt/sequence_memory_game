// 音频上下文
let audioContext;
// 背景音乐元素
let bgMusicElement = null;
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
        
        // 创建背景音乐元素
        createBackgroundMusicElement();
        
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
        soundEffects[name] = audio;
        console.log(`加载音效: ${name} (${path})`);
    }
}

// 创建背景音乐元素
function createBackgroundMusicElement() {
    // 删除可能存在的旧元素
    if (bgMusicElement) {
        document.body.removeChild(bgMusicElement);
    }
    
    // 使用内部音频文件
    const musicUrl = "audio/background_piano.mp3";
    
    // 创建音频元素
    bgMusicElement = document.createElement('audio');
    bgMusicElement.id = 'bgMusic';
    bgMusicElement.src = musicUrl;
    bgMusicElement.loop = true; // 循环播放
    bgMusicElement.volume = 0.5; // 设置音量为50%
    bgMusicElement.style.display = 'none'; // 隐藏元素
    bgMusicElement.preload = 'auto'; // 预加载音频
    
    // 添加到文档
    document.body.appendChild(bgMusicElement);
    
    // 添加加载事件监听器
    bgMusicElement.addEventListener('canplaythrough', () => {
        console.log('背景音乐已加载完成，可以播放');
    });
    
    bgMusicElement.addEventListener('error', (e) => {
        console.error('背景音乐加载失败:', e);
    });
    
    console.log('背景音乐元素已创建，音频源:', musicUrl);
}

// 播放/暂停背景音乐
function toggleBackgroundMusic() {
    if (!audioInitialized) {
        initAudio();
    }
    
    if (!bgMusicElement) {
        createBackgroundMusicElement();
    }
    
    try {
        if (bgMusicElement.paused) {
            // 尝试恢复音频上下文（如果被暂停）
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // 播放音乐
            console.log('尝试播放背景音乐');
            bgMusicElement.play()
                .then(() => {
                    console.log('背景音乐播放成功');
                    if (document.getElementById('musicToggleBtn')) {
                        document.getElementById('musicToggleBtn').textContent = '🔊';
                    }
                    return true;
                })
                .catch(error => {
                    console.error('播放背景音乐失败:', error);
                    // 在用户交互时重新尝试播放
                    document.addEventListener('click', function tryPlay() {
                        bgMusicElement.play().then(() => {
                            if (document.getElementById('musicToggleBtn')) {
                                document.getElementById('musicToggleBtn').textContent = '🔊';
                            }
                            document.removeEventListener('click', tryPlay);
                        }).catch(e => console.error('重试播放失败:', e));
                    });
                    return false;
                });
        } else {
            // 暂停音乐
            bgMusicElement.pause();
            if (document.getElementById('musicToggleBtn')) {
                document.getElementById('musicToggleBtn').textContent = '🔇';
            }
            console.log('背景音乐已暂停');
            return false;
        }
    } catch (e) {
        console.error('背景音乐控制错误:', e);
        return false;
    }
    
    return bgMusicElement.paused ? false : true;
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
    playGameOver: playGameOverSound,
    toggleMusic: toggleBackgroundMusic
}; 