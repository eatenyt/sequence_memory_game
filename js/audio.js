// 音频上下文
let audioContext;
// 背景音乐元素
let bgMusicElement = null;
// 音频是否已初始化
let audioInitialized = false;

// 初始化音频上下文
function initAudio() {
    try {
        // 创建音频上下文
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('音频上下文已初始化');
        
        // 创建背景音乐元素
        createBackgroundMusicElement();
        
        // 标记音频已初始化
        audioInitialized = true;
    } catch (e) {
        console.error('Web Audio API 不受支持:', e);
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
                    document.getElementById('musicToggleBtn').textContent = '🔊';
                    return true;
                })
                .catch(error => {
                    console.error('播放背景音乐失败:', error);
                    // 在用户交互时重新尝试播放
                    document.addEventListener('click', function tryPlay() {
                        bgMusicElement.play().then(() => {
                            document.getElementById('musicToggleBtn').textContent = '🔊';
                            document.removeEventListener('click', tryPlay);
                        }).catch(e => console.error('重试播放失败:', e));
                    });
                    return false;
                });
        } else {
            // 暂停音乐
            bgMusicElement.pause();
            document.getElementById('musicToggleBtn').textContent = '🔇';
            console.log('背景音乐已暂停');
            return false;
        }
    } catch (e) {
        console.error('背景音乐控制错误:', e);
        return false;
    }
    
    return bgMusicElement.paused ? false : true;
}

// 生成点击成功音效
function playCorrectSound() {
    if (!audioContext) return;
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.2); // A6
    
    // 配置增益节点（音量）
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 生成点击错误音效
function playWrongSound() {
    if (!audioContext) return;
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.3); // A2
    
    // 配置增益节点（音量）
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 生成数字显示音效
function playDisplaySound() {
    if (!audioContext) return;
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // E5
    
    // 配置增益节点（音量）
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// 生成完成音效
function playCompleteSound() {
    if (!audioContext) return;
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = 'sine';
    
    // 创建音阶 C G C'（C大三和弦）
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.2); // C6
    
    // 配置增益节点（音量）
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 生成游戏结束音效
function playGameOverSound() {
    if (!audioContext) return;
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = 'triangle';
    
    // 创建下降音阶
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3); // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.6); // A2
    
    // 配置增益节点（音量）
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.7);
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